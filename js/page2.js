const currentYear = new Date().getFullYear();
const currentMonth = new Date().getMonth();
const weekdays = ["日", "月", "火", "水", "木", "金", "土"];
const yearSelect = document.getElementById("year");
const monthSelect = document.getElementById("month");

// CSVデータを取得する関数
async function fetchCSVData() {
  const response = await fetch(csvURL4);
  const csvData = await response.text();
  return csvData;
}

// CSVテキストを解析しオブジェクトの配列に変換する関数
function parseCSV(csvData) {
  const lines = csvData.replace(/\r/g, '').split('\n');
  const header = lines[0].split(',');
  const results = [];

  for (let i = 1; i < lines.length; i++) {
    const obj = {};
    const currentLine = lines[i].split(',');
    let field = "";
    let record = [];

    for (let j = 0; j < currentLine.length; j++) {
      field += currentLine[j].trim();

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

    if (record.length === 1) {
      continue;
    }

    for (let j = 0; j < header.length; j++) {
      obj[header[j]] = record[j];
    }

    results.push(obj);
  }

  return results;
}

// CSVデータを取得する関数
function fetchCSV(url) {
  // 既に一度呼び出されている場合は、何もせずに関数を終了
  if (isPage2FetchDone) {
    return;
  }

  // 一度だけ実行される処理を記述
  return fetch(url)
    .then(response => response.text())
    .then(csvData => {
      const rows = csvData.split('\n');
      const headers = rows[0].split(',');

      const selectElement = document.getElementById('selectValues');
      const selectedValue = localStorage.getItem('gomichecker_chou_select');

      // 地区名の選択肢を生成
      const defaultOption = document.createElement('option');
      defaultOption.value = "";
      defaultOption.text = "町内を選んでください";
      selectElement.appendChild(defaultOption);

      for (let i = 1; i < rows.length; i++) {
        const values = rows[i].split(',');
        const option = document.createElement('option');
        option.value = values[2];
        option.text = values[2];
        if (selectedValue && selectedValue === values[2]) {
          option.selected = true; // 選択された値を自動的に選択する
        }
        // 最後の行が空行である場合の処理を追加
        if (values.length === 1) {
          break;
        }
        selectElement.appendChild(option);
      }
      selectElement.addEventListener('change', function() {
        const selectedValue = this.value;
        localStorage.setItem('gomichecker_chou_select', selectedValue);
        updateTableSet(selectedValue);
      });

      const currentDate = new Date();
      const currentYear = currentDate.getFullYear();
      const currentMonth = currentDate.getMonth() + 1;

      // 年の選択肢を生成
      for (let j = currentYear - 10; j <= currentYear + 10; j++) {
        const option = document.createElement("option");
        option.value = j;
        option.text = j;
        yearSelect.appendChild(option);
      }

      // 月の選択肢を生成
      for (let k = 1; k <= 12; k++) {
        const option = document.createElement("option");
        option.value = k;
        option.text = k;
        monthSelect.appendChild(option);
      }

      yearSelect.value = currentYear;
      monthSelect.value = currentMonth;
      updateTableSet(selectedValue);
      isPage2FetchDone = true;
    })
    .catch(error => console.log('CSVデータの取得に失敗しました:', error));
}

// カレンダーを生成して表示
function generateCalendar() {
  const year = parseInt(yearSelect.value);
  const month = parseInt(monthSelect.value);

  const calendar = document.getElementById("calendar");
  calendar.innerHTML = "";

  const headerRow = document.createElement("tr");
  const daysOfWeek = ["日", "月", "火", "水", "木", "金", "土"];
  for (let i = 0; i < 7; i++) {
    const headerCell = document.createElement("th");
    headerCell.textContent = daysOfWeek[i];
    headerRow.appendChild(headerCell);
  }
  calendar.appendChild(headerRow);

  const firstDay = new Date(year, month - 1, 1);
  const lastDay = new Date(year, month, 0);
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1;
  const currentDay = currentDate.getDate();

  let date = 1;
  let week = 0;
  while (date <= lastDay.getDate()) {
    const row = document.createElement("tr");

    for (let dayOfWeek = 0; dayOfWeek < 7; dayOfWeek++) {
      const cell = document.createElement("td");

      if ((week === 0 && dayOfWeek < firstDay.getDay()) || date > lastDay.getDate()) {
        cell.textContent = "";
      } else {
        if (dayOfWeek === 0) {
          cell.classList.add("sunday");
        } else if (dayOfWeek === 6) {
          cell.classList.add("saturday");
        } else {
          cell.classList.add("weekday-cell");
        }
        if (year === currentYear && month === currentMonth && date === currentDay) {
          cell.classList.add("today");
        }

        const dateWrapper = document.createElement("div");
        dateWrapper.classList.add("date");
        dateWrapper.textContent = date;
        cell.appendChild(dateWrapper);

        date++;
      }

      row.appendChild(cell);
    }

    calendar.appendChild(row);
    week++;
  }
}

// 前年を表示する関数
function previousYear() {
  const yearSelect = document.getElementById("year");
  yearSelect.value = parseInt(yearSelect.value) - 1;
  generateAndAddTextCalendar();
}

// 前月を表示する関数
function previousMonth() {
  const yearSelect = document.getElementById("year");
  let monthSelect = document.getElementById("month");
  let month = parseInt(monthSelect.value) - 1;
  if (month < 1) {
    month = 12;
    yearSelect.value = parseInt(yearSelect.value) - 1;
  }
  monthSelect.value = month;
  generateAndAddTextCalendar();
}

// 今月を表示する関数
function thisMonth() {
    const date = new Date();
    yearSelect.value = date.getFullYear();
    monthSelect.value = date.getMonth() + 1;
    generateAndAddTextCalendar();
}

// 翌月を表示する関数
function nextMonth() {
  const yearSelect = document.getElementById("year");
  let monthSelect = document.getElementById("month");
  let month = parseInt(monthSelect.value) + 1;
  if (month > 12) {
    month = 1;
    yearSelect.value = parseInt(yearSelect.value) + 1;
  }
  monthSelect.value = month;
  generateAndAddTextCalendar();
}

// 翌年を表示する関数
function nextYear() {
  const yearSelect = document.getElementById("year");
  yearSelect.value = parseInt(yearSelect.value) + 1;
  generateAndAddTextCalendar();
}

// カレンダーにテキストを追加する関数
function addTextCalendar(table, dayText, text) {
  return new Promise((resolve, reject) => {
    renameHeader(text)
      .then(convertedText => {
        // 変換後の値を利用して処理を行う
        text = convertedText;

        // valueの値から「毎週」と「第」と「・」を省略する
        dayText = dayText.replace('毎週', '').replace('第', '').replace('・', '');

        const cells = table.getElementsByTagName("td");

        const dayCombos = dayText.split("");

        // 数字から始まらない場合
        if (isNaN(dayCombos[0])) {
          // ２つの曜日の組み合わせの場合
          if (dayCombos.length === 2) {
            for (let i = 0; i < cells.length; i++) {
              const cell = cells[i];
              const day = parseInt(cell.textContent);

              if (day === "") {
                continue;
              }

              const dayOfWeek = weekdays[new Date(yearSelect.value, monthSelect.value - 1, day).getDay()];
              if (dayCombos.includes(dayOfWeek)) {
                addTextToCell(cell, text);
              }
            }
          // １つの曜日の場合
          } else if (dayCombos.length === 1) {
            for (let i = 0; i < cells.length; i++) {
              const cell = cells[i];
              const day = parseInt(cell.textContent);

              if (day === "") {
                continue;
              }

              const dayOfWeek = weekdays[new Date(yearSelect.value, monthSelect.value - 1, day).getDay()];
              if (dayOfWeek === dayCombos[0]) {
                addTextToCell(cell, text);
              }
            }
          }
        // 数字から始まる場合
        } else {
          let weekNumbers;
          let dayOfWeek;

          if (dayCombos.length === 3) {
            const firstDigit = Number(dayCombos[0]);
            const secondDigit = Number(dayCombos[1]);
            weekNumbers = [firstDigit, secondDigit];
            dayOfWeek = dayCombos[2];
          } else if (dayCombos.length === 2) {
            weekNumbers = dayCombos[0].split("");
            dayOfWeek = dayCombos[1];
          }

          for (let i = 0; i < cells.length; i++) {
            const cell = cells[i];
            const day = parseInt(cell.textContent);

            if (day === "") {
              continue;
            }

            const selectedDate = new Date(yearSelect.value, monthSelect.value - 1, day);
            const selectedWeekNumber = getWeekNumber(yearSelect.value, monthSelect.value, selectedDate);
            const selectedDayOfWeek = weekdays[selectedDate.getDay()];

            // 数字が2桁の場合
            if (dayCombos.length === 3) {
              const firstDigit = weekNumbers[0];
              const secondDigit = weekNumbers[1];

              if ((firstDigit >= 1 && firstDigit <= 4) || (secondDigit >= 1 && secondDigit <= 4)) {
                if ((selectedWeekNumber === firstDigit || selectedWeekNumber === secondDigit) && selectedDayOfWeek === dayOfWeek) {
                  addTextToCell(cell, text);
                }
              }
            // 数字が1桁の場合
            } else {
              if (weekNumbers.includes(String(selectedWeekNumber)) && selectedDayOfWeek === dayOfWeek) {
                addTextToCell(cell, text);
              }
            }
          }
        }

        resolve(); // Promiseを成功状態にする
      })
      .catch(error => {
        reject(error); // Promiseを失敗状態にする
      });
  });
}

// ヘッダーのテキストをルールに基づいて変換する関数
function renameHeader(text) {
  return new Promise((resolve, reject) => {
    fetch(csvURL5)
      .then(response => response.text())
      .then(csvData => {
        const csvDataArray = parseCSV(csvData);
        const headerMap = new Map(csvDataArray.map(item => [item.名称, item.略名称]));

        if (headerMap.has(text)) {
          resolve(headerMap.get(text));
        } else {
          resolve(text);
        }
      })
      .catch(error => {
        reject(error);
      });
  });
}

// セルにテキストを追加する関数
function addTextToCell(cell, text) {
  const existingTexts = cell.querySelectorAll(".text");

  if (existingTexts.length > 0) {
    for (let i = 0; i < existingTexts.length; i++) {
      const existingText = existingTexts[i];
      existingText.innerHTML += "<br>" + text;
    }
  } else {
    const textElement = document.createElement("span");
    textElement.className = "text";
    textElement.classList.add("text");
    textElement.innerHTML = text;
    cell.appendChild(textElement);
  }
}

// 週番号を取得する関数（その日付の曜日がその月で何番目か）
function getWeekNumber(selectedYear, selectedMonth, date) {
  const firstDayOfMonth = new Date(selectedYear, selectedMonth - 1, 1);
  const weekday = ((date - firstDayOfMonth) / 86400000 + 1) / 7;
  return Math.ceil(weekday);
}

// 指定された値を元にテキストをカレンダーセルに追加する関数
function generateTextToCell(values) {
  return new Promise((resolve, reject) => {
    fetch(csvURL3)
      .then(response => response.text())
      .then(csvData => {
        const parsedData = parseCSV(csvData);
        const header = Object.keys(parsedData[0]);
        const chou = values;
        const keywordIndex = header.indexOf('キーワード');
        const lastNumber = keywordIndex - 4;

        const promises = [];
        for (let kubun = 0; kubun < lastNumber; kubun++) {
          promises.push(getSyusyubi(chou, kubun, lastNumber)); // getSyusyubiの実行結果のPromiseを配列に追加する
        }

        Promise.all(promises)
          .then(() => {
            resolve(); // 全てのPromiseが成功した場合にresolveを呼び出す
          })
          .catch(error => {
            reject(error); // いずれかのPromiseがエラーとなった場合にrejectを呼び出す
          });
      })
      .catch(error => {
        reject(error); // エラー時にrejectを呼び出す
      });
  });
}

// 地区ごとに収集日を取得し、カレンダーセルに追加する関数
function getSyusyubi(chou, kubun, lastNumber) {
  return new Promise((resolve, reject) => {
    fetch(csvURL3)
      .then(response => response.text())
      .then(csvData => {
        const parsedData = parseCSV(csvData);

        let found = false; // 地区名が見つかったかどうかのフラグ
        for (let i = 0; i < parsedData.length; i++) {
          const row = parsedData[i];

          if (row['地区名'] === chou) {
            const item = Object.keys(row)[kubun + 4];
            const value = row[item];
            return addTextCalendar(calendar, value, item); // addTextCalendar関数を呼び出し、そのPromiseを返す
          }
        }
        throw new Error("地区名が見つかりませんでした。"); // エラーをスローする
      })
      .then(() => {
        resolve(); // 成功時にresolveを呼び出す
      })
      .catch(error => {
        reject(error); // エラー時にrejectを呼び出す
      });
  });
}

// 特定の期間のセルにテキストを上書きする関数
async function overwriteTextToCell(selectedYear, selectedMonth, text) {
  const calendar = document.getElementById("calendar");
  const cells = calendar.getElementsByTagName("td");
  const specialMessage = document.getElementById("specialMessage");

  specialMessage.innerHTML = "";

  const csvData = await fetchCSVData();
  const conditions = parseCSV(csvData);

  let isMatchedMonthDisplayed = false;
  const displayedStartDays = []; // 表示済みのstartDayを保持する配列

  for (let i = 0; i < cells.length; i++) {
    const cell = cells[i];
    const day = parseInt(cell.textContent);

    if (day === "") {
      continue;
    }

    let isMatchedStartDayDisplayed = false;

    for (let j = 0; j < conditions.length; j++) {
      const condition = conditions[j];
      const year = condition["年"];
      const month = condition["月"];
      const startDay = parseInt(condition["開始日"]);
      const endDay = parseInt(condition["終了日"]);
      const remarks = condition["備考"];
      const remarksURL = condition["URL"];

      if ((year === "毎年" || parseInt(year) === selectedYear) && parseInt(month) === selectedMonth && startDay <= day && day <= endDay) {
        const textElement = cell.querySelector(".text");
        if (textElement) {
          textElement.innerHTML = text;
        } else {
          const textElement = document.createElement("span");
          textElement.className = "text";
          textElement.innerHTML = text;
          cell.appendChild(textElement);
        }

        if (!isMatchedMonthDisplayed) {
          const message = document.createElement("div");
          message.classList.add("special-message");
          message.innerHTML = "※次の収集日は自治体にお問合せください<br>"
          specialMessage.appendChild(message);
          isMatchedMonthDisplayed = true;
        }

        if (!displayedStartDays.includes(startDay)) {
          const message = document.createElement("div");
          message.classList.add("special-message");
          let messageContent = month + "月" + startDay + "日";
          if (startDay !== endDay) {
            messageContent += "～" + endDay + "日";
          }
          messageContent += "：" + remarks;

          if (remarksURL) {
            const link = document.createElement("a");
            link.href = remarksURL;
            link.innerHTML = messageContent;
            link.target = "_blank";
            message.appendChild(link);
          } else {
            message.innerHTML = messageContent;
          }

          specialMessage.appendChild(message);
          displayedStartDays.push(startDay);
        }

        isMatchedStartDayDisplayed = true;
      }
    }

    if (!isMatchedStartDayDisplayed) {
      const message = document.createElement("div");
      message.classList.add("special-message");
      message.innerHTML = "";
      specialMessage.appendChild(message);
    }
  }
}

// 備考を取得して表示する関数
function fetchAndPopulateNote(chou) {
  fetch(csvURL3)
    .then(response => response.text())
    .then(csvData => {
      const parsedData = parseCSV(csvData);

      for (let i = 0; i < parsedData.length; i++) {
        const row = parsedData[i];
        if (row['地区名'] === chou) {
          const noteValue = row['備考'];
          const noteElement = document.getElementById('note');
          noteElement.innerText = noteValue;
          return; // 処理が見つかったらループを抜ける
        }
      }

      console.log('対応するデータが見つかりませんでした。');
    })
    .catch(error => {
      console.error('CSVデータの取得やパースでエラーが発生しました:', error);
    });
}

// カレンダーの生成とテキストの追加を行う関数
function generateAndAddTextCalendar() {
  const selectElement = document.getElementById('selectValues');
  generateCalendar();
  generateTextToCell(selectElement.value)
    .then(() => {
      fetchAndPopulateNote(selectElement.value);
      overwriteTextToCell(parseInt(yearSelect.value), parseInt(monthSelect.value), "※");
    })
    .catch(error => {
      console.log(error); // エラー時の処理
    });
}

// テーブルセットの更新
function updateTableSet(selectedValue) {
  const tableSet = document.getElementById('tableSet');
  const tableTitle = document.getElementById('tableTitle');

  if (!selectedValue) {
    tableSet.classList.remove('show');
    return;
  }

  fetch(csvURL3)
    .then(response => response.text())
    .then(csvData => {
      const parsedData = parseCSV(csvData);

      let selectedDataFound = false;
      for (let i = 0; i < parsedData.length; i++) {
        const row = parsedData[i];
        const selectedData = row['地区名'];

        if (selectedData === selectedValue) {
          generateAndAddTextCalendar();
          selectedDataFound = true;
          break;
        }
      }

      if (!selectedDataFound) {
        tableTitle.textContent = 'データが見つかりません';
        generateAndAddTextCalendar();
      }

      // ボタンの表示
      tableSet.classList.add('show');
    })
    .catch(error => console.log('CSVデータの取得に失敗しました:', error));
}

// ローカルストレージのリセット
function resetLocalStorage() {
  localStorage.removeItem('gomichecker_chou_select');
  document.getElementById('selectValues').selectedIndex = 0;
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1;
  yearSelect.value = currentYear;
  monthSelect.value = currentMonth;
  updateTableSet('');
}
