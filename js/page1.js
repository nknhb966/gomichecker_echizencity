// CSVデータを非同期で取得し、マッピングテーブルを適用して結果を返す関数
async function loadCSV() {
  try {
    const response2 = await fetch(csvURL2);
    if (!response2.ok) {
      throw new Error('Network response was not ok');
    }
    const csvData2 = await response2.text();
    const mappingTable = parseMappingTable(csvData2);

    const response1 = await fetch(csvURL1);
    if (!response1.ok) {
      throw new Error('Network response was not ok');
    }
    const csvData1 = await response1.text();
    const records = parseCSV(csvData1);
    const result = applyMapping(records, mappingTable);

    return result;
  } catch (error) {
    console.log(error);
    throw error;
  }
}

// CSVデータを取得してパースする関数
function getCSVData(url) {
  return fetch(url)
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.text();
    })
    .then(csvData => {
      return parseCSV(csvData);
    })
    .catch(error => {
      console.log(error);
      throw error;
    });
}

// CSVデータをパースする関数
function parseCSV(csvData) {
  const lines = csvData.split("\n");
  const result = [];

  for (let i = 1; i < lines.length; i++) {
    const fields = lines[i].split(",");
    const record = [];
    let field = "";

    for (let j = 0; j < fields.length; j++) {
      field += fields[j].trim();

      if (field.charAt(0) === '"' && field.charAt(field.length - 1) === '"') {
        field = field.substr(1, field.length - 2);
      }

      if ((field.match(/"/g) || []).length % 2 === 0) {
        record.push(field);
        field = "";
      } else {
        field += ",";
      }
    }

    if (fields.length === 1) {
      break;
    }
    result.push(record);
  }

  return result;
}

// マッピングテーブルをパースする関数
function parseMappingTable(csvData) {
  const lines = csvData.replace(/\r/g, '').split("\n");
  const mappingTable = {};

  for (let i = 1; i < lines.length; i++) {
    const fields = lines[i].split(",");
    const key = fields[0].trim();
    const value = fields[1];
    if (fields.length === 1) {
      break;
    }
    mappingTable[key] = value;
  }
  return mappingTable;
}

// レコードにマッピングテーブルを適用する関数
function applyMapping(data, mappingTable) {
  const result = [];

  for (let i = 0; i < data.length; i++) {
    const record = data[i];
    const filteringField = record[4];

    let matchedValue = "-";
    for (const key in mappingTable) {
      if (filteringField.includes(key)) {
        matchedValue = matchedValue === "-" ? mappingTable[key] : matchedValue + '・' + mappingTable[key];
      }
    }

    record.push(matchedValue);
    result.push(record);
  }

  return result;
}


// CSVデータを非同期で取得し、リストに表示する関数
async function displayCSVData() {
  try {
    // CSVデータを取得して処理
    const data = await loadCSV(csvURL1, csvURL2);

    // リストを作成
    const list = document.getElementById('csvList');
    list.innerHTML = ''; // リストをリセット

    // リストをフィルタリングする関数
function filterList(searchKeyword) {
  list.innerHTML = ''; // リストをリセット

  for (let i = 0; i < data.length; i++) {
    const gyou = data[i][0];
    const on = data[i][1];
    const name = data[i][2];
    const keyword = data[i][3].toLowerCase(); // フィルタリング対象のキーワードを小文字に変換
    const category = data[i][4];
    const description = data[i][5];
    const condition = data[i][6];
    const category2 = data[i][8];

    if (
      name.includes(searchKeyword) ||
      keyword.includes(searchKeyword.toLowerCase()) ||
      category.includes(searchKeyword) ||
      condition.includes(searchKeyword) ||
      category2.includes(searchKeyword)
    ) { // 検索ワードを小文字に変換して含む場合に表示
      const listItem = document.createElement('li');
      listItem.className = 'checker';

      const nameElement = document.createElement('p');
      nameElement.textContent = name;

      // 新しいdiv要素を作成し、category2ElementとconditionElementをその中に入れる
      const infoContainer = document.createElement('div');
      infoContainer.className = 'info-container';

      const category2Element = document.createElement('li');
      category2Element.className = 'category2';
      category2Element.textContent = category2;

      const conditionElement = document.createElement('li');
      conditionElement.className = 'condition';
      conditionElement.textContent = condition;
      truncateText(conditionElement); // テキストを切り詰める関数を呼び出す

      infoContainer.appendChild(category2Element);
      infoContainer.appendChild(conditionElement);

      listItem.appendChild(nameElement);
      listItem.appendChild(infoContainer);

      listItem.addEventListener('click', () => showModal(data[i]));
      list.appendChild(listItem);
    }
  }
}


    const searchBox = document.getElementById('searchBox');
    searchBox.addEventListener('input', () => filterList(searchBox.value));
    filterList(''); // 初期表示時にフィルタリングせずに全て表示
  } catch (error) {
    console.log(error);
    alert('データの取得に失敗しました。');
  }
}


function truncateText(element) {
  const maxWidth = 200;
  const ellipsis = '...';
  const text = element.textContent;

  if (element.offsetWidth > maxWidth) {
    let truncatedText = text;
    let i = text.length - 1;

    while (element.offsetWidth > maxWidth && i >= 0) {
      truncatedText = text.slice(0, i) + ellipsis;
      element.textContent = truncatedText;
      i--;
    }
  }
}

// モーダルを表示する関数
function showModal(values) {
  const modal = document.getElementById('modal');
  const modalContent = document.getElementById('modalContent');

  // モーダル内容を作成
  modalContent.innerHTML = `
    <p id="name">${values[2]}</p>
    <div id="category">${values[4]}</div>
    <div id="description">${values[6]}</div>
  `;

  // モーダルを表示
  modal.style.display = 'block';

  // モーダルを閉じるイベントを追加
  const closeModal = document.getElementById('closeModal');
  closeModal.addEventListener('click', () => {
    modal.style.display = 'none';
  });

  // モーダルの外側をクリックしても閉じるように設定
  window.onclick = (event) => {
    if (event.target === modal) {
      modal.style.display = 'none';
    }
  };
}
