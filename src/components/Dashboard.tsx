'use client';

import CategoryCard from './CategoryCard';
import YearSelector from './YearSelector';
import AddGoalModal from './AddGoalModal';
import JiraStatus from './JiraStatus';
import { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';

interface Category {
  id: number;
  name: string;
  slug: string;
  color: string;
  icon: string;
  tag?: string;
  link?: string;
}

interface Goal {
  id: number;
  category_id: number;
  year: number;
  slug: string;
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

  const overallProgress = goals.length > 0
    ? Math.round(goals.reduce((sum, g) => sum + g.progress, 0) / goals.length)
    : 0;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-xl text-foreground">로딩 중...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 연도 선택기 */}
        <YearSelector
          currentYear={currentYear}
          onYearChange={setCurrentYear}
        />

        {/* 전체 진척도 요약 */}
        <div className="mb-8 p-6 rounded-lg border border-border bg-card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold text-card-foreground">{currentYear} 전체 진척도</h2>
              <p className="text-sm text-muted-foreground mt-1">
                {categories.length}개 카테고리 · {goals.length}개 목표
              </p>
            </div>
            <span className="text-3xl font-bold text-primary">{overallProgress}%</span>
          </div>
          <div className="w-full bg-muted rounded-full h-3">
            <div
              className="h-3 rounded-full transition-all duration-500"
              style={{
                width: `${overallProgress}%`,
                background: 'linear-gradient(90deg, #4c7cff, #7b4fff)'
              }}
            />
          </div>
          {/* 카테고리별 미니 진척도 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-4">
            {categories.map(cat => {
              const catGoals = goals.filter(g => g.category_id === cat.id);
              const catProgress = catGoals.length > 0
                ? Math.round(catGoals.reduce((s, g) => s + g.progress, 0) / catGoals.length)
                : 0;
              return (
                <div key={cat.id} className="flex items-center gap-2">
                  <span className="text-sm shrink-0">{cat.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs text-muted-foreground truncate">{cat.name}</span>
                      <span className="text-xs font-mono shrink-0" style={{ color: cat.color }}>{catProgress}%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-1.5">
                      <div
                        className="h-1.5 rounded-full transition-all duration-500"
                        style={{ width: `${catProgress}%`, backgroundColor: cat.color }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Jira 연동 상태 */}
        <JiraStatus />

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
