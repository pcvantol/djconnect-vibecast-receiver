import {readback} from './readback_bootstrap.mjs';
const deadline=AbortSignal.timeout(300000);
let last;
for(let attempt=1;attempt<=30&&!deadline.aborted;attempt++) {
 try {
  const receipt=await readback(process.argv[2],'https://vibecast.tv',(url,options)=>fetch(url,{...options,signal:AbortSignal.any([options.signal,deadline])}));
  process.stdout.write(JSON.stringify({...receipt,attempt})+'\n');
  process.exit(0);
 }catch(error){last=error;}
 if(attempt<30&&!deadline.aborted)await new Promise(resolve=>setTimeout(resolve,10000));
}
process.stderr.write('Root HTTPS/artifact qualification did not complete: '+String(last?.message??'timeout')+'\n');
process.exitCode=1;
