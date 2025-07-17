// HTML 요소가 모두 로드된 후 실행
document.addEventListener("DOMContentLoaded", function () {
    const sidebar = document.getElementById("sidebar");
    const toggleBtn = document.getElementById("toggleBtn");
    const closeBtn = document.getElementById("closeBtn");

    // 사이드바 열기 버튼 클릭 시
    toggleBtn.addEventListener("click", function () {
        sidebar.classList.add("open");         // 사이드바 열기
        toggleBtn.style.display = "none";      // 열기 버튼 숨김
        closeBtn.style.display = "inline";     // 닫기 버튼 표시
    });

    // 사이드바 닫기 버튼 클릭 시
    closeBtn.addEventListener("click", function () {
        sidebar.classList.remove("open");      // 사이드바 닫기
        toggleBtn.style.display = "inline";    // 열기 버튼 다시 보이기
        closeBtn.style.display = "none";       // 닫기 버튼 숨김
    });
});