<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref, watch } from "vue";
import { init, type ECharts, type EChartsOption } from "echarts";
const props = defineProps<{
  option: EChartsOption;
  height?: number;
  label: string;
}>();
const host = ref<HTMLDivElement>();
let chart: ECharts | undefined;
let observer: ResizeObserver | undefined;
const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
function renderChart() {
  chart?.setOption({ ...props.option, animation: !motion.matches }, true);
}
onMounted(() => {
  if (!host.value) return;
  chart = init(host.value);
  renderChart();
  motion.addEventListener("change", renderChart);
  observer = new ResizeObserver(() => chart?.resize());
  observer.observe(host.value);
});
watch(
  () => props.option,
  renderChart,
  { deep: true },
);
onBeforeUnmount(() => {
  observer?.disconnect();
  motion.removeEventListener("change", renderChart);
  chart?.dispose();
});
</script>
<template>
  <div
    ref="host"
    class="chart"
    :style="{ height: (height || 270) + 'px' }"
    role="img"
    :aria-label="label"
  ></div>
</template>
