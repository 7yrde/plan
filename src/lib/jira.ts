const JIRA_BASE = process.env.JIRA_BASE_URL || 'https://7yr.atlassian.net';
const JIRA_EMAIL = process.env.JIRA_EMAIL || '';
const JIRA_PAT = process.env.JIRA_PAT || '';

function getAuthHeader(): string {
  return 'Basic ' + Buffer.from(`${JIRA_EMAIL}:${JIRA_PAT}`).toString('base64');
}

export function isJiraConfigured(): boolean {
  return !!(JIRA_EMAIL && JIRA_PAT);
}

export async function jiraFetch(path: string) {
  if (!isJiraConfigured()) {
    throw new Error('Jira credentials not configured (JIRA_EMAIL, JIRA_PAT)');
  }

  const res = await fetch(`${JIRA_BASE}${path}`, {
    headers: {
      'Authorization': getAuthHeader(),
      'Accept': 'application/json',
    },
    next: { revalidate: 300 }, // 5분 캐시
  });

  if (!res.ok) {
    throw new Error(`Jira API error: ${res.status} ${res.statusText}`);
  }

  return res.json();
}

export interface JiraIssue {
  key: string;
  fields: {
    summary: string;
    status: { name: string; statusCategory: { key: string } };
    priority?: { name: string };
    assignee?: { displayName: string };
    labels: string[];
    created: string;
    updated: string;
    description?: string;
    duedate?: string;
  };
}

export interface JiraSearchResult {
  total: number;
  issues: JiraIssue[];
}

export async function searchIssues(jql: string, maxResults = 50): Promise<JiraSearchResult> {
  // /rest/api/3/search는 deprecated (410 Gone). /search/jql 사용 (Atlassian Cloud 2024+)
  const fields = 'summary,status,priority,assignee,labels,created,updated,description,duedate';
  const result = await jiraFetch(`/rest/api/3/search/jql?jql=${encodeURIComponent(jql)}&maxResults=${maxResults}&fields=${fields}`);
  return { total: result.issues?.length ?? 0, issues: result.issues ?? [] };
}

export async function getPlanIssues(_year = 2026): Promise<JiraSearchResult> {
  // 모든 PLAN 프로젝트 이슈를 최신순 (라벨 필터 제거 — 라벨 미사용 시도 0건 방지)
  return searchIssues(`project = PLAN ORDER BY updated DESC`);
}

export async function getProjectIssues(projectKey: string, maxResults = 20): Promise<JiraSearchResult> {
  return searchIssues(`project = ${projectKey} ORDER BY updated DESC`, maxResults);
}
