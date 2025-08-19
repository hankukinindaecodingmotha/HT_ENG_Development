// HomePage JavaScript 함수

// 페이지 로드 시 메인페이지 데이터 로드
document.addEventListener('DOMContentLoaded', function () {
  // 기존 애니메이션 기능 유지
  initBrandAnimations();
  
  // 서버에서 데이터 로드하여 업데이트
  loadMainPageData();
  
  // 관리자 페이지로부터의 메시지 리스너 추가
  window.addEventListener('message', handleAdminMessage);
});

// 관리자 페이지로부터의 메시지 처리
function handleAdminMessage(event) {
  if (event.data && event.data.type === 'UPDATE_MAIN_PAGE') {
    console.log('관리자 페이지로부터 업데이트 메시지 수신:', event.data.data);
    
    // 즉시 홈페이지 업데이트
    updateMainPage(event.data.data);
    
    // 사용자에게 알림
    showUpdateNotification('관리자 페이지에서 변경한 내용이 즉시 적용되었습니다!');
  }
}

// 업데이트 알림 표시
function showUpdateNotification(message) {
  // 기존 알림이 있다면 제거
  const existingNotification = document.querySelector('.update-notification');
  if (existingNotification) {
    existingNotification.remove();
  }
  
  // 새 알림 생성
  const notification = document.createElement('div');
  notification.className = 'update-notification';
  notification.innerHTML = `
    <div class="notification-content">
      <i class="fas fa-check-circle"></i>
      <span>${message}</span>
      <button onclick="this.parentElement.parentElement.remove()">
        <i class="fas fa-times"></i>
      </button>
    </div>
  `;
  
  // 스타일 적용
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: #4CAF50;
    color: white;
    padding: 15px 20px;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    z-index: 10000;
    animation: slideIn 0.3s ease-out;
  `;
  
  // 알림 내용 스타일
  notification.querySelector('.notification-content').style.cssText = `
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 14px;
  `;
  
  // 닫기 버튼 스타일
  notification.querySelector('button').style.cssText = `
    background: none;
    border: none;
    color: white;
    cursor: pointer;
    padding: 0;
    font-size: 16px;
  `;
  
  // 애니메이션 CSS 추가
  if (!document.querySelector('#notification-styles')) {
    const style = document.createElement('style');
    style.id = 'notification-styles';
    style.textContent = `
      @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
      }
    `;
    document.head.appendChild(style);
  }
  
  // 알림 표시
  document.body.appendChild(notification);
  
  // 5초 후 자동 제거
  setTimeout(() => {
    if (notification.parentElement) {
      notification.remove();
    }
  }, 5000);
}

// 브랜드 박스 애니메이션(스크롤에 따라)
function initBrandAnimations() {
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
}

// 메가 메뉴 제어
function initMegaMenu() {
  const menuItems = document.querySelectorAll(".menu-item");
  const megaMenu = document.getElementById("megaMenu");
  const megaContents = document.querySelectorAll(".mega-menu-content");

  if (menuItems && megaMenu && megaContents) {
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
    const topBar = document.querySelector(".top-bar");
    if (topBar) {
      topBar.addEventListener("mouseleave", () => {
        megaMenu.classList.remove("active");
        megaContents.forEach(content => content.classList.remove("active"));
      });
    }
  }
}

// 메인페이지 데이터 로드
async function loadMainPageData() {
  try {
    const response = await fetch('http://localhost:3000/api/main-page');
    if (response.ok) {
      const data = await response.json();
      updateMainPage(data);
    } else {
      throw new Error('메인페이지 데이터를 불러올 수 없습니다.');
    }
  } catch (error) {
    console.error('Error loading main page data:', error);
    // 에러가 발생해도 기존 내용은 그대로 표시
    console.log('서버 연결 실패, 기존 내용을 유지합니다.');
  }
}

// 메인페이지 업데이트 (기존 형식 유지)
function updateMainPage(data) {
  if (!data) return;

  // 배너 업데이트
  updateBanner(data.banner);

  // 브랜드 업데이트
  updateBrands(data.brands);

  // Contact 섹션 업데이트
  updateContact(data.contact);

  // 설명 섹션 업데이트
  updateDescriptions(data.descriptions);
}

// 배너 업데이트
function updateBanner(banner) {
  if (!banner) return;

  const bannerImage = document.getElementById('bannerImage');
  if (bannerImage) {
    bannerImage.src = banner.image;
    bannerImage.alt = banner.alt;
  }
}

// 브랜드 업데이트
function updateBrands(brands) {
  if (!brands || !Array.isArray(brands)) return;

  const container = document.getElementById('brandsContainer');
  if (!container) return;

  // 기존 브랜드들을 새로운 데이터로 교체
  container.innerHTML = brands.map(brand => `
    <a href="${brand.url}" class="brand-box" target="_blank">
      <img src="${brand.image}" alt="${brand.alt}" />
    </a>
  `).join('');

  // 애니메이션 재설정
  initBrandAnimations();
}

// Contact 섹션 업데이트
function updateContact(contact) {
  if (!contact) return;

  // CEO 정보 업데이트
  updateContactInfo('ceoInfo', contact.ceo);
  updateContactImage('ceoImage', contact.ceo.image);

  // Manager 정보 업데이트
  updateContactInfo('managerInfo', contact.manager);
  updateContactImage('managerImage', contact.manager.image);
}

// 연락처 정보 업데이트
function updateContactInfo(containerId, person) {
  if (!person) return;

  const container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = `
    <p><strong>이름:</strong> ${person.name}</p>
    <p><strong>직급:</strong> ${person.position}</p>
    <p><strong>전화:</strong> ${person.phone}</p>
    <p><strong>이메일:</strong> ${person.email}</p>
    <p><strong>주소:</strong> ${person.address}</p>
    <p><strong>경력</strong></p>
    ${person.experience.map(exp => `<p>- ${exp}</p>`).join('')}
  `;
}

// 연락처 이미지 업데이트
function updateContactImage(imageId, imagePath) {
  if (!imagePath) return;

  const image = document.getElementById(imageId);
  if (image) {
    image.src = imagePath;
  }
}

// 설명 섹션 업데이트
function updateDescriptions(descriptions) {
  if (!descriptions || !Array.isArray(descriptions)) return;

  const container = document.getElementById('descriptionsContainer');
  if (!container) return;

  container.innerHTML = descriptions.map(desc => `
    <div class="desc-block">
      <img src="${desc.image}" alt="${desc.alt}" />
      <div class="desc-text">
        <p>${desc.content}</p>
      </div>
    </div>
  `).join('');
}