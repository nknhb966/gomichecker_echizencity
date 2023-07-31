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

// CSVデータを取得して表を表示する関数
function displayCSVData() {
  // 外部のCSVファイルを取得する非同期通信
  fetch(csvURL2)
    .then(response => response.text())
    .then(csvData => {
      // CSVデータをパースする
      const parsedData = parseCSV(csvData);

      // 表を生成して表示
      const table = document.getElementById("csvTable");
      let tableHTML = "";

      // ヘッダー行を追加
      tableHTML = "<tr><th>名称</th><th>略表示</th></tr>";

      // データ行を追加
      for (let i = 0; i < parsedData.length; i++) {
        tableHTML += "<tr>";

        for (let j = 0; j < parsedData[i].length; j++) {
          tableHTML += "<td>" + parsedData[i][j] + "</td>";
        }

        tableHTML += "</tr>";
      }

      table.innerHTML = tableHTML;
    })
    .catch(error => {
      console.error("CSVデータの取得または表示でエラーが発生しました:", error);
    });
}

// ページが読み込まれたらCSVデータを表示
window.onload = function() {
  displayCSVData();
};
