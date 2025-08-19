// 공통 헤더 로더: 어떤 페이지 경로에서도 동작하도록 WEB_ROOT를 동적으로 계산하고,
// 필요 CSS/아이콘을 보강한 뒤 헤더를 주입하고 로그인 상태에 맞춰 UI를 렌더링합니다.

// 로그인 상태 저장소: 세션 유지(탭 닫으면 자동 로그아웃)
const storage = sessionStorage;

// 현재 URL에서 /Web_UI 루트 경로 자동 계산
function getWebRoot() {
    const pathname = location.pathname;

    // /Admin, /User, /HomePage 등이 포함된 경우
    if (pathname.includes('/Admin') || pathname.includes('/User') || pathname.includes('/HomePage')) {
        const parts = pathname.split('/');
        const webUIIndex = parts.findIndex(part => part === 'Web_UI');
        if (webUIIndex >= 0) {
            return parts.slice(0, webUIIndex + 1).join('/');
        }
    }

    // 기본적으로 /Web_UI 찾기
    const idx = pathname.indexOf('/Web_UI');
    if (idx >= 0) return pathname.slice(0, idx) + '/Web_UI';

    // file:// 등 예외 시 기본값
    return '/Web_UI';
}

const WEB_ROOT = getWebRoot();

// 헤더 CSS/아이콘이 없으면 자동 주입
function ensureHeadAssets() {
    const head = document.head || document.getElementsByTagName('head')[0];

    // Header CSS
    if (!document.querySelector(`link[href$="HT_eng-header.css"]`)) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = `${WEB_ROOT}/Components/Header/HT_eng-header.css`;
        head.appendChild(link);
    }

    // Font Awesome 아이콘
    if (!document.querySelector('link[href*="font-awesome"], link[href*="fontawesome"], link[href*="cdnjs.cloudflare.com/ajax/libs/font-awesome"]')) {
        const fa = document.createElement('link');
        fa.rel = 'stylesheet';
        fa.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css';
        head.appendChild(fa);
    }
}

// 프로필/로그아웃 UI 렌더링
function renderAuthUI() {
    const authArea = document.getElementById('authArea');
    if (!authArea) return;

    const token = sessionStorage.getItem('auth_token');
    const role = sessionStorage.getItem('auth_role') || 'user';
    const username = sessionStorage.getItem('auth_user') || '사용자';

    if (!token) {
        authArea.innerHTML = `<a href="${WEB_ROOT}/LoginPage/HT-eng-Login.html">로그인</a>`;
        return;
    }

    // 현재 페이지 경로에 따라 적절한 링크 생성
    const currentPath = location.pathname;
    let profileLink = '';

    if (currentPath.includes('/Admin')) {
        profileLink = `${WEB_ROOT}/Admin/HT_eng-Admin.html`;
    } else if (currentPath.includes('/User')) {
        profileLink = `${WEB_ROOT}/User/HT_eng-Profile.html`;
    } else {
        profileLink = role === 'admin' ? `${WEB_ROOT}/Admin/HT_eng-Admin.html` : `${WEB_ROOT}/User/HT_eng-Profile.html`;
    }

    authArea.innerHTML = `
    <button class="avatar-btn" id="avatarBtn" aria-label="내 계정">
      <i class="fa-solid fa-user"></i>
    </button>
    <div class="profile-menu" id="profileMenu">
      <a href="${profileLink}">
        ${role === 'admin' ? '관리자 페이지' : '내 페이지'}
      </a>
      <button id="logoutBtn">로그아웃 (${username})</button>
    </div>
  `;

    const btn = document.getElementById('avatarBtn');
    const menu = document.getElementById('profileMenu');
    const logoutBtn = document.getElementById('logoutBtn');

    btn?.addEventListener('click', (e) => {
        e.stopPropagation();
        menu.classList.toggle('show');
    });
    document.addEventListener('click', () => menu.classList.remove('show'));

    logoutBtn?.addEventListener('click', () => {
        sessionStorage.clear();
        window.location.href = `${WEB_ROOT}/LoginPage/HT-eng-Login.html`;
    });
}

// 헤더 로딩
function loadHeader() {
    ensureHeadAssets();

    const container = document.getElementById('header-container');
    if (!container) return;

    // 다중 경로 시도: 절대 경로 우선, 실패 시 상대 경로로 재시도
    const candidates = [
        `${WEB_ROOT}/Components/Header/HT_eng-header.html`,
        '../Components/Header/HT_eng-header.html',
        './Components/Header/HT_eng-header.html'
    ];

    function tryFetch(urls) {
        if (!urls.length) return Promise.reject(new Error('모든 헤더 경로 로딩 실패'));
        const [url, ...rest] = urls;
        return fetch(url)
            .then((res) => {
                if (!res.ok) throw new Error(`헤더 로딩 실패: ${url}`);
                return res.text();
            })
            .catch(() => tryFetch(rest));
    }

    tryFetch(candidates)
        .then((html) => {
            // 상대 경로 보정: ../ -> WEB_ROOT 기준
            const modifiedHtml = html.replace(/\.\.\//g, `${WEB_ROOT}/`);
            container.innerHTML = modifiedHtml;

            // 메가메뉴 바인딩
            const menuItems = document.querySelectorAll('.menu-item');
            const megaMenu = document.getElementById('megaMenu');
            const megaContents = document.querySelectorAll('.mega-menu-content');
            const topBar = document.querySelector('.top-bar');

            if (menuItems && megaMenu && megaContents && topBar) {
                menuItems.forEach((item) => {
                    item.addEventListener('mouseenter', () => {
                        const menu = item.getAttribute('data-menu');
                        megaMenu.classList.add('active');
                        megaContents.forEach((c) => c.classList.remove('active'));
                        const activeContent = document.querySelector(`.mega-menu-content[data-menu="${menu}"]`);
                        if (activeContent) activeContent.classList.add('active');
                    });
                });
                // 상단바에서 벗어나더라도 메가메뉴 위에 있으면 닫지 않음
                topBar.addEventListener('mouseleave', () => {
                    if (megaMenu.matches(':hover')) return;
                    megaMenu.classList.remove('active');
                    megaContents.forEach((c) => c.classList.remove('active'));
                });
                // 메가메뉴 영역을 벗어났을 때 닫기
                megaMenu.addEventListener('mouseleave', () => {
                    megaMenu.classList.remove('active');
                    megaContents.forEach((c) => c.classList.remove('active'));
                });
            }

            renderAuthUI();
        })
        .catch((err) => {
            console.error(err);
            // fetch 실패 시 최소한의 로그인 링크만 표시
            container.innerHTML = `
        <header class="top-bar">
          <div class="top-bar-left"><img src="${WEB_ROOT}/Assesets/Image/HT_ENG.png" class="logo" alt="로고"/></div>
          <div class="top-bar-center"></div>
          <div class="top-bar-right"><span id="authArea"><a href="${WEB_ROOT}/LoginPage/HT-eng-Login.html">로그인</a></span></div>
        </header>`;
            renderAuthUI();
        });
}

// 자동 실행 (페이지 로드 시)
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadHeader);
} else {
    loadHeader();
}