// クイズデータを保持する変数
let questions = [];
let currentQuestion = 0;
let score = 0;
let highScores = [0, 0, 0, 0, 0];
const questionsLength = 10;

// Canvas要素を以下に記述
let stopDrawingFlag = false;
let animationFrameId;

// Canvas1要素の取得
const canvas1 = document.getElementById("colorful-balls");
const ctx1 = canvas1.getContext("2d");

// Canvas2要素の取得
const canvas2 = document.getElementById("monotone-balls");
const ctx2 = canvas2.getContext("2d");

// Canvas3要素の取得
const canvas3 = document.getElementById('fireworks-canvas');
const ctx3 = canvas3.getContext('2d');

// Canvas1,2要素のボールの設定
const ballRadius = 10;
const numBalls = 60;
const balls1 = [];
const balls2 = [];

// Canvas1,2要素のアニメーションの更新間隔
const interval = 10; // ミリ秒

// Canvas1要素の色の設定
const colors1 = ["#FFC0CB", "#ADD8E6", "#98FB98", "#FFD700", "#EE82EE", "#FFFFE0"];

// Canvas2要素の色の設定
const colors2 = ["#000000", "#333333", "#666666", "#999999", "#CCCCCC", "#FFFFFF"];

// 花火の設定
const gravity = 0.06;
const airResistance = 0.02;
const fireworks = [];
let lastTimeStamp = performance.now();

// レベル選択時に選択したレベルをセッションストレージに保存するイベントリスナーを追加
levelSelect.addEventListener('change', function () {
  var selectedLevel = levelSelect.value;
  sessionStorage.setItem('gomicheckerSelectedLevel', selectedLevel);
});

// 過去のハイスコアを取得する関数
function getHighScores() {
  let highScores = [];
  for (let i = 1; i <= 5; i++) {
    const score = localStorage.getItem("gomicheckerQuizHighScoreLevel" + i);
    highScores.push(parseInt(score));
  }
  return highScores;
}

// クイズを開始する関数isPage2FetchDone
function startQuiz() {
  currentQuestion = 0;
  fetchCSVData().then(() => {
    document.getElementById("hamburger").style.display = "none";
    document.getElementById("section-title3").style.display = "none";
    document.getElementById("load-screen").style.display = "none";
    document.getElementById("score-screen").style.display = "none";
    document.getElementById("level-scores").style.display = "none";
    document.getElementById("reset-button").style.display = "none";
    showQuestion();
  }).catch((error) => {
    console.error("CSVデータの取得に失敗しました:", error);
  });
}

// 問題を表示する関数
function showQuestion() {
  if (currentQuestion < questions.length) {
    let questionElement = document.getElementById("question");
    displayButtons();
    questionElement.innerHTML =  "-----" + (currentQuestion + 1) + "問目-----<br>" + questions[currentQuestion].question;

    document.getElementById("question-screen").style.display = "block";
  } else {
    endQuiz();
  }
}

// 選択肢の正誤をチェックする関数
function checkAnswer(choice) {
  stopDrawingFlag = false;
  if (choice === questions[currentQuestion].correctAnswer) {
    document.getElementById("result").innerHTML = "<div class='checkAnswer'>〇</div>" + questions[currentQuestion].question + "：" + questions[currentQuestion].correctText + "<br><br>" + questions[currentQuestion].optionText;
    score++;
    drawColorful();
  } else {
    document.getElementById("result").innerHTML = "<div class='checkAnswer'>×</div>" + questions[currentQuestion].question + "：" + questions[currentQuestion].correctText + "<br><br>" + questions[currentQuestion].optionText;
    drawMonotone();
  }

  document.getElementById("question-screen").style.display = "none";
  document.getElementById("result-screen").style.display = "block";
  if (currentQuestion === questions.length - 1) {
    document.getElementById("next-question-btn").style.display = "none";
    document.getElementById("show-result-btn").style.display = "block";
    document.getElementById("show-result-btn").addEventListener('animationend', () => {
      document.getElementById('show-result-btn').removeAttribute('disabled');
    }, { once: true });
  } else {
    document.getElementById("next-question-btn").style.display = "block";
    document.getElementById("next-question-btn").addEventListener('animationend', () => {
      document.getElementById('next-question-btn').removeAttribute('disabled');
    }, { once: true });
    document.getElementById("show-result-btn").style.display = "none";
  }
}

// 次の問題へ進む関数
function nextQuestion() {
  currentQuestion++;
  stopDrawing();
  showQuestion();
  document.getElementById("result-screen").style.display = "none";
  document.getElementById('next-question-btn').setAttribute('disabled', true);
}

// クイズ終了時の処理を行う関数
function endQuiz() {
  document.getElementById("result-screen").style.display = "block";
  document.getElementById('show-result-btn').setAttribute('disabled', true);
}

// クイズ終了時にテキストの色を変える関数
function toggleColorAdd() {
  let headerElement = document.querySelector(".header");
  let scoreElement = document.getElementById("score");
  let titleElement = document.querySelector(".titleContainer div");
  headerElement.classList.add("active");
  scoreElement.classList.add("active");
  titleElement.classList.add("active");
}

// スタートに戻る時にテキストの色を元に戻す関数
function toggleColorRemove() {
  let headerElement = document.querySelector(".header");
  let scoreElement = document.getElementById("score");
  let titleElement = document.querySelector(".titleContainer div");
  headerElement.classList.remove("active");
  scoreElement.classList.remove("active");
  titleElement.classList.remove("active");
}

// 結果を表示する関数
function showResult() {
  stopDrawing();
  toggleColorAdd();
  document.getElementById("result-screen").style.display = "none";
  document.getElementById("score").textContent = "今回のスコア: ★" + score + "個";
  document.getElementById("score-screen").style.display = "block";
  if (score / questionsLength == 0) {
  } else if (score / questionsLength < 0.3) {
    createRandomFirework();
  } else if (score / questionsLength < 0.6) {
    createRandomFirework();
    createRandomFirework();
  } else if (score / questionsLength == 1) {
    createRandomFirework();
    createRandomFirework();
    createRandomFirework();
    createRandomFirework();
    createRandomFirework();
  } else {
    createRandomFirework();
    createRandomFirework();
    createRandomFirework();
  }
  animate(performance.now());
  displayStars(score, questionsLength, '');
  updateLevelScore();
  const highScores = getHighScores();
  localStorage.setItem("gomicheckerQuizScoreLevel" + document.getElementById("levelSelect").value, score);
  let highScorevalue = highScores[document.getElementById("levelSelect").value - 1];
  localStorage.setItem("gomicheckerQuizHighScoreLevel" + document.getElementById("levelSelect").value, Math.max(score, isNaN(highScorevalue) ? 0 : highScorevalue));
  document.getElementById("start-back-button").style.display = "block";
  document.getElementById("start-back-button").addEventListener('animationend', () => {
    document.getElementById('start-back-button').removeAttribute('disabled');
  }, { once: true });
}

// レベルごとのスコアを更新する関数
function updateLevelScore() {
  const highScores = getHighScores();
  const level = document.getElementById("levelSelect").value;
  const highScore = Math.max(score, isNaN(highScores[level - 1]) ? 0 :highScores[level - 1]);
  highScores[level - 1] = highScore;
  document.getElementById("level-score-" + level).textContent = "レベル" + level + ": ★" + highScore + "個";
  document.getElementById("level-score-" + level).style.display = "block";
}

// 指定した数の星マークを表示する関数
function displayStars(score, totalcount, level) {
  let starsHTML = '';

  for (let i = 1; i <= totalcount; i++) {
    if (i <= score) {
      starsHTML += '<span style="color: gold;">★</span>';
    } else {
      starsHTML += '<span style="color: gray;">★</span>';
    }
    if (level == '') {
      document.getElementById('starContainer').innerHTML = starsHTML;
    } else{
      document.getElementById('starContainer-' + level).innerHTML = starsHTML;
    }
  }
}

// レコードをリセットする関数
function resetRecords() {
  // レベルを1にリセット
  var levelSelect = document.getElementById('levelSelect');
  levelSelect.value = '1';

  // レベルをセッションストレージに保存
  sessionStorage.setItem('gomicheckerSelectedLevel', '1');

  for (let i = 1; i <= 5; i++) {
    localStorage.removeItem("gomicheckerQuizScoreLevel" + i);
    localStorage.removeItem("gomicheckerQuizHighScoreLevel" + i);
  }
  storeAndReloadPage('page3');
}

// ページの読み込み完了時に実行する処理
function loadQuiz() {
  // 既に一度呼び出されている場合は、何もせずに関数を終了
  if (isPage3FetchDone) {
      return;
  }

  showInitial();
  isPage3FetchDone = true;
};

// 
function showInitial() {
  toggleColorRemove();
  document.getElementById("hamburger").style.display = "block";
  document.getElementById("section-title3").style.display = "block";
  document.getElementById("load-screen").style.display = "block";
  document.getElementById("score-screen").style.display = "none";
  document.getElementById("start-back-button").style.display = "none";
  document.getElementById("reset-button").style.display = "none";
  document.getElementById("next-question-btn").style.display = "block";
  const levelScores = document.getElementById("level-scores");
  levelScores.style.display = "none";

  let highScores = [];
  for (let i = 1; i <= 5; i++) {
    const savedScore = localStorage.getItem("gomicheckerQuizHighScoreLevel" + i);
    const highscore = parseInt(savedScore);
      highScores.push(highscore);
    if (savedScore !== null) {
      document.getElementById("level-score-" + i).textContent = "レベル" + i + ": ★" + savedScore + "個";
      document.getElementById("level-score-" + i).style.display = "block";
      displayStars(savedScore, questionsLength, i);
    }
  }

  let hasNonNaN = highScores.some(function(score) {
      return !isNaN(score);
  });

  if (hasNonNaN) {
      levelScores.style.display = "block";
      document.getElementById("reset-button").style.display = "block";
  }
stopDrawing();
}

// 選択したレベルに基づいて選択肢のボタンを表示
function displayButtons() {
  const question = document.getElementById('question');

  // 選択肢をリセット
  question.innerHTML = '';

  // CSVデータを取得してパースする
  getCSVData(csvURL6)
    .then(parsedData => {
      // 選択したレベルに応じてボタンを生成
      const options = parsedData[levelSelect.value - 1];
      const buttons = options[2].split(",");
      for (let i = 0; i < buttons.length; i++) {
        const button = document.createElement('button');
        button.innerHTML = buttons[i];

        // アニメーションを追加
        button.style.animation = 'fadeIn 0.3s ease-in-out forwards';
        
        // ボタンを無効化
        button.setAttribute('disabled', 'true');

        // アニメーションが終了したらボタンを有効にする
        button.addEventListener('animationend', () => {
          button.removeAttribute('disabled');
        }, { once: true });

        button.setAttribute('onclick', 'checkAnswer(' + i + ')');
        question.appendChild(button);
      }
    })
    .catch(error => {
      console.log(error);
      // エラーハンドリングを行う
    });
}

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

    if (filteringField in mappingTable) {
      record.push(mappingTable[filteringField]);
    } else {
      record.push("-");
    }

    result.push(record);
  }

  return result;
}

// 指定されたレベルのCSVデータから値を取得する関数
function getValuesFromCSV(level) {
  return fetch(csvURL6)
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.text();
    })
    .then(csvData => {
      const csvRows = csvData.split('\n');
      const selectedRow = csvRows[level].split(',');
      const values = selectedRow.slice(1).map(value => value.trim().replace(/"/g, ''));
      return values;
    })
    .catch(error => {
      console.log(error);
      throw error;
    });
}

// CSVデータの取得と処理を実行する関数
async function fetchCSVData() {
  try {
    const result = await loadCSV();
    const filteredRecords = await filterRecords(result, levelSelect.value);
    const getValuesSelectFromCSV = await getValuesFromCSV(levelSelect.value);
    const randomRecords = selectRandomRecords(filteredRecords, levelSelect.value, questionsLength);
    questions = [];

    for (let i = 0; i < randomRecords.length; i++) {
      const record = randomRecords[i];
      const question = record[2];
      const choices = getValuesSelectFromCSV;
      const optionText = record[6];
      let correctAnswer = record[8];
      let correctText = record[8];

      // 選択肢の中から正解のインデックスを探す
      for (let j = 0; j < choices.length; j++) {
        if (choices[j] === correctText) {
          correctAnswer = j;
          break;
        }
      }

      if (correctText == "資源") {
        correctText = correctText + "ごみ（" + record[4] + "）";        
      } else {
        correctText = record[4]
      }

      questions.push({
        question: question,
        choices: choices,
        optionText: optionText,
        correctAnswer: correctAnswer,
        correctText: correctText
      });
    }

  } catch (error) {
    console.error('Error:', error);
  }
}

// 配列をシャッフルする関数
function shuffleArray(array) {
  let currentIndex = array.length, temporaryValue, randomIndex;

  while (currentIndex !== 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}

// 追加の条件を生成する関数
function generateAdditionalCondition(records, level) {
  let additionalCondition = '';
  const levelData = records[level - 1];
  for (let i = 1; i < levelData.length; i++) {
    const words = levelData[i].split(",");
    let subCondition = '';

    for (let j = 0; j < words.length; j++) {
      if (subCondition !== '') {
        subCondition += ' || ';
      }
      subCondition += 'filteringField === "' + words[j].trim() + '"';
    }

    if (additionalCondition !== '') {
      additionalCondition += ' || ';
    }
    additionalCondition += '(' + subCondition + ')';
  }
  return additionalCondition;
}

// レコードをランダムに選択して返す関数
function selectRandomRecords(records, level, tableSize) {
  const wordCount = level - 1 < records.length ? records[level - 1].length - 1 : 0;
  const count = Math.ceil(tableSize / (parseInt(level) + 1));

  const countMap = {};
  records = shuffleArray(records);

  const filteredRecords = records.filter(function(record) {
    const value = record[8];
    countMap[value] = (countMap[value] || 0) + 1;
    return countMap[value] <= count;
  });

  const randomRecords = [];
  while (randomRecords.length < questionsLength && filteredRecords.length > 0) {
    const randomIndex = Math.floor(Math.random() * filteredRecords.length);
    const randomRecord = filteredRecords[randomIndex];
    const value = randomRecord[8];
    countMap[value]--;
    randomRecords.push(randomRecord);
    filteredRecords.splice(randomIndex, 1);
  }
  return randomRecords;
}

// レコードをフィルタリングする関数
function filterRecords(records, level) {
  return fetch(csvURL6)
    .then(function(response) {
      return response.text();
    })
    .then(function(csvData) {
      const parsedRecords = parseCSV(csvData);
      const additionalCondition = generateAdditionalCondition(parsedRecords, level);
      const filteredRecords = [];
      records.forEach(function(record) {
        const filteringField = record[8];
        if (!record[5].includes('医療品') && eval(additionalCondition)) {
          filteredRecords.push(record);
        }
      });

      return filteredRecords;
    })
   .catch(function(error) {
      console.error('Error:', error);
      return [];
    });
}



// 描画を停止する関数
function stopDrawing() {
  stopDrawingFlag = true;
  cancelAnimationFrame(animationFrameId);

  ctx1.clearRect(0, 0, canvas1.width, canvas1.height);
  ctx2.clearRect(0, 0, canvas2.width, canvas2.height);
  ctx3.clearRect(0, 0, canvas3.width, canvas3.height);
}



// キャンバス1をウィンドウサイズにリサイズする関数
function resizeCanvas1() {
  canvas1.width = window.innerWidth;
  canvas1.height = window.innerHeight;
}

// ウィンドウのリサイズイベントにリサイズ関数を登録
window.addEventListener('resize', resizeCanvas1);
resizeCanvas1();

// 玉の情報を初期化
balls1.splice(0, balls1.length);
for (let i = 0; i < numBalls; i++) {
  balls1.push({
    x: Math.random() * (canvas1.width - ballRadius * 2) + ballRadius,
    y: Math.random() * (canvas1.height - ballRadius * 2) + ballRadius,
    color: colors1[Math.floor(Math.random() * colors1.length)],
    speed: Math.random() * 3 + 1 // スピードを1から3の範囲でランダムに設定
  });
}

// アニメーションの更新関数
function drawColorful() {
  // 画面をクリアする
  ctx1.clearRect(0, 0, canvas1.width, canvas1.height);

  // 玉を描画する
  balls1.forEach(ball1 => {
    ctx1.beginPath();
    ctx1.arc(ball1.x, ball1.y, ballRadius, 0, Math.PI * 2);
    ctx1.fillStyle = ball1.color;
    ctx1.fill();
    ctx1.closePath();

    // 玉を上に移動させる
    ball1.y -= ball1.speed;

    // 玉が画面外に出たら下から再配置する
    if (ball1.y + ballRadius < 0) {
      ball1.y = canvas1.height;
      ball1.x = Math.random() * (canvas1.width - ballRadius * 2) + ballRadius;
      ball1.color = colors1[Math.floor(Math.random() * colors1.length)];
      ball1.speed = Math.random() * 3 + 1;
    }
  });

  // 次のフレームの更新を予約する
  if (!stopDrawingFlag) {
    animationFrameId = requestAnimationFrame(drawColorful);
  }
}



// キャンバス2をウィンドウサイズにリサイズする関数
function resizeCanvas2() {
  canvas2.width = window.innerWidth;
  canvas2.height = window.innerHeight;
}

// ウィンドウのリサイズイベントにリサイズ関数を登録
window.addEventListener('resize', resizeCanvas2);
resizeCanvas2();

// 玉の情報を初期化
balls2.splice(0, balls2.length);
for (let i = 0; i < numBalls; i++) {
  balls2.push({
    x: Math.random() * (canvas2.width - ballRadius * 2) + ballRadius,
    y: Math.random() * (canvas2.height - ballRadius * 2) + ballRadius,
    color: colors2[Math.floor(Math.random() * colors2.length)],
    speed: Math.random() * 3 + 1 // スピードを1から3の範囲でランダムに設定
  });
}

// アニメーションの更新関数
function drawMonotone() {
  // 画面をクリアする
  ctx2.clearRect(0, 0, canvas2.width, canvas2.height);

  // 玉を描画する
  balls2.forEach(ball2 => {
    ctx2.beginPath();
    ctx2.arc(ball2.x, ball2.y, ballRadius, 0, Math.PI * 2);
    ctx2.fillStyle = ball2.color;
    ctx2.fill();
    ctx2.closePath();

    // 玉を下に移動させる
    ball2.y += ball2.speed;

    // 玉が画面外に出たら上から再配置する
    if (ball2.y - ballRadius > canvas2.height) {
      ball2.y = 0;
      ball2.x = Math.random() * (canvas2.width - ballRadius * 2) + ballRadius;
      ball2.color = colors2[Math.floor(Math.random() * colors2.length)];
      ball2.speed = Math.random() * 3 + 1;
    }
  });

  // 次のフレームの更新を予約する
  if (!stopDrawingFlag) {
    animationFrameId = requestAnimationFrame(drawMonotone);
  }
}



// キャンバス3をウィンドウサイズにリサイズする関数
function resizeCanvas3() {
  canvas3.width = window.innerWidth;
  canvas3.height = window.innerHeight;
}

// ウィンドウのリサイズイベントにリサイズ関数を登録
window.addEventListener('resize', resizeCanvas3);
resizeCanvas3();

// Particleクラスの定義
function Particle(x, y, dx, dy, hue, timeStamp) {
  this.x = x;
  this.y = y;
  this.dx = dx;
  this.dy = dy;
  this.hue = hue;
  this.alpha = 1;
  this.decay = 0.015;
  this.isAlive = true;
  this.timeStamp = timeStamp;
}

Particle.prototype = {
  // パーティクルの更新
  update(currentTimeStamp) {
    const deltaTime = (currentTimeStamp - this.timeStamp) / (1000 / 60);
    this.timeStamp = currentTimeStamp;

    this.x += this.dx * deltaTime;
    this.y += this.dy * deltaTime;
    this.dy += gravity * deltaTime;
    this.dx *= (1 - airResistance);
    this.dy *= (1 - airResistance);

    this.alpha -= this.decay * deltaTime;
    if (this.alpha <= 0) this.isAlive = false;
  },

  // パーティクルの描画
  draw() {
    const particleSize = canvas3.width * 0.003;
    ctx3.beginPath();
    ctx3.arc(this.x, this.y, particleSize, 0, Math.PI * 2, false);
    ctx3.fillStyle = `hsla(${this.hue}, 100%, 80%, ${this.alpha})`;
    ctx3.fill();
  },
};

// 花火を生成する関数
function createFirework(centerX, centerY, numParticles, radius, hue) {
  const angleStep = (2 * Math.PI) / numParticles;

  // numParticles分のパーティクルを生成してfireworksに追加
  const particles = Array.from({ length: numParticles }, (_, i) => {
    const angle = i * angleStep;
    const speed = radius / 30;
    const dx = Math.cos(angle) * speed;
    const dy = Math.sin(angle) * speed;
    return new Particle(centerX, centerY, dx, dy, hue, performance.now());
  });

  fireworks.push(...particles);
}

// ランダムな位置に花火を生成する関数
function createRandomFirework() {
  // 一定の間隔でランダムな位置に花火を生成
  setInterval(() => {
    const centerX = Math.random() * canvas3.width;
    const centerY = Math.random() * canvas3.height;
    const particleWidth = 0.02 * canvas3.width;
    const radius = particleWidth * 7;
    const hue = Math.floor(Math.random() * 360);
    createFirework(centerX, centerY, 14, radius * 1, hue * 0.8);
    createFirework(centerX, centerY, 28, radius * 1.6, hue * 0.9);
    createFirework(centerX, centerY, 42, radius * 2.2, hue * 1);
  }, Math.random() * 1400 + 400);
}

// アニメーションのメインループ
function animate(timeStamp) {
  stopDrawingFlag = false;
  const deltaTime = timeStamp - lastTimeStamp;
  lastTimeStamp = timeStamp;

  // 背景を少しずつ消していくことで残像を表現
  ctx3.fillStyle = 'rgba(0, 0, 0, 0.1)';
  ctx3.fillRect(0, 0, canvas3.width, canvas3.height);

  // 全ての花火のパーティクルを更新して描画
  fireworks.forEach((firework, index) => {
    firework.update(timeStamp);
    firework.draw();

    // パーティクルが消えたら配列から削除
    if (!firework.isAlive) fireworks.splice(index, 1);
  });

  // 次のフレームの更新を予約する
  if (!stopDrawingFlag) animationFrameId = requestAnimationFrame(animate);
}
