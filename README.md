# 현황판 (Dashboard)

목표와 진척도를 관리하는 Next.js 기반 대시보드 애플리케이션입니다.

## 🚀 주요 기능

### 인증 시스템
- NextAuth.js 기반 사용자 인증
- 고정 계정: `tester`
- 로그인/로그아웃 상태 표시

### 대시보드
- 5개 주제별 목표 관리 (컴퓨터, 음악, 건강, 돈, 언어)
- 연도별 목표 관리 및 네비게이션
- 목표별 진행률 시각화 (Progress Bar)
- 새 목표 추가 기능 (모달)
- 카테고리별 상세 페이지

### 이슈 관리 (Jira 스타일)
- 전체 이슈 통합 뷰 (`/issues`)
- 실시간 검색 기능 (제목, 설명, 본문)
- 연도별, 카테고리별 필터링
- 사이드바 이슈 리스트 + 메인 상세 뷰
- 이슈 상태 관리 (열림 → 진행중 → 해결 → 종료)
- 우선순위 설정 (높음/보통/낮음)

### 목표 상세 페이지
- Jira 스타일 이슈 관리 인터페이스
- 마크다운 편집 가능한 본문
- 댓글 시스템 (좋아요 기능 포함)
- 첨부파일 업로드/다운로드
- 상태 및 우선순위 변경
- 시작일/목표일 관리

### UI/UX
- 다크모드 지원
- 반응형 디자인
- Tailwind CSS 기반 스타일링
- 직관적인 네비게이션

## 🛠 기술 스택

- **Frontend**: Next.js 15 (App Router), React 18, TypeScript
- **Styling**: Tailwind CSS
- **Database**: SQLite (better-sqlite3)
- **Authentication**: NextAuth.js
- **Icons**: Lucide React
- **Markdown**: react-markdown

## 📁 프로젝트 구조

```
src/
├── app/
│   ├── api/                    # API 라우트
│   │   ├── auth/              # 인증 관련
│   │   ├── categories/        # 카테고리 관리
│   │   ├── goals/             # 목표 관리
│   │   ├── tasks/             # 작업 관리
│   │   ├── comments/          # 댓글 관리
│   │   └── attachments/       # 첨부파일 관리
│   ├── auth/signin/           # 로그인 페이지
│   ├── category/[slug]/       # 카테고리 상세
│   ├── goal/[slug]/           # 목표 상세
│   ├── issues/                # 전체 이슈 뷰
│   └── layout.tsx             # 루트 레이아웃
├── components/                # React 컴포넌트
├── lib/                       # 유틸리티 및 데이터베이스
└── types/                     # TypeScript 타입 정의
```

## 🗄 데이터베이스 스키마

### Categories (카테고리)
- id, name, slug, color, icon, created_at

### Goals (목표)
- id, category_id, year, slug, title, description, content, status, priority, start_date, target_date, created_at, updated_at

### Tasks (작업)
- id, goal_id, title, description, status, created_at, updated_at

### Comments (댓글)
- id, goal_id, user_id, content, likes, created_at, updated_at

### Attachments (첨부파일)
- id, goal_id, filename, original_name, file_size, mime_type, file_path, created_at

## 🚀 시작하기

### 1. 저장소 클론
```bash
git clone https://github.com/qkrwogk/7-dashboard.git
cd 7-dashboard
```

### 2. 의존성 설치
```bash
npm install
```

### 3. 환경 설정 (선택사항)
```bash
# .env.local 파일 생성 (선택사항)
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key
```

### 4. 데이터베이스 초기화 ⚠️ 필수
```bash
# 데이터베이스 초기화 (처음 실행 시 필수!)
npx tsx src/lib/init-db.ts
```

**중요**: 데이터베이스 파일(`dashboard.db`)은 git에서 제외되어 있으므로, 처음 실행 시 반드시 초기화해야 합니다.

### 5. 개발 서버 실행
```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 확인하세요.

## 🔧 빌드 및 배포

### 개발 빌드
```bash
npm run build
```

### 프로덕션 빌드
```bash
npm run build
npm start
```

## 🎨 테마

- **주요 색상**: 다크 그린 (`#15803d`)
- **다크모드**: 완전 지원
- **반응형**: 모바일, 태블릿, 데스크톱 최적화

## 📋 앞으로 해야 할 일

### 🚧 개발 예정 기능
- [ ] **이슈 페이지에 새 목표 추가 버튼 넣기**
  - 사이드바에 "새 목표 추가" 버튼 추가
  - 모달을 통한 빠른 목표 생성

- [ ] **대시보드에 목표 정상 반영**
  - 새로 추가된 목표가 대시보드에 즉시 표시되도록 개선
  - 실시간 업데이트 기능

- [ ] **이슈페이지 스크롤 다운 에러 문제 해결**
  - 사이드바 스크롤 시 발생하는 오류 수정
  - 무한 스크롤 또는 페이지네이션 구현

- [ ] **개인설정 기능 활성화**
  - 사용자 프로필 설정
  - 테마 커스터마이징
  - 알림 설정

- [ ] **사이드 바 추가**
  - 대시보드에 사이드바 네비게이션 추가
  - 빠른 접근 메뉴 구현

### 🔧 기술적 개선사항
- [ ] 성능 최적화
- [ ] 에러 핸들링 개선
- [ ] 테스트 코드 작성
- [ ] 문서화 보완

## 🚨 문제 해결

### 데이터베이스 오류가 발생하는 경우
```bash
# 기존 데이터베이스 삭제 후 재생성
rm -f dashboard.db
npx tsx src/lib/init-db.ts
```

### 첨부파일 관련 오류
- `uploads/` 폴더는 자동으로 생성됩니다
- 권한 문제가 있다면 폴더 권한을 확인하세요

## 📝 라이선스

MIT License

## 🤝 기여하기

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request
