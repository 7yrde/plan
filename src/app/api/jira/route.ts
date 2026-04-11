import { NextResponse } from 'next/server';
import { isJiraConfigured, getPlanIssues, getProjectIssues, type JiraIssue } from '@/lib/jira';

function mapStatus(issue: JiraIssue) {
  const cat = issue.fields.status.statusCategory.key;
  if (cat === 'done') return 'resolved';
  if (cat === 'indeterminate') return 'in_progress';
  return 'open';
}

function formatIssue(issue: JiraIssue) {
  return {
    key: issue.key,
    summary: issue.fields.summary,
    status: issue.fields.status.name,
    statusMapped: mapStatus(issue),
    priority: issue.fields.priority?.name || 'Medium',
    assignee: issue.fields.assignee?.displayName || null,
    labels: issue.fields.labels,
    duedate: issue.fields.duedate,
    updated: issue.fields.updated,
  };
}

export async function GET(request: Request) {
  if (!isJiraConfigured()) {
    return NextResponse.json({
      configured: false,
      message: 'Jira PAT가 설정되지 않았습니다. JIRA_EMAIL과 JIRA_PAT 환경변수를 설정하세요.',
    });
  }

  try {
    const { searchParams } = new URL(request.url);
    const project = searchParams.get('project');

    if (project) {
      const result = await getProjectIssues(project);
      return NextResponse.json({
        configured: true,
        total: result.total,
        issues: result.issues.map(formatIssue),
      });
    }

    // 기본: PLAN 프로젝트 이슈
    const result = await getPlanIssues();
    return NextResponse.json({
      configured: true,
      total: result.total,
      issues: result.issues.map(formatIssue),
    });
  } catch (error) {
    console.error('Jira API error:', error);
    return NextResponse.json({
      configured: true,
      error: error instanceof Error ? error.message : 'Jira 연동 오류',
    }, { status: 500 });
  }
}
