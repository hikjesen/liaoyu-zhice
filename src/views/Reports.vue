<script setup lang="ts">
import { computed } from "vue";
import RuleTable from "../components/RuleTable.vue";
import { workspace, site, assessment } from "../stores/workspace";
import { makeReport, downloadJson } from "../services/report";
import { EVIDENCE_NOTE, RULESET_VERSION } from "../engine/rules";
import { evaluate } from "../engine/evaluator";
import sources from "../data/sources.json";
const created = new Date().toLocaleString("zh-CN", {
  timeZone: "Asia/Shanghai",
});
const report = computed(() =>
  makeReport(
    workspace.inputs,
    workspace.snapshot,
    site.value,
    workspace.scenarios,
  ),
);
const tasks = computed(() =>
  assessment.value.results.filter((r) => r.status !== "pass"),
);
function printReport() {
  window.print();
}
function exportReport() {
  downloadJson(
    report.value,
    `liaoyu-report-${new Date().toISOString().slice(0, 10)}.json`,
  );
}
</script>
<template>
  <div class="page-heading no-print">
    <div>
      <span class="overline">REPORT & EVIDENCE</span>
      <h1>一份判断，一条完整的依据链。</h1>
      <p>汇总环境参数、规则结果、情景对比与数据来源，便于展示、复核和归档。</p>
    </div>
    <div class="button-row wrap">
      <el-button size="large" @click="exportReport">导出 JSON</el-button
      ><el-button size="large" type="primary" @click="printReport"
        >打印 / 保存 PDF</el-button
      >
    </div>
  </div>
  <article class="report-paper">
    <header class="report-header">
      <div>
        <span class="overline">LIAOYU ZHICE · ASSESSMENT REPORT</span>
        <h2>养殖环境参考评估报告</h2>
        <p>{{ site.region }} · {{ site.species }} · {{ site.method }}</p>
      </div>
      <div class="report-stamp">辽渔智策<small>MVP 0.1.0</small></div>
    </header>
    <div class="report-meta">
      <div>
        <span>报告查看时间（北京时间）</span><strong>{{ created }}</strong>
      </div>
      <div>
        <span>示例查询坐标</span
        ><strong>{{ site.latitude }}°N / {{ site.longitude }}°E</strong>
      </div>
      <div>
        <span>可判定参数覆盖率</span
        ><strong
          >{{ assessment.coverage }}% ·
          {{ assessment.pending }} 项待补充</strong
        >
      </div>
    </div>
    <h3 class="report-section-title">01 / 参数与规则判断</h3>
    <RuleTable :assessment="assessment" details />
    <p class="evidence-note">{{ EVIDENCE_NOTE }}</p>
    <h3 class="report-section-title">02 / 优先复核事项</h3>
    <div v-if="tasks.length" class="report-tasks">
      <div v-for="row in tasks" :key="row.rule.id">
        <b>{{ row.rule.label }}</b>
        <p>
          {{ row.status === "outside" ? row.rule.action : row.explanation }}
        </p>
      </div>
    </div>
    <p v-else class="positive-note">
      已填写的四项参数均落在参考条件内。可继续检查标准引用的其他水质条件、设施和日常管理要求。
    </p>
    <h3 class="report-section-title">03 / 情景记录</h3>
    <div v-if="workspace.scenarios.length" class="table-scroll">
      <table class="rule-table">
        <thead>
          <tr>
            <th>情景</th>
            <th>范围内</th>
            <th>超范围</th>
            <th>待补充</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="s in workspace.scenarios" :key="s.id">
            <td>{{ s.name }}</td>
            <td>{{ evaluate(s.inputs).passed }}</td>
            <td>{{ evaluate(s.inputs).outside }}</td>
            <td>{{ evaluate(s.inputs).pending }}</td>
          </tr>
        </tbody>
      </table>
    </div>
    <p v-else class="muted">
      尚未保存情景；在情景推演页保存后，报告将自动包含对比结果。
    </p>
    <h3 class="report-section-title">04 / 数据与规则来源</h3>
    <div class="marine-provenance">
      <strong
        >{{ workspace.snapshot.source }} ·
        {{
          workspace.mode === "snapshot" ? "内置快照" : "最近一次在线获取"
        }}</strong
      >
      <p>
        获取时间：{{ workspace.snapshot.fetchedAt }}<br />预报有效期：{{
          workspace.snapshot.raw.hourly.time[0]
        }}
        — {{ workspace.snapshot.raw.hourly.time.at(-1) }}（{{
          workspace.snapshot.raw.timezone
        }}）<br />网格坐标：{{ workspace.snapshot.raw.latitude }},
        {{ workspace.snapshot.raw.longitude }}
      </p>
      <a
        :href="workspace.snapshot.requestUrl"
        target="_blank"
        rel="noopener noreferrer"
        >查看对应 API 请求 ↗</a
      >
    </div>
    <div class="source-list">
      <div v-for="(source, index) in sources" :key="source.id">
        <span class="source-index">{{
          String(index + 1).padStart(2, "0")
        }}</span>
        <div>
          <a :href="source.url" target="_blank" rel="noopener noreferrer"
            >{{ source.title }} ↗</a
          ><small
            >{{ source.publisher }} · {{ source.date }} ·
            {{ source.status }}</small
          >
          <p>{{ source.usage }}</p>
          <small>{{ source.license }}</small>
        </div>
      </div>
    </div>
    <div class="report-scope">
      <strong>应用范围与复现信息</strong>
      <p>
        本原型用于虾夷扇贝吊耳养殖的四项环境条件参考比较。海况为公开数值模型数据；用户填写和模拟情景分别标注。未计算真实产量、存活率、病害概率或完整标准符合性。示例坐标未绑定真实养殖场。JSON
        报告含输入、来源和规则版本，可重新导入验证。
      </p>
      <code>{{ RULESET_VERSION }}</code>
    </div>
  </article>
</template>
