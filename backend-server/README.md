# 🚀 검색 및 이미지 서버

백엔드 비전공자를 위한 간단하고 강력한 검색 및 이미지 서빙 서버입니다.  
FastAPI를 사용하여 만들어졌으며, 직관적인 API와 자동 문서화 기능을 제공합니다.

## ✨ 주요 기능

- 🔍 **강력한 검색 기능**: 제목, 설명, 태그에서 검색
- 📁 **카테고리 분류**: 데이터를 카테고리별로 조직화
- 🖼️ **이미지 업로드 및 서빙**: 다양한 형식의 이미지 지원
- 📚 **자동 API 문서화**: Swagger UI와 ReDoc 제공
- 🔒 **파일 검증**: 안전한 파일 업로드
- 💾 **JSON 기반 데이터베이스**: 간단한 파일 저장 시스템

## 🛠️ 설치 및 실행

### 1. 의존성 설치

```bash
# 서버 디렉토리로 이동
cd backend-server

# Python 패키지 설치
pip install -r requirements.txt
```

### 2. 서버 실행

```bash
# 간편 실행 (권장)
python start_server.py

# 또는 직접 실행
python main.py

# 또는 uvicorn으로 실행
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

### 3. 서버 접속

서버가 실행되면 다음 주소로 접속할 수 있습니다:

- **메인 페이지**: http://localhost:8000
- **API 문서 (Swagger)**: http://localhost:8000/docs
- **API 문서 (ReDoc)**: http://localhost:8000/redoc

## 📡 API 엔드포인트

### 기본 정보

| 메서드 | 엔드포인트 | 설명 |
|--------|------------|------|
| GET | `/` | 서버 상태 및 기본 정보 |
| GET | `/health` | 헬스 체크 |
| GET | `/docs` | Swagger UI 문서 |
| GET | `/redoc` | ReDoc 문서 |

### 검색 API

#### 🔍 검색하기
```http
GET /search?q=검색어&category=카테고리&limit=10
```

**파라미터:**
- `q` (선택): 검색할 키워드
- `category` (선택): 필터링할 카테고리
- `limit` (선택): 결과 개수 제한 (기본값: 10)

**예시:**
```bash
# 모든 아이템 검색
curl "http://localhost:8000/search"

# 특정 키워드로 검색
curl "http://localhost:8000/search?q=파이썬"

# 카테고리별 검색
curl "http://localhost:8000/search?category=프로그래밍"

# 복합 검색
curl "http://localhost:8000/search?q=웹&category=개발&limit=5"
```

### 아이템 관리 API

#### 📋 모든 아이템 조회
```http
GET /items
```

#### 🔎 특정 아이템 조회
```http
GET /items/{item_id}
```

#### ➕ 새 아이템 추가
```http
POST /items
```

**파라미터:**
- `title`: 제목 (필수)
- `description`: 설명 (필수)
- `category`: 카테고리 (필수)
- `tags`: 태그 배열 (선택)
- `image`: 이미지 파일 (선택)

### 이미지 API

#### 📤 이미지 업로드
```http
POST /upload
```

**지원 형식:** JPG, JPEG, PNG, GIF, WEBP  
**최대 크기:** 5MB

#### 📷 이미지 접근
```http
GET /uploads/{filename}
GET /static/images/{filename}
```

### 카테고리 API

#### 📂 카테고리 목록 조회
```http
GET /categories
```

## 🧪 API 테스트

서버가 정상적으로 작동하는지 확인하려면 테스트 스크립트를 실행하세요:

```bash
# requests 패키지 설치 (테스트용)
pip install requests

# API 테스트 실행
python test_api.py
```

## 📁 프로젝트 구조

```
backend-server/
├── main.py              # 메인 서버 파일
├── start_server.py      # 서버 시작 스크립트
├── test_api.py          # API 테스트 스크립트
├── requirements.txt     # Python 의존성
├── README.md           # 이 파일
├── data/               # 데이터 저장소
│   └── search_data.json
├── uploads/            # 업로드된 이미지
├── static/             # 정적 파일
│   └── images/
└── ...
```

## 💡 사용 예시

### 1. Python requests로 API 사용

```python
import requests

# 서버 상태 확인
response = requests.get("http://localhost:8000/")
print(response.json())

# 검색하기
response = requests.get("http://localhost:8000/search", 
                       params={"q": "파이썬", "limit": 5})
results = response.json()
print(f"검색 결과: {results['total_results']}개")

# 이미지 업로드
with open("my_image.jpg", "rb") as f:
    files = {"image": f}
    response = requests.post("http://localhost:8000/upload", files=files)
    print(response.json())
```

### 2. JavaScript fetch로 API 사용

```javascript
// 검색하기
async function searchItems(query) {
    const response = await fetch(`http://localhost:8000/search?q=${query}`);
    const data = await response.json();
    console.log(`검색 결과: ${data.total_results}개`);
    return data.results;
}

// 이미지 업로드
async function uploadImage(file) {
    const formData = new FormData();
    formData.append('image', file);
    
    const response = await fetch('http://localhost:8000/upload', {
        method: 'POST',
        body: formData
    });
    
    return await response.json();
}
```

### 3. curl로 API 테스트

```bash
# 서버 상태 확인
curl http://localhost:8000/

# 검색하기
curl "http://localhost:8000/search?q=웹개발"

# 새 아이템 추가
curl -X POST "http://localhost:8000/items" \
     -F "title=새로운 아이템" \
     -F "description=설명입니다" \
     -F "category=테스트" \
     -F "tags=test,example"

# 이미지 업로드
curl -X POST "http://localhost:8000/upload" \
     -F "image=@my_image.jpg"
```

## 🔧 설정 및 커스터마이징

### 포트 변경

`start_server.py` 파일에서 포트를 변경할 수 있습니다:

```python
uvicorn.run(
    "main:app",
    host="0.0.0.0",
    port=8080,  # 원하는 포트로 변경
    reload=True
)
```

### 초기 데이터 수정

`main.py` 파일의 `init_data()` 함수에서 초기 데이터를 수정할 수 있습니다.

### 업로드 제한 변경

`main.py` 파일에서 파일 크기 제한과 허용 확장자를 수정할 수 있습니다:

```python
# 파일 크기 제한 (현재 5MB)
if len(content) > 10 * 1024 * 1024:  # 10MB로 변경

# 허용 확장자
allowed_extensions = {".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg"}
```

## 🛡️ 보안 고려사항

이 서버는 개발 및 학습 목적으로 만들어졌습니다. 프로덕션 환경에서 사용할 때는 다음 사항을 고려하세요:

- 파일 업로드 보안 강화
- 인증 및 권한 관리 추가
- HTTPS 설정
- 데이터베이스 사용 고려
- 로그 시스템 구축

## 🚀 확장 아이디어

- 사용자 인증 시스템 추가
- 실시간 검색 (WebSocket)
- 이미지 썸네일 생성
- 태그 자동완성 기능
- 검색 기록 저장
- RESTful API 확장
- 프론트엔드 웹 인터페이스

## 🐛 문제 해결

### 자주 발생하는 문제

**1. 포트가 이미 사용 중인 경우**
```bash
# 실행 중인 프로세스 확인
lsof -i :8000

# 프로세스 종료
kill -9 <PID>
```

**2. 패키지 설치 오류**
```bash
# pip 업그레이드
pip install --upgrade pip

# 가상환경 사용 권장
python -m venv venv
source venv/bin/activate  # Linux/Mac
# 또는
venv\Scripts\activate     # Windows
```

**3. 권한 오류 (Linux/Mac)**
```bash
# 실행 권한 부여
chmod +x start_server.py
chmod +x test_api.py
```

## 📞 지원

문제가 발생하거나 질문이 있으시면:

1. `python test_api.py`로 서버 상태 확인
2. 서버 로그 확인
3. API 문서 (http://localhost:8000/docs) 참조

---

**🎉 축하합니다! 이제 나만의 검색 및 이미지 서버를 운영할 수 있습니다!**

더 자세한 FastAPI 사용법은 [공식 문서](https://fastapi.tiangolo.com/)를 참조하세요.