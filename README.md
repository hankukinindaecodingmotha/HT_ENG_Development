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
- ✅ 회사 정보 수정
- ✅ CEO 소개 수정
- ✅ 회사 구성원 소개 수정
- ✅ 회사 가치 소개 수정

### 실시간 통계
- ✅ 전체 사용자 수
- ✅ 활성 사용자 수
- ✅ 승인 대기 사용자 수
- ✅ 등록 제품 수

## 🌐 API 엔드포인트

### 인증
- `POST /api/auth/login` - 사용자 로그인

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
- `PUT /api/admin/values` - 회사 가치 정보 업데이트
- `GET /api/admin/values` - 회사 가치 정보 조회

## 📁 프로젝트 구조

```
HT_Eng_Project/
├── Server/                 # 백엔드 서버
│   ├── server.js          # 메인 서버 파일
│   └── package.json       # 서버 의존성
├── Web_UI/                # 프론트엔드
│   ├── Admin/             # 관리자 페이지
│   ├── LoginPage/         # 로그인 페이지
│   ├── HomePage/          # 홈페이지
│   ├── Components/        # 공통 컴포넌트
│   └── ...                # 기타 페이지들
└── Resource/              # 리소스 파일들
```

## 🧪 테스트 방법

1. **서버 실행**: `cd Server && node server.js`
2. **로그인 페이지 접속**: `/Web_UI/LoginPage/HT-eng-Login.html`
3. **관리자 로그인**: `admin` / `admin1234`
4. **관리자 페이지 접속**: 자동으로 리다이렉트됨
5. **사용자 관리 테스트**:
   - 승인 대기 사용자 승인/거절
   - 비활성 사용자 활성화
   - 활성 사용자 비활성화
   - 새 사용자 추가/수정/삭제

## 🔒 보안 기능

- JWT 토큰 기반 인증
- 관리자 권한 검증
- 비밀번호 해시화 (bcrypt)
- 세션 기반 상태 관리
- 관리자 계정 보호

## 🎨 UI/UX 특징

- 반응형 디자인
- 실시간 상태 업데이트
- 직관적인 사용자 인터페이스
- 즉각적인 시각적 피드백
- 로딩 상태 표시
- 에러 처리 및 사용자 알림
