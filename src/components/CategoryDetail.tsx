'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, ArrowLeft } from 'lucide-react';
import AddGoalModal from './AddGoalModal';

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
  slug: string;
  title: string;
  description: string;
  target_date: string;
  progress: number;
}

interface CategoryDetailProps {
  slug: string;
}

export default function CategoryDetail({ slug }: CategoryDetailProps) {
  const [category, setCategory] = useState<Category | null>(null);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  useEffect(() => {
    fetchCategoryData();
  }, [slug, currentYear]);

  const fetchCategoryData = async () => {
    try {
      const [categoryRes, goalsRes] = await Promise.all([
        fetch(`/api/categories/${slug}`),
        fetch(`/api/goals?category=${slug}&year=${currentYear}`)
      ]);

      if (categoryRes.ok && goalsRes.ok) {
        const categoryData = await categoryRes.json();
        const goalsData = await goalsRes.json();
        
        setCategory(categoryData);
        setGoals(goalsData);
      }
    } catch (error) {
      console.error('데이터 로딩 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGoalAdded = () => {
    fetchCategoryData();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-xl text-foreground">로딩 중...</div>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-xl text-foreground">카테고리를 찾을 수 없습니다.</div>
      </div>
    );
  }

  const averageProgress = goals.length > 0 
    ? Math.round(goals.reduce((sum, goal) => sum + goal.progress, 0) / goals.length)
    : 0;

  return (
    <div className="min-h-screen bg-background">
      {/* 메인 콘텐츠 */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 뒤로가기 버튼 */}
        <div className="mb-6">
          <Link
            href="/"
            className="inline-flex items-center text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            뒤로가기
          </Link>
        </div>

        {/* 카테고리 헤더 */}
        <div className="flex items-center space-x-3 mb-8">
          <span className="text-3xl">{category.icon}</span>
          <h1 className="text-3xl font-bold text-foreground">{category.name}</h1>
        </div>

        {/* 연도 선택기 */}
        <div className="flex items-center justify-center mb-8">
          <button
            onClick={() => setCurrentYear(currentYear - 1)}
            className="p-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            ←
          </button>
          <h2 className="text-xl font-bold text-foreground mx-6">
            {currentYear}년
          </h2>
          <button
            onClick={() => setCurrentYear(currentYear + 1)}
            className="p-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            →
          </button>
        </div>

        {/* 전체 진척도 */}
        <div className="bg-card rounded-lg shadow-md border border-border p-6 mb-8">
          <h3 className="text-lg font-semibold text-card-foreground mb-4">전체 진척도</h3>
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <div className="w-full bg-muted rounded-full h-3">
                <div
                  className="h-3 rounded-full transition-all duration-300 bg-primary"
                  style={{ width: `${averageProgress}%` }}
                />
              </div>
            </div>
            <span className="text-lg font-bold text-card-foreground min-w-[60px] text-right">
              {averageProgress}%
            </span>
          </div>
        </div>

        {/* 목표 목록 헤더 */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-foreground">목표 목록 ({goals.length})</h3>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            <Plus className="w-5 h-5 mr-2" />
            새 목표 추가
          </button>
        </div>

        {/* 목표 목록 */}
        <div className="space-y-4">
          {goals.length === 0 ? (
            <div className="bg-card rounded-lg border border-border p-8 text-center">
              <p className="text-muted-foreground">이 카테고리에 목표가 없습니다.</p>
            </div>
          ) : (
            goals.map((goal) => (
              <div
                key={goal.id}
                className="bg-card rounded-lg border border-border p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h4 className="text-lg font-semibold text-card-foreground mb-2">
                      {goal.title}
                    </h4>
                    {goal.description && (
                      <p className="text-muted-foreground mb-2">
                        {goal.description}
                      </p>
                    )}
                    {goal.target_date && (
                      <p className="text-sm text-muted-foreground">
                        목표 날짜: {new Date(goal.target_date).toLocaleDateString('ko-KR')}
                      </p>
                    )}
                  </div>
                  <Link
                    href={`/goal/${goal.slug}`}
                    className="text-sm text-primary hover:text-primary/80 font-medium transition-colors"
                  >
                    상세보기 →
                  </Link>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="flex-1">
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className="h-2 rounded-full transition-all duration-300 bg-primary"
                        style={{ width: `${goal.progress}%` }}
                      />
                    </div>
                  </div>
                  <span className="text-sm font-medium text-card-foreground min-w-[50px] text-right">
                    {goal.progress}%
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </main>

      {/* 목표 추가 모달 */}
      <AddGoalModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        categories={[category]}
        currentYear={currentYear}
        onGoalAdded={handleGoalAdded}
      />
    </div>
  );
} 