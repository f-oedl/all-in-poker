const fs=require('fs'),vm=require('vm'),assert=require('assert');
const calls=[],events=[];const sandbox={URL,Response,location:{href:'http://localhost:8787/'},CustomEvent:class{constructor(type){this.type=type}},window:{fetch:async (...args)=>{calls.push(args);return new Response('{}')},dispatchEvent:e=>events.push(e)},addEventListener:()=>{}};
vm.runInNewContext(fs.readFileSync('dist/preview-guard.js','utf8'),sandbox);
(async()=>{const base='https://okgvubkibtkgcofkdpsd.supabase.co';
 for(const method of ['POST','PATCH','PUT','DELETE']){const r=await sandbox.window.fetch(base+'/rest/v1/poker_sessions',{method});assert.equal(r.status,403);}
 assert.equal(calls.length,0,'No blocked write may reach network');
 await sandbox.window.fetch(base+'/rest/v1/poker_sessions');
 await sandbox.window.fetch(base+'/storage/v1/object/list/poker-photos',{method:'POST'});
 assert.equal(calls.length,2,'Read queries and avatar lists must pass');
 await sandbox.window.fetch('https://cdn.jsdelivr.net/npm/chart.js');assert.equal(calls.length,3);
 const r=await sandbox.window.fetch({url:base+'/rest/v1/live_session',method:'POST'});assert.equal(r.status,403);
 console.log('PASS: mutations blocked; session reads, image lists and chart loading allowed.');})();
