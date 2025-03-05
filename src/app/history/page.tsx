'use client';

import { useState } from 'react';
import Navbar from '@/components/Navbar';
import { useTraining } from '@/contexts/TrainingContext';
import { TrainingRecord } from '@/types/training';

type SortOrder = 'asc' | 'desc';

export default function HistoryPage() {
  const { records, deleteRecord, deleteMultipleRecords } = useTraining();
  const [selectedRecords, setSelectedRecords] = useState<string[]>([]);
  const [filterType, setFilterType] = useState('all');
  const [filterDate, setFilterDate] = useState('');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  // 过滤和排序记录
  const filteredRecords = records
    .filter(record => {
      if (filterType === 'all') return true;
      return record.exercise.pattern === filterType;
    })
    .filter(record => {
      if (!filterDate) return true;
      return record.date === filterDate;
    })
    .sort((a, b) => {
      const compareResult = a.date.localeCompare(b.date);
      return sortOrder === 'asc' ? compareResult : -compareResult;
    });

  // 处理选择记录
  const handleSelectRecord = (id: string) => {
    setSelectedRecords(prev =>
      prev.includes(id)
        ? prev.filter(recordId => recordId !== id)
        : [...prev, id]
    );
  };

  // 处理批量删除
  const handleBatchDelete = () => {
    if (selectedRecords.length > 0) {
      if (window.confirm(`确定要删除选中的 ${selectedRecords.length} 条记录吗？`)) {
        deleteMultipleRecords(selectedRecords);
        setSelectedRecords([]);
      }
    }
  };

  // 切换排序顺序
  const toggleSortOrder = () => {
    setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
  };

  // 格式化组数据显示
  const formatSets = (sets: TrainingRecord['sets']) => {
    return sets.map(set => 
      `${set.weight}kg×${set.reps}次${set.isNearFailure ? '(力竭)' : ''}`
    ).join('  ·  ');
  };

  return (
    <main className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
          <h1 className="text-2xl font-bold text-gray-800">训练历史</h1>
          <div className="flex flex-col md:flex-row gap-4">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-2.5 border border-gray-200 rounded-lg text-gray-600 bg-white hover:border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors"
            >
              <option value="all">所有类型</option>
              <option value="下肢推">下肢推</option>
              <option value="下肢拉">下肢拉</option>
              <option value="上肢垂直推">上肢垂直推</option>
              <option value="上肢垂直拉">上肢垂直拉</option>
              <option value="上肢水平推">上肢水平推</option>
              <option value="上肢水平拉">上肢水平拉</option>
            </select>
            <input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="px-4 py-2.5 border border-gray-200 rounded-lg text-gray-600 bg-white hover:border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors"
            />
          </div>
        </div>

        {selectedRecords.length > 0 && (
          <div className="mb-4 flex justify-between items-center bg-white rounded-lg shadow-sm border border-gray-100 p-4">
            <span className="text-gray-500">已选择 {selectedRecords.length} 条记录</span>
            <button
              onClick={handleBatchDelete}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 focus:ring-2 focus:ring-red-200 transition-colors"
            >
              批量删除
            </button>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-sm border border-gray-100">
          {/* 表头 */}
          <div className="grid grid-cols-7 gap-1 sm:gap-4 p-2 sm:p-4 border-b border-gray-100 bg-gray-50">
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={selectedRecords.length === filteredRecords.length && filteredRecords.length > 0}
                onChange={() => {
                  if (selectedRecords.length === filteredRecords.length) {
                    setSelectedRecords([]);
                  } else {
                    setSelectedRecords(filteredRecords.map(r => r.id));
                  }
                }}
                className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600 rounded border-gray-300 focus:ring-2 focus:ring-blue-200 transition-colors"
              />
            </div>
            <div className="text-xs sm:text-sm font-medium text-gray-500">
              <button 
                onClick={toggleSortOrder} 
                className="flex items-center hover:text-blue-600 transition-colors"
              >
                日期 {sortOrder === 'asc' ? '↑' : '↓'}
              </button>
            </div>
            <div className="text-xs sm:text-sm font-medium text-gray-500">动作名称</div>
            <div className="text-xs sm:text-sm font-medium text-gray-500">动作模式</div>
            <div className="col-span-2 text-xs sm:text-sm font-medium text-gray-500">训练详情</div>
            <div className="text-xs sm:text-sm font-medium text-gray-500">操作</div>
          </div>

          {/* 训练记录列表 */}
          <div className="divide-y divide-gray-100">
            {filteredRecords.map((record) => (
              <div key={record.id} className="grid grid-cols-7 gap-1 sm:gap-4 p-2 sm:p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={selectedRecords.includes(record.id)}
                    onChange={() => handleSelectRecord(record.id)}
                    className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600 rounded border-gray-300 focus:ring-2 focus:ring-blue-200 transition-colors"
                  />
                </div>
                <div className="text-xs sm:text-sm text-gray-400">{record.date}</div>
                <div className="text-xs sm:text-sm font-medium text-gray-700 truncate">{record.exercise.name}</div>
                <div className="text-xs sm:text-sm text-gray-400 truncate">{record.exercise.pattern}</div>
                <div className="col-span-2 text-xs sm:text-sm text-gray-500 overflow-hidden text-ellipsis whitespace-nowrap">
                  {formatSets(record.sets)}
                </div>
                <div>
                  <button
                    onClick={() => {
                      if (window.confirm('确定要删除这条记录吗？')) {
                        deleteRecord(record.id);
                      }
                    }}
                    className="text-xs sm:text-sm text-red-500 hover:text-red-600 hover:underline focus:outline-none focus:ring-2 focus:ring-red-200 rounded px-1 sm:px-2 py-0.5 sm:py-1 transition-colors"
                  >
                    删除
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* 空状态 */}
          {filteredRecords.length === 0 && (
            <div className="p-8 text-center text-gray-400">
              暂无训练记录
            </div>
          )}
        </div>
      </div>
    </main>
  );
}