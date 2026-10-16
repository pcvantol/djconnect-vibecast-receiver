import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {guardRecovery,recovery} from '../../scripts/reconcile_initial_binding.mjs';
const raw=await readFile(new URL('./fixtures/failed-domain-38933359799.json',import.meta.url));
const run={id:Number(recovery.runID),repository:{full_name:'pcvantol/djconnect-vibecast-receiver'},head_sha:recovery.sourceSHA,head_branch:'main',event:'workflow_dispatch',path:'.github/workflows/bootstrap-publish.yml',status:'completed',conclusion:'failure'};
test('recovery accepts only exact measured failed-run receipt and trusted provenance',()=>{
 assert.equal(guardRecovery(run,raw).createdRecordID,recovery.recordID);
 for(const change of [{id:1},{head_sha:'a'.repeat(40)},{head_branch:'feature'},{event:'pull_request'},{path:'.github/workflows/ci.yml'},{status:'in_progress'},{conclusion:'success'},{repository:{full_name:'other/repo'}}])assert.throws(()=>guardRecovery({...run,...change},raw));
 const changed=JSON.parse(raw);changed.createdRecordID='foreign';assert.throws(()=>guardRecovery(run,JSON.stringify(changed)));
 assert.throws(()=>guardRecovery(run,Buffer.concat([raw,Buffer.from('\n')])));
});
