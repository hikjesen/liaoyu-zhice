import { RULES, RULESET_VERSION } from './rules';
import type { Assessment, Inputs, RuleResult } from './types';
export function evaluate(inputs: Inputs): Assessment {
  const results: RuleResult[] = RULES.map(rule => {
    const measurement = inputs[rule.field];
    const value = measurement?.value;
    const origin = measurement?.origin ?? 'manual';
    if (value === null || value === undefined) return { rule, value: null, origin, status: 'missing', explanation: '尚未提供该参数，不能计入通过项。' };
    if (typeof value !== 'number' || !Number.isFinite(value) || value < rule.domain[0] || value > rule.domain[1]) return { rule, value, origin, status: 'invalid', explanation: '请输入有效数值并核对单位；该值超出软件允许的输入范围。' };
    if (origin === 'model') return { rule, value, origin, status: 'reference', explanation: '模型空间/水层/统计口径与条款不同；请补充对应的养殖现场参数。' };
    const inside = (rule.min === undefined || value >= rule.min) && value <= rule.max;
    return { rule, value, origin, status: inside ? 'pass' : 'outside', explanation: `${value} ${rule.unit}，${inside ? '位于' : '超出'}参考范围 ${rule.range}。${inside ? '其余水质与养殖条件仍需逐项核对。' : rule.action}` };
  });
  const passed = results.filter(r => r.status === 'pass').length;
  const outside = results.filter(r => r.status === 'outside').length;
  const pending = results.length - passed - outside;
  return { results, passed, outside, pending, coverage: Math.round((passed + outside) / results.length * 100), status: outside ? 'outside' : pending ? 'pending' : 'within', version: RULESET_VERSION };
}
export function normalizeInputs(value: unknown): Inputs {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('参数必须为对象');
  const object = value as Record<string, unknown>;
  return Object.fromEntries(RULES.map(rule => {
    const m = object[rule.field] as { value?: unknown; origin?: unknown } | undefined;
    if (!m || typeof m !== 'object' || !['manual', 'scenario', 'model'].includes(String(m.origin))) throw new Error(`参数 ${rule.field} 缺失或来源无效`);
    if (m.value !== null && (typeof m.value !== 'number' || !Number.isFinite(m.value) || m.value < rule.domain[0] || m.value > rule.domain[1])) throw new Error(`参数 ${rule.field} 数值或单位无效`);
    return [rule.field, { value: m.value, origin: m.origin }];
  })) as Inputs;
}
