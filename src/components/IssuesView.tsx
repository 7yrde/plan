'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { Search, Calendar, Tag, Clock, CheckCircle, Circle, AlertCircle } from 'lucide-react';

interface Goal {
  id: number;
  slug: string;
  title: string;
  description: string;
  content: string;
  status: string;
  priority: string;
  start_date: string;
  target_date: string;
  category: {
    id: number;
    name: string;
    slug: string;
    icon: string;
  };
  progress: number;
}

export default function IssuesView() {
  const { data: session } = useSession();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [filteredGoals, setFilteredGoals] = useState<Goal[]>([]);
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  const fetchGoals = useCallback(async () => {
    try {
      const response = await fetch(`/api/goals?year=${selectedYear}`);
      if (response.ok) {
        const data = await response.json();
        setGoals(data);
        if (data.length > 0 && !selectedGoal) {
          setSelectedGoal(data[0]);
        }
      }
    } catch (error) {
      console.error('목표 조회 실패:', error);
    } finally {
      setLoading(false);
    }
  }, [selectedYear, selectedGoal]);

  const filterGoals = useCallback(() => {
    let filtered = goals;

    // 카테고리 필터
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(goal => goal.category.slug === selectedCategory);
    }

    // 검색어 필터
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(goal => 
        goal.title.toLowerCase().includes(term) ||
        goal.description.toLowerCase().includes(term) ||
        (goal.content && goal.content.toLowerCase().includes(term))
      );
    }

    setFilteredGoals(filtered);
  }, [goals, searchTerm, selectedCategory]);

  useEffect(() => {
    fetchGoals();
  }, [fetchGoals]);

  useEffect(() => {
    filterGoals();
  }, [filterGoals]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open':
        return <Circle className="w-4 h-4 text-blue-500" />;
      case 'in_progress':
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      case 'resolved':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'closed':
        return <CheckCircle className="w-4 h-4 text-gray-500" />;
      default:
        return <Circle className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'open':
        return '열림';
      case 'in_progress':
        return '진행중';
      case 'resolved':
        return '해결됨';
      case 'closed':
        return '종료';
      default:
        return status;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'text-red-500';
      case 'medium':
        return 'text-yellow-500';
      case 'low':
        return 'text-green-500';
      default:
        return 'text-gray-500';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">로딩 중...</div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background">
      {/* 사이드바 - 이슈 리스트 */}
      <div className="w-1/3 border-r border-border bg-card">
        <div className="p-4 border-b border-border">
          <h1 className="text-xl font-bold text-foreground mb-4">전체 이슈</h1>
          
          {/* 검색바 */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <input
              type="text"
              placeholder="이슈 제목, 내용으로 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          {/* 연도 선택 */}
          <div className="flex items-center space-x-2 mb-4">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className="border border-input rounded-md px-2 py-1 bg-background text-foreground"
            >
              {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map(year => (
                <option key={year} value={year}>{year}년</option>
              ))}
            </select>
          </div>

          {/* 카테고리 필터 */}
          <div className="flex items-center space-x-2 mb-4">
            <Tag className="w-4 h-4 text-muted-foreground" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="border border-input rounded-md px-2 py-1 bg-background text-foreground"
            >
              <option value="all">전체 카테고리</option>
              <option value="computer">컴퓨터</option>
              <option value="music">음악</option>
              <option value="health">건강</option>
              <option value="money">돈</option>
              <option value="language">언어</option>
            </select>
          </div>
        </div>

        {/* 이슈 리스트 */}
        <div className="overflow-y-auto h-full">
          {filteredGoals.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground">
              검색 결과가 없습니다.
            </div>
          ) : (
            filteredGoals.map((goal) => (
              <div
                key={goal.id}
                onClick={() => setSelectedGoal(goal)}
                className={`p-4 border-b border-border cursor-pointer hover:bg-muted/50 transition-colors ${
                  selectedGoal?.id === goal.id ? 'bg-muted' : ''
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-medium text-foreground line-clamp-2">
                    {goal.title}
                  </h3>
                  <div className="flex items-center space-x-1">
                    {getStatusIcon(goal.status)}
                  </div>
                </div>
                
                <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                  {goal.description}
                </p>
                
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <div className="flex items-center space-x-2">
                    <span className="px-2 py-1 bg-muted rounded">
                      {goal.category.name}
                    </span>
                    <span className={getPriorityColor(goal.priority)}>
                      {goal.priority === 'high' ? '높음' : goal.priority === 'medium' ? '보통' : '낮음'}
                    </span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Clock className="w-3 h-3" />
                    <span>{goal.target_date || '기한 없음'}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* 메인 영역 - 상세 페이지 */}
      <div className="flex-1 bg-background">
        {selectedGoal ? (
          <div className="h-full overflow-y-auto">
            <div className="p-6">
              {/* 헤더 */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(selectedGoal.status)}
                    <h1 className="text-2xl font-bold text-foreground">
                      {selectedGoal.title}
                    </h1>
                  </div>
                  <Link
                    href={`/goal/${selectedGoal.slug}`}
                    className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
                  >
                    상세 페이지로 이동
                  </Link>
                </div>
                
                <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                  <span>카테고리: {selectedGoal.category.name}</span>
                  <span>상태: {getStatusText(selectedGoal.status)}</span>
                  <span className={getPriorityColor(selectedGoal.priority)}>
                    우선순위: {selectedGoal.priority === 'high' ? '높음' : selectedGoal.priority === 'medium' ? '보통' : '낮음'}
                  </span>
                  <span>진행률: {selectedGoal.progress}%</span>
                </div>
              </div>

              {/* 설명 */}
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-foreground mb-2">설명</h2>
                <p className="text-foreground bg-muted/50 p-4 rounded-md">
                  {selectedGoal.description}
                </p>
              </div>

              {/* 본문 내용 */}
              {selectedGoal.content && (
                <div className="mb-6">
                  <h2 className="text-lg font-semibold text-foreground mb-2">본문</h2>
                  <div className="bg-muted/50 p-4 rounded-md text-foreground">
                    <div className="prose prose-sm max-w-none">
                      {selectedGoal.content}
                    </div>
                  </div>
                </div>
              )}

              {/* 날짜 정보 */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-foreground mb-1">시작일</h3>
                  <p className="text-sm text-muted-foreground">
                    {selectedGoal.start_date || '미정'}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-foreground mb-1">목표일</h3>
                  <p className="text-sm text-muted-foreground">
                    {selectedGoal.target_date || '미정'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-muted-foreground">
              <p className="text-lg mb-2">이슈를 선택해주세요</p>
              <p className="text-sm">왼쪽 목록에서 이슈를 클릭하면 상세 내용을 볼 수 있습니다.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 