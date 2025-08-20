// 관리자 페이지 핵심 기능
// ================================

// 관리자 페이지 초기화
function initAdmin() {
  // 사용자 정보 표시
  displayUserInfo();
  
  // 초기 데이터 로드
  loadStats();
  loadUsers();
  loadCompanyInfo();
  loadIntroPagesInfo();

  // 사용자 관리 섹션을 기본적으로 표시
  showUserManagement();
}

// 현재 로그인한 사용자 정보 표시
function displayUserInfo() {
  const userInfo = sessionStorage.getItem('user_info');
  if (userInfo) {
    try {
      const user = JSON.parse(userInfo);
      const currentUserElement = document.getElementById('currentUser');
      if (currentUserElement) {
        currentUserElement.innerHTML = `
          <i class="fas fa-user"></i> ${user.displayName} (${user.username})
        `;
      }
    } catch (error) {
      console.error('사용자 정보 표시 오류:', error);
    }
  }
}

// 로그아웃
function logout() {
  if (confirm('정말로 로그아웃하시겠습니까?')) {
    sessionStorage.clear();
    window.location.href = 'HT_eng-Admin-Login.html';
  }
}

// 이벤트 리스너 설정
function setupEventListeners() {
  // 새 사용자 추가 폼
  document.getElementById('addUserForm').addEventListener('submit', handleAddUser);

  // 회사 정보 폼
  document.getElementById('companyForm').addEventListener('submit', handleCompanyUpdate);
}

// 통계 로드
async function loadStats() {
  try {
    const response = await fetch('http://localhost:3000/api/admin/summary', {
      headers: {
        'Authorization': `Bearer ${sessionStorage.getItem('auth_token')}`
      }
    });

    if (response.ok) {
      const data = await response.json();
      document.getElementById('totalUsers').textContent = data.totalUsers;
      document.getElementById('activeUsers').textContent = data.activeUsers;
      document.getElementById('pendingUsers').textContent = data.pendingUsers;
      document.getElementById('totalProducts').textContent = data.totalProducts;
    } else {
      console.error('통계 로드 실패:', response.status);
      // 실패 시 기본값 표시
      document.getElementById('totalUsers').textContent = '0';
      document.getElementById('activeUsers').textContent = '0';
      document.getElementById('pendingUsers').textContent = '0';
      document.getElementById('totalProducts').textContent = '0';
    }
  } catch (error) {
    console.error('통계 로드 실패:', error);
    // 에러 시 기본값 표시
    document.getElementById('totalUsers').textContent = '0';
    document.getElementById('activeUsers').textContent = '0';
    document.getElementById('pendingUsers').textContent = '0';
    document.getElementById('totalProducts').textContent = '0';
  }
}

// 탭 표시 함수
function showTab(tabName) {
  // 모든 탭 내용 숨기기
  const tabContents = document.querySelectorAll('.tab-content');
  tabContents.forEach(content => {
    content.style.display = 'none';
  });

  // 모든 탭 버튼 비활성화
  const tabButtons = document.querySelectorAll('.tab-btn');
  tabButtons.forEach(btn => {
    btn.classList.remove('active');
  });

  // 선택된 탭 내용 표시
  let targetTab = document.getElementById(tabName + 'Tab');
  if (!targetTab) {
    targetTab = document.getElementById(tabName);
  }

  if (targetTab) {
    targetTab.style.display = 'block';
  }

  // 선택된 탭 버튼 활성화
  const activeButton = document.querySelector(`[onclick="showTab('${tabName}')"]`);
  if (activeButton) {
    activeButton.classList.add('active');
  }
}

// 섹션 표시/숨기기 함수들
function showUserManagement() {
  document.getElementById('userManagement').style.display = 'block';
  document.getElementById('contentManagement').style.display = 'none';

  // 탭 버튼 활성화
  document.querySelector('[onclick="showUserManagement()"]').classList.add('active');
  document.querySelector('[onclick="showContentManagement()"]').classList.remove('active');
}

function showContentManagement() {
  document.getElementById('userManagement').style.display = 'none';
  document.getElementById('contentManagement').style.display = 'block';

  // 탭 버튼 활성화
  document.querySelector('[onclick="showUserManagement()"]').classList.remove('active');
  document.querySelector('[onclick="showContentManagement()"]').classList.add('active');

  // 기본적으로 회사 정보 탭 표시
  showTab('company');
}

// 버튼 상태 관리 함수들
function setButtonLoading(button, isLoading) {
  if (isLoading) {
    button.disabled = true;
    button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 처리중...';
    button.classList.add('loading');
  } else {
    button.disabled = false;
    button.classList.remove('loading');
  }
}

function setButtonSuccess(button) {
  button.classList.remove('loading', 'error');
  button.classList.add('success');
  button.innerHTML = '<i class="fas fa-check"></i> 완료';

  setTimeout(() => {
    button.classList.remove('success');
    button.innerHTML = button.getAttribute('data-original-text') || '저장';
  }, 2000);
}

function setButtonError(button) {
  button.classList.remove('loading', 'success');
  button.classList.add('error');
  button.innerHTML = '<i class="fas fa-times"></i> 실패';

  setTimeout(() => {
    button.classList.remove('error');
    button.innerHTML = button.getAttribute('data-original-text') || '저장';
  }, 2000);
}

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', function () {
  initAdmin();
  setupEventListeners();
});
