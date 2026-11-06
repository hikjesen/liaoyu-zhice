import type { Inputs, Scenario, Snapshot } from "../engine/types";
import { evaluate } from "../engine/evaluator";
import { EVIDENCE_NOTE, RULESET_VERSION } from "../engine/rules";
import sources from "../data/sources.json";
export function makeReport(
  inputs: Inputs,
  snapshot: Snapshot,
  site: unknown,
  scenarios: Scenario[],
) {
  return {
    schemaVersion: 1,
    project: "辽渔智策",
    generatedAt: new Date().toISOString(),
    rulesetVersion: RULESET_VERSION,
    evidenceNote: EVIDENCE_NOTE,
    site,
    inputs: JSON.parse(JSON.stringify(inputs)),
    assessment: evaluate(inputs),
    scenarios: scenarios.map((s) => ({ ...s, assessment: evaluate(s.inputs) })),
    marine: {
      source: snapshot.source,
      fetchedAt: snapshot.fetchedAt,
      requestUrl: snapshot.requestUrl,
      kind: snapshot.kind,
      attribution: snapshot.attribution,
      grid: {
        latitude: snapshot.raw.latitude,
        longitude: snapshot.raw.longitude,
      },
      validFrom: snapshot.raw.hourly.time[0],
      validTo: snapshot.raw.hourly.time.at(-1),
      timezone: snapshot.raw.timezone,
    },
    sources,
    scope:
      "四项环境条件参考比较；不推断产量、病害概率、航行安全或完整标准符合性。",
  };
}
export function downloadJson(value: unknown, name: string) {
  const blob = new Blob([JSON.stringify(value, null, 2)], {
    type: "application/json;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
