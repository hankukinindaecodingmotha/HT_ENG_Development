# HT_Eng_Project

HTeng 전기 보호 장치 전문 기업의 웹사이트 프로젝트입니다.

## 🚀 프로젝트 실행 방법

### 1. 서버 실행
```bash
cd Server
npm install
node server.js
```
서버는 `http://localhost:3000`에서 실행됩니다.

### 2. 웹사이트 접속
- **홈페이지**: `/Web_UI/HomePage/HT-eng-HomePage.html`
- **관리자 페이지**: `/Web_UI/Admin/HT_eng-Admin.html`
- **로그인 페이지**: `/Web_UI/LoginPage/HT-eng-Login.html`
- **CEO 소개 페이지**: `/Web_UI/CEOPage/HT_eng-ceo.html`
- **회사 구성원 페이지**: `/Web_UI/Members/HT_eng-members.html`
- **회사 소개 페이지**: `/Web_UI/Company/HT_eng-Company.html`

## 👥 사용자 계정 정보

### 관리자 계정
- **아이디**: `admin`
- **비밀번호**: `admin1234`
- **권한**: 관리자 (모든 기능 사용 가능)

### 테스트 사용자 계정 (모든 계정 비밀번호: `user1234`)

#### 활성 사용자
- `user1` - 김영희
- `user2` - 박민수  
- `user3` - 이지영

#### 승인 대기 사용자
- `user4` - 최준호
- `user5` - 정수진
- `user6` - 한동훈

#### 비활성 사용자
- `user7` - 송미라
- `user8` - 강태우
- `user9` - 윤서연
- `user10` - 임재현

## 🔧 관리자 기능

### 사용자 관리
- ✅ 사용자 목록 조회
- ✅ 새 사용자 추가
- ✅ 사용자 정보 수정
- ✅ 사용자 상태 변경 (승인/거절/활성화/비활성화)
- ✅ 사용자 삭제

### 콘텐츠 관리
- ✅ **메인페이지 관리**: 회사 기본 정보, 연혁, 사업 분야, 주소, 연락처 정보
- ✅ **소개 페이지 관리**: CEO 소개, 회사 구성원 소개, 회사 소개 페이지 통합 관리
- ✅ **제품 페이지 관리**: 제품 카테고리 및 주요 제품 관리
- ✅ **멤버십 페이지 관리**: 멤버십 등급 및 혜택 관리

### 실시간 통계
- ✅ 전체 사용자 수
- ✅ 활성 사용자 수
- ✅ 승인 대기 사용자 수
- ✅ 등록 제품 수

## 🌐 API 엔드포인트

### 인증
- `POST /api/auth/login` - 사용자 로그인

### 공개 API
- `GET /api/intro-pages` - 소개 페이지 정보 조회 (CEO, 구성원, 회사 소개)

### 관리자 기능
- `GET /api/admin/summary` - 관리자 대시보드 통계
- `GET /api/admin/users` - 사용자 목록 조회
- `POST /api/admin/users` - 새 사용자 추가
- `PUT /api/admin/users/:userId` - 사용자 정보 수정
- `PATCH /api/admin/users/:userId/status` - 사용자 상태 변경
- `DELETE /api/admin/users/:userId` - 사용자 삭제
- `PUT /api/admin/company` - 회사 정보 업데이트
- `GET /api/admin/company` - 회사 정보 조회
- `PUT /api/admin/ceo` - CEO 정보 업데이트
- `GET /api/admin/ceo` - CEO 정보 조회
- `PUT /api/admin/members` - 구성원 정보 업데이트
- `GET /api/admin/members` - 구성원 정보 조회

## 📁 프로젝트 구조

```
HT_Eng_Project/
├── Server/                 # 백엔드 서버
│   ├── server.js          # 메인 서버 파일
│   └── package.json       # 서버 의존성
├── Web_UI/                # 프론트엔드
│   ├── Admin/             # 관리자 페이지 (모듈화된 구조)
│   │   ├── admin-core.js      # 핵심 관리자 기능
│   │   ├── admin-users.js     # 사용자 관리
│   │   ├── admin-company.js   # 회사 정보 관리
│   │   ├── admin-ceo.js       # CEO 정보 관리
│   │   ├── admin-members.js   # 구성원 관리
│   │   └── admin-intro-pages.js # 소개 페이지 통합 관리
│   ├── LoginPage/         # 로그인 페이지
│   ├── HomePage/          # 홈페이지
│   ├── CEOPage/           # CEO 소개 페이지
│   ├── Members/           # 회사 구성원 페이지
│   ├── Company/           # 회사 소개 페이지
│   ├── Components/        # 공통 컴포넌트 (헤더, 푸터)
│   └── ...                # 기타 페이지들
└── Resource/              # 리소스 파일들
```

## 🔄 최근 주요 변경사항

### 코드 모듈화
- **기존**: `HT_eng-Admin.js` (단일 대용량 파일)
- **현재**: 6개의 모듈화된 JavaScript 파일로 분리
  - `admin-core.js`: 핵심 관리자 기능
  - `admin-users.js`: 사용자 관리
  - `admin-company.js`: 회사 정보 관리
  - `admin-ceo.js`: CEO 정보 관리
  - `admin-members.js`: 구성원 관리
  - `admin-intro-pages.js`: 소개 페이지 통합 관리

### 콘텐츠 관리 통합
- **메인페이지 관리**: 회사 기본 정보, 연혁, 사업 분야, 주소, 연락처 통합 관리
- **소개 페이지 관리**: CEO, 구성원, 회사 소개를 모달 기반으로 통합 관리
- **제품/멤버십 관리**: 새로운 관리 섹션 추가

### 공개 페이지 동적 로딩
- **CEO 소개 페이지**: 서버 API에서 동적으로 콘텐츠 로딩
- **회사 구성원 페이지**: 서버 API에서 동적으로 구성원 정보 로딩
- **회사 소개 페이지**: 서버 API에서 동적으로 회사 정보 로딩

### CSS 최적화
- 헤더 가려짐 문제 해결을 위한 여백 조정
- 반응형 디자인 개선
- 일관된 레이아웃 및 스타일링

## 🧪 테스트 방법

1. **서버 실행**: `cd Server && node server.js`
2. **로그인 페이지 접속**: `/Web_UI/LoginPage/HT-eng-Login.html`
3. **관리자 로그인**: `admin` / `admin1234`
4. **관리자 페이지 접속**: 자동으로 리다이렉트됨
5. **콘텐츠 관리 테스트**:
   - 메인페이지 관리: 회사 정보, 연혁, 사업 분야, 연락처 수정
   - 소개 페이지 관리: CEO, 구성원, 회사 소개 통합 관리
   - 사용자 관리: 승인/거절/활성화/비활성화

## 🔒 보안 기능

- JWT 토큰 기반 인증
- 관리자 권한 검증
- 비밀번호 해시화 (bcrypt)
- 세션 기반 상태 관리
- 관리자 계정 보호

## 🎨 UI/UX 특징

- **모듈화된 코드 구조**: 유지보수성 및 확장성 향상
- **통합 콘텐츠 관리**: 모달 기반의 직관적인 편집 인터페이스
- **실시간 데이터 동기화**: 관리자 페이지 수정사항이 공개 페이지에 즉시 반영
- **반응형 디자인**: 다양한 디바이스에서 최적화된 사용자 경험
- **즉각적인 시각적 피드백**: 로딩, 성공, 에러 상태 표시
- **일관된 레이아웃**: 헤더 여백 최적화로 콘텐츠 가려짐 방지

## 🚧 제거된 기능

- **회사 가치 페이지**: 기존 Values 폴더 및 관련 기능 제거
- **기존 admin.js**: 모듈화된 구조로 대체
- **정적 콘텐츠**: 동적 API 기반 로딩으로 전환

## 🚀 향후 개발 계획

- 제품 페이지 관리 기능 구현
- 멤버십 페이지 관리 기능 구현
- 이미지 업로드 및 관리 기능
- 콘텐츠 버전 관리 및 히스토리
- 다국어 지원
