let hideMessageTimeout;
const itemCounts = {};
let excelData = [];
const item_obtained = [];
let isSoundOn = true;
let autoClickInterval = null;

// 등급에 따른 배경색 클래스를 설정하는 함수
function getRarityClass(rarity) {
  switch (rarity) {
    case '1':
      return 'rarity-1';
    case '2':
      return 'rarity-2';
    case '3':
      return 'rarity-3';
    case '4':
      return 'rarity-4';
    case '5':
      return 'rarity-5';
    default:
      return '';
  }
}

// list.xlsx 데이터를 서버에서 가져오는 함수
const loadListData = () => {
  fetch('https://port-0-diggit-lxss6wt4c9526a7f.sel5.cloudtype.app/api/list-data')
    .then(response => response.json())
    .then(data => {
      excelData = data;
      console.log('Loaded list data:', excelData);
      populateListTable();
      updateItemCounts();
      checkAndStrikeItems();
    })
    .catch(error => {
      console.error('Error loading list data:', error);
    });
};

document.getElementById('miner_stop').addEventListener('click', function() {
  mineItem();
});

document.getElementById('inventory-icon').addEventListener('click', function() {
  const modal = document.getElementById('inventory-modal');
  modal.style.display = 'block';
});

document.getElementById('list-icon').addEventListener('click', function() {
  const modal = document.getElementById('list-modal');
  modal.style.display = 'block';
  loadListData();
});

document.getElementById('sound-icon').addEventListener('click', function() {
  toggleSound();
});

document.getElementById('auto-icon').addEventListener('click', function() {
  toggleAutoClick();
});

document.querySelectorAll('.close').forEach(function(closeButton) {
  closeButton.addEventListener('click', function() {
    const modal = closeButton.closest('.modal');
    modal.style.display = 'none';
  });
});

window.addEventListener('click', function(event) {
  const inventoryModal = document.getElementById('inventory-modal');
  const listModal = document.getElementById('list-modal');
  if (event.target == inventoryModal || event.target == listModal) {
    event.target.style.display = 'none';
  }
});

function mineItem() {
  const staticImage = document.getElementById('miner_stop');
  const animatedGif = document.getElementById('miner_motion');
  const soundEffect = document.getElementById('soundEffect');
  const messageDiv = document.getElementById('message');

  staticImage.style.display = 'none';
  animatedGif.src = 'img/miner_motion.gif';
  animatedGif.style.display = 'block';
  if (isSoundOn) {
    soundEffect.play();
  }

  fetch('https://port-0-diggit-lxss6wt4c9526a7f.sel5.cloudtype.app/api/generate-id')
    .then(response => response.json())
    .then(data => {
      const id = data.result[0];
      const rarity = String(data.result[1]); // 문자열로 변환
      const category = data.result[2];
      const item_name = data.result[3];
      console.log('Generated item:', item_name);
      showMessage(item_name, rarity);

      addItemToTable(category, item_name, rarity);
      addItemToObtained(item_name);
      updateItemCounts();
      checkAndStrikeItems();
    })
    .catch(error => {
      console.error('Error fetching data:', error);
    });

  setTimeout(() => {
    animatedGif.style.display = 'none';
    staticImage.style.display = 'block';
    animatedGif.src = "";
    soundEffect.pause();
    soundEffect.currentTime = 0;
  }, 1580);
}

function showMessage(item_name, rarity) {
  const messageDiv = document.getElementById('message');
  const rarityClass = getRarityClass(rarity);
  const rarityText = `${rarity}등급`;

  // 클래스와 텍스트를 콘솔에 출력
  console.log(`Applying class: ${rarityClass} to rarity text: ${rarityText}`);

  messageDiv.innerHTML = `<div class="speech-bubble"><span class="${rarityClass}">${item_name}(${rarityText})</span> 아이템을 획득했습니다!</div>`;
  clearTimeout(hideMessageTimeout);

  const bubble = messageDiv.querySelector('.speech-bubble');
  if (bubble) {
    bubble.classList.remove('hidden');
  }

  hideMessageTimeout = setTimeout(() => {
    const bubble = messageDiv.querySelector('.speech-bubble');
    if (bubble) {
      bubble.classList.add('hidden');
      setTimeout(() => {
        messageDiv.innerHTML = '';
      }, 2000); 
    }
  }, 3000);
}

function addItemToTable(category, item_name, rarity) {
  const tableBody = document.querySelector('#inventory-table tbody');
  const key = `${category}-${item_name}-${rarity}`;
  
  if (itemCounts[key]) {
    itemCounts[key]++;
    const existingRow = document.querySelector(`[data-key="${key}"]`);
    const countCell = existingRow.querySelector('.count');
    countCell.textContent = `x ${itemCounts[key]}`;
  } else {
    itemCounts[key] = 1;
    const row = document.createElement('tr');
    row.setAttribute('data-key', key);
    row.innerHTML = `
      <td>${category}</td>
      <td>${item_name}</td>
      <td>${rarity}</td>
      <td class="count">x 1</td>
    `;
    tableBody.appendChild(row);
  }
}

function populateListTable() {
  const tableBody = document.querySelector('#list-table tbody');
  tableBody.innerHTML = '';
  excelData.forEach(item => {
    const itemName = item.아이템.trim();
    const row = document.createElement('tr');
    row.setAttribute('data-item', itemName);
    console.log('Setting data-item:', itemName);
    row.innerHTML = `
      <td>${item.카테고리}</td>
      <td>${item.아이템}</td>
      <td>${item.희귀도}</td>
      <td class="status"></td> <!-- 새 열 추가 -->
    `;
    tableBody.appendChild(row);
  });

  // 테이블 행 확인
  const rows = document.querySelectorAll('#list-table tr');
  rows.forEach(row => {
    console.log('Row data-item:', row.getAttribute('data-item'));
  });
}

function addItemToObtained(item_name) {
  if (!item_obtained.includes(item_name)) {
    item_obtained.push(item_name);
    console.log('Item obtained added:', item_name);
  }
}

function checkAndStrikeItems() {
  console.log('Checking items for strike:', item_obtained);
  const rows = document.querySelectorAll('#list-table tr');
  rows.forEach(row => {
    const dataItem = row.getAttribute('data-item');
    if (dataItem && item_obtained.includes(dataItem)) {
      console.log('Item matched and completed:', dataItem);
      row.classList.add('completed');
      const statusCell = row.querySelector('.status');
      statusCell.textContent = '(획득)';
    }
  });
}

function updateItemCounts() {
  const obtainedCount = item_obtained.length;
  const totalCount = excelData.length;

  document.getElementById('obtained-count').textContent = obtainedCount;
  document.getElementById('total-count').textContent = totalCount;
}

function toggleSound() {
  const soundIcon = document.getElementById('sound-icon');
  const soundEffect = document.getElementById('soundEffect');
  isSoundOn = !isSoundOn;
  soundIcon.src = isSoundOn ? 'img/sound_on.png' : 'img/sound_off.png';
  if (!isSoundOn) {
    soundEffect.pause();
    soundEffect.currentTime = 0;
  }
}

function toggleAutoClick() {
  const autoIcon = document.getElementById('auto-icon');
  if (autoClickInterval) {
    clearInterval(autoClickInterval);
    autoClickInterval = null;
    autoIcon.src = 'img/auto_off.png';
  } else {
    autoClickInterval = setInterval(() => {
      mineItem();
    }, 2000); // 2초마다 클릭
    autoIcon.src = 'img/auto_on.png';
  }
}
