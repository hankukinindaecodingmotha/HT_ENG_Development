// 공통 푸터 로더: 어떤 페이지 경로에서도 동작하도록 WEB_ROOT를 동적으로 계산하고,
// 필요 CSS를 보강한 뒤 푸터를 주입합니다.

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

// 푸터 CSS가 없으면 자동 주입
function ensureFooterCSS() {
    const head = document.head || document.getElementsByTagName('head')[0];

    // Footer CSS
    if (!document.querySelector(`link[href$="HT_eng-footer.css"]`)) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = `${WEB_ROOT}/Components/Footer/HT_eng-footer.css`;
        head.appendChild(link);
    }
}

// 푸터 로딩
function loadFooter() {
    ensureFooterCSS();

    const container = document.getElementById('footer-container');
    if (!container) return;

    // 절대/동적 경로로 푸터 조각 불러오기
    fetch(`${WEB_ROOT}/Components/Footer/HT_eng-footer.html`)
        .then((res) => {
            if (!res.ok) throw new Error('푸터 로딩 실패');
            return res.text();
        })
        .then((html) => {
            // 경로를 현재 위치에 맞게 수정
            const modifiedHtml = html.replace(/\/Web_UI\//g, `${WEB_ROOT}/`);
            container.innerHTML = modifiedHtml;
        })
        .catch((err) => {
            console.error('푸터 로딩 실패:', err);
            // fetch 실패 시 최소한의 푸터만 표시
            container.innerHTML = `
                <footer class="footer">
                    <div class="footer-bottom">
                        <div class="footer-bottom-content">
                            <p>&copy; 2025 HTENG Co., Ltd. | 사업자등록번호: 123-45-67890</p>
                            <p>대표: 정탁영 | 주소: 서울특별시 강남구 어딘가로 123</p>
                            <p>전화: 02-123-4567 | 이메일: info@hteng.com</p>
                        </div>
                    </div>
                </footer>`;
        });
}

// 자동 실행 (페이지 로드 시)
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadFooter);
} else {
    loadFooter();
}
