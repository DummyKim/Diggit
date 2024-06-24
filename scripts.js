let hideMessageTimeout;
const itemCounts = {};
let excelData = [];

// list.xlsx 데이터를 서버에서 가져오는 함수
const loadListData = () => {
  fetch('https://port-0-diggit-lxss6wt4c9526a7f.sel5.cloudtype.app/api/list-data')
    .then(response => response.json())
    .then(data => {
      excelData = data;
      populateListTable();
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
      const id = data.result[0]; // id, result 배열의 첫번째 값
      const rarity = data.result[1]; // 희귀도, result 배열의 두 번째 값
      const category = data.result[2]; // 카테고리, result 배열의 세번째 값
      const item_name = data.result[3]; // 아이템 이름, result 배열의 네 번째 값
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
      checkAndStrikeItem(item_name);
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
    const row = document.createElement('tr');
    row.setAttribute('data-item', item.아이템);
    row.innerHTML = `
      <td>${item.카테고리}</td>
      <td>${item.아이템}</td>
      <td>${item.희귀도}</td>
    `;
    tableBody.appendChild(row);
  });
}

function checkAndStrikeItem(item_name) {
  const matchingRow = document.querySelector(`#list-table tr[data-item="${item_name}"]`);
  if (matchingRow) {
    matchingRow.classList.add('completed');
  }
}
