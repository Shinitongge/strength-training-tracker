'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { TrainingRecord } from '@/types/training';

interface TrainingContextType {
  records: TrainingRecord[];
  addRecord: (record: Omit<TrainingRecord, 'id' | 'createdAt'>) => void;
  deleteRecord: (id: string) => void;
  deleteMultipleRecords: (ids: string[]) => void;
  updateRecord: (id: string, record: Partial<TrainingRecord>) => void;
}

const TrainingContext = createContext<TrainingContextType | undefined>(undefined);

export function TrainingProvider({ children }: { children: ReactNode }) {
  const [records, setRecords] = useState<TrainingRecord[]>([]);

  // 从本地存储加载训练记录
  useEffect(() => {
    const saved = localStorage.getItem('trainingRecords');
    if (saved) {
      setRecords(JSON.parse(saved));
    }
  }, []);

  // 添加训练记录
  const addRecord = (record: Omit<TrainingRecord, 'id' | 'createdAt'>) => {
    // 检查是否存在同一天同一动作的记录
    const existingRecordIndex = records.findIndex(
      r => r.date === record.date && r.exercise.id === record.exercise.id
    );

    if (existingRecordIndex !== -1) {
      // 如果存在，更新该记录
      const updated = [...records];
      updated[existingRecordIndex] = {
        ...updated[existingRecordIndex],
        sets: record.sets,
      };
      setRecords(updated);
      localStorage.setItem('trainingRecords', JSON.stringify(updated));
    } else {
      // 如果不存在，添加新记录
      const newRecord: TrainingRecord = {
        ...record,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
      };
      const updated = [...records, newRecord];
      setRecords(updated);
      localStorage.setItem('trainingRecords', JSON.stringify(updated));
    }
  };

  // 删除训练记录
  const deleteRecord = (id: string) => {
    const updated = records.filter(record => record.id !== id);
    setRecords(updated);
    localStorage.setItem('trainingRecords', JSON.stringify(updated));
  };

  // 批量删除训练记录
  const deleteMultipleRecords = (ids: string[]) => {
    const updated = records.filter(record => !ids.includes(record.id));
    setRecords(updated);
    localStorage.setItem('trainingRecords', JSON.stringify(updated));
  };

  // 更新训练记录
  const updateRecord = (id: string, updatedData: Partial<TrainingRecord>) => {
    const updated = records.map(record =>
      record.id === id ? { ...record, ...updatedData } : record
    );
    setRecords(updated);
    localStorage.setItem('trainingRecords', JSON.stringify(updated));
  };

  return (
    <TrainingContext.Provider
      value={{
        records,
        addRecord,
        deleteRecord,
        deleteMultipleRecords,
        updateRecord,
      }}
    >
      {children}
    </TrainingContext.Provider>
  );
}

export function useTraining() {
  const context = useContext(TrainingContext);
  if (context === undefined) {
    throw new Error('useTraining must be used within a TrainingProvider');
  }
  return context;
} 