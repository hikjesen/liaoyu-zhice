import type { MarineRaw, Snapshot } from '../engine/types';
export const MARINE_DOCS = 'https://open-meteo.com/en/docs/marine-weather-api';
export function currentToCms(value: number | null, unit: string): number | null {
  if (value === null || !Number.isFinite(value)) return null;
  const factor: Record<string, number> = { 'km/h': 100 / 3.6, 'm/s': 100, 'cm/s': 1, 'kn': 51.4444, 'knots': 51.4444 };
  if (!(unit in factor)) throw new Error(`未知流速单位：${unit}`);
  return Math.round(value * factor[unit] * 100) / 100;
}
export function validateMarine(value: unknown): MarineRaw {
  if (!value || typeof value !== 'object') throw new Error('海况响应格式错误');
  const r = value as MarineRaw;
  if (!Number.isFinite(r.latitude) || !Number.isFinite(r.longitude) || !r.hourly || !r.hourly_units || r.timezone !== 'Asia/Shanghai' || r.utc_offset_seconds !== 28800) throw new Error('海况坐标或时区不完整');
  const times = r.hourly.time;
  if (!Array.isArray(times) || !times.length || times.length > 1000 || !times.every(t => typeof t === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(t))) throw new Error('海况时间序列无效');
  for (const key of ['sea_surface_temperature', 'wave_height', 'ocean_current_velocity'] as const) {
    const arr = r.hourly[key];
    if (!Array.isArray(arr) || arr.length !== times.length || !arr.every(v => v === null || typeof v === 'number' && Number.isFinite(v))) throw new Error(`海况字段 ${key} 无效`);
  }
  if (r.hourly_units.sea_surface_temperature !== '°C' || r.hourly_units.wave_height !== 'm') throw new Error('海温或浪高单位不匹配');
  currentToCms(1, r.hourly_units.ocean_current_velocity);
  if (!r.hourly.sea_surface_temperature.some(v => v !== null)) throw new Error('此海域暂无有效海温数据');
  return r;
}
export function marineUrl(lat: number, lon: number): string {
  const params = new URLSearchParams({ latitude: String(lat), longitude: String(lon), hourly: 'sea_surface_temperature,wave_height,ocean_current_velocity', forecast_days: '3', timezone: 'Asia/Shanghai', cell_selection: 'sea' });
  return `https://marine-api.open-meteo.com/v1/marine?${params}`;
}
export async function fetchMarine(site: { id: string; latitude: number; longitude: number }, fetcher: typeof fetch = fetch): Promise<Snapshot> {
  const url = marineUrl(site.latitude, site.longitude);
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 12000);
  try {
    const response = await fetcher(url, { signal: controller.signal });
    if (!response.ok) throw new Error(`海况服务返回 ${response.status}`);
    const raw = validateMarine(await response.json());
    return { id: `open-meteo-${Date.now()}`, siteId: site.id, fetchedAt: new Date().toISOString(), requestUrl: url, source: 'Open-Meteo Marine', kind: 'model-forecast-snapshot', attribution: 'Weather data by Open-Meteo.com; Copernicus Marine Service / Meteo-France; CC BY 4.0', raw };
  } finally { clearTimeout(timer); }
}
export function nearestHour(raw: MarineRaw, now = Date.now()): number {
  return raw.hourly.time.reduce((best, t, i, times) => Math.abs(Date.parse(`${t}+08:00`) - now) < Math.abs(Date.parse(`${times[best]}+08:00`) - now) ? i : best, 0);
}
