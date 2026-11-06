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
onMounted(() => {
  if (!host.value) return;
  chart = init(host.value);
  chart.setOption(props.option);
  observer = new ResizeObserver(() => chart?.resize());
  observer.observe(host.value);
});
watch(
  () => props.option,
  (o) => chart?.setOption(o, true),
  { deep: true },
);
onBeforeUnmount(() => {
  observer?.disconnect();
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
