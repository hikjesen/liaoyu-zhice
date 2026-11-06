<script setup lang="ts">
import { RULES,ORIGIN_LABELS } from '../engine/rules';
import {workspace,setMeasurement} from '../stores/workspace';
</script>
<template><div class="input-grid"><div v-for="rule in RULES" :key="rule.id" class="input-field"><label :for="rule.field">{{rule.label}} <span>{{rule.unit}}</span></label><el-input-number :id="rule.field" :data-testid="rule.field" :model-value="workspace.inputs[rule.field].value" :min="rule.domain[0]" :max="rule.domain[1]" :precision="2" :step="rule.field==='meanCurrent'?1:0.5" controls-position="right" @update:model-value="(v: number | null | undefined) => setMeasurement(rule.field, v)"/><small>参考 {{rule.range}} · {{ORIGIN_LABELS[workspace.inputs[rule.field].origin]}}</small></div></div></template>
