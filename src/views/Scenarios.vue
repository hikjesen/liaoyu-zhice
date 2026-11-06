<script setup lang="ts">
import { computed, ref } from "vue";
import type { EChartsOption } from "echarts";
import { ElMessage } from "element-plus";
import InputFields from "../components/InputFields.vue";
import ChartPanel from "../components/ChartPanel.vue";
import {
  workspace,
  assessment,
  loadPreset,
  saveScenario,
  removeScenario,
  loadScenario,
} from "../stores/workspace";
import { evaluate } from "../engine/evaluator";
import { RULES } from "../engine/rules";
const name = ref("我的方案");
const rows = computed(() =>
  workspace.scenarios.map((s) => ({ ...s, result: evaluate(s.inputs) })),
);
function save() {
  try {
    saveScenario(name.value);
    ElMessage.success("情景已保存在当前浏览器");
    name.value = `方案 ${workspace.scenarios.length + 1}`;
  } catch (e) {
    ElMessage.error((e as Error).message);
  }
}
const chart = computed<EChartsOption>(() => ({
  animationDuration: 300,
  tooltip: { trigger: "axis", axisPointer: { type: "shadow" } },
  legend: { bottom: 0 },
  grid: { left: 36, right: 20, top: 24, bottom: 68 },
  xAxis: { type: "category", data: rows.value.map((s) => s.name) },
  yAxis: { type: "value", min: 0, max: 4, interval: 1, name: "条件项数" },
  series: [
    {
      name: "范围内",
      type: "bar",
      stack: "status",
      data: rows.value.map((s) => s.result.passed),
      itemStyle: { color: "#319a83" },
      barMaxWidth: 54,
    },
    {
      name: "超出范围",
      type: "bar",
      stack: "status",
      data: rows.value.map((s) => s.result.outside),
      itemStyle: { color: "#d68a59" },
    },
    {
      name: "待补充",
      type: "bar",
      stack: "status",
      data: rows.value.map((s) => s.result.pending),
      itemStyle: { color: "#cbd8dc", borderRadius: [5, 5, 0, 0] },
    },
  ],
}));
</script>
<template>
  <div class="page-heading">
    <div>
      <span class="overline">SCENARIO STUDIO</span>
      <h1>改变条件，看见判断如何变化。</h1>
      <p>
        保留同一套规则，比较不同输入情景。结果用于方案讨论与参数敏感性展示。
      </p>
    </div>
    <span class="pill reference"
      >本地保存 {{ workspace.scenarios.length }} / 5</span
    >
  </div>
  <div class="two-column">
    <section class="panel">
      <div class="panel-title">
        <div>
          <h3>编辑当前情景</h3>
          <p class="subline">修改任意参数，右侧判断即时更新。</p>
        </div>
      </div>
      <div class="button-row wrap preset-row">
        <el-button size="small" @click="loadPreset('normal')"
          >基准情景</el-button
        ><el-button size="small" @click="loadPreset('hot')">高温情景</el-button
        ><el-button size="small" @click="loadPreset('fresh')"
          >低盐情景</el-button
        >
      </div>
      <InputFields />
      <div class="scenario-save">
        <el-input
          v-model="name"
          maxlength="40"
          placeholder="为这个情景命名"
          aria-label="情景名称"
        /><el-button type="primary" @click="save">保存当前情景</el-button>
      </div>
      <p class="footnote">
        基准参数：18 °C / 盐度31 / 水深22 m / 平均流速12
        cm/s，均为测试用模拟值。
      </p>
    </section>
    <section class="panel">
      <div class="panel-title">
        <div>
          <h3>当前情景的变化反馈</h3>
          <p class="subline">
            范围内 {{ assessment.passed }} 项 · 超出 {{ assessment.outside }} 项
            · 待补充 {{ assessment.pending }} 项
          </p>
        </div>
      </div>
      <div class="condition-list">
        <div v-for="r in assessment.results" :key="r.rule.id">
          <span class="condition-dot" :class="r.status"></span>
          <div>
            <strong>{{ r.rule.label }}</strong>
            <p>{{ r.explanation }}</p>
          </div>
        </div>
      </div>
      <div class="mini-note">
        环境参数只在模型中发生变化；系统不会自动控制设备或向真实养殖场下发操作。
      </div>
    </section>
  </div>
  <section class="panel">
    <div class="panel-title">
      <div>
        <span class="overline">COMPARE & UNDERSTAND</span>
        <h3>情景对比</h3>
      </div>
      <router-link to="/reports" class="text-link"
        >随报告一起导出 →</router-link
      >
    </div>
    <div v-if="!rows.length" class="empty-state">
      <div class="empty-icon">⇄</div>
      <h3>保存第一份情景，开始比较</h3>
      <p>试着依次保存「基准情景」和「高温情景」，观察超范围项的变化。</p>
    </div>
    <template v-else
      ><ChartPanel
        :option="chart"
        :height="255"
        label="已保存情景的范围内、超范围及待补充项数对比"
      />
      <div class="table-scroll">
        <table class="rule-table scenario-table">
          <thead>
            <tr>
              <th>情景名称</th>
              <th v-for="rule in RULES" :key="rule.id">{{ rule.label }}</th>
              <th>超范围 / 待补充</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="s in rows" :key="s.id">
              <td>
                <strong>{{ s.name }}</strong
                ><small>{{
                  new Date(s.createdAt).toLocaleDateString("zh-CN")
                }}</small>
              </td>
              <td v-for="rule in RULES" :key="rule.id">
                {{ s.inputs[rule.field].value ?? "—" }}
                <small>{{ rule.unit }}</small>
              </td>
              <td>{{ s.result.outside }} / {{ s.result.pending }}</td>
              <td class="no-wrap">
                <el-button
                  size="small"
                  text
                  type="primary"
                  @click="loadScenario(s)"
                  >载入</el-button
                ><el-button
                  size="small"
                  text
                  type="danger"
                  @click="removeScenario(s.id)"
                  >删除</el-button
                >
              </td>
            </tr>
          </tbody>
        </table>
      </div></template
    >
  </section>
</template>
