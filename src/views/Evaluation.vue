<script setup lang="ts">
import { computed, ref } from "vue";
import { ElMessage } from "element-plus";
import InputFields from "../components/InputFields.vue";
import RuleTable from "../components/RuleTable.vue";
import {
  workspace,
  assessment,
  loadPreset,
  applySnapshotReferences,
  importReport,
} from "../stores/workspace";
import { EVIDENCE_NOTE } from "../engine/rules";
const file = ref<HTMLInputElement>();
const summary = computed(() =>
  assessment.value.status === "outside"
    ? "发现超出参考范围的条件"
    : assessment.value.status === "pending"
      ? "补充参数后，逐项生成判断"
      : "已填写条件均在参考范围内",
);
async function onImport(e: Event) {
  const f = (e.target as HTMLInputElement).files?.[0];
  if (!f) return;
  try {
    if (f.size > 1000000) throw new Error("文件超过 1 MB");
    importReport(JSON.parse(await f.text()));
    ElMessage.success("参数已导入并重新计算");
  } catch (err) {
    ElMessage.error(err instanceof Error ? err.message : "导入失败");
  } finally {
    if (file.value) file.value.value = "";
  }
}
</script>
<template>
  <div class="page-heading">
    <div>
      <span class="overline">EXPLAINABLE ASSESSMENT</span>
      <h1>养殖条件评估</h1>
      <p>四项条件逐项比较；缺失值保留为待补充，模型参考值单独显示。</p>
    </div>
    <router-link to="/reports"
      ><el-button size="large" type="primary"
        >查看评估报告 ↗</el-button
      ></router-link
    >
  </div>
  <div class="two-column evaluation-layout">
    <section class="panel">
      <div class="panel-title">
        <div>
          <h3>填写养殖环境参数</h3>
          <p class="subline">使用相同水层、时间与统计口径的数据进行比较。</p>
        </div>
        <span class="pill reference">虾夷扇贝 · 吊耳养殖</span>
      </div>
      <InputFields />
      <div class="divider"></div>
      <div class="button-row wrap">
        <el-button @click="applySnapshotReferences">填入海面参考值</el-button
        ><el-button @click="loadPreset('blank')">清空参数</el-button
        ><el-button @click="file?.click()">导入报告 JSON</el-button
        ><input
          ref="file"
          type="file"
          accept="application/json,.json"
          hidden
          @change="onImport"
        />
      </div>
      <p class="footnote">
        海面温度、模型瞬时流速与养殖水层/平均值的口径不同，填入后标记为「模型参考」，等待补充相应参数。
      </p>
    </section>
    <section class="summary-card" :class="assessment.status">
      <span class="overline">ASSESSMENT SUMMARY</span>
      <h3 data-testid="assessment-summary">{{ summary }}</h3>
      <div class="coverage-number">{{ assessment.coverage }}<span>%</span></div>
      <p>可判定参数覆盖率</p>
      <el-progress
        :percentage="assessment.coverage"
        :show-text="false"
        color="#2c977f"
      />
      <div class="summary-stats">
        <div>
          <strong data-testid="pass-count">{{ assessment.passed }}</strong
          ><span>范围内</span>
        </div>
        <div>
          <strong data-testid="outside-count">{{ assessment.outside }}</strong
          ><span>超出范围</span>
        </div>
        <div>
          <strong data-testid="pending-count">{{ assessment.pending }}</strong
          ><span>待补充</span>
        </div>
      </div>
      <small
        >覆盖率反映可比较参数的数量，不代表存活率、生产收益或整体安全等级。</small
      >
    </section>
  </div>
  <section class="panel">
    <div class="panel-title">
      <div>
        <span class="overline">TRACEABLE RULES</span>
        <h3>逐项判断与依据</h3>
      </div>
      <span class="pill">规则引擎 v0.1</span>
    </div>
    <RuleTable :assessment="assessment" details />
    <p class="evidence-note">{{ EVIDENCE_NOTE }}</p>
  </section>
  <section class="demo-strip">
    <div>
      <h3>用测试情景走一遍流程</h3>
      <p>以下为软件测试参数，与真实海况数据分开保存。</p>
    </div>
    <div class="button-row wrap">
      <el-button @click="loadPreset('normal')">载入基准情景</el-button
      ><el-button @click="loadPreset('hot')">载入高温情景</el-button
      ><el-button @click="loadPreset('fresh')">载入低盐情景</el-button>
    </div>
  </section>
</template>
