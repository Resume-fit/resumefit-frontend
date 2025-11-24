# ResumeFit Frontend

ResumeFit 프로젝트의 React 기반 프론트엔드 애플리케이션입니다.

## 주요 기능

### 1. 인증 시스템
- **회원가입**: 비밀번호 확인 기능 포함, 유효성 검증
- **로그인**: JWT 기반 인증
- **자동 토큰 갱신**: Access Token 만료 시 자동으로 Refresh Token을 사용하여 재발급

### 2. 이력서 관리
- **이력서 업로드**: PDF 파일 업로드 (파일 형식 검증)
- **이력서 목록 조회**: 등록된 모든 이력서 확인
- **이력서 상세 보기**: PDF 미리보기 (Pre-signed URL 사용)
- **이력서 삭제**: 이력서 및 S3 파일 삭제

### 3. AI 매칭 시스템
- **매칭 실행**: 이력서를 채용공고와 AI 매칭
- **매칭 진행 상태 표시**: 
  - 매칭 중 로딩 스피너 표시
  - **탭 닫기 방지**: 매칭 중 "이 탭을 닫지 마세요!" 경고 메시지
  - 브라우저 닫기 시도 시 경고
- **매칭 결과 분류**:
  - ✨ **적합 (SUITABLE)**: 현재 역량으로 지원 가능한 공고
  - 🚀 **성장 트랙 (GROWTH_TRACK)**: 일부 역량 보충 필요한 공고

### 4. 리뷰 시스템
- **매칭 결과 피드백**: 매칭 완료 후 자동으로 리뷰 제출
- **리뷰 옵션**:
  - 😊 결과가 마음에 들어요
  - 📄 제 이력서와 맞지 않아요
  - 💼 제 분야와 맞지 않아요
  - 🏢 회사가 마음에 들지 않아요

## 기술 스택

- **React 18** with TypeScript
- **React Router v6**: 라우팅
- **Axios**: HTTP 클라이언트
- **CSS**: 커스텀 스타일링

## 설치 및 실행

### 1. 의존성 설치

```bash
npm install
```

### 2. 환경 변수 설정

`.env` 파일 생성:

```env
REACT_APP_API_BASE_URL=http://localhost:8080
```

배포 시에는 실제 API 서버 주소로 변경하세요.

### 3. 개발 서버 실행

```bash
npm start
```

브라우저에서 [http://localhost:3000](http://localhost:3000) 접속

### 4. 프로덕션 빌드

```bash
npm run build
```

## 프로젝트 구조

```
src/
├── api/                    # API 관련
│   ├── axios.ts           # Axios 인스턴스 및 인터셉터
│   └── services.ts        # API 서비스 함수들
├── components/            # 재사용 컴포넌트
│   └── MatchingModal.tsx  # 매칭 모달 컴포넌트
├── pages/                 # 페이지 컴포넌트
│   ├── LoginPage.tsx      # 로그인 페이지
│   ├── JoinPage.tsx       # 회원가입 페이지
│   ├── ResumesPage.tsx    # 이력서 목록 페이지
│   ├── ResumeUploadPage.tsx   # 이력서 업로드 페이지
│   └── ResumeDetailPage.tsx   # 이력서 상세 페이지
├── styles/                # 스타일 파일
│   ├── Auth.css          # 인증 관련 스타일
│   ├── Resumes.css       # 이력서 목록 스타일
│   ├── Upload.css        # 업로드 페이지 스타일
│   ├── Detail.css        # 상세 페이지 스타일
│   └── Modal.css         # 모달 스타일
├── types/                 # TypeScript 타입 정의
│   └── index.ts          # 공통 타입 정의
├── App.tsx               # 메인 앱 컴포넌트
└── App.css               # 앱 전역 스타일
```

## 주요 구현 사항

### 1. JWT 토큰 관리

- **Access Token**: localStorage에 저장
- **Refresh Token**: HttpOnly 쿠키로 관리 (서버에서 설정)
- **자동 재발급**: Axios 인터셉터에서 401 에러 발생 시 자동으로 토큰 재발급 시도

### 2. 매칭 프로세스 안전성

- **매칭 중 탭 닫기 방지**:
  - `beforeunload` 이벤트 리스너로 브라우저 닫기 감지
  - 모달 닫기 버튼 비활성화
  - 매칭 중임을 알리는 명확한 경고 메시지

### 3. 비밀번호 검증

- **실시간 확인**: 비밀번호와 비밀번호 확인 필드 일치 여부 실시간 검증
- **패턴 검증**: 영문, 숫자, 특수문자 포함 8자 이상
- **에러 메시지**: 불일치 시 즉시 표시

### 4. 에러 처리

- 네트워크 에러 처리
- API 에러 메시지 표시
- 인증 실패 시 로그인 페이지로 리다이렉트

## API 엔드포인트

### Auth
- `POST /api/auth/login` - 로그인
- `POST /api/auth/logout` - 로그아웃
- `POST /api/reissue` - 토큰 재발급
- `POST /api/join` - 회원가입

### Resume
- `GET /api/resumes` - 이력서 목록 조회
- `GET /api/resumes/{id}` - 이력서 상세 조회
- `POST /api/resumes/upload` - 이력서 업로드
- `DELETE /api/resumes/{id}` - 이력서 삭제
- `POST /api/resumes/{id}/match` - 이력서 매칭

### Matching
- `GET /api/matching/{resumeId}` - 매칭 결과 조회

### Review
- `DELETE /api/resumes/{id}/review` - 리뷰 제출

## 보안 고려사항

1. **XSS 방지**: React의 기본 이스케이핑 활용
2. **CSRF 방지**: HttpOnly 쿠키 사용
3. **토큰 저장**: Access Token은 localStorage, Refresh Token은 쿠키
4. **HTTPS**: 프로덕션에서는 반드시 HTTPS 사용 권장

## 브라우저 지원

- Chrome (최신 버전)
- Firefox (최신 버전)
- Safari (최신 버전)
- Edge (최신 버전)

## 개발 팀

명지대학교 융합소프트웨어학부 캡스톤 프로젝트 팀
- 팀장 및 백엔드 개발: Timber
- 팀원: 박진형, 전성민, 권성중
