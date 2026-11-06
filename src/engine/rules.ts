import type { Rule, Inputs } from './types';
export const RULESET_VERSION = 'liaoyu-scallop-0.1.0';
export const EVIDENCE_NOTE = '规则依据：DB21/T 3719—2023 正式文本第4.1、4.2条（PDF第5页）。本原型覆盖其中四项环境条件，其余引用标准、设施及管理要求另行核对。';
export const RULES: Rule[] = [
  { id: 'SCA-TEMP', field: 'temperature', label: '养殖水层温度', unit: '°C', min: 0, max: 24, domain: [-5, 45], clause: '4.2 水质条件', sourceId: 'db21-3719', range: '0–24 °C', action: '复核养殖水层的测温记录与持续时间，记录异常时段，交由养殖技术人员研判。' },
  { id: 'SCA-SAL', field: 'salinity', label: '养殖水层盐度', unit: '标准数值', min: 28, max: 33, domain: [0, 50], clause: '4.2 水质条件', sourceId: 'db21-3719', range: '28–33（原文未标单位）', action: '核对盐度测量口径，补充降雨前后及不同水层记录，复查异常是否持续。' },
  { id: 'SCA-DEPTH', field: 'depth', label: '养殖海域水深', unit: 'm', min: 15, max: 30, domain: [0, 300], clause: '4.1 养殖海域', sourceId: 'db21-3719', range: '15–30 m', action: '复核海域水深及测量基准，结合设施与养殖模式确认场址适用性。' },
  { id: 'SCA-CURRENT', field: 'meanCurrent', label: '海水平均流速', unit: 'cm/s', min: 0, max: 20, domain: [0, 500], clause: '4.1 养殖海域', sourceId: 'db21-3719', range: '≤20 cm/s', action: '补充养殖水层平均流速及统计时段；海面模型瞬时流速只用于背景参考。' }
];
export function emptyInputs(): Inputs { return Object.fromEntries(RULES.map(r => [r.field, { value: null, origin: 'manual' }])) as Inputs; }
export function demoInputs(overrides: Partial<Record<keyof Inputs, number | null>> = {}): Inputs {
  const values = { temperature: 18, salinity: 31, depth: 22, meanCurrent: 12, ...overrides };
  return Object.fromEntries(RULES.map(r => [r.field, { value: values[r.field], origin: 'scenario' }])) as Inputs;
}
export const STATUS_LABELS = { pass: '参考范围内', outside: '超出参考范围', missing: '待补充', invalid: '数值无效', reference: '模型参考' };
export const ORIGIN_LABELS = { manual: '用户填写', scenario: '模拟情景', model: '海面模型参考' };
