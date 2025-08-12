// 사용자 관리 기능
// ================================

// 사용자 목록 로드
async function loadUsers() {
  try {
    console.log('=== 사용자 목록 로드 시작 ===');
    const token = sessionStorage.getItem('auth_token');
    console.log('인증 토큰:', token ? '존재함' : '없음');

    if (!token) {
      console.error('인증 토큰이 없습니다!');
      return;
    }

    const response = await fetch('http://localhost:3000/api/admin/users', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    console.log('서버 응답 상태:', response.status);
    console.log('서버 응답 헤더:', response.headers);

    if (response.ok) {
      const users = await response.json();
      console.log('받은 사용자 데이터:', users);
      console.log('사용자 수:', users.length);

      if (users && users.length > 0) {
        console.log('첫 번째 사용자 예시:', users[0]);
        renderUserList(users);
      } else {
        console.log('사용자 데이터가 비어있습니다.');
        renderUserList([]);
      }
    } else {
      console.error('사용자 목록 로드 실패:', response.status);
      renderUserList([]);
    }
  } catch (error) {
    console.error('사용자 목록 로드 실패:', error);
    renderUserList([]);
  }
}

// 사용자 목록 렌더링
function renderUserList(users) {
  console.log('=== renderUserList 호출됨 ===');
  console.log('받은 사용자 수:', users.length);
  console.log('사용자 배열:', users);

  const userList = document.getElementById('userList');
  console.log('userList 엘리먼트:', userList);

  if (!userList) {
    console.error('❌ userList 엘리먼트를 찾을 수 없습니다!');
    return;
  }

  if (!Array.isArray(users)) {
    console.error('❌ users가 배열이 아닙니다:', typeof users);
    return;
  }

  // 헤더는 이미 HTML에 있으므로 사용자 아이템만 추가
  const usersHTML = users.map((user, index) => {
    console.log(`사용자 ${index + 1} 렌더링:`, user);

    if (!user.id || !user.username || !user.displayName) {
      console.error(`❌ 사용자 ${index + 1} 데이터 누락:`, user);
      return '';
    }

    return `
    <div class="user-item">
      <span class="username">${user.username}</span>
      <span class="display-name">${user.displayName}</span>
      <span class="role ${user.role}">${user.role === 'admin' ? '관리자' : '사용자'}</span>
      <span class="status ${user.status}">${getStatusText(user.status)}</span>
        <span class="email">${user.email || ''}</span>
        <span class="join-date">${user.joinDate || ''}</span>
      <div class="status-actions">
        ${renderStatusActions(user)}
      </div>
      <div class="user-actions">
          <button class="action-btn edit-btn" id="edit-${user.id}" onclick="editUser('${user.id}')" title="수정" data-user-id="${user.id}">
          <i class="fas fa-edit"></i>
        </button>
          <button class="action-btn delete-btn" id="delete-${user.id}" onclick="deleteUser('${user.id}')" title="삭제" data-user-id="${user.id}">
          <i class="fas fa-trash"></i>
        </button>
      </div>
    </div>
    `;
  }).join('');

  console.log('생성된 HTML 길이:', usersHTML.length);
  console.log('생성된 HTML 미리보기:', usersHTML.substring(0, 200) + '...');

  // 기존 사용자 아이템들 제거 (헤더는 유지)
  const existingItems = userList.querySelectorAll('.user-item');
  console.log('기존 사용자 아이템 수:', existingItems.length);
  existingItems.forEach(item => item.remove());

  // 새 사용자 목록 추가
  if (usersHTML.trim()) {
    userList.insertAdjacentHTML('beforeend', usersHTML);
    console.log('✅ 사용자 목록 렌더링 완료');
  } else {
    console.log('사용자 데이터가 비어있습니다.');
  }
}

// 상태별 액션 버튼 렌더링
function renderStatusActions(user) {
  let actionsHTML = '';

  if (user.status === 'pending') {
    actionsHTML += `
      <button class="action-btn approve-btn" id="approve-${user.id}" onclick="approveUser('${user.id}')" title="승인" data-user-id="${user.id}">
        <i class="fas fa-check"></i>
      </button>
      <button class="action-btn reject-btn" id="reject-${user.id}" onclick="rejectUser('${user.id}')" title="거절" data-user-id="${user.id}">
        <i class="fas fa-times"></i>
      </button>
    `;
  } else if (user.status === 'active') {
    actionsHTML += `
      <button class="action-btn deactivate-btn" id="deactivate-${user.id}" onclick="deactivateUser('${user.id}')" title="비활성화" data-user-id="${user.id}">
        <i class="fas fa-ban"></i>
      </button>
    `;
  } else if (user.status === 'inactive') {
    actionsHTML += `
      <button class="action-btn activate-btn" id="activate-${user.id}" onclick="activateUser('${user.id}')" title="활성화" data-user-id="${user.id}">
        <i class="fas fa-check-circle"></i>
      </button>
    `;
  }

  return actionsHTML;
}

// 상태 텍스트 변환
function getStatusText(status) {
  const statusMap = {
    'active': '활성',
    'inactive': '비활성',
    'pending': '승인대기'
  };
  return statusMap[status] || status;
}

// 새 사용자 추가 폼 표시/숨기기
function showAddUserForm() {
  document.getElementById('addUserForm').style.display = 'block';
  document.getElementById('addUserBtn').style.display = 'none';
}

function hideAddUserForm() {
  document.getElementById('addUserForm').style.display = 'none';
  document.getElementById('addUserBtn').style.display = 'block';
}

// 새 사용자 추가 처리
async function handleAddUser(e) {
  e.preventDefault();
  
  const submitBtn = e.target.querySelector('button[type="submit"]');
  setButtonLoading(submitBtn, true);

  try {
    const formData = new FormData(e.target);
    
    // 비밀번호 확인
    const password = formData.get('password');
    const passwordConfirm = formData.get('passwordConfirm');
    
    if (password !== passwordConfirm) {
      alert('비밀번호가 일치하지 않습니다.');
      setButtonLoading(submitBtn, false);
      return;
    }

    const userData = {
      username: formData.get('username'),
      password: password,
      displayName: formData.get('displayName'),
      email: formData.get('email'),
      role: formData.get('role')
    };

    const response = await fetch('http://localhost:3000/api/admin/users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${sessionStorage.getItem('auth_token')}`
      },
      body: JSON.stringify(userData)
    });

    if (response.ok) {
      const result = await response.json();
      console.log('사용자 추가 성공:', result);
      
      // 사용자 목록 새로고침
      await loadUsers();
      updateStats(); // 통계 업데이트
      setButtonSuccess(submitBtn);
      alert('사용자가 성공적으로 추가되었습니다.');
      hideAddUserForm();
    } else {
      const errorData = await response.json();
      alert(`사용자 추가 실패: ${errorData.message || response.statusText}`);
      setButtonError(submitBtn);
    }
  } catch (error) {
    console.error('사용자 추가 실패:', error);
    alert('사용자 추가 중 오류가 발생했습니다.');
    setButtonError(submitBtn);
  } finally {
    setButtonLoading(submitBtn, false);
  }
}

// 사용자 수정 폼 표시
async function editUser(userId) {
  try {
    const user = await getUserById(userId);
    if (user) {
      showUserEdit(user);
    }
  } catch (error) {
    console.error('사용자 정보 로드 실패:', error);
    alert('사용자 정보를 불러오는데 실패했습니다.');
  }
}

// 사용자 ID로 사용자 정보 조회
async function getUserById(userId) {
  try {
    const response = await fetch('http://localhost:3000/api/admin/users', {
      headers: {
        'Authorization': `Bearer ${sessionStorage.getItem('auth_token')}`
      }
    });

    if (response.ok) {
      const users = await response.json();
      return users.find(u => u.id === userId);
    } else {
      console.error('사용자 목록 조회 실패:', response.status);
      return null;
    }
  } catch (error) {
    console.error('사용자 정보 조회 실패:', error);
    return null;
  }
}

// 사용자 수정 폼 표시
function showUserEdit(user) {
  const editSection = document.getElementById('userEditSection');
  const editForm = document.getElementById('userEditForm');

  // 폼에 사용자 정보 설정
  editForm.querySelector('[name="editUsername"]').value = user.username;
  editForm.querySelector('[name="editDisplayName"]').value = user.displayName;
  editForm.querySelector('[name="editEmail"]').value = user.email || '';
  editForm.querySelector('[name="editRole"]').value = user.role;
  editForm.querySelector('[name="editStatus"]').value = user.status;

  // 사용자 ID를 폼에 저장
  editForm.setAttribute('data-user-id', user.id);

  // 수정 섹션 표시
  editSection.style.display = 'block';
}

// 사용자 수정 폼 숨기기
function hideUserEdit() {
  document.getElementById('userEditSection').style.display = 'none';
}

// 사용자 수정 처리
async function handleEditUser(e) {
  e.preventDefault();
  
  const submitBtn = e.target.querySelector('button[type="submit"]');
  setButtonLoading(submitBtn, true);

  try {
    const formData = new FormData(e.target);
    const userId = e.target.getAttribute('data-user-id');

    const userData = {
      username: formData.get('editUsername'),
      displayName: formData.get('editDisplayName'),
      email: formData.get('editEmail'),
      role: formData.get('editRole'),
      status: formData.get('editStatus')
    };

    // 비밀번호가 입력된 경우에만 포함
    const password = formData.get('editPassword');
    if (password && password.trim()) {
      userData.password = password;
    }

    const response = await fetch(`http://localhost:3000/api/admin/users/${userId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${sessionStorage.getItem('auth_token')}`
      },
      body: JSON.stringify(userData)
    });

    if (response.ok) {
      const result = await response.json();
      console.log('사용자 수정 성공:', result);
      
      // 사용자 목록 새로고침
      await loadUsers();
      updateStats(); // 통계 업데이트
      hideUserEdit(); // 수정 섹션 숨김
      setButtonSuccess(submitBtn);
      alert('사용자 정보가 성공적으로 수정되었습니다.');
    } else {
      const errorData = await response.json();
      alert(`사용자 수정 실패: ${errorData.message || response.statusText}`);
      setButtonError(submitBtn);
    }
  } catch (error) {
    console.error('사용자 수정 실패:', error);
    alert('사용자 수정 중 오류가 발생했습니다.');
    setButtonError(submitBtn);
  } finally {
    setButtonLoading(submitBtn, false);
  }
}

// 사용자 삭제
async function deleteUser(userId) {
  if (!confirm('정말로 이 사용자를 삭제하시겠습니까?')) {
    return;
  }

  const deleteBtn = document.getElementById(`delete-${userId}`);
  setButtonLoading(deleteBtn, true);

  try {
    const response = await fetch(`http://localhost:3000/api/admin/users/${userId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${sessionStorage.getItem('auth_token')}`
      }
    });

    if (response.ok) {
      console.log('사용자 삭제 성공');
      
      // 사용자 목록 새로고침
      await loadUsers();
      updateStats(); // 통계 업데이트
      
      if (deleteBtn) {
        setButtonSuccess(deleteBtn);
      }
      alert('사용자가 성공적으로 삭제되었습니다.');
    } else {
      const errorData = await response.json();
      alert(`사용자 삭제 실패: ${errorData.message || response.statusText}`);
      if (deleteBtn) {
        setButtonError(deleteBtn);
      }
    }
  } catch (error) {
    console.error('사용자 삭제 실패:', error);
    alert('사용자 삭제 중 오류가 발생했습니다.');
    if (deleteBtn) {
      setButtonError(deleteBtn);
    }
  } finally {
    if (deleteBtn) {
      setButtonLoading(deleteBtn, false);
    }
  }
}

// 사용자 승인
async function approveUser(userId) {
  await updateUserStatus(userId, 'active', 'approve');
}

// 사용자 거절
async function rejectUser(userId) {
  await updateUserStatus(userId, 'rejected', 'reject');
}

// 사용자 활성화
async function activateUser(userId) {
  await updateUserStatus(userId, 'active', 'activate');
}

// 사용자 비활성화
async function deactivateUser(userId) {
  if (!confirm('정말로 이 사용자를 비활성화하시겠습니까?')) {
    return;
  }
  await updateUserStatus(userId, 'inactive', 'deactivate');
}

// 사용자 상태 업데이트
async function updateUserStatus(userId, newStatus, actionType) {
  const actionBtn = document.getElementById(`${actionType}-${userId}`);
  setButtonLoading(actionBtn, true);

  try {
    const response = await fetch(`http://localhost:3000/api/admin/users/${userId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${sessionStorage.getItem('auth_token')}`
      },
      body: JSON.stringify({ status: newStatus })
    });

    if (response.ok) {
      const result = await response.json();
      console.log('사용자 상태 업데이트 성공:', result);
      
      // 사용자 목록 새로고침
      await loadUsers();
      updateStats(); // 통계 업데이트
      
      if (actionBtn) {
        setButtonSuccess(actionBtn);
      }
      
      let message = '';
      switch (actionType) {
        case 'approve':
          message = '사용자가 성공적으로 승인되었습니다.';
          break;
        case 'reject':
          message = '사용자가 성공적으로 거절되었습니다.';
          break;
        case 'activate':
          message = '사용자가 성공적으로 활성화되었습니다.';
          break;
        case 'deactivate':
          message = '사용자가 성공적으로 비활성화되었습니다.';
          break;
      }
      alert(message);
    } else {
      const errorData = await response.json();
      alert(`사용자 상태 업데이트 실패: ${errorData.message || response.statusText}`);
      if (actionBtn) {
        setButtonError(actionBtn);
      }
    }
  } catch (error) {
    console.error('사용자 상태 업데이트 실패:', error);
    alert('사용자 상태 업데이트 중 오류가 발생했습니다.');
    if (actionBtn) {
      setButtonError(actionBtn);
    }
  } finally {
    if (actionBtn) {
      setButtonLoading(actionBtn, false);
    }
  }
}

// 통계 업데이트
async function updateStats() {
  await loadStats();
}
