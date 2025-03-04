// 动作模式类型
export type MovementPattern = '下肢推' | '下肢拉' | '上肢垂直推' | '上肢垂直拉' | '上肢水平推' | '上肢水平拉';

// 训练动作类型
export interface Exercise {
  id: string;
  name: string;
  pattern: MovementPattern;
}

// 训练组数据类型
export interface Set {
  weight: number;
  reps: number;
  isNearFailure: boolean;
}

// 训练记录类型
export interface TrainingRecord {
  id: string;
  date: string;
  exercise: Exercise;
  sets: Set[];
  createdAt: string;
} 