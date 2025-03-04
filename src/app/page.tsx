import Navbar from '@/components/Navbar';
import TrainingForm from '@/components/TrainingForm';
import WeeklyProgress from '@/components/WeeklyProgress';

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 记录训练卡片 */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
              <span className="w-1.5 h-6 bg-blue-500 rounded-full mr-3"></span>
              记录训练
            </h2>
            <TrainingForm />
          </div>

          {/* 本周目标进度卡片 */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
              <span className="w-1.5 h-6 bg-green-500 rounded-full mr-3"></span>
              本周目标进度
            </h2>
            <WeeklyProgress />
          </div>
        </div>
      </div>
    </main>
  );
}
