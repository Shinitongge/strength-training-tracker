'use client';

import { useState } from 'react';
import Navbar from '@/components/Navbar';
import { useTraining } from '@/contexts/TrainingContext';
import { MovementPattern, TrainingRecord, Set } from '@/types/training';
import { Chart } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ChartData,
  ChartOptions
} from 'chart.js';

// 注册Chart.js组件
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend
);

// 时间范围类型
type DateRange = {
  start: string;
  end: string;
};

// 格式化日期范围为简短文本
const formatDateRange = (range: DateRange) => {
  const start = new Date(range.start + 'T00:00:00');
  const end = new Date(range.end + 'T00:00:00');
  return `${(start.getMonth() + 1)}/${start.getDate()}-${(end.getMonth() + 1)}/${end.getDate()}`;
};

export default function AnalysisPage() {
  const { records } = useTraining();
  const [weekCount, setWeekCount] = useState<number>(5);
  const [activeTab, setActiveTab] = useState<'sets' | 'weight' | 'maxWeight'>('sets');
  // 使用本地时区的日期
  const [currentDate] = useState<Date>(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
  });

  // 获取过去N个7天的日期范围
  const getWeekRanges = (count: number) => {
    const ranges: DateRange[] = [];
    
    for (let i = 0; i < count; i++) {
      const endDate = new Date(currentDate);
      const startDate = new Date(currentDate);
      
      endDate.setDate(currentDate.getDate() - i * 7);
      startDate.setDate(currentDate.getDate() - (i + 1) * 7);
      
      ranges.push({
        start: startDate.toISOString().split('T')[0],
        end: endDate.toISOString().split('T')[0],
      });
    }
    
    return ranges;
  };

  // 获取短期（最近7天）日期范围
  const getRecentDateRange = (): DateRange => {
    const end = new Date(currentDate);
    const start = new Date(currentDate);
    start.setDate(currentDate.getDate() - 7);
    
    return {
      start: start.toISOString().split('T')[0],
      end: end.toISOString().split('T')[0],
    };
  };

  // 获取长期（前35天至前8天）日期范围
  const getPreviousDateRange = (): DateRange => {
    const end = new Date(currentDate);
    const start = new Date(currentDate);
    
    end.setDate(currentDate.getDate() - 8);
    start.setDate(currentDate.getDate() - 35);
    
    return {
      start: start.toISOString().split('T')[0],
      end: end.toISOString().split('T')[0],
    };
  };

  // 获取指定日期范围内的记录
  const getRecordsInRange = (range: DateRange) => {
    return records.filter(record => 
      record.date >= range.start && record.date <= range.end
    );
  };

  // 计算每个动作模式的力竭组总和
  const calculateNearFailureSets = (records: TrainingRecord[], isWeeklyAverage: boolean = false) => {
    const patterns: MovementPattern[] = [
      '下肢推', '下肢拉', '上肢垂直推', '上肢垂直拉', '上肢水平推', '上肢水平拉'
    ];
    const result = new Map<MovementPattern, number>();
    patterns.forEach(pattern => result.set(pattern, 0));

    records.forEach((record: TrainingRecord) => {
      const nearFailureSets = record.sets.filter((set: Set) => set.isNearFailure).length;
      const currentCount = result.get(record.exercise.pattern) || 0;
      result.set(record.exercise.pattern, currentCount + nearFailureSets);
    });

    // 如果是28天数据，计算每周平均值
    if (isWeeklyAverage) {
      patterns.forEach(pattern => {
        const total = result.get(pattern) || 0;
        result.set(pattern, Math.round(total / 4 * 10) / 10); // 保留一位小数
      });
    }

    return Object.fromEntries(result);
  };

  // 计算每个动作模式的总负重
  const calculateTotalWeight = (records: TrainingRecord[], isWeeklyAverage: boolean = false) => {
    const patterns: MovementPattern[] = [
      '下肢推', '下肢拉', '上肢垂直推', '上肢垂直拉', '上肢水平推', '上肢水平拉'
    ];
    const result = new Map<MovementPattern, number>();
    patterns.forEach(pattern => result.set(pattern, 0));

    records.forEach((record: TrainingRecord) => {
      const totalWeight = record.sets.reduce((sum: number, set: Set) => sum + (set.weight * set.reps), 0);
      const currentTotal = result.get(record.exercise.pattern) || 0;
      result.set(record.exercise.pattern, currentTotal + totalWeight);
    });

    // 如果是28天数据，计算每周平均值
    if (isWeeklyAverage) {
      patterns.forEach(pattern => {
        const total = result.get(pattern) || 0;
        result.set(pattern, Math.round(total / 4 * 10) / 10); // 保留一位小数
      });
    }

    return Object.fromEntries(result);
  };

  // 计算每个训练动作的最大重量
  const calculateMaxWeights = (records: TrainingRecord[]) => {
    const maxWeights = new Map<string, { weight: number; pattern: MovementPattern }>();

    records.forEach((record: TrainingRecord) => {
      const maxWeight = Math.max(...record.sets.map((set: Set) => set.weight));
      const currentMax = maxWeights.get(record.exercise.name)?.weight || 0;
      
      if (maxWeight > currentMax) {
        maxWeights.set(record.exercise.name, {
          weight: maxWeight,
          pattern: record.exercise.pattern,
        });
      }
    });

    return Object.fromEntries(maxWeights);
  };

  // 获取每个动作模式的颜色
  const getPatternColor = (pattern: MovementPattern): string => {
    const colors: Record<MovementPattern, string> = {
      '下肢推': 'rgb(255, 99, 132)',
      '下肢拉': 'rgb(54, 162, 235)',
      '上肢垂直推': 'rgb(255, 206, 86)',
      '上肢垂直拉': 'rgb(75, 192, 192)',
      '上肢水平推': 'rgb(153, 102, 255)',
      '上肢水平拉': 'rgb(255, 159, 64)',
    };
    return colors[pattern];
  };

  // 计算线性回归
  const calculateRegression = (xValues: number[], yValues: number[]) => {
    const n = xValues.length;
    if (n < 2) return null;

    // 计算均值
    const xMean = xValues.reduce((a, b) => a + b) / n;
    const yMean = yValues.reduce((a, b) => a + b) / n;

    // 计算回归系数
    let numerator = 0;
    let denominator = 0;
    for (let i = 0; i < n; i++) {
      numerator += (xValues[i] - xMean) * (yValues[i] - yMean);
      denominator += Math.pow(xValues[i] - xMean, 2);
    }
    
    // 计算斜率和截距
    const slope = denominator !== 0 ? numerator / denominator : 0;
    const intercept = yMean - slope * xMean;

    // 计算R方值
    let rSquared = 0;
    if (denominator !== 0) {
      const yPred = xValues.map(x => slope * x + intercept);
      const ssTot = yValues.reduce((a, b) => a + Math.pow(b - yMean, 2), 0);
      const ssRes = yValues.reduce((a, b, i) => a + Math.pow(b - yPred[i], 2), 0);
      rSquared = 1 - ssRes / ssTot;
    }

    return {
      slope,
      intercept,
      rSquared,
      predict: (x: number) => slope * x + intercept
    };
  };

  // 获取单个动作模式的周数据
  const getPatternWeeklyData = (pattern: MovementPattern): ChartData<'bar' | 'line'> => {
    const weekRanges = getWeekRanges(weekCount);
    const data = weekRanges.map(range => {
      const weekRecords = getRecordsInRange(range);
      const weekStats = calculateNearFailureSets(weekRecords);
      return weekStats[pattern];
    });
    
    const longTermAverage = previousNearFailureSets[pattern];
    const patternColor = getPatternColor(pattern);

    // 计算每周的短长期比
    const ratioData = weekRanges.map(range => {
      const weekRecords = getRecordsInRange(range);
      const weekStats = calculateNearFailureSets(weekRecords);
      const weekAverage = calculateNearFailureSets(
        getRecordsInRange({
          start: new Date(new Date(range.end).setDate(new Date(range.end).getDate() - 35)).toISOString().split('T')[0],
          end: new Date(new Date(range.end).setDate(new Date(range.end).getDate() - 8)).toISOString().split('T')[0],
        }),
        true
      );
      return weekStats[pattern] / (weekAverage[pattern] || 1);
    });
    
    return {
      labels: weekRanges.map(range => formatDateRange(range)).reverse(),
      datasets: [
        {
          type: 'line' as const,
          label: '短长期组数比',
          data: ratioData.reverse(),
          borderColor: 'rgb(75, 192, 192)',
          backgroundColor: 'rgba(75, 192, 192, 0.1)',
          borderWidth: 2,
          tension: 0.4,
          pointStyle: 'circle',
          pointRadius: 3,
          yAxisID: 'y1',
          order: 1
        },
        {
          type: 'line' as const,
          label: '长期平均',
          data: Array(weekCount).fill(longTermAverage),
          borderColor: patternColor,
          backgroundColor: patternColor.replace('rgb', 'rgba').replace(')', ', 0.1)'),
          borderWidth: 2,
          borderDash: [5, 5],
          pointStyle: false as const,
          fill: true,
          yAxisID: 'y',
          order: 2
        },
        {
          type: 'bar' as const,
          label: '增肌组数',
          data: data.reverse(),
          backgroundColor: patternColor.replace('rgb', 'rgba').replace(')', ', 0.5)'),
          borderRadius: 4,
          yAxisID: 'y',
          order: 3
        }
      ],
    };
  };

  // 图表配置
  const getChartOptions = (pattern: MovementPattern): ChartOptions<'bar' | 'line'> => ({
    responsive: true,
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    plugins: {
      legend: {
        display: true,
        position: 'top' as const,
        align: 'end' as const,
        labels: {
          boxWidth: 12,
          usePointStyle: true,
          pointStyle: 'circle',
        },
      },
      title: {
        display: false,
      },
      tooltip: {
        callbacks: {
          title: (items: any[]) => `${pattern} - ${items[0].label}`,
          label: (context: any) => {
            if (context.dataset.yAxisID === 'y1') {
              return `短长期组数比: ${context.parsed.y.toFixed(1)}`;
            }
            if (context.dataset.type === 'line') {
              return `长期平均: ${context.parsed.y} 组/周`;
            }
            return `${context.parsed.y} 组`;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        position: 'left',
        title: {
          display: true,
          text: '增肌组数',
        },
        ticks: {
          stepSize: 1,
        },
      },
      y1: {
        beginAtZero: true,
        position: 'right',
        title: {
          display: true,
          text: '短长期组数比',
        },
        grid: {
          drawOnChartArea: false,
        },
        ticks: {
          stepSize: 0.25,
          callback: function(tickValue: string | number) {
            return typeof tickValue === 'number' ? tickValue.toFixed(2) : tickValue;
          }
        },
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          maxRotation: 0,
          minRotation: 0,
          font: {
            size: 11,
          },
        },
      },
    },
    maintainAspectRatio: false,
  });

  // 获取单个动作模式的负重周数据
  const getWeightWeeklyData = (pattern: MovementPattern): ChartData<'bar' | 'line'> => {
    const weekRanges = getWeekRanges(weekCount);
    const data = weekRanges.map(range => {
      const weekRecords = getRecordsInRange(range);
      const weekStats = calculateTotalWeight(weekRecords);
      return weekStats[pattern];
    });
    
    const longTermAverage = previousTotalWeight[pattern];
    const patternColor = getPatternColor(pattern);

    // 计算每周的短长期负重比
    const ratioData = weekRanges.map(range => {
      const weekRecords = getRecordsInRange(range);
      const weekStats = calculateTotalWeight(weekRecords);
      const weekAverage = calculateTotalWeight(
        getRecordsInRange({
          start: new Date(new Date(range.end).setDate(new Date(range.end).getDate() - 35)).toISOString().split('T')[0],
          end: new Date(new Date(range.end).setDate(new Date(range.end).getDate() - 8)).toISOString().split('T')[0],
        }),
        true
      );
      return weekStats[pattern] / (weekAverage[pattern] || 1);
    });
    
    return {
      labels: weekRanges.map(range => formatDateRange(range)).reverse(),
      datasets: [
        {
          type: 'line' as const,
          label: '短长期负重比',
          data: ratioData.reverse(),
          borderColor: 'rgb(75, 192, 192)',
          backgroundColor: 'rgba(75, 192, 192, 0.1)',
          borderWidth: 2,
          tension: 0.4,
          pointStyle: 'circle',
          pointRadius: 3,
          yAxisID: 'y1',
          order: 1
        },
        {
          type: 'line' as const,
          label: '长期平均',
          data: Array(weekCount).fill(longTermAverage),
          borderColor: patternColor,
          backgroundColor: patternColor.replace('rgb', 'rgba').replace(')', ', 0.1)'),
          borderWidth: 2,
          borderDash: [5, 5],
          pointStyle: false as const,
          fill: true,
          order: 2
        },
        {
          type: 'bar' as const,
          label: '负重',
          data: data.reverse(),
          backgroundColor: patternColor.replace('rgb', 'rgba').replace(')', ', 0.5)'),
          borderRadius: 4,
          order: 3
        }
      ],
    };
  };

  // 负重图表配置
  const getWeightChartOptions = (pattern: MovementPattern): ChartOptions<'bar' | 'line'> => ({
    responsive: true,
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    plugins: {
      legend: {
        display: true,
        position: 'top' as const,
        align: 'end' as const,
        labels: {
          boxWidth: 12,
          usePointStyle: true,
          pointStyle: 'circle',
        },
      },
      title: {
        display: false,
      },
      tooltip: {
        callbacks: {
          title: (items: any[]) => `${pattern} - ${items[0].label}`,
          label: (context: any) => {
            if (context.dataset.yAxisID === 'y1') {
              return `短长期负重比: ${context.parsed.y.toFixed(1)}`;
            }
            if (context.dataset.type === 'line') {
              return `长期平均: ${context.parsed.y.toFixed(1)} kg/周`;
            }
            return `${context.parsed.y.toFixed(1)} kg`;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        position: 'left',
        title: {
          display: true,
          text: '负重 (kg)',
        },
      },
      y1: {
        beginAtZero: true,
        position: 'right',
        title: {
          display: true,
          text: '短长期负重比',
        },
        grid: {
          drawOnChartArea: false,
        },
        ticks: {
          stepSize: 0.25,
          callback: function(tickValue: string | number) {
            return typeof tickValue === 'number' ? tickValue.toFixed(2) : tickValue;
          }
        },
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          maxRotation: 0,
          minRotation: 0,
          font: {
            size: 11,
          },
        },
      },
    },
    maintainAspectRatio: false,
  });

  // 获取单个训练动作的最大重量周数据
  const getMaxWeightWeeklyData = (exercise: string, pattern: MovementPattern): ChartData<'bar' | 'line'> => {
    const weekRanges = getWeekRanges(weekCount);
    const data = weekRanges.map(range => {
      const weekRecords = getRecordsInRange(range);
      const weekMaxWeights = calculateMaxWeights(weekRecords);
      return weekMaxWeights[exercise]?.weight || 0;
    }).reverse();
    
    const longTermMax = previousMaxWeights[exercise]?.weight || 0;
    const patternColor = getPatternColor(pattern);

    // 计算回归线
    const xValues = Array.from({length: weekCount}, (_, i) => i);
    const regression = calculateRegression(xValues, data);
    const regressionData = regression ? xValues.map(x => regression.predict(x)) : [];
    const hasSignificantTrend = regression && regression.rSquared > 0.5;
    
    return {
      labels: weekRanges.map(range => formatDateRange(range)).reverse(),
      datasets: [
        {
          type: 'line' as const,
          label: '长期最大值',
          data: Array(weekCount).fill(longTermMax),
          borderColor: patternColor,
          backgroundColor: patternColor.replace('rgb', 'rgba').replace(')', ', 0.1)'),
          borderWidth: 2,
          borderDash: [5, 5],
          pointStyle: false as const,
          fill: true,
          order: 2
        },
        ...(hasSignificantTrend ? [{
          type: 'line' as const,
          label: '趋势线',
          data: regressionData,
          borderColor: 'rgba(75, 192, 192, 0.8)',
          borderWidth: 2,
          pointStyle: false as const,
          tension: 0.4,
          order: 1
        }] : []),
        {
          type: 'line' as const,
          label: '最大重量',
          data: data,
          borderColor: patternColor.replace('rgb', 'rgba').replace(')', ', 0.8)'),
          backgroundColor: 'transparent',
          borderWidth: 2,
          pointStyle: 'circle',
          pointRadius: 4,
          tension: 0.4,
          order: 3
        }
      ],
    };
  };

  // 最大重量图表配置
  const getMaxWeightChartOptions = (exercise: string): ChartOptions<'bar' | 'line'> => ({
    responsive: true,
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    plugins: {
      legend: {
        display: true,
        position: 'top' as const,
        align: 'end' as const,
        labels: {
          boxWidth: 12,
          usePointStyle: true,
          pointStyle: 'circle',
        },
      },
      title: {
        display: false,
      },
      tooltip: {
        callbacks: {
          title: (items: any[]) => `${exercise} - ${items[0].label}`,
          label: (context: any) => {
            if (context.dataset.label === '趋势线') {
              return `趋势: ${context.parsed.y.toFixed(1)} kg`;
            }
            if (context.dataset.type === 'line') {
              return `长期最大值: ${context.parsed.y} kg`;
            }
            return `${context.parsed.y} kg`;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: '重量 (kg)',
        },
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          maxRotation: 0,
          minRotation: 0,
          font: {
            size: 11,
          },
        },
      },
    },
    maintainAspectRatio: false,
  });

  const recentDateRange = getRecentDateRange();
  const previousDateRange = getPreviousDateRange();
  const recentRecords = getRecordsInRange(recentDateRange);
  const previousRecords = getRecordsInRange(previousDateRange);

  const recentNearFailureSets = calculateNearFailureSets(recentRecords);
  const previousNearFailureSets = calculateNearFailureSets(previousRecords, true);
  const recentTotalWeight = calculateTotalWeight(recentRecords);
  const previousTotalWeight = calculateTotalWeight(previousRecords, true);
  const recentMaxWeights = calculateMaxWeights(recentRecords);
  const previousMaxWeights = calculateMaxWeights(previousRecords);

  return (
    <main className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex flex-col gap-6">
          {/* 顶部控制栏 */}
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
            <h1 className="text-2xl font-bold text-gray-800">训练分析</h1>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">时间范围：</span>
              <select 
                value={weekCount}
                onChange={(e) => setWeekCount(Number(e.target.value))}
                className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value={5}>5周</option>
                <option value={8}>8周</option>
                <option value={12}>12周</option>
              </select>
            </div>
          </div>

          {/* 导航按钮 */}
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setActiveTab('sets')}
              className={`flex-1 px-6 py-3 rounded-lg font-medium text-sm transition-all ${
                activeTab === 'sets'
                ? 'bg-blue-500 text-white shadow-md hover:bg-blue-600'
                : 'bg-white text-gray-600 border border-gray-200 hover:border-blue-500 hover:text-blue-500'
              }`}
            >
              增肌组数对比
            </button>
            <button
              onClick={() => setActiveTab('weight')}
              className={`flex-1 px-6 py-3 rounded-lg font-medium text-sm transition-all ${
                activeTab === 'weight'
                ? 'bg-blue-500 text-white shadow-md hover:bg-blue-600'
                : 'bg-white text-gray-600 border border-gray-200 hover:border-blue-500 hover:text-blue-500'
              }`}
            >
              负重对比
            </button>
            <button
              onClick={() => setActiveTab('maxWeight')}
              className={`flex-1 px-6 py-3 rounded-lg font-medium text-sm transition-all ${
                activeTab === 'maxWeight'
                ? 'bg-blue-500 text-white shadow-md hover:bg-blue-600'
                : 'bg-white text-gray-600 border border-gray-200 hover:border-blue-500 hover:text-blue-500'
              }`}
            >
              最大重量对比
            </button>
          </div>

          {/* 内容区域 */}
          <div className="bg-white rounded-lg shadow-md p-6">
            {activeTab === 'sets' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(recentNearFailureSets).map(([pattern, count]) => (
                  <div key={pattern} className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-medium text-gray-700 mb-2">{pattern}</h3>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">短期组数</span>
                      <span className="font-semibold text-blue-600">{count} 组</span>
                    </div>
                    <div className="flex justify-between items-center mt-1">
                      <span className="text-sm text-gray-500">长期平均组数</span>
                      <span className="font-semibold text-gray-600">
                        {previousNearFailureSets[pattern]} 组/周
                      </span>
                    </div>
                    <div className="flex justify-between items-center mt-1 mb-4">
                      <span className="text-sm text-gray-500">短长期组数比</span>
                      <span className={`font-semibold ${
                        previousNearFailureSets[pattern] === 0 ? 'text-gray-600' :
                        (count / previousNearFailureSets[pattern] > 1.25 ? 'text-red-600' :
                        count / previousNearFailureSets[pattern] < 0.75 ? 'text-yellow-600' :
                        'text-green-600')
                      }`}>
                        {previousNearFailureSets[pattern] === 0 ? '-' : 
                          (count / previousNearFailureSets[pattern]).toFixed(1)}
                      </span>
                    </div>
                    <div className="h-48 mt-4">
                      <Chart 
                        type="bar"
                        options={getChartOptions(pattern as MovementPattern)} 
                        data={getPatternWeeklyData(pattern as MovementPattern)} 
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'weight' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(recentTotalWeight).map(([pattern, weight]) => (
                  <div key={pattern} className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-medium text-gray-700 mb-2">{pattern}</h3>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">短期负重</span>
                      <span className="font-semibold text-blue-600">{weight.toFixed(1)} kg</span>
                    </div>
                    <div className="flex justify-between items-center mt-1">
                      <span className="text-sm text-gray-500">长期平均负重</span>
                      <span className="font-semibold text-gray-600">
                        {previousTotalWeight[pattern].toFixed(1)} kg/周
                      </span>
                    </div>
                    <div className="flex justify-between items-center mt-1 mb-4">
                      <span className="text-sm text-gray-500">短长期负重比</span>
                      <span className={`font-semibold ${
                        previousTotalWeight[pattern] === 0 ? 'text-gray-600' :
                        (weight / previousTotalWeight[pattern] > 1.25 ? 'text-red-600' :
                        weight / previousTotalWeight[pattern] < 0.75 ? 'text-yellow-600' :
                        'text-green-600')
                      }`}>
                        {previousTotalWeight[pattern] === 0 ? '-' : 
                          (weight / previousTotalWeight[pattern]).toFixed(1)}
                      </span>
                    </div>
                    <div className="h-48 mt-4">
                      <Chart 
                        type="bar"
                        options={getWeightChartOptions(pattern as MovementPattern)} 
                        data={getWeightWeeklyData(pattern as MovementPattern)} 
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'maxWeight' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(recentMaxWeights).map(([exercise, { weight, pattern }]) => (
                  <div key={exercise} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="font-medium text-gray-700">{exercise}</h3>
                      <span className="text-sm text-gray-500">{pattern}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">短期</span>
                      <span className="font-semibold text-blue-600">{weight} kg</span>
                    </div>
                    <div className="flex justify-between items-center mt-1">
                      <span className="text-sm text-gray-500">长期</span>
                      <span className="font-semibold text-gray-600">
                        {previousMaxWeights[exercise]?.weight || 0} kg
                      </span>
                    </div>
                    <div className="flex justify-between items-center mt-1 mb-4">
                      <span className="text-sm text-gray-500">变化</span>
                      {previousMaxWeights[exercise]?.weight ? (
                        <span className={`font-semibold ${
                          weight / previousMaxWeights[exercise].weight > 1 ? 'text-green-600' : 
                          weight / previousMaxWeights[exercise].weight < 1 ? 'text-red-600' : 
                          'text-gray-600'
                        }`}>
                          {weight > previousMaxWeights[exercise].weight ? '+' : ''}
                          {((weight / previousMaxWeights[exercise].weight - 1) * 100).toFixed(1)}%
                        </span>
                      ) : (
                        <span className="font-semibold text-gray-600">-</span>
                      )}
                    </div>
                    <div className="h-48 mt-4">
                      <Chart 
                        type="bar"
                        options={getMaxWeightChartOptions(exercise)} 
                        data={getMaxWeightWeeklyData(exercise, pattern as MovementPattern)} 
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
} 