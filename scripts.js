let hideMessageTimeout;
const itemCounts = {};
let excelData = [];
const item_obtained = [];

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
  const staticImage = document.getElementById('miner_stop');
  const animatedGif = document.getElementById('miner_motion');
  const soundEffect = document.getElementById('soundEffect');
  const messageDiv = document.getElementById('message');

  staticImage.style.display = 'none';
  animatedGif.src = 'img/miner_motion.gif';
  animatedGif.style.display = 'block';
  soundEffect.play();

  fetch('https://port-0-diggit-lxss6wt4c9526a7f.sel5.cloudtype.app/api/generate-id')
    .then(response => response.json())
    .then(data => {
      const id = data.result[0];
      const rarity = data.result[1];
      const category = data.result[2];
      const item_name = data.result[3];
      console.log('Generated item:', item_name);
      messageDiv.innerHTML = `<div class="speech-bubble">${item_name}(${rarity}등급) 아이템을 획득했습니다!</div>`;

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
