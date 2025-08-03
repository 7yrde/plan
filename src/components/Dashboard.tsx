'use client';

import CategoryCard from './CategoryCard';
import YearSelector from './YearSelector';
import AddGoalModal from './AddGoalModal';
import { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';

interface Category {
  id: number;
  name: string;
  slug: string;
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

  const handleGoalAdded = () => {
    fetchDashboardData();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-xl text-foreground">로딩 중...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* 메인 콘텐츠 */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 연도 선택기 */}
        <YearSelector 
          currentYear={currentYear} 
          onYearChange={setCurrentYear} 
        />

        {/* 새 목표 추가 버튼 */}
        <div className="flex justify-center mb-8">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            <Plus className="w-5 h-5 mr-2" />
            새 목표 추가
          </button>
        </div>

        {/* 카테고리 카드들 */}
        <div className="space-y-6">
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