// 회사 정보 관리 기능
// ================================

// 회사 정보 로드
async function loadCompanyInfo() {
  try {
    console.log('회사 정보 로드 시작...');
    const response = await fetch('http://localhost:3000/api/admin/company', {
      headers: {
        'Authorization': `Bearer ${sessionStorage.getItem('auth_token')}`
      }
    });

    if (response.ok) {
      const companyInfo = await response.json();
      console.log('로드된 회사 정보:', companyInfo);

      // 기본 회사 정보 폼에 데이터 반영
      const companyNameInput = document.getElementById('companyName');
      const companyDescInput = document.getElementById('companyDesc');
      const companyBusinessInput = document.getElementById('companyBusiness');
      const companyLocationInput = document.getElementById('companyLocation');

      if (companyNameInput) companyNameInput.value = companyInfo.name || '';
      if (companyDescInput) companyDescInput.value = companyInfo.description || '';
      if (companyBusinessInput) companyBusinessInput.value = companyInfo.business || '';
      if (companyLocationInput) companyLocationInput.value = companyInfo.location || '';

      // 회사 소개 페이지 정보 폼에 데이터 반영
      const introTitleInput = document.getElementById('introTitle');
      const introSubtitleInput = document.getElementById('introSubtitle');
      const companyDescriptionInput = document.getElementById('companyDescription');

      if (introTitleInput) introTitleInput.value = companyInfo.title || '회사 소개';
      if (introSubtitleInput) introSubtitleInput.value = companyInfo.subtitle || 'HTeng이 추구하는 핵심 가치입니다';
      if (companyDescriptionInput) companyDescriptionInput.value = companyInfo.description || '';

      // 연락처 정보 폼에 데이터 반영
      const companyPhoneInput = document.getElementById('companyPhone');
      const companyEmailInput = document.getElementById('companyEmail');
      const companyFaxInput = document.getElementById('companyFax');
      const companyWebsiteInput = document.getElementById('companyWebsite');
      const companyHoursInput = document.getElementById('companyHours');

      if (companyPhoneInput) companyPhoneInput.value = companyInfo.phone || '02-1234-5678';
      if (companyEmailInput) companyEmailInput.value = companyInfo.email || 'info@hteng.com';
      if (companyFaxInput) companyFaxInput.value = companyInfo.fax || '02-1234-5679';
      if (companyWebsiteInput) companyWebsiteInput.value = companyInfo.website || 'www.hteng.com';
      if (companyHoursInput) companyHoursInput.value = companyInfo.hours || '09:00 - 18:00';

      // 연혁 정보 로드
      if (companyInfo.history && companyInfo.history.length > 0) {
        loadHistoryToForm(companyInfo.history);
      } else {
        setDefaultCompanyValues();
      }

      // 사업 분야 상세 정보 로드
      if (companyInfo.businessItems && companyInfo.businessItems.length > 0) {
        loadBusinessToForm(companyInfo.businessItems);
      } else {
        setDefaultCompanyValues();
      }

      console.log('회사 정보 폼 업데이트 완료');
    } else {
      console.error('회사 정보 로드 실패:', response.status);
      setDefaultCompanyValues();
    }
  } catch (error) {
    console.error('회사 정보 로드 실패:', error);
    setDefaultCompanyValues();
  }
}

// 기본 회사 정보 값 설정
function setDefaultCompanyValues() {
  // 연혁 기본값 설정
  const historyList = document.getElementById('historyList');
  if (historyList && historyList.children.length === 0) {
    const defaultHistory = [
      { year: '2020', event: '회사 설립' },
      { year: '2021', event: '사업 확장' },
      { year: '2022', event: '신기술 도입' }
    ];
    defaultHistory.forEach((history, index) => {
      addHistoryToForm(history, index);
    });
  }

  // 사업 분야 상세 기본값 설정
  const businessList = document.getElementById('businessList');
  if (businessList && businessList.children.length === 0) {
    const defaultBusiness = [
      { title: '전기 설비', description: '전기 설비 설계 및 시공' },
      { title: '자동화 시스템', description: '공장 자동화 시스템 구축' },
      { title: '에너지 관리', description: '에너지 효율성 최적화' }
    ];
    defaultBusiness.forEach((business, index) => {
      addBusinessToForm(business, index);
    });
  }
}

// 회사 정보 업데이트 처리
async function handleCompanyUpdate(e) {
  e.preventDefault();
  
  const submitBtn = e.target.querySelector('button[type="submit"]');
  setButtonLoading(submitBtn, true);

  try {
    const formData = new FormData(e.target);
    
    // 기본 회사 정보 수집
    const companyData = {
      name: formData.get('companyName'),
      description: formData.get('companyDesc'),
      business: formData.get('companyBusiness'),
      location: formData.get('companyLocation'),
      
      // 회사 소개 페이지 정보
      title: formData.get('introTitle'),
      subtitle: formData.get('introSubtitle'),
      
      // 연락처 정보
      phone: formData.get('companyPhone'),
      email: formData.get('companyEmail'),
      fax: formData.get('companyFax'),
      website: formData.get('companyWebsite'),
      hours: formData.get('companyHours'),
      
      // 연혁 정보 수집
      history: []
    };

    // 연혁 항목들 수집
    const historyItems = document.querySelectorAll('#historyList .history-item');
    historyItems.forEach((item, index) => {
      const year = formData.get(`historyYear_${index}`);
      const event = formData.get(`historyEvent_${index}`);
      if (year && event) {
        companyData.history.push({ year, event });
      }
    });

    // 사업 분야 상세 항목들 수집
    const businessItems = [];
    const businessItemElements = document.querySelectorAll('#businessList .business-item');
    businessItemElements.forEach((item, index) => {
      const title = formData.get(`businessTitle_${index}`);
      const description = formData.get(`businessDescription_${index}`);
      if (title && description) {
        businessItems.push({ title, description });
      }
    });
    companyData.businessItems = businessItems;

    console.log('전송할 회사 데이터:', companyData);

    const response = await fetch('http://localhost:3000/api/admin/company', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${sessionStorage.getItem('auth_token')}`
      },
      body: JSON.stringify(companyData)
    });

    if (response.ok) {
      const result = await response.json();
      setButtonSuccess(submitBtn);
      alert('회사 정보가 성공적으로 업데이트되었습니다.');
      console.log('통합 회사 정보 업데이트 성공:', result);
    } else {
      const errorData = await response.json();
      alert(`회사 정보 업데이트 실패: ${errorData.message || response.statusText}`);
      setButtonError(submitBtn);
    }
  } catch (error) {
    console.error('회사 정보 업데이트 실패:', error);
    alert('회사 정보 업데이트 중 오류가 발생했습니다.');
    setButtonError(submitBtn);
  } finally {
    setButtonLoading(submitBtn, false);
  }
}

// 연혁 관련 함수들
function addHistory() {
  const historyList = document.getElementById('historyList');
  const historyCount = historyList.querySelectorAll('.history-item').length;
  const newIndex = historyCount;

  const newHistory = {
    year: '',
    event: ''
  };

  addHistoryToForm(newHistory, newIndex);
}

function addHistoryToForm(history, index) {
  const historyList = document.getElementById('historyList');

  const historyHTML = `
    <div class="history-item" data-index="${index}">
      <div class="form-row">
        <div class="form-group">
          <label>연도</label>
          <input type="text" name="historyYear_${index}" value="${history.year || ''}" required>
        </div>
        <div class="form-group">
          <label>내용</label>
          <input type="text" name="historyEvent_${index}" value="${history.event || ''}" required>
        </div>
        <button type="button" class="remove-history-btn" onclick="removeHistory(${index})" title="제거">
          <i class="fas fa-trash"></i>
        </button>
      </div>
    </div>
  `;

  historyList.insertAdjacentHTML('beforeend', historyHTML);
}

function removeHistory(index) {
  const historyItem = document.querySelector(`[data-index="${index}"]`);
  if (historyItem) {
    historyItem.remove();
    // 인덱스 재정렬
    reorderHistoryIndexes();
  }
}

function reorderHistoryIndexes() {
  const historyItems = document.querySelectorAll('#historyList .history-item');
  historyItems.forEach((item, newIndex) => {
    item.setAttribute('data-index', newIndex);

    // input name 속성 업데이트
    const inputs = item.querySelectorAll('input');
    inputs.forEach(input => {
      const oldName = input.getAttribute('name');
      if (oldName) {
        const newName = oldName.replace(/_\d+$/, `_${newIndex}`);
        input.setAttribute('name', newName);
      }
    });

    // onclick 이벤트 업데이트
    const removeBtn = item.querySelector('.remove-history-btn');
    if (removeBtn) {
      removeBtn.setAttribute('onclick', `removeHistory(${newIndex})`);
    }
  });
}

// 사업 분야 상세 관련 함수들
function addBusiness() {
  const businessList = document.getElementById('businessList');
  const businessCount = businessList.querySelectorAll('.business-item').length;
  const newIndex = businessCount;

  const newBusiness = {
    title: '',
    description: ''
  };

  addBusinessToForm(newBusiness, newIndex);
}

function addBusinessToForm(business, index) {
  const businessList = document.getElementById('businessList');

  const businessHTML = `
    <div class="business-item" data-index="${index}">
      <div class="form-row">
        <div class="form-group">
          <label>사업명</label>
          <input type="text" name="businessTitle_${index}" value="${business.title || ''}" required>
        </div>
        <div class="form-group">
          <label>설명</label>
          <textarea name="businessDescription_${index}" rows="2" required>${business.description || ''}</textarea>
        </div>
        <button type="button" class="remove-business-btn" onclick="removeBusiness(${index})" title="제거">
          <i class="fas fa-trash"></i>
        </button>
      </div>
    </div>
  `;

  businessList.insertAdjacentHTML('beforeend', businessHTML);
}

function removeBusiness(index) {
  const businessItem = document.querySelector(`[data-index="${index}"]`);
  if (businessItem) {
    businessItem.remove();
    // 인덱스 재정렬
    reorderBusinessIndexes();
  }
}

function reorderBusinessIndexes() {
  const businessItems = document.querySelectorAll('#businessList .business-item');
  businessItems.forEach((item, newIndex) => {
    item.setAttribute('data-index', newIndex);

    // input name 속성 업데이트
    const inputs = item.querySelectorAll('input, textarea');
    inputs.forEach(input => {
      const oldName = input.getAttribute('name');
      if (oldName) {
        const newName = oldName.replace(/_\d+$/, `_${newIndex}`);
        input.setAttribute('name', newName);
      }
    });

    // onclick 이벤트 업데이트
    const removeBtn = item.querySelector('.remove-business-btn');
    if (removeBtn) {
      removeBtn.setAttribute('onclick', `removeBusiness(${newIndex})`);
    }
  });
}
