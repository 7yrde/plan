'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Calendar, Tag, FileText, MessageCircle, Paperclip, Heart, Edit, Save, X } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface Goal {
  id: number;
  category_id: number;
  year: number;
  slug: string;
  title: string;
  description: string;
  content: string;
  status: string;
  priority: string;
  start_date: string;
  target_date: string;
  created_at: string;
  updated_at: string;
  category: {
    name: string;
    slug: string;
    icon: string;
  };
}

interface Comment {
  id: number;
  goal_id: number;
  user_id: number;
  content: string;
  likes: number;
  created_at: string;
  user: {
    username: string;
  };
}

interface Attachment {
  id: number;
  goal_id: number;
  filename: string;
  original_name: string;
  file_size: number;
  mime_type: string;
  created_at: string;
}

interface GoalDetailProps {
  slug: string;
}

const STATUS_OPTIONS = [
  { value: 'open', label: '열림', color: 'bg-blue-100 text-blue-800' },
  { value: 'in_progress', label: '진행중', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'resolved', label: '해결', color: 'bg-green-100 text-green-800' },
  { value: 'closed', label: '종료', color: 'bg-gray-100 text-gray-800' }
];

const PRIORITY_OPTIONS = [
  { value: 'low', label: '낮음', color: 'bg-gray-100 text-gray-800' },
  { value: 'medium', label: '보통', color: 'bg-blue-100 text-blue-800' },
  { value: 'high', label: '높음', color: 'bg-orange-100 text-orange-800' },
  { value: 'critical', label: '긴급', color: 'bg-red-100 text-red-800' }
];

export default function GoalDetail({ slug }: GoalDetailProps) {
  const [goal, setGoal] = useState<Goal | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingContent, setEditingContent] = useState(false);
  const [content, setContent] = useState('');
  const [newComment, setNewComment] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    fetchGoalData();
  }, [slug]);

  const fetchGoalData = async () => {
    try {
      const [goalRes, commentsRes, attachmentsRes] = await Promise.all([
        fetch(`/api/goals/${slug}`),
        fetch(`/api/goals/${slug}/comments`),
        fetch(`/api/goals/${slug}/attachments`)
      ]);

      if (goalRes.ok) {
        const goalData = await goalRes.json();
        setGoal(goalData);
        setContent(goalData.content || '');
      }

      if (commentsRes.ok) {
        const commentsData = await commentsRes.json();
        setComments(commentsData);
      }

      if (attachmentsRes.ok) {
        const attachmentsData = await attachmentsRes.json();
        setAttachments(attachmentsData);
      }
    } catch (error) {
      console.error('데이터 로딩 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (status: string) => {
    if (!goal) return;

    try {
      const response = await fetch(`/api/goals/${goal.slug}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });

      if (response.ok) {
        setGoal({ ...goal, status });
      }
    } catch (error) {
      console.error('상태 업데이트 실패:', error);
    }
  };

  const handlePriorityChange = async (priority: string) => {
    if (!goal) return;

    try {
      const response = await fetch(`/api/goals/${goal.slug}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priority })
      });

      if (response.ok) {
        setGoal({ ...goal, priority });
      }
    } catch (error) {
      console.error('우선순위 업데이트 실패:', error);
    }
  };

  const handleContentSave = async () => {
    if (!goal) return;

    try {
      const response = await fetch(`/api/goals/${goal.slug}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content })
      });

      if (response.ok) {
        setEditingContent(false);
        setGoal({ ...goal, content });
      }
    } catch (error) {
      console.error('내용 저장 실패:', error);
    }
  };

  const handleCommentSubmit = async () => {
    if (!goal || !newComment.trim()) return;

    try {
      const response = await fetch(`/api/goals/${goal.slug}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newComment })
      });

      if (response.ok) {
        setNewComment('');
        fetchGoalData(); // 댓글 목록 새로고침
      }
    } catch (error) {
      console.error('댓글 작성 실패:', error);
    }
  };

  const handleFileUpload = async () => {
    if (!goal || !selectedFile) return;

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const response = await fetch(`/api/goals/${goal.slug}/attachments`, {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        setSelectedFile(null);
        fetchGoalData(); // 첨부파일 목록 새로고침
      }
    } catch (error) {
      console.error('파일 업로드 실패:', error);
    }
  };

  const handleCommentLike = async (commentId: number) => {
    try {
      const response = await fetch(`/api/comments/${commentId}/like`, {
        method: 'POST'
      });

      if (response.ok) {
        fetchGoalData(); // 댓글 목록 새로고침
      }
    } catch (error) {
      console.error('좋아요 실패:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-xl text-foreground">로딩 중...</div>
      </div>
    );
  }

  if (!goal) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-xl text-foreground">목표를 찾을 수 없습니다.</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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

        {/* 헤더 */}
        <div className="bg-card rounded-lg border border-border p-6 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <span className="text-2xl">{goal.category.icon}</span>
                <h1 className="text-2xl font-bold text-card-foreground">{goal.title}</h1>
                <span className="text-sm text-muted-foreground">#{goal.slug}</span>
              </div>
              {goal.description && (
                <p className="text-muted-foreground">{goal.description}</p>
              )}
            </div>
          </div>

          {/* 메타 정보 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex items-center space-x-2">
              <Tag className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">카테고리:</span>
              <span className="text-sm font-medium text-card-foreground">{goal.category.name}</span>
            </div>
            
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">연도:</span>
              <span className="text-sm font-medium text-card-foreground">{goal.year}년</span>
            </div>

            {goal.start_date && (
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">시작일:</span>
                <span className="text-sm font-medium text-card-foreground">
                  {new Date(goal.start_date).toLocaleDateString('ko-KR')}
                </span>
              </div>
            )}

            {goal.target_date && (
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">목표일:</span>
                <span className="text-sm font-medium text-card-foreground">
                  {new Date(goal.target_date).toLocaleDateString('ko-KR')}
                </span>
              </div>
            )}
          </div>

          {/* 상태 및 우선순위 */}
          <div className="flex items-center space-x-4 mt-4">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-muted-foreground">상태:</span>
              <select
                value={goal.status}
                onChange={(e) => handleStatusChange(e.target.value)}
                className="text-sm px-2 py-1 border border-border rounded bg-background text-card-foreground"
              >
                {STATUS_OPTIONS.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-sm text-muted-foreground">우선순위:</span>
              <select
                value={goal.priority}
                onChange={(e) => handlePriorityChange(e.target.value)}
                className="text-sm px-2 py-1 border border-border rounded bg-background text-card-foreground"
              >
                {PRIORITY_OPTIONS.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 메인 콘텐츠 */}
          <div className="lg:col-span-2 space-y-6">
            {/* 본문 */}
            <div className="bg-card rounded-lg border border-border p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-card-foreground flex items-center">
                  <FileText className="w-5 h-5 mr-2" />
                  본문
                </h2>
                {!editingContent ? (
                  <button
                    onClick={() => setEditingContent(true)}
                    className="flex items-center text-sm text-primary hover:text-primary/80 transition-colors"
                  >
                    <Edit className="w-4 h-4 mr-1" />
                    편집
                  </button>
                ) : (
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={handleContentSave}
                      className="flex items-center text-sm text-primary hover:text-primary/80 transition-colors"
                    >
                      <Save className="w-4 h-4 mr-1" />
                      저장
                    </button>
                    <button
                      onClick={() => {
                        setEditingContent(false);
                        setContent(goal.content || '');
                      }}
                      className="flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <X className="w-4 h-4 mr-1" />
                      취소
                    </button>
                  </div>
                )}
              </div>

              {editingContent ? (
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full h-64 p-3 border border-border rounded bg-background text-card-foreground resize-none focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="Markdown으로 내용을 작성하세요..."
                />
              ) : (
                <div className="prose prose-sm max-w-none text-card-foreground">
                  {content ? (
                    <ReactMarkdown>{content}</ReactMarkdown>
                  ) : (
                    <p className="text-muted-foreground italic">내용이 없습니다.</p>
                  )}
                </div>
              )}
            </div>

            {/* 댓글 */}
            <div className="bg-card rounded-lg border border-border p-6">
              <h2 className="text-lg font-semibold text-card-foreground flex items-center mb-4">
                <MessageCircle className="w-5 h-5 mr-2" />
                댓글 ({comments.length})
              </h2>

              {/* 댓글 작성 */}
              <div className="mb-6">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="w-full p-3 border border-border rounded bg-background text-card-foreground resize-none focus:outline-none focus:ring-2 focus:ring-ring"
                  rows={3}
                  placeholder="댓글을 작성하세요..."
                />
                <div className="flex justify-end mt-2">
                  <button
                    onClick={handleCommentSubmit}
                    disabled={!newComment.trim()}
                    className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    댓글 작성
                  </button>
                </div>
              </div>

              {/* 댓글 목록 */}
              <div className="space-y-4">
                {comments.map((comment) => (
                  <div key={comment.id} className="border-b border-border pb-4 last:border-b-0">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium text-card-foreground">
                          {comment.user.username}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(comment.created_at).toLocaleString('ko-KR')}
                        </span>
                      </div>
                      <button
                        onClick={() => handleCommentLike(comment.id)}
                        className="flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <Heart className="w-4 h-4 mr-1" />
                        {comment.likes}
                      </button>
                    </div>
                    <p className="text-sm text-card-foreground">{comment.content}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 사이드바 */}
          <div className="space-y-6">
            {/* 첨부파일 */}
            <div className="bg-card rounded-lg border border-border p-6">
              <h3 className="text-lg font-semibold text-card-foreground flex items-center mb-4">
                <Paperclip className="w-5 h-5 mr-2" />
                첨부파일 ({attachments.length})
              </h3>

              {/* 파일 업로드 */}
              <div className="mb-4">
                <input
                  type="file"
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                  className="w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-medium file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                />
                {selectedFile && (
                  <button
                    onClick={handleFileUpload}
                    className="w-full mt-2 px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors"
                  >
                    업로드
                  </button>
                )}
              </div>

              {/* 첨부파일 목록 */}
              <div className="space-y-2">
                {attachments.map((attachment) => (
                  <div key={attachment.id} className="flex items-center justify-between p-2 bg-muted rounded">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-card-foreground truncate">
                        {attachment.original_name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {(attachment.file_size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                    <a
                      href={`/api/attachments/${attachment.id}`}
                      download
                      className="text-sm text-primary hover:text-primary/80 transition-colors"
                    >
                      다운로드
                    </a>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 