import {describe,it,expect,vi} from 'vitest';
import {currentToCms,validateMarine,nearestHour,fetchMarine,marineUrl} from '../src/services/marine';
import snapshot from '../src/data/snapshots/changhai-demo.json';
describe('marine provenance and unit adapter',()=>{
 it('converts km/h to cm/s',()=>expect(currentToCms(0.72,'km/h')).toBe(20));
 it('converts m/s to cm/s',()=>expect(currentToCms(0.2,'m/s')).toBe(20));
 it('keeps null absent',()=>expect(currentToCms(null,'km/h')).toBeNull());
 it('rejects unknown units',()=>expect(()=>currentToCms(1,'miles/hour')).toThrow());
 it('validates the real bundled 72-hour snapshot',()=>{expect(validateMarine(snapshot.raw).hourly.time).toHaveLength(72);});
 it('rejects array length mismatch',()=>{const raw=structuredClone(snapshot.raw);raw.hourly.wave_height.pop();expect(()=>validateMarine(raw)).toThrow();});
 it('rejects a wrong timezone',()=>{const raw={...snapshot.raw,timezone:'UTC'};expect(()=>validateMarine(raw)).toThrow();});
 it('rejects non-numeric values',()=>{const raw=structuredClone(snapshot.raw);(raw.hourly.wave_height as unknown[])[0]='unknown';expect(()=>validateMarine(raw)).toThrow();});
 it('rejects unsupported temperature units',()=>{const raw=structuredClone(snapshot.raw);raw.hourly_units.sea_surface_temperature='°F';expect(()=>validateMarine(raw)).toThrow();});
 it('finds an hour with explicit China timezone',()=>{const now=Date.parse(snapshot.raw.hourly.time[10]+'+08:00');expect(nearestHour(snapshot.raw,now)).toBe(10);});
 it('constructs a bounded sea-grid request',()=>{const u=new URL(marineUrl(39.05,122.8));expect(u.searchParams.get('forecast_days')).toBe('3');expect(u.searchParams.get('cell_selection')).toBe('sea');});
 it('surfaces HTTP failures for snapshot fallback',async()=>{const mock=vi.fn().mockResolvedValue({ok:false,status:503});await expect(fetchMarine({id:'test',latitude:39,longitude:122},mock)).rejects.toThrow('503');});
 it('preserves fetched response and provenance',async()=>{const mock=vi.fn().mockResolvedValue({ok:true,json:async()=>snapshot.raw});const s=await fetchMarine({id:'test',latitude:39,longitude:122},mock);expect(s.kind).toBe('model-forecast-snapshot');expect(s.siteId).toBe('test');expect(s.raw).toEqual(snapshot.raw);expect(s.fetchedAt).toMatch(/^\d{4}-/);});
});
