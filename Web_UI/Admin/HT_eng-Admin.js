function ensureAuth() {
    const token = localStorage.getItem('auth_token');
    const role = localStorage.getItem('auth_role');
    if (!token) {
        window.location.href = '../LoginPage/HT-eng-Login.html';
        return null;
    }
    if (role !== 'admin') {
        alert('관리자만 접근할 수 있습니다.');
        window.location.href = '../HomePage/HT-eng-HomePage.html';
        return null;
    }
    return token;
}

async function loadSummary() {
    const token = ensureAuth();
    if (!token) return;
    try {
        const res = await fetch('http://localhost:3000/api/admin/summary', {
            headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) {
            if (res.status === 401) {
                localStorage.removeItem('auth_token');
                window.location.href = '../LoginPage/HT-eng-Login.html';
                return;
            }
            const e = await res.json().catch(() => ({ message: '오류' }));
            alert(e.message || '불러오기 실패');
            return;
        }
        const data = await res.json();
        document.getElementById('adminName').textContent = `${localStorage.getItem('auth_user')} (admin)`;
        document.getElementById('totalProducts').textContent = data.totalProducts;
        document.getElementById('serverTime').textContent = new Date(data.serverTime).toLocaleString();
    } catch (e) {
        console.error(e);
        alert('서버 통신 오류');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('logoutBtn').addEventListener('click', () => {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');
        localStorage.removeItem('auth_role');
        window.location.href = '../LoginPage/HT-eng-Login.html';
    });
    loadSummary();
});


