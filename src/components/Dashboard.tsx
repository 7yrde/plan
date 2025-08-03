'use client';

import { useSession, signOut } from 'next-auth/react';
import CategoryCard from './CategoryCard';
import ThemeToggle from './ThemeToggle';
import YearSelector from './YearSelector';
import AddGoalModal from './AddGoalModal';
import { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';

interface Category {
  id: number;
  name: string;
  color: string;
  icon: string;
}

interface Goal {
  id: number;
  category_id: number;
  year: number;
  title: string;
  description: string;
  target_date: string;
  progress: number;
}

export default function Dashboard() {
  const { data: session } = useSession();
  const [categories, setCategories] = useState<Category[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, [currentYear]);

  const fetchDashboardData = async () => {
    try {
      const [categoriesRes, goalsRes] = await Promise.all([
        fetch('/api/categories'),
        fetch(`/api/goals?year=${currentYear}`)
      ]);

      if (categoriesRes.ok && goalsRes.ok) {
        const categoriesData = await categoriesRes.json();
        const goalsData = await goalsRes.json();
        
        setCategories(categoriesData);
        setGoals(goalsData);
      }
    } catch (error) {
      console.error('데이터 로딩 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = () => {
    signOut({ callbackUrl: '/auth/signin' });
  };

  const handleGoalAdded = () => {
    fetchDashboardData();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-xl text-gray-900">로딩 중...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-2xl font-bold text-gray-900">현황판</h1>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                안녕하세요, {session?.user?.name}님
              </span>
              <ThemeToggle />
              <button
                onClick={handleSignOut}
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                로그아웃
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* 메인 콘텐츠 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 연도 선택기 */}
        <YearSelector 
          currentYear={currentYear} 
          onYearChange={setCurrentYear} 
        />

        {/* 새 목표 추가 버튼 */}
        <div className="flex justify-center mb-8">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5 mr-2" />
            새 목표 추가
          </button>
        </div>

        {/* 카테고리 카드들 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category) => {
            const categoryGoals = goals.filter(goal => goal.category_id === category.id);
            return (
              <CategoryCard
                key={category.id}
                category={category}
                goals={categoryGoals}
              />
            );
          })}
        </div>
      </main>

      {/* 목표 추가 모달 */}
      <AddGoalModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        categories={categories}
        currentYear={currentYear}
        onGoalAdded={handleGoalAdded}
      />
    </div>
  );
} 