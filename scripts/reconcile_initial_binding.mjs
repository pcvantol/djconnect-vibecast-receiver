import {readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {api,guardSource} from './promotion_guard.mjs';
import {rollbackDomain} from './cloudflare_domain.mjs';
import {target,safeReadFailure} from './cloudflare_readiness.mjs';

// One measured failed mutation, never a general historical rollback selector.
export const recovery=Object.freeze({sourceSHA:'b4dcff6210714d3504fcebcf07aaa6b15e0372a1',runID:'38933359799',recordID:'d548e42ff358abe72ae62dd6d4a65974',receiptSHA256:'7862100cd05a055c8c72d9bed9955fb3f37154d846cf8006dcfa181e9947e4df'});
export function guardRecovery(run,raw) {
 if(String(run.id)!==recovery.runID||run.repository?.full_name!=='pcvantol/djconnect-vibecast-receiver'||run.head_sha!==recovery.sourceSHA||run.head_branch!=='main'||run.event!=='workflow_dispatch'||run.path!=='.github/workflows/bootstrap-publish.yml'||run.status!=='completed'||run.conclusion!=='failure')throw Error('Untrusted failed publication');
 if(createHash('sha256').update(raw).digest('hex')!==recovery.receiptSHA256)throw Error('Recovery receipt hash mismatch');
 const receipt=JSON.parse(raw);
 if(receipt.sourceSHA!==recovery.sourceSHA||receipt.runID!==recovery.runID||receipt.createdRecordID!==recovery.recordID||receipt.createdDomainID!==null||receipt.initialDomainID!==null||receipt.pendingMutation!==null||receipt.complete!==false||receipt.stage!=='dns-before-association'||!Array.isArray(receipt.initialAddresses)||receipt.initialAddresses.length!==0)throw Error('Unexpected recovery scope');
 return receipt;
}
if(process.argv[1]===new URL(import.meta.url).pathname) {
 try {
  const repository=process.env.GITHUB_REPOSITORY,sha=process.env.CANDIDATE_SHA;
  guardSource({repository,branch:process.env.GITHUB_REF,sha,checkoutSHA:process.env.GITHUB_SHA,currentMain:api(`repos/${repository}/commits/main`).sha,run:api(`repos/${repository}/actions/runs/${process.env.ARTIFACT_RUN_ID}`),environment:api(`repos/${repository}/environments/vibecast-production`)});
  const receipt=guardRecovery(api(`repos/${repository}/actions/runs/${recovery.runID}`),await readFile('prior-publication/domain-receipt.json'));
  const options={pagesToken:process.env.CLOUDFLARE_API_TOKEN,dnsToken:process.env.CLOUDFLARE_DNS_API_TOKEN,account:process.env.CLOUDFLARE_ACCOUNT_ID,observe:observation=>writeFile('cloudflare-read-observation.json',JSON.stringify(observation,null,2)+'\n')};
  if(options.account!==target.account)throw Error('Wrong recovery account');
  const restored=await rollbackDomain(options,receipt,recovery);
  await writeFile('domain-reconciliation.json',JSON.stringify({...restored,executorSHA:sha,executorRunID:process.env.GITHUB_RUN_ID,priorReceiptSHA256:recovery.receiptSHA256},null,2)+'\n');
  process.stdout.write('Exact prior failed-run owned binding restored; no upload or association\n');
 }catch(error){const failure=safeReadFailure(error);await writeFile('cloudflare-failure.json',JSON.stringify(failure,null,2)+'\n');process.stderr.write(JSON.stringify(failure)+'\n');process.exitCode=1;}
}
