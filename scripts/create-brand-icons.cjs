// Preserve the supplied vector mark, centered inside the maskable safe area.
const fs=require('node:fs');
const sharp=require('sharp');
const original=fs.readFileSync('dist/assets/72o-logo-white-black.svg','utf8');
const path=original.match(/<path[^>]+\/>/)[0];
const icon=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024"><rect width="1024" height="1024" fill="#000"/><svg x="102" y="375" width="820" height="274" viewBox="0 0 2172 724">${path}</svg></svg>`;
fs.writeFileSync('dist/icons/72o-icon.svg',icon);
(async()=>{for(const size of [32,180,192,512])await sharp(Buffer.from(icon)).resize(size,size).png().toFile(`dist/icons/72o-${size}.png`);})();
