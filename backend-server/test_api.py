#!/usr/bin/env python3
"""
API 테스트 스크립트
서버가 정상적으로 작동하는지 확인합니다.
"""
import requests
import json

BASE_URL = "http://localhost:8000"

def test_api():
    print("🧪 API 테스트 시작...")
    print("=" * 50)
    
    try:
        # 1. 서버 상태 확인
        print("1. 서버 상태 확인...")
        response = requests.get(f"{BASE_URL}/")
        if response.status_code == 200:
            print("✅ 서버 정상 작동")
            print(f"   응답: {response.json()['message']}")
        else:
            print("❌ 서버 연결 실패")
            return
        
        # 2. 헬스 체크
        print("\n2. 헬스 체크...")
        response = requests.get(f"{BASE_URL}/health")
        if response.status_code == 200:
            print("✅ 헬스 체크 통과")
        else:
            print("❌ 헬스 체크 실패")
        
        # 3. 모든 아이템 조회
        print("\n3. 모든 아이템 조회...")
        response = requests.get(f"{BASE_URL}/items")
        if response.status_code == 200:
            items = response.json()
            print(f"✅ {len(items)}개의 아이템 조회 성공")
            for item in items[:2]:  # 처음 2개만 출력
                print(f"   - {item['title']} ({item['category']})")
        else:
            print("❌ 아이템 조회 실패")
        
        # 4. 검색 테스트
        print("\n4. 검색 테스트...")
        search_query = "파이썬"
        response = requests.get(f"{BASE_URL}/search", params={"q": search_query})
        if response.status_code == 200:
            results = response.json()
            print(f"✅ '{search_query}' 검색 결과: {results['total_results']}개")
            for result in results['results']:
                print(f"   - {result['title']}")
        else:
            print("❌ 검색 실패")
        
        # 5. 카테고리 조회
        print("\n5. 카테고리 조회...")
        response = requests.get(f"{BASE_URL}/categories")
        if response.status_code == 200:
            categories = response.json()
            print(f"✅ 사용 가능한 카테고리: {', '.join(categories)}")
        else:
            print("❌ 카테고리 조회 실패")
        
        print("\n" + "=" * 50)
        print("🎉 모든 테스트 완료!")
        print("📚 자세한 API 문서는 http://localhost:8000/docs에서 확인하세요")
        
    except requests.exceptions.ConnectionError:
        print("❌ 서버에 연결할 수 없습니다.")
        print("   서버가 실행 중인지 확인하세요: python start_server.py")
    except Exception as e:
        print(f"❌ 테스트 중 오류 발생: {e}")

if __name__ == "__main__":
    test_api()