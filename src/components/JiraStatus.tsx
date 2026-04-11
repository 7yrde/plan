'use client';

import { useState, useEffect } from 'react';

interface JiraIssue {
  key: string;
  summary: string;
  status: string;
  statusMapped: string;
  priority: string;
  labels: string[];
  updated: string;
}

interface JiraData {
  configured: boolean;
  message?: string;
  error?: string;
  total?: number;
  issues?: JiraIssue[];
}

const STATUS_COLORS: Record<string, string> = {
  resolved: '#4ade80',
  in_progress: '#4c7cff',
  open: '#5a6478',
};

export default function JiraStatus() {
  const [data, setData] = useState<JiraData | null>(null);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    fetch('/plan/api/jira')
      .then(r => r.json())
      .then(setData)
      .catch(() => setData({ configured: false, message: 'API 호출 실패' }));
  }, []);

  if (!data) return null;

  if (!data.configured) {
    return (
      <div className="mb-6 p-4 rounded-lg border border-border bg-card text-sm text-muted-foreground">
        🔗 Jira 미연결 — <code className="text-xs">JIRA_EMAIL</code>, <code className="text-xs">JIRA_PAT</code> 환경변수 설정 필요
      </div>
    );
  }

  if (data.error) {
    return (
      <div className="mb-6 p-4 rounded-lg border border-red-500/30 bg-red-500/5 text-sm text-red-400">
        Jira 오류: {data.error}
      </div>
    );
  }

  const issues = data.issues || [];

  return (
    <div className="mb-6 rounded-lg border border-border bg-card overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-4 text-left hover:bg-muted/30 transition-colors"
      >
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-card-foreground">🔗 Jira PLAN</span>
          <span className="text-xs text-muted-foreground">{issues.length}개 이슈</span>
        </div>
        <span className="text-xs text-muted-foreground">{expanded ? '▲' : '▼'}</span>
      </button>
      {expanded && (
        <div className="border-t border-border px-4 pb-4">
          {issues.map(issue => (
            <div key={issue.key} className="flex items-center justify-between py-2 text-sm border-b border-border last:border-0">
              <div className="flex items-center gap-2">
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ background: STATUS_COLORS[issue.statusMapped] || '#5a6478' }}
                />
                <span className="font-mono text-xs text-muted-foreground">{issue.key}</span>
                <span className="text-card-foreground">{issue.summary}</span>
              </div>
              <span className="text-xs text-muted-foreground">{issue.status}</span>
            </div>
          ))}
          {issues.length === 0 && <p className="text-sm text-muted-foreground py-2">이슈 없음</p>}
        </div>
      )}
    </div>
  );
}
