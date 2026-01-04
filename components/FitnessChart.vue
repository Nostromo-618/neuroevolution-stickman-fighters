<template>
  <UCard class="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700">
    <div class="p-4">
      <div class="flex justify-between items-center mb-2">
        <h3 class="text-xs font-bold text-gray-500 dark:text-slate-400 uppercase">Fitness / Generation</h3>
        <UBadge v-if="!isTrainingActive" color="yellow" variant="subtle" size="xs">
          Using Best Model
        </UBadge>
      </div>

      <div class="w-full" :style="{ minHeight: tall ? '200px' : '100px' }">
        <VChart
          :option="chartOption"
          class="w-full"
          :style="{ height: tall ? '200px' : '100px' }"
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
  GridComponent,
  LegendComponent
} from 'echarts/components';
import VChart from 'vue-echarts';

// Register ECharts components
use([
  CanvasRenderer,
  LineChart,
  TitleComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent
]);

interface Props {
  fitnessHistory: { gen: number; fitness: number; mutationRate: number }[];
  currentGen: number;
  bestFitness: number;
  isTrainingActive: boolean;
  /** When true, doubles the chart height for better readability */
  tall?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  tall: false
});

// Get color mode
const colorMode = useColorMode();
const isDarkMode = computed(() => colorMode.value === 'dark');

const chartOption = computed(() => ({
  grid: { left: 35, right: 35, top: 20, bottom: 20 },
  legend: {
    show: true,
    top: 0,
    right: 0,
    textStyle: { color: isDarkMode.value ? '#94a3b8' : '#6b7280', fontSize: 9 },
    itemWidth: 12,
    itemHeight: 8,
    data: ['Fitness', 'Mutation']
  },
  xAxis: {
    type: 'category',
    data: props.fitnessHistory.map(d => d.gen),
    axisLabel: { color: isDarkMode.value ? '#64748b' : '#6b7280', fontSize: 10 },
    axisLine: { lineStyle: { color: isDarkMode.value ? '#334155' : '#d1d5db' } }
  },
  yAxis: [
    {
      type: 'value',
      name: '',
      position: 'left',
      splitLine: { lineStyle: { color: isDarkMode.value ? '#334155' : '#e5e7eb', type: 'dashed' } },
      axisLabel: { color: isDarkMode.value ? '#64748b' : '#6b7280', fontSize: 10 }
    },
    {
      type: 'value',
      name: '',
      position: 'right',
      min: 0,
      max: 0.35,
      splitLine: { show: false },
      axisLabel: { 
        color: isDarkMode.value ? '#fbbf24' : '#d97706', 
        fontSize: 10,
        formatter: (value: number) => `${(value * 100).toFixed(0)}%`
      }
    }
  ],
  tooltip: {
    backgroundColor: isDarkMode.value ? '#1e293b' : '#ffffff',
    borderColor: isDarkMode.value ? '#334155' : '#d1d5db',
    textStyle: { color: isDarkMode.value ? '#fff' : '#111827', fontSize: 10 },
    trigger: 'axis',
    formatter: (params: any[]) => {
      if (!params || params.length === 0) return '';
      const gen = params[0]?.axisValue;
      let html = `<div style="font-weight: 600; margin-bottom: 4px;">Gen ${gen}</div>`;
      for (const param of params) {
        if (param.seriesName === 'Fitness') {
          html += `<div style="color: #14b8a6;">Fitness: ${param.value?.toFixed(0) ?? '-'}</div>`;
        } else if (param.seriesName === 'Mutation') {
          html += `<div style="color: #f59e0b;">Mutation: ${((param.value ?? 0) * 100).toFixed(1)}%</div>`;
        }
      }
      return html;
    }
  },
  series: [
    {
      name: 'Fitness',
      data: props.fitnessHistory.map(d => d.fitness),
      type: 'line',
      smooth: true,
      yAxisIndex: 0,
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
    },
    {
      name: 'Mutation',
      data: props.fitnessHistory.map(d => d.mutationRate),
      type: 'line',
      smooth: true,
      yAxisIndex: 1,
      lineStyle: { color: '#f59e0b', width: 1.5, type: 'dashed' },
      symbol: 'none',
      animationDuration: 300
    }
  ]
}));
</script>
