# 🚀 빠른 시작 가이드

## 1. 서버 시작하기

```bash
cd backend-server
python3 main.py
```

## 2. 서버 접속

브라우저에서 다음 주소로 접속:

- **메인 페이지**: http://localhost:8000
- **API 문서**: http://localhost:8000/docs
- **Redoc 문서**: http://localhost:8000/redoc

## 3. 주요 API 테스트

### 전체 아이템 조회
```bash
curl http://localhost:8000/items
```

### 검색하기
```bash
# 키워드 검색
curl "http://localhost:8000/search?q=python"

# 카테고리별 검색
curl "http://localhost:8000/search?category=프로그래밍"
```

### 이미지 업로드
```bash
curl -X POST "http://localhost:8000/upload" -F "image=@your_image.jpg"
```

### 새 아이템 추가
```bash
curl -X POST "http://localhost:8000/items" \
     -F "title=새로운 아이템" \
     -F "description=설명입니다" \
     -F "category=테스트" \
     -F "tags=test,example"
```

## 4. 성공 메시지

서버가 성공적으로 실행되면 다음과 같은 응답을 받을 수 있습니다:

```json
{
    "message": "검색 및 이미지 서버가 정상적으로 실행 중입니다!",
    "server": "FastAPI Backend Server",
    "version": "1.0.0",
    "endpoints": {
        "search": "/search",
        "upload": "/upload", 
        "items": "/items",
        "static_files": "/static",
        "uploads": "/uploads"
    }
}
```

## 🎉 축하합니다!

이제 검색 기능과 이미지 서빙이 가능한 백엔드 서버가 준비되었습니다!