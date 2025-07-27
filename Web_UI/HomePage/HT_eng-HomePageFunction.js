document.addEventListener("DOMContentLoaded", function () {
    // 브랜드 박스 애니메이션(스크롤에 따라)
    const boxes = document.querySelectorAll(".brand-box");

    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                const box = entry.target;
                if (entry.isIntersecting) {
                    box.classList.add("show");
                } else {
                    box.classList.remove("show");
                }
            });
        },
        {
            threshold: 0.4,
        }
    );

    boxes.forEach((box) => observer.observe(box));

    // 메가 메뉴 제어
    const menuItems = document.querySelectorAll(".menu-item");
    const megaMenu = document.getElementById("megaMenu");
    const megaContents = document.querySelectorAll(".mega-menu-content");

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

    // 상단바 영역 밖으로 마우스 나가면 메가 메뉴 닫기
    document.querySelector(".top-bar").addEventListener("mouseleave", () => {
        megaMenu.classList.remove("active");
        megaContents.forEach(content => content.classList.remove("active"));
    });
});