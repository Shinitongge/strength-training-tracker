'use client';

import { useTraining } from '@/contexts/TrainingContext';
import { MovementPattern } from '@/types/training';

interface PatternProgress {
  pattern: MovementPattern;
  nearFailureSets: number;
}

export default function WeeklyProgress() {
  const { records } = useTraining();
  const WEEKLY_GOAL = 10; // 每个动作模式每周10组力竭

  // 获取最近7天的日期范围
  const getLastWeekRange = () => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - 6); // 包括今天在内的7天
    return { start, end };
  };

  // 计算每个动作模式的力竭组数
  const calculatePatternProgress = (): PatternProgress[] => {
    const { start, end } = getLastWeekRange();
    const startDate = start.toISOString().split('T')[0];
    const endDate = end.toISOString().split('T')[0];

    // 初始化每个动作模式的统计
    const patterns: MovementPattern[] = [
      '下肢推', '下肢拉', '上肢垂直推', '上肢垂直拉', '上肢水平推', '上肢水平拉'
    ];
    const progressMap = new Map<MovementPattern, number>();
    patterns.forEach(pattern => {
      progressMap.set(pattern, 0);
    });

    // 统计近7天的力竭组数
    records.forEach(record => {
      if (record.date >= startDate && record.date <= endDate) {
        const nearFailureSets = record.sets.filter(set => set.isNearFailure).length;
        const currentCount = progressMap.get(record.exercise.pattern) || 0;
        progressMap.set(record.exercise.pattern, currentCount + nearFailureSets);
      }
    });

    // 转换为数组格式
    return Array.from(progressMap.entries()).map(([pattern, count]) => ({
      pattern,
      nearFailureSets: count,
    }));
  };

  const patternProgress = calculatePatternProgress();

  // 获取进度条渐变色样式
  const getProgressGradient = (percentage: number) => {
    if (percentage >= 100) {
      // 超过目标时显示绿色渐变
      return 'bg-gradient-to-r from-green-400 via-green-500 to-green-600';
    }
    // 未达到目标时显示从红到黄的渐变
    return 'bg-gradient-to-r from-red-500 via-yellow-400 to-green-500';
  };

  // 获取文字颜色
  const getTextColor = (percentage: number) => {
    if (percentage >= 100) {
      return 'text-green-600';
    }
    if (percentage >= 50) {
      return 'text-yellow-600';
    }
    return 'text-red-600';
  };

  return (
    <div className="space-y-4">
      {patternProgress.map(({ pattern, nearFailureSets }) => {
        const progressPercentage = Math.min((nearFailureSets / WEEKLY_GOAL) * 100, 100);
        const remainingSets = Math.max(WEEKLY_GOAL - nearFailureSets, 0);
        const progressGradient = getProgressGradient(progressPercentage);
        const textColor = getTextColor(progressPercentage);
        
        return (
          <div key={pattern} className="bg-gray-50 rounded-lg p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="font-medium text-gray-700">{pattern}</span>
              <span className={`font-semibold ${textColor}`}>
                {nearFailureSets >= WEEKLY_GOAL 
                  ? `已完成 ${nearFailureSets} 组`
                  : `还需 ${remainingSets} 组`
                }
              </span>
            </div>
            <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
              <div
                className={`h-full ${progressGradient} transition-all duration-500`}
                style={{
                  width: `${progressPercentage}%`,
                  backgroundSize: '200% 100%',
                  backgroundPosition: `${100 - progressPercentage}% 0`,
                }}
              />
            </div>
            <div className="mt-1 flex justify-between text-xs text-gray-500">
              <span>本周力竭组数: {nearFailureSets}</span>
              <span>目标: {WEEKLY_GOAL} 组/周</span>
            </div>
          </div>
        );
      })}
    </div>
  );
} 