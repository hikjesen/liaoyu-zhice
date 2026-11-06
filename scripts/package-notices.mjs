import {mkdir,copyFile} from 'node:fs/promises';
await mkdir('dist/licenses',{recursive:true});
await copyFile('LICENSE','dist/licenses/LICENSE.txt');
await copyFile('licenses/pure-admin-MIT.txt','dist/licenses/pure-admin-MIT.txt');
await copyFile('docs/third-party-notices.md','dist/licenses/third-party-notices.md');
await copyFile('src/data/sources.json','dist/licenses/data-sources.json');
console.log('License notices and source attribution included in dist.');

for (const name of ['vue','vue-router','element-plus','echarts','zrender']) {
  for (const filename of ['LICENSE','LICENSE.txt','NOTICE','NOTICE.txt']) {
    try { await copyFile(`node_modules/${name}/${filename}`,`dist/licenses/${name}-${filename.replaceAll('.', '-')}.txt`); } catch {}
  }
}
