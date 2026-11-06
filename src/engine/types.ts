export type FieldKey = "temperature" | "salinity" | "depth" | "meanCurrent";
export type Origin = "manual" | "scenario" | "model";
export interface Measurement {
  value: number | null;
  origin: Origin;
}
export type Inputs = Record<FieldKey, Measurement>;
export type RuleStatus =
  | "pass"
  | "outside"
  | "missing"
  | "invalid"
  | "reference";
export interface Rule {
  id: string;
  field: FieldKey;
  label: string;
  unit: string;
  min?: number;
  max: number;
  domain: [number, number];
  clause: string;
  sourceId: string;
  range: string;
  action: string;
}
export interface RuleResult {
  rule: Rule;
  value: number | null;
  origin: Origin;
  status: RuleStatus;
  explanation: string;
}
export interface Assessment {
  results: RuleResult[];
  passed: number;
  outside: number;
  pending: number;
  coverage: number;
  status: "outside" | "pending" | "within";
  version: string;
}
export interface Scenario {
  id: string;
  name: string;
  createdAt: string;
  inputs: Inputs;
  siteId: string;
}
export interface MarineRaw {
  latitude: number;
  longitude: number;
  utc_offset_seconds: number;
  timezone: string;
  hourly_units: Record<string, string>;
  hourly: {
    time: string[];
    sea_surface_temperature: (number | null)[];
    wave_height: (number | null)[];
    ocean_current_velocity: (number | null)[];
  };
}
export interface Snapshot {
  id: string;
  siteId: string;
  fetchedAt: string;
  requestUrl: string;
  source: string;
  kind: "model-forecast-snapshot";
  attribution: string;
  raw: MarineRaw;
}
