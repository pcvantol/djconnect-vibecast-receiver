"""Adversarial import tests. No network or hosting effects."""
import copy
import importlib.util
import io
import json
from pathlib import Path
import shutil
import subprocess
import tarfile
import tempfile
import unittest
ROOT = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location('import_vibecast', ROOT / 'scripts/import_vibecast.py')
importer = importlib.util.module_from_spec(spec)
spec.loader.exec_module(importer)
class ImportTest(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory(); self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name).resolve()
        shutil.copytree(ROOT / 'vendor', self.root / 'vendor')
        shutil.copytree(ROOT / 'wwwroot', self.root / 'wwwroot')
        self.lock = json.loads((ROOT / 'vibecast-source-lock.json').read_bytes())
        self.lock_path = self.root / 'lock.json'; self.write_lock()
    def write_lock(self):
        self.lock_path.write_text(json.dumps(self.lock))
    def adopt(self, **kwargs):
        return importer.adopt(self.lock_path, root=self.root, **kwargs)
    def snapshot(self):
        return {p.name:p.read_bytes() for p in (self.root / 'wwwroot').iterdir() if p.is_file()}
    def test_reproducible_import_and_exact_restore(self):
        expected = self.snapshot(); self.adopt(check=True)
        (self.root / 'wwwroot/index.html').write_text('drift')
        with self.assertRaises(ValueError): self.adopt(check=True)
        self.adopt(); self.assertEqual(self.snapshot(), expected)
        self.adopt(); self.assertEqual(self.snapshot(), expected)
    def test_wrong_external_pins_fail_without_writes(self):
        for key in ['source_revision','bundle_sha256','manifest_sha256','renderer_sha256','verifier_sha256']:
            with self.subTest(key=key):
                saved = copy.deepcopy(self.lock); self.lock[key] = '0' * len(self.lock[key]); self.write_lock(); before = self.snapshot()
                with self.assertRaises((ValueError,subprocess.CalledProcessError)): self.adopt()
                self.assertEqual(before, self.snapshot()); self.lock = saved; self.write_lock()
    def test_corrupt_download_and_changed_verifier(self):
        archive = self.root / self.lock['bundle_file']; archive.write_bytes(archive.read_bytes()+b'changed')
        with self.assertRaises(ValueError): self.adopt()
        shutil.copyfile(ROOT / self.lock['bundle_file'], archive)
        (self.root / self.lock['verifier_file']).write_text("print('untrusted')")
        with self.assertRaises(ValueError): self.adopt()
    def archive(self, entries):
        path = self.root / 'test.tar.gz'
        with tarfile.open(path,'w:gz') as archive:
            for name,content,kind in entries:
                info=tarfile.TarInfo(name); info.type=kind
                if kind==tarfile.REGTYPE:
                    info.size=len(content); archive.addfile(info,io.BytesIO(content))
                else:
                    info.linkname='/tmp/escape'; archive.addfile(info)
        return path
    def test_missing_extra_duplicate_and_unsafe_archive(self):
        valid=[(name,b'test',tarfile.REGTYPE) for name in sorted(importer.ASSETS)]
        variants=[valid[:-1],valid+[('extra',b'x',tarfile.REGTYPE)],valid+[valid[0]], [('..'+'/escape',b'x',tarfile.REGTYPE)]+valid[1:], [('/escape',b'x',tarfile.REGTYPE)]+valid[1:]]
        for kind in [tarfile.SYMTYPE,tarfile.LNKTYPE,tarfile.FIFOTYPE,tarfile.DIRTYPE]: variants.append([(valid[0][0],b'',kind)]+valid[1:])
        for entries in variants:
            with self.subTest(entries=entries):
                destination=self.root/'extracted'; destination.mkdir(exist_ok=True)
                with self.assertRaises(ValueError): importer.extract(self.archive(entries),destination)
                self.assertEqual(list(destination.iterdir()),[])
    def test_core_authority_rejects_changed_missing_and_extra_assets(self):
        folder=self.root/'extracted'; folder.mkdir(); importer.extract(self.root/self.lock['bundle_file'],folder)
        core_spec=importlib.util.spec_from_file_location('core',self.root/self.lock['verifier_file']); core=importlib.util.module_from_spec(core_spec); core_spec.loader.exec_module(core)
        def verify(): return core.verify(folder,expected_manifest_sha256=self.lock['manifest_sha256'],expected_revision=self.lock['source_revision'])
        self.assertEqual(verify(),[]); asset=folder/'cast/index.html'; original=asset.read_bytes()
        asset.write_bytes(original+b'changed'); self.assertTrue(verify()); asset.unlink(); self.assertTrue(verify()); asset.write_bytes(original)
        (folder/'extra').write_text('extra'); self.assertIn('unexpected_assets',verify())
    def test_unexpected_distribution_asset_and_symlink(self):
        extra=self.root/'wwwroot/functions.js'; extra.write_text('unexpected')
        with self.assertRaises(ValueError): self.adopt()
        extra.unlink(); page=self.root/'wwwroot/index.html'; page.unlink(); page.symlink_to(self.root/'target')
        with self.assertRaises(ValueError): self.adopt()
        self.assertFalse((self.root/'target').exists())
    def test_lock_paths_cannot_escape_checkout(self):
        for value in ['/tmp/external','../external']:
            self.lock['verifier_file']=value; self.write_lock()
            with self.assertRaises(ValueError): self.adopt()
if __name__=='__main__': unittest.main()
