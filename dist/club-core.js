(function(root){
'use strict';
const profit = row => Number(row.cash_out || 0) - Number(row.buy_in || 0);
const sum = (rows, fn) => rows.reduce((n, row) => n + Number(fn(row)||0), 0);
function playerStats(rows, name) {
 const own=rows.filter(r=>r.player_name===name).slice().sort((a,b)=>a.date.localeCompare(b.date)||String(a.id||'').localeCompare(String(b.id||'')));
 let balance=0,winStreak=0,bestStreak=0;const byDate=new Map();
 for(const r of own){const p=profit(r);balance+=p;byDate.set(r.date,{date:r.date,value:balance});winStreak=p>0?winStreak+1:0;bestStreak=Math.max(bestStreak,winStreak);}
 const wins=own.filter(r=>profit(r)>0).length, total=sum(own,profit),buyin=sum(own,r=>r.buy_in);
 return {name,rows:own,count:own.length,total,buyin,wins,losses:own.filter(r=>profit(r)<0).length,winRate:own.length?wins/own.length*100:0,average:own.length?total/own.length:0,roi:buyin?total/buyin*100:0,best:own.length?Math.max(...own.map(profit)):0,worst:own.length?Math.min(...own.map(profit)):0,bestStreak,currentStreak:winStreak,rebuy:sum(own,r=>r.rebuy_count),last:own.at(-1)?.date||null,first:own[0]?.date||null,series:[...byDate.values()],form:own.slice(-8).map(profit)};
}
function groups(rows){const grouped=new Map();for(const r of rows){if(!grouped.has(r.date))grouped.set(r.date,{date:r.date,title:r.session_name||r.name||'Pokerabend',rows:[],pot:0});const g=grouped.get(r.date);g.rows.push(r);g.pot+=Number(r.buy_in||0);}return [...grouped.values()].sort((a,b)=>b.date.localeCompare(a.date));}
function ranking(rows){return [...new Set(rows.map(r=>r.player_name))].map(name=>playerStats(rows,name)).sort((a,b)=>b.total-a.total||a.name.localeCompare(b.name));}
function monthly(rows,name){const map=new Map();for(const r of rows.filter(r=>!name||r.player_name===name)){const key=r.date.slice(0,7);map.set(key,(map.get(key)||0)+profit(r));}return [...map.entries()].sort((a,b)=>b[0].localeCompare(a[0])).map(([date,value])=>({date,value}));}
function compare(rows,a,b){const da=new Map(),db=new Map();for(const r of rows){if(r.player_name===a)da.set(r.date,(da.get(r.date)||0)+profit(r));if(r.player_name===b)db.set(r.date,(db.get(r.date)||0)+profit(r));}const common=[...da.keys()].filter(k=>db.has(k)).sort();return {count:common.length,a:sum(common,k=>da.get(k)),b:sum(common,k=>db.get(k)),aWins:common.filter(k=>da.get(k)>db.get(k)).length,bWins:common.filter(k=>db.get(k)>da.get(k)).length,ties:common.filter(k=>da.get(k)===db.get(k)).length,dates:common};}
function csv(rows){const cell=v=>'"'+String(v??'').replace(/"/g,'""')+'"';return '\uFEFF'+[['Datum','Spielabend','Spieler','Buy-in EUR','Cash-out EUR','Ergebnis EUR','Rebuys'],...rows.map(r=>[r.date,r.session_name||r.name||'',r.player_name,Number(r.buy_in||0).toFixed(2),Number(r.cash_out||0).toFixed(2),profit(r).toFixed(2),r.rebuy_count||0])].map(row=>row.map(cell).join(';')).join('\r\n');}
function entryPayload({date,player,buy,cash,rebuys=[]},rows=[]){
 if(!date||!player||String(buy).trim()===''||String(cash).trim()==='')throw new Error('Bitte Datum, Spieler, Buy-in und Cash-out ausfüllen.');
 const d=new Date(date+'T12:00:00Z');if(!Number.isFinite(d.getTime())||d.toISOString().slice(0,10)!==date)throw new Error('Bitte ein gültiges Datum eingeben.');
 function cents(v){const t=String(v).trim();if(!/^(?:[0-9]+(?:[.,][0-9]{0,2})?|[.,][0-9]{1,2})$/.test(t))throw new Error('Bitte gültige Beträge ab 0 € mit höchstens zwei Nachkommastellen eingeben.');const n=Math.round(Number(t.replace(',','.'))*100);if(!Number.isSafeInteger(n))throw new Error('Dieser Betrag ist zu groß.');return n;}
 const initial=cents(buy),out=cents(cash),extra=rebuys.map(cents).reduce((a,b)=>a+b,0);if(!Number.isSafeInteger(initial+extra))throw new Error('Dieser Betrag ist zu groß.');
 if(rows.some(r=>r.date===date&&r.player_name===player))throw new Error('Für diesen Spieler gibt es an diesem Tag bereits einen Eintrag. Bitte prüfe ihn zuerst im Archiv.');
 return {date,player_name:player,buy_in:(initial+extra)/100,cash_out:out/100,rebuys:extra/100,rebuy_count:rebuys.length};
}
function extraAchievements(rows,name){const p=playerStats(rows,name),months=new Set(p.rows.map(r=>r.date.slice(0,7))).size;return [
{id:'club50',name:'TEIL DER EINRICHTUNG',desc:'50 erfasste Runden im gewählten Zeitraum gespielt.',tier:3,unlocked:p.count>=50},
{id:'club100',name:'HUNDERT ABENDE',desc:'100 erfasste Runden im gewählten Zeitraum gespielt.',tier:4,unlocked:p.count>=100},
{id:'wins50',name:'50 GEWINNRUNDEN',desc:'50 Runden mit positivem Ergebnis im gewählten Zeitraum abgeschlossen.',tier:4,unlocked:p.wins>=50},
{id:'months6',name:'SAISONMENSCH',desc:'In sechs unterschiedlichen Kalendermonaten im gewählten Zeitraum gespielt.',tier:2,unlocked:months>=6}];}
const api={extraAchievements,entryPayload,profit,sum,playerStats,groups,ranking,monthly,compare,csv};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.ClubCore=api;
})(typeof globalThis!=='undefined'?globalThis:this);
