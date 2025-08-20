// 사용자 관리 기능

// 사용자 목록 로드
async function loadUsers() {
    try {
        const response = await fetch('http://localhost:3000/api/admin/users', {
            headers: {
                'Authorization': `Bearer ${sessionStorage.getItem('auth_token')}`
            }
        });

        if (response.ok) {
            const users = await response.json();
            renderUsers(users);
        } else {
            console.error('사용자 목록 로드 실패:', response.status);
        }
    } catch (error) {
        console.error('사용자 목록 로드 실패:', error);
    }
}

// 사용자 목록 렌더링
function renderUsers(users) {
    const userList = document.getElementById('userList');
    if (!userList) return;

    // 헤더는 유지하고 사용자 항목들만 추가
    const userItems = users.map(user => `
        <div class="user-item" data-user-id="${user.id}">
            <span class="username">${user.username}</span>
            <span class="display-name">${user.displayName}</span>
            <span class="role">${user.role === 'admin' ? '관리자' : '사용자'}</span>
            <span class="status">${getStatusText(user.status)}</span>
            <span class="email">${user.email || '-'}</span>
            <span class="join-date">${user.joinDate}</span>
            <span class="actions">
                <button class="action-btn edit-btn" onclick="editUser('${user.id}')">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="action-btn delete-btn" onclick="deleteUser('${user.id}')">
                    <i class="fas fa-trash"></i>
                </button>
            </span>
        </div>
    `).join('');

    // 기존 헤더는 유지하고 사용자 항목들만 교체
    const header = userList.querySelector('.user-list-header');
    userList.innerHTML = '';
    if (header) userList.appendChild(header);
    userList.insertAdjacentHTML('beforeend', userItems);
}

// 상태 텍스트 변환
function getStatusText(status) {
    const statusMap = {
        'active': '활성',
        'pending': '승인 대기',
        'inactive': '비활성'
    };
    return statusMap[status] || status;
}

// 사용자 편집
function editUser(userId) {
    const user = users.find(u => u.id === userId);
    if (!user) return;

    // 편집 폼에 사용자 정보 채우기
    document.getElementById('editUsername').value = user.username;
    document.getElementById('editDisplayName').value = user.displayName;
    document.getElementById('editRole').value = user.role;
    document.getElementById('editStatus').value = user.status;
    document.getElementById('editEmail').value = user.email || '';

    // 편집 섹션 표시
    document.getElementById('userEditSection').style.display = 'block';
}

// 사용자 편집 숨기기
function hideUserEdit() {
    document.getElementById('userEditSection').style.display = 'none';
}

// 사용자 삭제
async function deleteUser(userId) {
    if (!confirm('정말로 이 사용자를 삭제하시겠습니까?')) return;

    try {
        const response = await fetch(`http://localhost:3000/api/admin/users/${userId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${sessionStorage.getItem('auth_token')}`
            }
        });

        if (response.ok) {
            alert('사용자가 삭제되었습니다.');
            loadUsers(); // 목록 새로고침
        } else {
            const error = await response.json();
            alert(error.message || '사용자 삭제에 실패했습니다.');
        }
    } catch (error) {
        console.error('사용자 삭제 실패:', error);
        alert('사용자 삭제 중 오류가 발생했습니다.');
    }
}

// 새 사용자 추가 폼 표시
function showAddUserForm() {
    document.getElementById('addUserModal').style.display = 'block';
}

// 새 사용자 추가 폼 숨기기
function hideAddUserForm() {
    document.getElementById('addUserModal').style.display = 'none';
}

// 새 사용자 추가 처리
async function handleAddUser(event) {
    event.preventDefault();

    const formData = new FormData(event.target);
    const userData = {
        username: formData.get('username'),
        displayName: formData.get('displayName'),
        password: formData.get('password'),
        role: formData.get('role'),
        email: formData.get('email')
    };

    try {
        const response = await fetch('http://localhost:3000/api/admin/users', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${sessionStorage.getItem('auth_token')}`
            },
            body: JSON.stringify(userData)
        });

        if (response.ok) {
            alert('사용자가 추가되었습니다.');
            hideAddUserForm();
            event.target.reset();
            loadUsers(); // 목록 새로고침
        } else {
            const error = await response.json();
            alert(error.message || '사용자 추가에 실패했습니다.');
        }
    } catch (error) {
        console.error('사용자 추가 실패:', error);
        alert('사용자 추가 중 오류가 발생했습니다.');
    }
}

// 사용자 편집 폼 제출 처리
async function handleEditUser(event) {
    event.preventDefault();

    const formData = new FormData(event.target);
    const userId = document.getElementById('editUsername').getAttribute('data-user-id');
    
    const userData = {
        displayName: formData.get('displayName'),
        role: formData.get('role'),
        status: formData.get('status'),
        email: formData.get('email')
    };

    // 비밀번호가 입력된 경우에만 포함
    const password = formData.get('password');
    if (password) {
        userData.password = password;
    }

    try {
        const response = await fetch(`http://localhost:3000/api/admin/users/${userId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${sessionStorage.getItem('auth_token')}`
            },
            body: JSON.stringify(userData)
        });

        if (response.ok) {
            alert('사용자 정보가 수정되었습니다.');
            hideUserEdit();
            loadUsers(); // 목록 새로고침
        } else {
            const error = await response.json();
            alert(error.message || '사용자 정보 수정에 실패했습니다.');
        }
    } catch (error) {
        console.error('사용자 정보 수정 실패:', error);
        alert('사용자 정보 수정 중 오류가 발생했습니다.');
    }
}
