#!/usr/bin/env python3
"""
백엔드 서버 시작 스크립트
"""
import uvicorn
import os
import sys

def main():
    print("=" * 50)
    print("🚀 검색 및 이미지 서버 시작 중...")
    print("=" * 50)
    
    # 현재 디렉토리를 서버 디렉토리로 변경
    server_dir = os.path.dirname(os.path.abspath(__file__))
    os.chdir(server_dir)
    
    print(f"📁 작업 디렉토리: {server_dir}")
    print("🌐 서버 주소: http://localhost:8000")
    print("📚 API 문서: http://localhost:8000/docs")
    print("🔍 Redoc 문서: http://localhost:8000/redoc")
    print("=" * 50)
    print("서버를 종료하려면 Ctrl+C를 누르세요")
    print("=" * 50)
    
    try:
        uvicorn.run(
            "main:app",
            host="0.0.0.0",
            port=8000,
            reload=True,  # 코드 변경시 자동 재시작
            log_level="info"
        )
    except KeyboardInterrupt:
        print("\n👋 서버가 종료되었습니다.")
        sys.exit(0)

if __name__ == "__main__":
    main()