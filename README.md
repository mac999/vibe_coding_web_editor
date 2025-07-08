# Vibe Coding Web Editor

웹 기반 텍스트 편집기로, 모던하고 깔끔한 UI와 PWA(Progressive Web App) 지원을 제공합니다.

## 🌟 주요 기능

### 텍스트 편집

- **새 문서 생성**: 빈 문서로 시작
- **파일 열기**: 로컬 텍스트 파일(.txt) 불러오기
- **파일 저장**: 작성한 내용을 텍스트 파일로 다운로드
- **실시간 상태 표시**: 커서 위치(줄, 열) 및 문자 수 표시

### 편집 기능

- **실행 취소/다시 실행**: Ctrl+Z / Ctrl+Y
- **클립보드 기능**: 잘라내기, 복사, 붙여넣기
- **검색 기능**: Ctrl+F로 텍스트 검색 및 네비게이션
- **자동 들여쓰기**: Tab 키로 4칸 들여쓰기

### 테마 지원

- **시스템 테마**: 운영체제 설정에 따라 자동 변경
- **라이트 모드**: 밝은 테마
- **다크 모드**: 어두운 테마
- **테마 기억**: 사용자 설정을 로컬 스토리지에 저장

### PWA 지원

- **오프라인 사용**: 서비스 워커를 통한 캐싱
- **앱 설치**: 브라우저에서 앱처럼 설치 가능
- **반응형 디자인**: 다양한 디바이스에서 최적화된 경험

## 🚀 시작하기

### 온라인 사용

1. 웹 브라우저에서 프로젝트 페이지에 접속
2. 바로 사용 가능

### 로컬 개발 환경

```bash
# 저장소 클론
git clone https://github.com/mac999/vibe_coding_web_editor.git

# 프로젝트 디렉토리로 이동
cd vibe_coding_web_editor

# 의존성 설치
npm install

# 개발 서버 실행
npm run serve
```

### TypeScript 개발

```bash
# TypeScript 컴파일
npm run build

# TypeScript 감시 모드
npm run dev
```

## 🎮 키보드 단축키

| 단축키       | 기능                  |
| ------------ | --------------------- |
| `Ctrl + N` | 새 문서               |
| `Ctrl + O` | 파일 열기             |
| `Ctrl + S` | 파일 저장             |
| `Ctrl + F` | 검색                  |
| `Ctrl + Z` | 실행 취소             |
| `Ctrl + Y` | 다시 실행             |
| `Ctrl + X` | 잘라내기              |
| `Ctrl + C` | 복사                  |
| `Ctrl + V` | 붙여넣기              |
| `Tab`      | 들여쓰기 (4칸)        |
| `Esc`      | 검색 닫기 / 메뉴 닫기 |

## 🛠️ 기술 스택

- **HTML5**: 시맨틱 마크업
- **CSS3**: Flexbox, CSS 변수, 다크 모드 지원
- **JavaScript (ES6+)**: 모던 JavaScript 문법
- **TypeScript**: 타입 안전성 및 개발 생산성
- **PWA**: 서비스 워커, 웹 앱 매니페스트

## 📁 프로젝트 구조

```
vibe_coding_web_editor/
├── index.html          # 메인 HTML 파일
├── style.css           # 스타일시트
├── script.js           # 메인 JavaScript 파일
├── script.ts           # TypeScript 소스 파일
├── sw.js              # 서비스 워커
├── manifest.json      # PWA 매니페스트
├── package.json       # Node.js 패키지 설정
├── tsconfig.json      # TypeScript 설정
└── README.md          # 프로젝트 문서
```

## 🎨 UI/UX 특징

### 디자인 철학

- **미니멀리즘**: 깔끔하고 직관적인 인터페이스
- **일관성**: 일관된 색상 체계와 타이포그래피
- **접근성**: 키보드 네비게이션 및 스크린 리더 지원

### 반응형 디자인

- **데스크톱**: 전체 화면 활용
- **태블릿**: 터치 친화적 UI
- **모바일**: 컴팩트한 레이아웃

## 🔧 개발자 가이드

### 코드 구조

- `WebEditor` 클래스: 메인 에디터 기능
- 이벤트 기반 아키텍처: 사용자 상호작용 처리
- 모듈화된 메서드: 각 기능별로 분리된 메서드

### 확장 가능성

- 플러그인 시스템 추가 가능
- 추가 파일 형식 지원
- 문법 강조 기능 확장
- 멀티 탭 기능 추가

## 📝 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다. 자세한 내용은 [LICENSE](LICENSE) 파일을 참조하세요.

## 🤝 기여하기

1. 이 저장소를 포크합니다
2. 기능 브랜치를 생성합니다 (`git checkout -b feature/AmazingFeature`)
3. 변경사항을 커밋합니다 (`git commit -m 'Add some AmazingFeature'`)
4. 브랜치에 푸시합니다 (`git push origin feature/AmazingFeature`)
5. Pull Request를 생성합니다

## 📞 연락처

프로젝트 링크: [https://github.com/mac999/vibe_coding_web_editor](https://github.com/mac999/vibe_coding_web_editor)

## 🙏 감사의 말

이 프로젝트는 모던 웹 기술과 사용자 경험을 중심으로 개발되었습니다. 사용해주시고 피드백을 주시는 모든 분들께 감사드립니다.

---

⭐ 이 프로젝트가 유용하다면 스타를 눌러주세요!
