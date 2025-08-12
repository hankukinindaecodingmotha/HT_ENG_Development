// 프로필 페이지 기능
document.addEventListener('DOMContentLoaded', function () {
  ensureAuth();
  initProfile();
  setupEventListeners();
});

// 인증 확인
function ensureAuth() {
  const token = sessionStorage.getItem('auth_token');
  if (!token) {
    alert('로그인이 필요한 페이지입니다.');
    window.location.href = '/Web_UI/LoginPage/HT-eng-Login.html';
    return;
  }
}

// 프로필 초기화
function initProfile() {
  const username = sessionStorage.getItem('auth_user') || '사용자';
  const role = sessionStorage.getItem('auth_role') || 'user';

  // 기본 정보 설정
  document.getElementById('displayName').textContent = username;
  document.getElementById('username').textContent = username;
  document.getElementById('roleBadge').textContent = role === 'admin' ? '관리자' : '사용자';

  // 이메일 설정 (임시)
  document.getElementById('email').textContent = `${username}@example.com`;

  // 가입일 및 마지막 로그인 설정 (임시)
  const today = new Date().toISOString().split('T')[0];
  document.getElementById('joinDate').textContent = today;
  document.getElementById('lastLogin').textContent = today;

  // 관리자 기능 표시/숨김
  if (role === 'admin') {
    document.getElementById('adminActions').style.display = 'block';
  }
}

// 이벤트 리스너 설정
function setupEventListeners() {
  // 수정 버튼
  document.getElementById('editBtn').addEventListener('click', showEditForm);

  // 취소 버튼
  document.getElementById('cancelBtn').addEventListener('click', hideEditForm);

  // 수정 폼 제출
  document.getElementById('editForm').addEventListener('submit', handleEditSubmit);

  // 로그아웃
  document.getElementById('logoutBtn').addEventListener('click', handleLogout);

  // 모달 취소 버튼
  document.getElementById('modalCancelBtn').addEventListener('click', hidePasswordModal);

  // 비밀번호 확인 폼
  document.getElementById('passwordForm').addEventListener('submit', handlePasswordConfirm);
}

// 수정 폼 표시
function showEditForm() {
  const infoGrid = document.getElementById('infoGrid');
  const editForm = document.getElementById('editForm');

  // 현재 값으로 폼 초기화
  document.getElementById('editDisplayName').value = document.getElementById('displayName').textContent;
  document.getElementById('editEmail').value = document.getElementById('email').textContent;
  document.getElementById('editPassword').value = '';
  document.getElementById('editPasswordConfirm').value = '';

  // 폼 표시
  infoGrid.style.display = 'none';
  editForm.style.display = 'block';
}

// 수정 폼 숨김
function hideEditForm() {
  const infoGrid = document.getElementById('infoGrid');
  const editForm = document.getElementById('editForm');

  infoGrid.style.display = 'grid';
  editForm.style.display = 'none';
}

// 수정 폼 제출 처리
function handleEditSubmit(e) {
  e.preventDefault();

  const newPassword = document.getElementById('editPassword').value;
  const newPasswordConfirm = document.getElementById('editPasswordConfirm').value;

  // 비밀번호 변경 시 확인
  if (newPassword || newPasswordConfirm) {
    if (newPassword !== newPasswordConfirm) {
      alert('새 비밀번호가 일치하지 않습니다.');
      return;
    }
    if (newPassword.length < 6) {
      alert('비밀번호는 최소 6자 이상이어야 합니다.');
      return;
    }
  }

  // 비밀번호 확인 모달 표시
  showPasswordModal();
}

// 비밀번호 확인 모달 표시
function showPasswordModal() {
  document.getElementById('passwordModal').style.display = 'flex';
  document.getElementById('password').focus();
}

// 비밀번호 확인 모달 숨김
function hidePasswordModal() {
  document.getElementById('passwordModal').style.display = 'none';
  document.getElementById('passwordForm').reset();
}

// 비밀번호 확인 처리
function handlePasswordConfirm(e) {
  e.preventDefault();

  const currentPassword = document.getElementById('password').value;
  const storedPassword = sessionStorage.getItem('auth_password'); // 실제로는 서버에서 확인해야 함

  // 간단한 비밀번호 확인 (실제로는 서버 API 호출)
  if (currentPassword === storedPassword || currentPassword === 'admin1234' || currentPassword === 'user1234') {
    // 비밀번호 확인 성공 - 정보 업데이트
    updateProfile();
    hidePasswordModal();
  } else {
    alert('현재 비밀번호가 일치하지 않습니다.');
    document.getElementById('password').focus();
  }
}

// 프로필 정보 업데이트
function updateProfile() {
  const newDisplayName = document.getElementById('editDisplayName').value;
  const newEmail = document.getElementById('editEmail').value;
  const newPassword = document.getElementById('editPassword').value;

  // 화면 업데이트
  document.getElementById('displayName').textContent = newDisplayName;
  document.getElementById('email').textContent = newEmail;

  // sessionStorage 업데이트 (실제로는 서버에 저장)
  sessionStorage.setItem('auth_user', newDisplayName);

  // 비밀번호 변경 시 sessionStorage 업데이트
  if (newPassword) {
    sessionStorage.setItem('auth_password', newPassword);
    alert('비밀번호가 성공적으로 변경되었습니다.');
  }

  // 수정 폼 숨김
  hideEditForm();

  // 성공 메시지
  alert('프로필 정보가 성공적으로 업데이트되었습니다.');
}

// 로그아웃 처리
function handleLogout() {
  if (confirm('로그아웃 하시겠습니까?')) {
    sessionStorage.clear();
    window.location.href = '/Web_UI/LoginPage/HT-eng-Login.html';
  }
}