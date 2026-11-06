import { reactive, computed, watch } from "vue";
import { emptyInputs, demoInputs } from "../engine/rules";
import { evaluate, normalizeInputs } from "../engine/evaluator";
import { fetchMarine, nearestHour, currentToCms } from "../services/marine";
import type { Inputs, Scenario, Snapshot, FieldKey } from "../engine/types";
import bundled from "../data/snapshots/changhai-demo.json";
import sites from "../data/sites.json";
const KEY = "liaoyu-workspace-v1";
let restored: { inputs?: Inputs; scenarios?: Scenario[] } = {};
try {
  const raw = JSON.parse(localStorage.getItem(KEY) || "{}");
  if (raw.inputs) restored.inputs = normalizeInputs(raw.inputs);
  if (Array.isArray(raw.scenarios))
    restored.scenarios = raw.scenarios
      .slice(0, 5)
      .filter(
        (s: Scenario) => typeof s.name === "string" && s.siteId === sites[0].id,
      )
      .map((s: Scenario) => ({
        ...s,
        name: s.name.slice(0, 40),
        inputs: normalizeInputs(s.inputs),
      }));
} catch {
  restored = {};
}
export const workspace = reactive({
  siteId: sites[0].id,
  inputs: restored.inputs || emptyInputs(),
  scenarios: restored.scenarios || [],
  snapshot: bundled as Snapshot,
  mode: "snapshot" as "snapshot" | "online",
  loading: false,
  error: "",
  storageError: "",
  lastRefreshAttempt: "",
});
export const site = computed(
  () => sites.find((s) => s.id === workspace.siteId) || sites[0],
);
export const assessment = computed(() => evaluate(workspace.inputs));
export const hourIndex = computed(() => nearestHour(workspace.snapshot.raw));
watch(
  () => [workspace.inputs, workspace.scenarios],
  () => {
    try {
      localStorage.setItem(
        KEY,
        JSON.stringify({
          inputs: workspace.inputs,
          scenarios: workspace.scenarios,
        }),
      );
      workspace.storageError = "";
    } catch {
      workspace.storageError =
        "浏览器本地存储不可用；本次编辑仍保留在页面内，可导出 JSON 保存。";
    }
  },
  { deep: true },
);
export function setMeasurement(
  key: FieldKey,
  value: number | null | undefined,
) {
  workspace.inputs[key] = { value: value ?? null, origin: "manual" };
}
export function loadPreset(type: "normal" | "hot" | "fresh" | "blank") {
  workspace.inputs =
    type === "blank"
      ? emptyInputs()
      : demoInputs(
          type === "hot"
            ? { temperature: 26 }
            : type === "fresh"
              ? { salinity: 26 }
              : {},
        );
}
export function applySnapshotReferences() {
  const raw = workspace.snapshot.raw;
  const i = hourIndex.value;
  workspace.inputs.temperature = {
    value: raw.hourly.sea_surface_temperature[i],
    origin: "model",
  };
  workspace.inputs.meanCurrent = {
    value: currentToCms(
      raw.hourly.ocean_current_velocity[i],
      raw.hourly_units.ocean_current_velocity,
    ),
    origin: "model",
  };
}
export async function refreshMarine() {
  if (workspace.loading) return;
  workspace.loading = true;
  workspace.error = "";
  workspace.lastRefreshAttempt = new Date().toISOString();
  try {
    workspace.snapshot = await fetchMarine(site.value);
    workspace.mode = "online";
  } catch (e) {
    workspace.error = `更新未成功，继续使用${workspace.mode === "snapshot" ? "内置快照" : "上次成功数据"}。${e instanceof Error ? e.message : "网络不可用"}`;
  } finally {
    workspace.loading = false;
  }
}
export function useSnapshot() {
  workspace.snapshot = bundled as Snapshot;
  workspace.mode = "snapshot";
  workspace.error = "";
}
export function saveScenario(name: string, inputs: Inputs = workspace.inputs) {
  if (workspace.scenarios.length >= 5)
    throw new Error("最多保留 5 个情景，请先删除不再需要的方案。");
  const n = name.trim().slice(0, 40);
  if (!n) throw new Error("请填写情景名称");
  workspace.scenarios.push({
    id: crypto.randomUUID(),
    name: n,
    createdAt: new Date().toISOString(),
    siteId: site.value.id,
    inputs: normalizeInputs(JSON.parse(JSON.stringify(inputs))),
  });
}
export function removeScenario(id: string) {
  workspace.scenarios = workspace.scenarios.filter((s) => s.id !== id);
}
export function loadScenario(s: Scenario) {
  workspace.inputs = normalizeInputs(JSON.parse(JSON.stringify(s.inputs)));
}
export function importReport(raw: unknown) {
  const r = raw as { schemaVersion?: number; inputs?: unknown };
  if (!r || r.schemaVersion !== 1)
    throw new Error("仅支持 schemaVersion=1 的辽渔智策 JSON 报告");
  workspace.inputs = normalizeInputs(r.inputs);
}
