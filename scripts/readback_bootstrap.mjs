import {readFile} from 'node:fs/promises';import {createHash} from 'node:crypto';
const manifestBytes=await readFile(process.argv[2]);
const manifest=JSON.parse(manifestBytes);
const origin=new URL(process.argv[3]);
if(origin.protocol!=='https:'||origin.username||origin.password||origin.pathname!=='/'||origin.search||origin.hash)throw Error('Exact HTTPS origin required');
for(const [file,digest] of Object.entries(manifest.files).filter(([f])=>!f.startsWith('_'))){
 const url=new URL(file==='index.html'?'/':file,origin);
 const response=await fetch(url,{redirect:'error',signal:AbortSignal.timeout(20000)});
 if(!response.ok)throw Error('Readback HTTP failure');
 const content=new Uint8Array(await response.arrayBuffer());
 if(createHash('sha256').update(content).digest('hex')!==digest)throw Error(`Readback hash mismatch: ${file}`);
 const type=file.endsWith('.mjs')?'javascript':file.endsWith('.css')?'text/css':file.endsWith('.html')?'text/html':null;
 if(type&&!response.headers.get('content-type')?.includes(type))throw Error('Content type mismatch');
 for(const [key,value] of Object.entries({'cache-control':'no-store','referrer-policy':'no-referrer','x-content-type-options':'nosniff'}))if(response.headers.get(key)!==value)throw Error('Privacy header mismatch');
 if(!response.headers.get('content-security-policy')?.includes("connect-src 'none'"))throw Error('CSP missing');
 if(!response.headers.get('permissions-policy')?.includes('camera=()'))throw Error('Permissions missing');
}
const response=await fetch(new URL('build-manifest.json',origin),{redirect:'error',signal:AbortSignal.timeout(20000)});
if(!response.ok||!response.headers.get('content-type')?.includes('application/json')||createHash('sha256').update(new Uint8Array(await response.arrayBuffer())).digest('hex')!==createHash('sha256').update(manifestBytes).digest('hex'))throw Error('Live source manifest mismatch');
for(const route of ['/index.html','/index']){
 const entry=await fetch(new URL(route,origin),{redirect:'manual',signal:AbortSignal.timeout(20000)});
 if([301,302,307,308].includes(entry.status)){
  const destination=new URL(entry.headers.get('location'),origin);
  if(destination.href!==new URL('/',origin).href)throw Error('Unexpected index redirect');
 }else if(!entry.ok||createHash('sha256').update(new Uint8Array(await entry.arrayBuffer())).digest('hex')!==manifest.files['index.html'])throw Error('Index byte mismatch');
}
process.stdout.write(JSON.stringify({origin:origin.origin,sourceSHA:manifest.sourceSHA,outcome:'PASS'})+'\n');
