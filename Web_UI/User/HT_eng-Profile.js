function ensureAuth() {
    const token = sessionStorage.getItem('auth_token');
    if (!token) {
        window.location.href = '../LoginPage/HT-eng-Login.html';
        return null;
    }
    return token;
}

function initProfile() {
    if (!ensureAuth()) return;

    const username = sessionStorage.getItem('auth_user') || '사용자';
    const role = (sessionStorage.getItem('auth_role') || 'user').toLowerCase();

    // 상단 카드
    document.getElementById('displayName').textContent = username;
    document.getElementById('avatar').textContent = username.charAt(0).toUpperCase();

    // 배지/키밸류
    const roleBadge = document.getElementById('roleBadge');
    roleBadge.textContent = role.toUpperCase();
    if (role === 'admin') roleBadge.classList.add('admin');

    document.getElementById('kvUsername').textContent = username;
    document.getElementById('kvRole').textContent = role.toUpperCase();

    // 버튼
    document.getElementById('homeBtn').addEventListener('click', () => {
        window.location.href = '../HomePage/HT-eng-HomePage.html';
    });
    document.getElementById('searchBtn').addEventListener('click', () => {
        window.location.href = '../SearchPage2/HT-eng-searchpage2.html';
    });
    document.getElementById('logoutBtn').addEventListener('click', () => {
        sessionStorage.clear();
        window.location.href = '../LoginPage/HT-eng-Login.html';
    });

    // 관리자라면 버튼 노출
    if (role === 'admin') {
        const adminBtn = document.getElementById('adminBtn');
        adminBtn.style.display = 'inline-flex';
        adminBtn.addEventListener('click', () => {
            window.location.href = '../Admin/HT_eng-Admin.html';
        });
    }
}

document.addEventListener('DOMContentLoaded', initProfile);