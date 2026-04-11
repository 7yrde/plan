# plan

## 개요

7YR 연간 목표와 진척도를 관리하는 대시보드 웹앱. 목표별 진행률, KPI, 타임라인 등을 시각화.

> 레포 이름이 `7-dashboard` → `plan`으로 변경됨 (Jira PLAN 프로젝트와 매칭).

## 기술 스택

- **Next.js 15** + React + TypeScript
- **better-sqlite3** (로컬 DB, native module → Docker에서 python3/make/g++ 빌드 필요)
- **접속 경로**: http://localhost/plan/
- **Jira 프로젝트**: PLAN (`https://7yr.atlassian.net/jira/software/projects/PLAN/board`)

## Docker 배포

- `output: "standalone"` + `basePath: "/plan"` 설정 필수
- Alpine 이미지에서 better-sqlite3 빌드를 위해 빌더 스테이지에 `apk add python3 make g++`
- 포트 3000, nginx가 `/plan/` 라우트로 프록시

## 7YR 슈퍼프로젝트 내 위치

- 서브모듈 경로: `./plan`
- 원래 `qkrwogk/7-dashboard` → `7yrde/7-dashboard` → `7yrde/plan`으로 이전/개명
