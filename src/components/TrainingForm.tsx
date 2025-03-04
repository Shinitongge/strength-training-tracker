'use client';

import { useState, useEffect } from 'react';
import { Exercise, MovementPattern, Set } from '@/types/training';
import { useTraining } from '@/contexts/TrainingContext';

export default function TrainingForm() {
  const { addRecord } = useTraining();
  
  // 状态管理
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [savedExercises, setSavedExercises] = useState<Exercise[]>([]);
  const [newExercise, setNewExercise] = useState('');
  const [selectedPattern, setSelectedPattern] = useState<MovementPattern>('下肢推');
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [currentSet, setCurrentSet] = useState<Set>({ weight: 0, reps: 0, isNearFailure: false });
  const [setNumber, setSetNumber] = useState(1);
  const [sets, setSets] = useState<Set[]>([]);
  const [isTrainingComplete, setIsTrainingComplete] = useState(false);

  // 动作模式选项
  const patterns: MovementPattern[] = [
    '下肢推', '下肢拉', '上肢垂直推', '上肢垂直拉', '上肢水平推', '上肢水平拉'
  ];

  // 从本地存储加载已保存的动作
  useEffect(() => {
    const saved = localStorage.getItem('savedExercises');
    if (saved) {
      setSavedExercises(JSON.parse(saved));
    }
  }, []);

  // 保存动作到本地存储
  const saveExercise = () => {
    if (newExercise.trim()) {
      const exercise: Exercise = {
        id: Date.now().toString(),
        name: newExercise.trim(),
        pattern: selectedPattern,
      };
      const updated = [...savedExercises, exercise];
      setSavedExercises(updated);
      localStorage.setItem('savedExercises', JSON.stringify(updated));
      setNewExercise('');
    }
  };

  // 删除已保存的动作
  const deleteExercise = (id: string) => {
    const updated = savedExercises.filter(ex => ex.id !== id);
    setSavedExercises(updated);
    localStorage.setItem('savedExercises', JSON.stringify(updated));
  };

  // 确认当前组
  const confirmSet = () => {
    if (currentSet.weight > 0 && currentSet.reps > 0) {
      const newSets = [...sets, currentSet];
      setSets(newSets);

      // 立即保存当前动作的所有组数据
      addRecord({
        date,
        exercise: selectedExercise!,
        sets: newSets,
      });

      setCurrentSet({ weight: 0, reps: 0, isNearFailure: false });
      setSetNumber(setNumber + 1);
    }
  };

  // 开始新动作
  const startNewExercise = () => {
    setSelectedExercise(null);
    setSets([]);
    setSetNumber(1);
    setCurrentSet({ weight: 0, reps: 0, isNearFailure: false });
  };

  // 完成训练
  const completeTraining = () => {
    setIsTrainingComplete(true);
    setSelectedExercise(null);
    setSets([]);
    setSetNumber(1);
    setCurrentSet({ weight: 0, reps: 0, isNearFailure: false });
  };

  // 开始新的训练
  const startNewTraining = () => {
    setDate(new Date().toISOString().split('T')[0]);
    setIsTrainingComplete(false);
  };

  return (
    <div className="space-y-6">
      {isTrainingComplete ? (
        <div className="text-center py-8">
          <div className="mb-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-lg text-green-600 font-medium">训练已完成！</p>
          </div>
          <button
            onClick={startNewTraining}
            className="bg-blue-500 text-white py-2.5 px-6 rounded-lg hover:bg-blue-600 focus:ring-2 focus:ring-blue-200 transition-colors"
          >
            开始新的训练
          </button>
        </div>
      ) : (
        <>
          {/* 日期选择 */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1.5">训练日期</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-gray-600 bg-white hover:border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors"
            />
          </div>

          {!selectedExercise ? (
            <>
              {/* 添加新动作 */}
              <div className="space-y-4 bg-gray-50 rounded-lg p-4 border border-gray-100">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1.5">动作名称</label>
                  <input
                    type="text"
                    value={newExercise}
                    onChange={(e) => setNewExercise(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-gray-600 bg-white hover:border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors"
                    placeholder="输入动作名称"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1.5">动作模式</label>
                  <select
                    value={selectedPattern}
                    onChange={(e) => setSelectedPattern(e.target.value as MovementPattern)}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-gray-600 bg-white hover:border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors"
                  >
                    {patterns.map(pattern => (
                      <option key={pattern} value={pattern}>{pattern}</option>
                    ))}
                  </select>
                </div>
                <button
                  onClick={saveExercise}
                  disabled={!newExercise.trim()}
                  className="w-full bg-green-500 text-white py-2.5 rounded-lg hover:bg-green-600 focus:ring-2 focus:ring-green-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  保存动作
                </button>
              </div>

              {/* 已保存的动作列表 */}
              <div>
                <h3 className="text-sm font-medium text-gray-600 mb-3">选择动作</h3>
                <div className="space-y-2 max-h-[320px] overflow-y-auto pr-2">
                  {savedExercises.map((exercise) => (
                    <div 
                      key={exercise.id} 
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100 hover:border-gray-300 transition-colors group"
                    >
                      <div>
                        <p className="font-medium text-gray-700">{exercise.name}</p>
                        <p className="text-sm text-gray-400">{exercise.pattern}</p>
                      </div>
                      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => setSelectedExercise(exercise)}
                          className="px-3 py-1.5 text-sm bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-200 transition-colors"
                        >
                          选择
                        </button>
                        <button
                          onClick={() => deleteExercise(exercise.id)}
                          className="px-3 py-1.5 text-sm bg-red-500 text-white rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-200 transition-colors"
                        >
                          删除
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            /* 训练组记录 */
            <div className="space-y-4">
              <div className="flex justify-between items-center bg-gray-50 rounded-lg p-4 border border-gray-100">
                <h3 className="font-medium text-gray-700">
                  {selectedExercise.name} - 第{setNumber}组
                </h3>
                <div className="flex gap-2">
                  <button
                    onClick={startNewExercise}
                    className="px-4 py-2 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-200 transition-colors"
                  >
                    下一个动作
                  </button>
                  <button
                    onClick={completeTraining}
                    className="px-4 py-2 text-sm bg-green-500 text-white rounded-lg hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-200 transition-colors"
                  >
                    完成训练
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1.5">重量(kg)</label>
                  <input
                    type="number"
                    value={currentSet.weight || ''}
                    onChange={(e) => setCurrentSet({ ...currentSet, weight: Number(e.target.value) })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-gray-600 bg-white hover:border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors"
                    min="0"
                    step="0.5"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1.5">重复次数</label>
                  <input
                    type="number"
                    value={currentSet.reps || ''}
                    onChange={(e) => setCurrentSet({ ...currentSet, reps: Number(e.target.value) })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-gray-600 bg-white hover:border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors"
                    min="0"
                  />
                </div>
              </div>

              <div className="flex items-center bg-yellow-50 rounded-lg p-4 border border-yellow-100 hover:border-yellow-200 transition-colors">
                <input
                  type="checkbox"
                  checked={currentSet.isNearFailure}
                  onChange={(e) => setCurrentSet({ ...currentSet, isNearFailure: e.target.checked })}
                  className="h-5 w-5 text-yellow-500 rounded border-yellow-300 focus:ring-2 focus:ring-yellow-200 transition-colors hover:border-yellow-400"
                />
                <label className="ml-2.5 text-sm font-medium text-yellow-700 flex items-center gap-1.5">
                  接近力竭
                  <svg className="w-4 h-4 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </label>
              </div>

              <button
                onClick={confirmSet}
                disabled={!(currentSet.weight > 0 && currentSet.reps > 0)}
                className="w-full bg-blue-500 text-white py-2.5 rounded-lg hover:bg-blue-600 focus:ring-2 focus:ring-blue-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                确认本组
              </button>

              {/* 已记录的组数据 */}
              {sets.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-600 mb-3">已记录的组数</h4>
                  <div className="space-y-2 max-h-[240px] overflow-y-auto pr-2">
                    {sets.map((set, index) => (
                      <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-gray-100">
                        <span className="text-sm text-gray-400">第{index + 1}组</span>
                        <span className="text-sm font-medium text-gray-700">{set.weight}kg × {set.reps}次</span>
                        {set.isNearFailure && (
                          <span className="text-sm text-yellow-500 font-medium">接近力竭</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
} 