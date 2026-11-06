import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
const manifests=JSON.parse(await readFile(new URL('../src/data/snapshots/manifest.json',import.meta.url),'utf8'));
for(const item of manifests){
 const bytes=await readFile(new URL(`../src/data/snapshots/${item.file}`,import.meta.url));
 if(createHash('sha256').update(bytes).digest('hex')!==item.sha256)throw new Error(`Checksum mismatch: ${item.file}`);
 const s=JSON.parse(bytes.toString());
 if(s.kind!=='model-forecast-snapshot'||!s.requestUrl.startsWith('https://marine-api.open-meteo.com/')||!s.fetchedAt)throw new Error('Invalid provenance');
 if(s.raw.hourly.time.length!==item.records)throw new Error('Record count mismatch');
 console.log(`Verified ${item.file}: SHA-256 OK, ${item.records} model forecast records`);
}
