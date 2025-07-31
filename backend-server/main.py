from fastapi import FastAPI, HTTPException, UploadFile, File, Query
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, JSONResponse
from typing import List, Optional
import os
import json
import aiofiles
import uuid
from datetime import datetime

# FastAPI 앱 생성
app = FastAPI(
    title="검색 및 이미지 서버",
    description="검색 기능과 이미지 업로드/서빙이 가능한 백엔드 서버",
    version="1.0.0"
)

# 정적 파일 서빙 설정
app.mount("/static", StaticFiles(directory="static"), name="static")
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# 데이터 저장 경로
DATA_FILE = "data/search_data.json"
UPLOAD_DIR = "uploads"

# 초기 데이터 설정
def init_data():
    """서버 시작시 초기 데이터를 설정합니다."""
    os.makedirs("data", exist_ok=True)
    os.makedirs("uploads", exist_ok=True)
    os.makedirs("static/images", exist_ok=True)
    
    if not os.path.exists(DATA_FILE):
        initial_data = {
            "items": [
                {
                    "id": 1,
                    "title": "파이썬 프로그래밍",
                    "description": "파이썬 기초부터 고급까지 완벽 가이드",
                    "category": "프로그래밍",
                    "tags": ["python", "programming", "tutorial"],
                    "image_url": "/static/images/python.jpg",
                    "created_at": "2024-01-01T00:00:00"
                },
                {
                    "id": 2,
                    "title": "웹 개발 기초",
                    "description": "HTML, CSS, JavaScript를 이용한 웹 개발",
                    "category": "웹개발",
                    "tags": ["web", "html", "css", "javascript"],
                    "image_url": "/static/images/web.jpg",
                    "created_at": "2024-01-02T00:00:00"
                },
                {
                    "id": 3,
                    "title": "데이터베이스 설계",
                    "description": "효율적인 데이터베이스 구조 설계 방법",
                    "category": "데이터베이스",
                    "tags": ["database", "sql", "design"],
                    "image_url": "/static/images/database.jpg",
                    "created_at": "2024-01-03T00:00:00"
                }
            ]
        }
        with open(DATA_FILE, 'w', encoding='utf-8') as f:
            json.dump(initial_data, f, ensure_ascii=False, indent=2)

# 데이터 로드 함수
async def load_data():
    """JSON 파일에서 데이터를 로드합니다."""
    try:
        async with aiofiles.open(DATA_FILE, 'r', encoding='utf-8') as f:
            content = await f.read()
            return json.loads(content)
    except FileNotFoundError:
        return {"items": []}

# 데이터 저장 함수
async def save_data(data):
    """데이터를 JSON 파일에 저장합니다."""
    async with aiofiles.open(DATA_FILE, 'w', encoding='utf-8') as f:
        await f.write(json.dumps(data, ensure_ascii=False, indent=2))

@app.on_event("startup")
async def startup_event():
    """서버 시작시 실행되는 함수"""
    init_data()

@app.get("/")
async def root():
    """루트 엔드포인트 - 서버 상태 확인"""
    return {
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

@app.get("/search")
async def search_items(
    q: Optional[str] = Query(None, description="검색어"),
    category: Optional[str] = Query(None, description="카테고리 필터"),
    limit: int = Query(10, description="결과 개수 제한")
):
    """
    검색 API
    - q: 제목, 설명, 태그에서 검색
    - category: 특정 카테고리로 필터링
    - limit: 반환할 결과 개수
    """
    data = await load_data()
    items = data.get("items", [])
    
    # 검색어가 있는 경우 필터링
    if q:
        q_lower = q.lower()
        filtered_items = []
        for item in items:
            # 제목, 설명, 태그에서 검색
            if (q_lower in item.get("title", "").lower() or 
                q_lower in item.get("description", "").lower() or
                any(q_lower in tag.lower() for tag in item.get("tags", []))):
                filtered_items.append(item)
        items = filtered_items
    
    # 카테고리 필터링
    if category:
        items = [item for item in items if item.get("category", "").lower() == category.lower()]
    
    # 결과 개수 제한
    items = items[:limit]
    
    return {
        "query": q,
        "category": category,
        "total_results": len(items),
        "results": items
    }

@app.get("/items")
async def get_all_items():
    """모든 아이템 조회"""
    data = await load_data()
    return data.get("items", [])

@app.get("/items/{item_id}")
async def get_item(item_id: int):
    """특정 아이템 조회"""
    data = await load_data()
    items = data.get("items", [])
    
    for item in items:
        if item.get("id") == item_id:
            return item
    
    raise HTTPException(status_code=404, detail="아이템을 찾을 수 없습니다.")

@app.post("/items")
async def create_item(
    title: str,
    description: str,
    category: str,
    tags: List[str] = [],
    image: Optional[UploadFile] = File(None)
):
    """새 아이템 생성"""
    data = await load_data()
    items = data.get("items", [])
    
    # 새 ID 생성
    new_id = max([item.get("id", 0) for item in items], default=0) + 1
    
    # 이미지 업로드 처리
    image_url = None
    if image:
        # 파일 확장자 확인
        allowed_extensions = {".jpg", ".jpeg", ".png", ".gif", ".webp"}
        file_extension = os.path.splitext(image.filename)[1].lower()
        
        if file_extension not in allowed_extensions:
            raise HTTPException(
                status_code=400, 
                detail="지원하지 않는 이미지 형식입니다. (jpg, jpeg, png, gif, webp만 가능)"
            )
        
        # 고유한 파일명 생성
        unique_filename = f"{uuid.uuid4()}{file_extension}"
        file_path = os.path.join(UPLOAD_DIR, unique_filename)
        
        # 파일 저장
        async with aiofiles.open(file_path, 'wb') as f:
            content = await image.read()
            await f.write(content)
        
        image_url = f"/uploads/{unique_filename}"
    
    # 새 아이템 생성
    new_item = {
        "id": new_id,
        "title": title,
        "description": description,
        "category": category,
        "tags": tags,
        "image_url": image_url,
        "created_at": datetime.now().isoformat()
    }
    
    items.append(new_item)
    data["items"] = items
    await save_data(data)
    
    return new_item

@app.post("/upload")
async def upload_image(image: UploadFile = File(...)):
    """이미지 업로드 API"""
    # 파일 타입 확인
    if not image.content_type.startswith('image/'):
        raise HTTPException(status_code=400, detail="이미지 파일만 업로드 가능합니다.")
    
    # 파일 크기 확인 (5MB 제한)
    content = await image.read()
    if len(content) > 5 * 1024 * 1024:  # 5MB
        raise HTTPException(status_code=400, detail="파일 크기는 5MB 이하여야 합니다.")
    
    # 파일 확장자 확인
    allowed_extensions = {".jpg", ".jpeg", ".png", ".gif", ".webp"}
    file_extension = os.path.splitext(image.filename)[1].lower()
    
    if file_extension not in allowed_extensions:
        raise HTTPException(
            status_code=400, 
            detail="지원하지 않는 이미지 형식입니다. (jpg, jpeg, png, gif, webp만 가능)"
        )
    
    # 고유한 파일명 생성
    unique_filename = f"{uuid.uuid4()}{file_extension}"
    file_path = os.path.join(UPLOAD_DIR, unique_filename)
    
    # 파일 저장
    async with aiofiles.open(file_path, 'wb') as f:
        await f.write(content)
    
    # 이미지 정보 반환 (PIL 없이 기본 정보만)
    width, height = None, None
    
    return {
        "filename": unique_filename,
        "url": f"/uploads/{unique_filename}",
        "size": len(content),
        "width": width,
        "height": height,
        "uploaded_at": datetime.now().isoformat()
    }

@app.get("/categories")
async def get_categories():
    """사용 가능한 카테고리 목록 조회"""
    data = await load_data()
    items = data.get("items", [])
    
    categories = list(set(item.get("category", "") for item in items if item.get("category")))
    return sorted(categories)

@app.get("/health")
async def health_check():
    """서버 상태 확인"""
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "message": "서버가 정상적으로 작동 중입니다."
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)