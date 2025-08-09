// Web_UI/SearchPage1/HT_eng-SearchPage1.js

// 검색 입력창 요소 선택
const input = document.getElementById('searchInput');

// 숨겨져 있는 검색 가능한 아이템 리스트 ul 요소 선택
const list = document.getElementById('itemList');

// ul 내부의 모든 li 요소들 (검색 가능한 아이템들)
const items = list.getElementsByTagName('li');

// 연관 검색어를 보여줄 박스 요소 선택
const suggestions = document.getElementById('suggestions');

// 최근 검색어를 보여줄 박스 요소 선택
const recentBox = document.getElementById('recentSearches');

// 최근 검색어 목록이 들어갈 ul 요소 선택
const recentList = document.getElementById('recentList');

// 사전에 정의된 연관 검색어 배열 (필터링에 사용됨)
const relatedWords = [
  "사과즙", "사과파이", "바나나우유", "바나나팬케이크",
  "오렌지주스", "오렌지향", "포도주", "포도케이크",
  "망고", "멜론", "수박", "딸기잼"
];

// 최근 검색어 저장 배열 (최대 5개까지 저장)
let recentSearches = [];

// 현재 뷰 모드
let currentViewMode = 'grid-4';

// 서버 검색 함수
function performSearch() {
  const query = input.value.trim();

  if (!query) {
    alert('검색어를 입력해주세요.');
    return;
  }

  // 최근 검색어에 추가
  updateRecentSearches(query);

  // 서버 API 호출
  fetch(`http://localhost:3000/api/products/filter?제품명=${encodeURIComponent(query)}`)
    .then(res => res.json())
    .then(data => {
      displayServerResults(data);
    })
    .catch(error => {
      console.error('서버 검색 오류:', error);
      alert('서버 연결에 실패했습니다. 서버가 실행 중인지 확인해주세요.');
    });

  // 연관검색어 박스 숨기기
  suggestions.style.display = 'none';
}

// 서버 검색 결과 표시 함수
function displayServerResults(data) {
  const resultGrid = document.getElementById('serverResultGrid');
  const resultContainer = document.getElementById('serverResultContainer');

  resultGrid.innerHTML = '';

  if (data.length === 0) {
    resultGrid.innerHTML = '<div class="no-results">검색 결과가 없습니다.</div>';
    resultContainer.classList.add('show');
    return;
  }

  data.forEach(item => {
    const card = document.createElement('div');
    card.className = 'product-card';
    card.onclick = () => showProductDetail(item);

    // 제품 이미지 (실제 이미지가 없으므로 플레이스홀더)
    const imageDiv = document.createElement('div');
    imageDiv.className = 'product-image';
    imageDiv.textContent = item.제품.charAt(0);

    // 제품 정보
    const infoDiv = document.createElement('div');
    infoDiv.className = 'product-info';

    const nameDiv = document.createElement('div');
    nameDiv.className = 'product-name';
    nameDiv.textContent = item.제품;

    const descDiv = document.createElement('div');
    descDiv.className = 'product-description';
    descDiv.textContent = item.상세설명;

    infoDiv.appendChild(nameDiv);
    infoDiv.appendChild(descDiv);

    card.appendChild(imageDiv);
    card.appendChild(infoDiv);

    resultGrid.appendChild(card);
  });

  resultContainer.classList.add('show');
}

// 제품 상세 페이지로 이동 (제품명 전달)
function showProductDetail(item) {
  const name = item?.제품;
  if (!name) return;
  window.location.href = `../ProductPage/ProductDetailPage/HT_eng-ProductDetail.html?name=${encodeURIComponent(name)}`;
}

// 뷰 모드 설정
function setViewMode(mode) {
  currentViewMode = mode;
  const resultGrid = document.getElementById('serverResultGrid');
  const viewBtns = document.querySelectorAll('.view-btn');

  // 클래스 업데이트
  resultGrid.className = `result-grid ${mode}`;

  // 버튼 활성화 상태 업데이트
  viewBtns.forEach(btn => {
    btn.classList.remove('active');
    if (btn.getAttribute('onclick').includes(mode)) {
      btn.classList.add('active');
    }
  });
}

// 연관 검색어 표시 (서버 기반)
function showSuggestions() {
  const value = input.value.trim();

  if (!value) {
    suggestions.style.display = 'none';
    return;
  }

  fetch(`http://localhost:3000/api/products/suggest?q=${encodeURIComponent(value)}`)
    .then(res => res.json())
    .then(suggestions => {
      if (suggestions.length === 0) {
        document.getElementById('suggestions').style.display = 'none';
        return;
      }
      document.getElementById('suggestions').innerHTML = suggestions.map(s => `<div onclick="selectSuggestion('${s}')">${s}</div>`).join('');
      document.getElementById('suggestions').style.display = 'block';
    })
    .catch(error => {
      console.error('연관 검색어 오류:', error);
      document.getElementById('suggestions').style.display = 'none';
    });
}

function selectSuggestion(value) {
  document.getElementById('searchInput').value = value;
  performSearch();
}

// 검색어 필터링 함수 (기존 로컬 검색용)
function filterItems(filter) {
  for (let i = 0; i < items.length; i++) {
    const text = items[i].textContent.toLowerCase();
    // 포함되면 빈문자열로 보임 (style.display 기본값)
    // 포함 안되면 none으로 숨김
    items[i].style.display = text.includes(filter) ? "" : "none";
  }
}

// 최근 검색어 UI를 업데이트하는 함수
// keyword(최신 검색어)를 받아서 중복 제거 후 배열 앞에 추가
// 배열 길이가 5 초과하면 뒤에서부터 제거해서 5개 유지
// ul 요소 innerHTML을 최근검색어 li 목록으로 다시 생성
// li 각각에 클릭 이벤트를 달아 클릭 시 검색어가 입력창에 들어가고 필터링 실행되며 박스 숨김
function updateRecentSearches(keyword) {
  // 배열에 이미 있으면 제거
  const index = recentSearches.indexOf(keyword);
  if (index > -1) recentSearches.splice(index, 1);

  // 배열 앞에 새 검색어 추가
  recentSearches.unshift(keyword);

  // 최대 5개 유지
  if (recentSearches.length > 5) recentSearches.pop();

  // ul 내부를 li 목록 HTML로 업데이트
  recentList.innerHTML = recentSearches.map(word => `<li>${word}</li>`).join("");

  // 각 li에 클릭 이벤트 등록
  recentList.querySelectorAll("li").forEach(item => {
    item.addEventListener("click", () => {
      // 클릭된 li 텍스트를 입력창 값으로 세팅
      input.value = item.textContent;
      // 서버 검색 실행
      performSearch();
      // 최근 검색어 박스 숨김
      recentBox.style.display = "none";
    });
  });
}

// 검색 입력창에 내용이 바뀔 때마다 실행되는 이벤트 리스너
input.addEventListener('input', function () {
  // 입력된 값을 소문자와 양 끝 공백 제거해서 filter 변수에 저장
  const filter = input.value.toLowerCase().trim();

  // li 필터링 실행 (기존 로컬 검색)
  filterItems(filter);

  // 입력값이 비었을 때 처리
  if (filter === "") {
    // 연관검색어 박스 숨기고 내용 비우기
    suggestions.style.display = "none";
    suggestions.innerHTML = "";

    // 최근검색어가 있으면 최근검색어 박스 보이기, 없으면 숨기기
    if (recentSearches.length > 0) {
      recentBox.style.display = "block";
    } else {
      recentBox.style.display = "none";
    }

  } else { // 입력값이 있을 때 처리
    // 최근검색어 박스 보이기 (검색중에도 보이도록)
    recentBox.style.display = "block";

    // 서버 기반 연관 검색어 표시
    showSuggestions();
  }
});

// 검색창에서 엔터키 입력 시 실행 이벤트
input.addEventListener('keydown', function (event) {
  // 엔터키일 경우만 처리
  if (event.key === "Enter") {
    // 입력값 양쪽 공백 제거
    const keyword = input.value.trim();
    // 빈값이 아니면
    if (keyword !== "") {
      // 서버 검색 실행
      performSearch();
    }
  }
});

// 입력창에 포커스(클릭 또는 탭) 되었을 때 실행 이벤트
input.addEventListener('focus', () => {
  // 최근검색어 배열이 비어있지 않으면 박스 보이게, 아니면 숨김
  if (recentSearches.length > 0) {
    recentBox.style.display = 'block';
  } else {
    recentBox.style.display = 'none';
  }
});

// 입력창 포커스 해제(다른 곳 클릭 등) 시 실행 이벤트
input.addEventListener('blur', () => {
  // 딜레이를 두어 클릭 이벤트와 충돌 방지
  setTimeout(() => {
    // 최근검색어 박스 숨기기
    recentBox.style.display = 'none';
    // 연관검색어 박스 숨기기
    suggestions.style.display = 'none';
  }, 150);
});

// --- 홈 버튼 클릭 시 HomePage.html로 이동 --- //
// 홈 버튼 id 'homeBtn' 선택 후 클릭 이벤트 리스너 추가
document.getElementById('homeBtn').addEventListener('click', () => {
  // SearchPage1 폴더 기준
  window.location.href = '../HomePage/HT-eng-HomePage.html';
});