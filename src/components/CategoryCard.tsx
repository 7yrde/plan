'use client';

import Link from 'next/link';

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

interface CategoryCardProps {
  category: Category;
  goals: Goal[];
}

export default function CategoryCard({ category, goals }: CategoryCardProps) {
  const averageProgress = goals.length > 0
    ? Math.round(goals.reduce((sum, goal) => sum + goal.progress, 0) / goals.length)
    : 0;

  return (
    <div className="bg-card rounded-lg shadow-md overflow-hidden border border-border">
      {/* 카테고리 헤더 */}
      <div className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="text-2xl">{category.icon}</span>
            <h2 className="text-xl font-semibold text-card-foreground">{category.name}</h2>
            {category.tag && (
              <span
                className="text-xs font-mono px-2 py-0.5 rounded"
                style={{ backgroundColor: `${category.color}20`, color: category.color, border: `1px solid ${category.color}40` }}
              >
                {category.tag}
              </span>
            )}
          </div>
          <div className="flex items-center space-x-3">
            {category.link && (
              <a
                href={category.link}
                className="text-xs font-mono text-muted-foreground hover:text-primary transition-colors"
                target="_blank"
                rel="noopener noreferrer"
              >
                서비스 →
              </a>
            )}
            <Link
              href={`/category/${category.slug}`}
              className="text-sm text-primary hover:text-primary/80 font-medium transition-colors"
            >
              상세보기 →
            </Link>
          </div>
        </div>

        {/* 전체 진척도 */}
        <div className="mt-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-muted-foreground">전체 진척도</span>
            <span className="text-sm font-medium text-card-foreground">{averageProgress}%</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div
              className="h-2 rounded-full transition-all duration-300"
              style={{ width: `${averageProgress}%`, backgroundColor: category.color }}
            />
          </div>
        </div>
      </div>

      {/* 목표 목록 */}
      <div className="px-6 pb-6">
        <h3 className="text-sm font-medium text-muted-foreground mb-3">목표 ({goals.length})</h3>
        <div className="space-y-3">
          {goals.length === 0 ? (
            <p className="text-sm text-muted-foreground italic">목표가 없습니다</p>
          ) : (
            goals.map((goal) => (
              <Link
                key={goal.id}
                href={`/goal/${goal.slug}`}
                className="block p-3 bg-muted/50 rounded-md hover:bg-muted transition-colors"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      {goal.slug && (
                        <span className="text-xs font-mono text-muted-foreground uppercase">
                          {goal.slug}
                        </span>
                      )}
                      <h4 className="text-sm font-medium text-card-foreground line-clamp-1">
                        {goal.title}
                      </h4>
                    </div>
                    {goal.description && (
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {goal.description}
                      </p>
                    )}
                  </div>
                  <span className="text-xs font-medium text-muted-foreground ml-2">
                    {goal.progress}%
                  </span>
                </div>
                <div className="mt-2">
                  <div className="w-full bg-muted rounded-full h-1">
                    <div
                      className="h-1 rounded-full transition-all duration-300"
                      style={{ width: `${goal.progress}%`, backgroundColor: category.color }}
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
