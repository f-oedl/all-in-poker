const assert=require('node:assert/strict'),C=require('../dist/club-core.js');
const rows=[
 {id:1,date:'2026-01-01',player_name:'A',name:'Runde 1',buy_in:20,cash_out:50,rebuy_count:1},
 {id:2,date:'2026-01-01',player_name:'B',name:'Runde 1',buy_in:30,cash_out:0},
 {id:3,date:'2026-01-02',player_name:'A',buy_in:20,cash_out:10},
 {id:4,date:'2026-01-02',player_name:'B',buy_in:20,cash_out:30},
 {id:5,date:'2026-02-01',player_name:'A',buy_in:20,cash_out:20},
 {id:6,date:'2026-02-01',player_name:'B',buy_in:20,cash_out:20},
 {id:7,date:'2026-02-02',player_name:'A',buy_in:10,cash_out:40},
 {id:8,date:'2026-02-03',player_name:'A',buy_in:10,cash_out:15},
];
const before=JSON.stringify(rows),p=C.playerStats(rows,'A');
assert.equal(p.total,55);assert.equal(p.count,5);assert.equal(p.wins,3);assert.equal(p.losses,1);assert.equal(p.winRate,60);assert.equal(p.average,11);assert.equal(p.best,30);assert.equal(p.worst,-10);assert.equal(p.bestStreak,2);assert.equal(p.currentStreak,2);assert.equal(p.buyin,80);assert.equal(p.rebuy,1);assert.equal(p.series.at(-1).value,55);
assert.equal(C.playerStats([],'Nobody').winRate,0);assert.equal(C.playerStats([],'Nobody').best,0);
assert.deepEqual(C.monthly(rows,'A'),[{date:'2026-02',value:35},{date:'2026-01',value:20}]);
const duel=C.compare(rows,'A','B');assert.equal(duel.count,3);assert.equal(duel.a,20);assert.equal(duel.b,-20);assert.equal(duel.aWins,1);assert.equal(duel.bWins,1);assert.equal(duel.ties,1);
assert.equal(C.compare(rows,'A','X').count,0);assert.equal(C.groups(rows).find(x=>x.date==='2026-01-01').pot,50);assert.equal(C.ranking(rows)[0].name,'A');assert.equal(C.groups(rows)[0].date,'2026-02-03');
const duplicate=[{date:'2026-01-01',player_name:'A',buy_in:1,cash_out:3},{date:'2026-01-01',player_name:'A',buy_in:1,cash_out:2},{date:'2026-01-01',player_name:'B',buy_in:1,cash_out:4}];
assert.equal(C.compare(duplicate,'A','B').ties,1);assert.equal(C.playerStats(duplicate,'A').series.length,1);assert.equal(C.playerStats(duplicate,'A').series[0].value,3);
assert.equal(JSON.stringify(rows),before,'Calculations must not mutate source records');assert.match(C.csv(rows),/"Datum";"Spielabend";"Spieler"/);assert.match(C.csv([{...rows[0],player_name:'a"b'}]),/"a""b"/);
console.log('PASS: player totals, zero data, streaks, monthly totals, common-date comparison, ties, duplicate dates, grouping, CSV escaping, input immutability.');
const entry=C.entryPayload({date:'2026-10-28',player:'Test',buy:'0,10',cash:'1,00',rebuys:['0,20']},[]);
assert.deepEqual(entry,{date:'2026-10-28',player_name:'Test',buy_in:0.3,cash_out:1,rebuys:0.2,rebuy_count:1});
for (const bad of ['-1','NaN','Infinity','1e3','1,234','']) assert.throws(()=>C.entryPayload({date:'2026-10-28',player:'Test',buy:bad,cash:'1'},[]));
assert.throws(()=>C.entryPayload({date:'2026-02-30',player:'Test',buy:'1',cash:'1'},[]));
assert.throws(()=>C.entryPayload({date:'2026-01-01',player:'A',buy:'1',cash:'1'},rows),/bereits/);
assert.equal(C.entryPayload({date:'2026-10-28',player:'Test',buy:'.50',cash:'0'},[]).buy_in,.5);
console.log('PASS: exact cents, decimal commas, invalid/negative/excess precision, invalid date and duplicate entry protection.');
const extra=C.extraAchievements(rows,'A');assert.equal(extra.length,4);assert.equal(extra.find(a=>a.id==='club50').unlocked,false);
const many=Array.from({length:100},(_,i)=>({date:'2026-'+String(i%6+1).padStart(2,'0')+'-01',player_name:'A',buy_in:10,cash_out:20}));assert.ok(C.extraAchievements(many,'A').every(a=>a.unlocked));
assert.ok(C.extraAchievements([],'A').every(a=>!a.unlocked));
console.log('PASS: new milestone achievements, threshold unlocks, calendar-month counts and empty-state behavior.');
