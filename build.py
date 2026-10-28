from pathlib import Path
root=Path(__file__).parent
s=(root/'dist/assets/original.js').read_text()
p=s.index('function Bv(');j=s.index('function $v(',p)
block=s[p:j];ret=block.index('const V={eintrag:')
block=block[:ret]+'''return a.jsx(ClubApp,{sessions:n,tournaments:l,seatingHistory:i,players:u,avatars:_,loading:d,connection:y,refresh:m,onAdded:g,addPlayer:C,removePlayer:A,renamePlayer:j,uploadAvatar:P,deleteAvatar:p})}'''
s=s[:p]+block+s[j:]
# Preserve loading errors instead of unconditionally reporting a successful connection.
s=s.replace('f(!0),await Promise.all([g(),w()]),f(!1),b("connected")','f(!0);try{await Promise.all([g(),w()])}catch(R){b("error")}finally{f(!1)}')
s=s.replace('async function m(){f(!0);try','async function m(){f(!0);try')
s=s.replace('return}if(s(R||[]),R)', 'return}b("connected");if(s(R||[]),R)')
# Live session: the writer appends its own event locally and then receives the same
# row again via realtime. Skip events already applied so rebuys/cash-outs never count twice.
live_echo='v&&(b.current=[...b.current,v],ut())'
assert s.count(live_echo)==1
s=s.replace(live_echo,'v&&!b.current.some(e=>e.ts===v.ts&&e.type===v.type&&e.player===v.player)&&(b.current=[...b.current,v],ut())')
# Settlement: an unbalanced evening's difference was split per head with per-head rounding,
# so transfers could miss the total by a cent. Split in whole cents and hand out the remainder.
for sign in '+-':
    share=f'y=Math.round(d/f.length*100)/100;f.forEach(b=>{{s[b]=Math.round((s[b]{sign}y)*100)/100}})'
    assert s.count(share)==1
    s=s.replace(share,f'y=Math.round(d/f.length*100)/100;(()=>{{const C=Math.round(d*100),q=Math.floor(C/f.length),R=C-q*f.length;f.forEach((b,k)=>{{s[b]=Math.round(s[b]*100{sign}(q+(k<R?1:0)))/100}})}})()')
# Tournament: saving with one player left stored the winner without a place, so the win and
# the 1st-place payout were missing from results and rankings. Record the last player as 1st.
save_t='async function D(){if(!l)return;const x={...l};'
assert s.count(save_t)==1
s=s.replace(save_t,save_t+'{const A=x.players.filter(p=>!p.eliminated);if(A.length===1&&!(x.results||[]).some(r=>r.place===1)){x.players=x.players.map(p=>p===A[0]?{...p,eliminated:!0,place:1}:p);x.results=[...(x.results||[]),{name:A[0].name,place:1}]}}')
# Renaming a player only touched poker_sessions and the avatar: tournaments and seating kept the
# old name, splitting the player's history. Rename those rows too.
rename='const F=u.map(ne=>ne===R?H:ne).sort();h(F),localStorage.setItem("poker_players",JSON.stringify(F)),await g(),'
assert s.count(rename)==1
s=s.replace(rename,'for(const T of l){const sw=p=>p&&p.name===R?{...p,name:H}:p;if((T.players||[]).some(p=>p.name===R)||(T.results||[]).some(p=>p.name===R))await re.from("poker_tournaments").update({players:(T.players||[]).map(sw),results:(T.results||[]).map(sw)}).eq("id",T.id)}for(const S of i){if((S.seats||[]).some(p=>p.name===R))await re.from("seating_history").update({seats:S.seats.map(p=>p.name===R?{...p,name:H}:p)}).eq("id",S.id)}'+rename+'await w(),')
# Avatars are stored under the safe name Ws(name) (spaces/umlauts -> "_"), but renaming looked
# them up and re-saved them by encodeURIComponent, so photos of such players were lost.
old_find='W=(E||[]).find(ne=>decodeURIComponent(ne.name.replace(/\\.[^.]+$/,""))===R)'
old_path='I=`avatars/${encodeURIComponent(H)}.${ne}`'
assert s.count(old_find)==1 and s.count(old_path)==1
s=s.replace(old_find,'W=(E||[]).find(ne=>{const k=ne.name.replace(/\\.[^.]+$/,"");return k===Ws(R)||decodeURIComponent(k)===R})')
s=s.replace(old_path,'I=`avatars/${Ws(H)}.${ne}`')
# Renaming onto an existing name silently merged two players. Ask first; merging duplicates stays possible.
merge='async function w(){if(!b.trim()||b.trim()===f){y(null);return}'
assert s.count(merge)==1
s=s.replace(merge,merge+'if(e.includes(b.trim())&&!confirm(`„${b.trim()}“ gibt es schon. Alle Einträge von „${f}“ werden mit „${b.trim()}“ zusammengeführt. Das lässt sich nicht rückgängig machen. Fortfahren?`))return;')
# Let the new React layer read the actual shared data, no copied database or new schema.
pos=s.index('ma.createRoot(document.getElementById("root"))')
s=s[:pos]+(root/'src/club-app.js').read_text()+'\n'+s[pos:]
s=s.replace('children:a.jsx(Bv,{})','children:a.jsx(ClubBoundary,{children:a.jsx(Bv,{})})')
(root/'dist/assets/app.js').write_text(s)
# Keep code and shared calculations on the same revision, including browser reloads.
import re,hashlib
index=root/'dist/index.html'
html=index.read_text()
def revision(m):
    asset=root/'dist'/m.group(2)
    if not asset.is_file(): return m.group(0)
    return m.group(1)+m.group(2)+'?v='+hashlib.sha256(asset.read_bytes()).hexdigest()[:12]+m.group(3)
html=re.sub(r'((?:src|href)="\./)([^"?#]+)(?:\?v=[a-f0-9]+)?(")',revision,html)
index.write_text(html)
