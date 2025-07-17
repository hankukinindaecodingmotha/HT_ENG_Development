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

// 검색어 필터링 함수
// 입력된 필터(문자열)를 소문자로 비교해
// li 요소 각각의 텍스트에 포함되면 보이고, 아니면 숨김 처리
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
      // 필터링 함수 실행
      filterItems(input.value.toLowerCase());
      // 최근 검색어 박스 숨김
      recentBox.style.display = "none";
    });
  });
}

// 검색 입력창에 내용이 바뀔 때마다 실행되는 이벤트 리스너
input.addEventListener('input', function () {
  // 입력된 값을 소문자와 양 끝 공백 제거해서 filter 변수에 저장
  const filter = input.value.toLowerCase().trim();

  // li 필터링 실행
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

    // 연관검색어 배열에서 입력값이 포함된 단어만 필터링해서 최대 5개까지 추림
    const filteredSuggestions = relatedWords
      .filter(word => word.toLowerCase().includes(filter))
      .slice(0, 5);

    // 필터링 결과가 있으면 연관검색어 박스에 div 요소로 표시하고 보이게 처리
    if (filteredSuggestions.length > 0) {
      suggestions.innerHTML = filteredSuggestions.map(word => `<div>${word}</div>`).join("");
      suggestions.style.display = "block";
    } else { // 없으면 박스 숨기고 내용 비움
      suggestions.style.display = "none";
      suggestions.innerHTML = "";
    }

    // 연관검색어 div 각각에 클릭 이벤트 등록
    suggestions.querySelectorAll('div').forEach(item => {
      item.addEventListener('click', () => {
        // 클릭 시 해당 텍스트를 입력창 값으로 세팅하고
        input.value = item.textContent;
        // 필터링 실행
        filterItems(input.value.toLowerCase());
        // 연관검색어 박스 숨기고 내용 비움
        suggestions.innerHTML = "";
        suggestions.style.display = "none";
      });
    });
  }
});

// 검색창에서 엔터키 입력 시 실행 이벤트
input.addEventListener('keydown', function(event) {
  // 엔터키일 경우만 처리
  if (event.key === "Enter") {
    // 입력값 양쪽 공백 제거
    const keyword = input.value.trim();
    // 빈값이 아니면
    if (keyword !== "") {
      // 최근 검색어 목록 업데이트 (UI 포함)
      updateRecentSearches(keyword);
      // 연관검색어 박스 숨김 및 내용 초기화
      suggestions.innerHTML = "";
      suggestions.style.display = "none";
      // 최근검색어 박스도 숨김
      recentBox.style.display = "none";
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
  // 상대 경로로 HomePage.html로 이동
  // 현재 SearchPage 폴더 안이므로 ../Homepage/ 경로 사용
  window.location.href = '../Homepage/HomePage.html';
});