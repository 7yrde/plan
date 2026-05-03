# plan Release Notes

## v1.0.0 (2026-05-03) — Jira 연동 + DB 통합 + 디자인 토큰

### 주요 변경

- **Jira PAT 연동**: `lib/jira.ts` REST API 클라이언트 (Basic Auth + PAT, 5분 캐시), `/api/jira` 엔드포인트, `JiraStatus` 컴포넌트로 PLAN 프로젝트 이슈 표시
- **DB 통합**: `./data/dashboard.db` → `../data/7yr.db` (모노레포 공유) + `plan_*` 테이블 prefix
- **테이블 명명**: `plan_users`, `plan_categories`, `plan_goals`, `plan_tasks`, `plan_comments`, `plan_attachments`
- **Dashboard 진척도 시각화**: 카테고리 요약 섹션을 텍스트 퍼센트 → 개별 progress bar로 개선

### 환경변수

- `DB_PATH` (default: `../data/7yr.db`)
- `JIRA_BASE_URL` (default: `https://7yr.atlassian.net`)
- `JIRA_EMAIL`, `JIRA_PAT` — 미설정 시 Jira 카드만 비활성화, 다른 기능 정상

### 데이터 모델

기본 계정: `test` / `test` (init-db.ts에서 시드)
