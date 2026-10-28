const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),C=require('../dist/club-core.js');
const source=fs.readFileSync('dist/assets/original.js','utf8'),start=source.indexOf('const pa='),end=source.indexOf(',zv=',start);
assert.ok(start>=0&&end>start);const sandbox={};vm.runInNewContext(source.slice(start,end)+';globalThis.rules=pa;',sandbox);
const rows=Array.from({length:12},(_,i)=>({date:'2026-01-'+String(i+1).padStart(2,'0'),player_name:'A',buy_in:20,cash_out:i%2?120:20,rebuy_count:0}));
const stats={A:{sessions:12,profit:600,wins:6,losses:0,buyin:240}};
for(const rule of sandbox.rules){const holders=rule.holders(stats,rows,[]);assert.ok(Array.isArray(holders),rule.id+' must return a holder list');}
assert.ok(sandbox.rules.find(a=>a.id==='first_win').holders(stats,rows,[]).includes('A'));
assert.ok(sandbox.rules.find(a=>a.id==='profit_emperor').holders(stats,rows,[]).includes('A'));
assert.ok(!sandbox.rules.find(a=>a.id==='tourney_winner').holders(stats,rows,[]).includes('A'));
console.log('PASS: all original achievement rules execute with the shared stats format; win, profit and absent tournament unlocks verified.');
