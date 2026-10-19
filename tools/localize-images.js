// Downloads every static.wixstatic.com image referenced in content/**/*.json
// into images/ and rewrites the JSON to the local path. Run by the GitHub Action.
const fs = require('fs'), path = require('path');
const root = path.join(__dirname, '..');
const files = [];
(function walk(d){ for (const f of fs.readdirSync(d,{withFileTypes:true})) { const p=path.join(d,f.name); f.isDirectory()?walk(p):p.endsWith('.json')&&files.push(p); } })(path.join(root,'content'));
fs.mkdirSync(path.join(root,'images'),{recursive:true});
const re = /https:\/\/static\.wixstatic\.com\/media\/([A-Za-z0-9_.~%-]+?)(\.[a-z]+)(?:\/[^"\s]*)?(?=")/g;
(async () => {
  for (const f of files) {
    let t = fs.readFileSync(f,'utf8'); const found = new Map();
    for (const m of t.matchAll(re)) found.set(m[0], m);
    for (const [url, m] of found) {
      const name = decodeURIComponent(m[1]).replace(/~mv2$/,'').replace(/^798f75_/,'') + m[2];
      const dest = path.join(root,'images',name);
      if (!fs.existsSync(dest)) {
        const base = `https://static.wixstatic.com/media/${m[1]}${m[2]}`;
        const r = await fetch(base); if (!r.ok) { console.error('FAIL', base, r.status); continue; }
        fs.writeFileSync(dest, Buffer.from(await r.arrayBuffer())); console.log('saved', name);
      }
      t = t.split(url).join('/images/' + name);
    }
    fs.writeFileSync(f, t);
  }
})();
