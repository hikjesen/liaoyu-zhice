<script setup lang="ts">
import type {Assessment} from '../engine/types';
import {STATUS_LABELS,ORIGIN_LABELS} from '../engine/rules';
defineProps<{assessment:Assessment;details?:boolean}>();
</script>
<template><div class="table-scroll"><table class="rule-table"><thead><tr><th>评估指标</th><th>输入值 / 来源</th><th>参考条件</th><th>判断结果</th><th v-if="details">依据与解释</th></tr></thead><tbody>
<tr v-for="row in assessment.results" :key="row.rule.id"><td><strong>{{row.rule.label}}</strong><small>{{row.rule.id}}</small></td><td>{{row.value??'—'}} <span v-if="row.value!==null" class="muted">{{row.rule.unit}}</span><small>{{ORIGIN_LABELS[row.origin]}}</small></td><td>{{row.rule.range}}<small>条款 {{row.rule.clause}}</small></td><td><span class="pill" :class="row.status">{{STATUS_LABELS[row.status]}}</span></td><td v-if="details" class="explanation">{{row.explanation}}</td></tr>
</tbody></table></div></template>
