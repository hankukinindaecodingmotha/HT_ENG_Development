// header.js

// header.html을 가져와 삽입하고 나서 이벤트 바인딩을 수행
fetch('../Components/Header/HT_eng-header.html')
    .then(response => response.text())
    .then(html => {
        document.getElementById('header-container').innerHTML = html;

        // 이제 삽입된 후에 DOM 요소들을 찾고 이벤트 바인딩
        const menuItems = document.querySelectorAll(".menu-item");
        const megaMenu = document.getElementById("megaMenu");
        const megaContents = document.querySelectorAll(".mega-menu-content");
        const topBar = document.querySelector(".top-bar");

        if (!menuItems || !megaMenu || !megaContents || !topBar) {
            console.warn("헤더 요소 일부가 없습니다. 스크립트를 확인해주세요.");
            return;
        }

        menuItems.forEach(item => {
            item.addEventListener("mouseenter", () => {
                const menu = item.getAttribute("data-menu");

                megaMenu.classList.add("active");

                megaContents.forEach(content => {
                    content.classList.remove("active");
                });

                const activeContent = document.querySelector(`.mega-menu-content[data-menu="${menu}"]`);
                if (activeContent) activeContent.classList.add("active");
            });
        });

        topBar.addEventListener("mouseleave", () => {
            megaMenu.classList.remove("active");
            megaContents.forEach(content => content.classList.remove("active"));
        });
    })
    .catch(err => console.error("헤더 로딩 실패:", err));