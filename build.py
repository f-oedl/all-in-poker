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
