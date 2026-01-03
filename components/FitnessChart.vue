<template>
  <UCard class="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700">
    <div class="p-4">
      <div class="flex justify-between items-center mb-2">
        <h3 class="text-xs font-bold text-gray-500 dark:text-slate-400 uppercase">Fitness / Generation</h3>
        <UBadge v-if="!isTrainingActive" color="yellow" variant="subtle" size="xs">
          Using Best Model
        </UBadge>
      </div>

      <div class="w-full" style="min-height: 100px">
        <VChart
          :option="chartOption"
          class="w-full"
          style="height: 100px"
          autoresize
        />
      </div>

      <div class="flex justify-between mt-2 text-xs font-mono text-gray-500 dark:text-slate-500">
        <span>Gen: <span class="text-gray-900 dark:text-white">{{ currentGen }}</span></span>
        <span>Best: <span class="text-teal-500 dark:text-teal-400">{{ bestFitness.toFixed(0) }}</span></span>
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { use } from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';
import { LineChart } from 'echarts/charts';
import {
  TitleComponent,
  TooltipComponent,
  GridComponent
} from 'echarts/components';
import VChart from 'vue-echarts';

// Register ECharts components
use([
  CanvasRenderer,
  LineChart,
  TitleComponent,
  TooltipComponent,
  GridComponent
]);

interface Props {
  fitnessHistory: { gen: number; fitness: number }[];
  currentGen: number;
  bestFitness: number;
  isTrainingActive: boolean;
}

const props = defineProps<Props>();

// Get color mode
const colorMode = useColorMode();
const isDarkMode = computed(() => colorMode.value === 'dark');

const chartOption = computed(() => ({
  grid: { left: 30, right: 10, top: 10, bottom: 20 },
  xAxis: {
    type: 'category',
    data: props.fitnessHistory.map(d => d.gen),
    axisLabel: { color: isDarkMode.value ? '#64748b' : '#6b7280', fontSize: 10 },
    axisLine: { lineStyle: { color: isDarkMode.value ? '#334155' : '#d1d5db' } }
  },
  yAxis: {
    type: 'value',
    splitLine: { lineStyle: { color: isDarkMode.value ? '#334155' : '#e5e7eb', type: 'dashed' } },
    axisLabel: { color: isDarkMode.value ? '#64748b' : '#6b7280', fontSize: 10 }
  },
  tooltip: {
    backgroundColor: isDarkMode.value ? '#1e293b' : '#ffffff',
    borderColor: isDarkMode.value ? '#334155' : '#d1d5db',
    textStyle: { color: isDarkMode.value ? '#fff' : '#111827', fontSize: 10 },
    formatter: (params: any) => {
      return `Gen ${params.data[0]}: ${params.data[1].toFixed(0)}`;
    }
  },
  series: [{
    data: props.fitnessHistory.map(d => [d.gen, d.fitness]),
    type: 'line',
    smooth: true,
    lineStyle: { color: '#14b8a6', width: 2 },
    areaStyle: {
      color: {
        type: 'linear',
        x: 0, y: 0, x2: 0, y2: 1,
        colorStops: [
          { offset: 0, color: 'rgba(20, 184, 166, 0.5)' },
          { offset: 1, color: 'rgba(20, 184, 166, 0.0)' }
        ]
      }
    },
    symbol: 'none',
    animationDuration: 300
  }]
}));
</script>


