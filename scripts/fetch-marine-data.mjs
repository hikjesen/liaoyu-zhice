import { readFile, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
const sites = JSON.parse(
  await readFile(new URL("../src/data/sites.json", import.meta.url), "utf8"),
);
const manifests = [];
for (const site of sites) {
  const p = new URLSearchParams({
    latitude: String(site.latitude),
    longitude: String(site.longitude),
    hourly: "sea_surface_temperature,wave_height,ocean_current_velocity",
    forecast_days: "3",
    timezone: "Asia/Shanghai",
    cell_selection: "sea",
  });
  const requestUrl = `https://marine-api.open-meteo.com/v1/marine?${p}`;
  const response = await fetch(requestUrl, {
    signal: AbortSignal.timeout(20000),
  });
  if (!response.ok) throw new Error(`Marine HTTP ${response.status}`);
  const raw = await response.json();
  if (
    !raw.hourly?.time?.length ||
    !raw.hourly.sea_surface_temperature?.some((v) => typeof v === "number")
  )
    throw new Error("Marine response has no valid SST");
  const fetchedAt = new Date().toISOString();
  const snapshot = {
    id: `open-meteo-${site.id}-${fetchedAt}`,
    siteId: site.id,
    fetchedAt,
    requestUrl,
    source: "Open-Meteo Marine",
    kind: "model-forecast-snapshot",
    attribution:
      "Weather data by Open-Meteo.com; Copernicus Marine Service / Meteo-France; CC BY 4.0",
    raw,
  };
  const bytes = JSON.stringify(snapshot, null, 2) + "\n";
  const name = `${site.id}.json`;
  await writeFile(
    new URL(`../src/data/snapshots/${name}`, import.meta.url),
    bytes,
  );
  manifests.push({
    file: name,
    sha256: createHash("sha256").update(bytes).digest("hex"),
    fetchedAt,
    records: raw.hourly.time.length,
    validFrom: raw.hourly.time[0],
    validTo: raw.hourly.time.at(-1),
  });
  console.log(
    `Saved ${name}: ${raw.hourly.time.length} timestamps, fetched ${fetchedAt}`,
  );
}
await writeFile(
  new URL("../src/data/snapshots/manifest.json", import.meta.url),
  JSON.stringify(manifests, null, 2) + "\n",
);
