'use client';

import Link from 'next/link';

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

interface CategoryCardProps {
  category: Category;
  goals: Goal[];
}

export default function CategoryCard({ category, goals }: CategoryCardProps) {
  const averageProgress = goals.length > 0 
    ? Math.round(goals.reduce((sum, goal) => sum + goal.progress, 0) / goals.length)
    : 0;

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {/* 카테고리 헤더 */}
      <div 
        className="p-6"
        style={{ borderLeft: `4px solid ${category.color}` }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="text-2xl">{category.icon}</span>
            <h2 className="text-xl font-semibold text-gray-900">{category.name}</h2>
          </div>
          <Link
            href={`/category/${category.id}`}
            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            상세보기 →
          </Link>
        </div>
        
        {/* 전체 진척도 */}
        <div className="mt-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-600">전체 진척도</span>
            <span className="text-sm font-medium text-gray-900">{averageProgress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="h-2 rounded-full transition-all duration-300"
              style={{ 
                width: `${averageProgress}%`,
                backgroundColor: category.color
              }}
            />
          </div>
        </div>
      </div>

      {/* 목표 목록 */}
      <div className="px-6 pb-6">
        <h3 className="text-sm font-medium text-gray-700 mb-3">목표 ({goals.length})</h3>
        <div className="space-y-3">
          {goals.length === 0 ? (
            <p className="text-sm text-gray-500 italic">목표가 없습니다</p>
          ) : (
            goals.map((goal) => (
              <Link
                key={goal.id}
                href={`/goal/${goal.id}`}
                className="block p-3 bg-gray-50 rounded-md hover:bg-gray-100 transition-colors"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-gray-900 line-clamp-1">
                      {goal.title}
                    </h4>
                    {goal.description && (
                      <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                        {goal.description}
                      </p>
                    )}
                  </div>
                  <span className="text-xs font-medium text-gray-500 ml-2">
                    {goal.progress}%
                  </span>
                </div>
                <div className="mt-2">
                  <div className="w-full bg-gray-200 rounded-full h-1">
                    <div
                      className="h-1 rounded-full transition-all duration-300"
                      style={{ 
                        width: `${goal.progress}%`,
                        backgroundColor: category.color
                      }}
                    />
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
} 