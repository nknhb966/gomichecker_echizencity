// CSVデータのURL
const csvURL1 = "https://echizencity.github.io/opendata/gomijp.csv";
const csvURL2 = "https://nknhb966.github.io/gomichecker_echizencity/gomikubunryaku.csv";
const csvURL3 = 'https://echizencity.github.io/opendata/gomisyusyubi.csv';
const csvURL4 = 'https://nknhb966.github.io/gomichecker_echizencity/gomisyusyubi_zyogai.csv';
const csvURL5 = 'https://nknhb966.github.io/gomichecker_echizencity/gomisyusyubi_rename.csv';
const csvURL6 = 'https://nknhb966.github.io/gomichecker_echizencity/gomiquiz.csv';
const csvURL7 = 'https://echizencity.github.io/opendata/01shisetsu.csv';

// 現在ロードされているJSファイルのURLを格納する変数
let loadedJSURL = null;

// 現在ロードされているCSSファイルのURLを格納する変数
let loadedCSSURL = null;

// フラグ変数を初期化します
let isPage2FetchDone = false;
let isPage3FetchDone = false;
let isPage4Done = false;


// マップを格納する変数
let map;


// メニューの表示・非表示を切り替える関数
function toggleMenu() {
var menu = document.getElementById('menu');
menu.classList.toggle('open');

// メニューが開いている場合にクリックしたらメニューを閉じる
if (menu.classList.contains('open')) {
    document.addEventListener('click', closeMenu);
} else {
    document.removeEventListener('click', closeMenu);
}
}

// メニュー以外の場所をクリックしたらメニューを閉じる関数
function closeMenu(event) {
var menu = document.getElementById('menu');
var hamburger = document.querySelector('.hamburger');

// クリックイベントがメニュー内部の要素に属していない場合にメニューを閉じる
if (event && !menu.contains(event.target) && !hamburger.contains(event.target)) {
    menu.classList.remove('open');
    document.removeEventListener('click', closeMenu);
}
}

// ページの表示・非表示を切り替える関数
function togglePage(pageId) {
// すべてのページのコンテンツを非表示にする
var pages = document.querySelectorAll('.content');
pages.forEach(function(page) {
    page.style.display = 'none';
});

// 指定したページのコンテンツを表示する
var pageToShow = document.getElementById(pageId);
pageToShow.style.display = 'block';

// メニューを閉じる
toggleMenu();

// 選択されたページのメニュー項目にactiveクラスを追加する
var menuItems = document.querySelectorAll('.menu ul li a');
menuItems.forEach(function(item) {
    item.classList.remove('active');
});

var selectedMenuItem = document.querySelector('.menu ul li a[href="#' + pageId + '"]');
selectedMenuItem.classList.add('active');

// ページごとのrefresh#()関数を実行する
switch (pageId) {
    case 'page1':
        refresh1();
        break;
    case 'page2':
        refresh2();
        break;
    case 'page3':
        refresh3();
        break;
    case 'page4':
        refresh4();
        break;
    case 'page5':
        refresh5();
        break;
}
}

// 各ページのrefresh#()関数
function refresh1() {
// ページごとのCSSファイルを読み込む
loadPageSpecificCSS('page1');
// 非同期処理を含むloadPageSpecificJS()関数を呼び出す
loadPageSpecificJS('page1').then(() => {
    // loadPageSpecificJS()関数が完了した後の処理を記述する
    displayCSVData();
}).catch((error) => {
    // エラー処理
    console.error(error);
});
}

function refresh2() {
// ページごとのCSSファイルを読み込む
loadPageSpecificCSS('page2');
// 非同期処理を含むloadPageSpecificJS()関数を呼び出す
loadPageSpecificJS('page2').then(() => {
    // loadPageSpecificJS()関数が完了した後の処理を記述する
    // カレンダーの表示
    fetchCSV(csvURL3);
}).catch((error) => {
    // エラー処理
    console.error(error);
});
}

function refresh3() {
// ページごとのCSSファイルを読み込む
loadPageSpecificCSS('page3');
// 非同期処理を含むloadPageSpecificJS()関数を呼び出す
loadPageSpecificJS('page3').then(() => {
    // loadPageSpecificJS()関数が完了した後の処理を記述する
    // クイズの表示
    loadQuiz();
}).catch((error) => {
    // エラー処理
    console.error(error);
});
}

function refresh4() {
// ページごとのCSSファイルを読み込む
loadPageSpecificCSS('page4');
// 非同期処理を含むloadPageSpecificJS()関数を呼び出す
loadPageSpecificJS('page4').then(() => {
    // loadPageSpecificJS()関数が完了した後の処理を記述する
    loadMap();
}).catch((error) => {
    // エラー処理
    console.error(error);
});
}

function refresh5() {
// ページごとのCSSファイルを読み込む
loadPageSpecificCSS('page5');
// 非同期処理を含むloadPageSpecificJS()関数を呼び出す
loadPageSpecificJS('page5').then(() => {
    // loadPageSpecificJS()関数が完了した後の処理を記述する

}).catch((error) => {
    // エラー処理
    console.error(error);
});
}

// loadPageSpecificCSS関数をPromiseを返すように定義
function loadPageSpecificCSS(pageId) {
return new Promise((resolve, reject) => {
    // ページごとに適切なCSSファイルのURLを定義
    let cssURL;
    switch (pageId) {
        case 'page1':
            cssURL = 'css/page1.css';
            break;
        case 'page2':
            cssURL = 'css/page2.css';
            break;
        case 'page3':
            cssURL = 'css/page3.css';
            break;
        case 'page4':
            cssURL = 'css/page4.css';
            break;
        case 'page5':
            cssURL = 'css/page5.css';
            break;
        default:
            reject(new Error('Invalid pageId'));
    }

    // すでにロードされているCSSファイルがある場合、アンロードする
    if (loadedCSSURL) {
        unloadPageSpecificCSS();
    }

    // link要素を作成してCSSファイルをロードする
    const linkElement = document.createElement('link');
    linkElement.rel = 'stylesheet';
    linkElement.href = cssURL;
    linkElement.onload = () => {
        // ロードが成功したら、loadedCSSURLを更新する
        loadedCSSURL = cssURL;
        resolve(); // ロードが成功したらresolve()を呼び出す
    };
    linkElement.onerror = () => {
        reject(new Error(`Failed to load CSS file: ${cssURL}`)); // ロードが失敗したらreject()を呼び出す
    };
    document.head.appendChild(linkElement);
});
}

// 前のページのCSSファイルをアンロードする関数
function unloadPageSpecificCSS() {
if (loadedCSSURL) {
    // 読み込まれているCSSファイルをlink要素から削除する
    const linkElements = document.querySelectorAll(`link[href="${loadedCSSURL}"]`);
    linkElements.forEach((element) => {
        element.parentNode.removeChild(element);
    });
    // loadedCSSURLをリセットする
    loadedCSSURL = null;
}
}

// loadPageSpecificJS関数をPromiseを返すように変更
function loadPageSpecificJS(pageId) {
return new Promise((resolve, reject) => {
// ページごとに適切なJSファイルのURLを定義
let jsURL;
switch (pageId) {
    case 'page1':
        jsURL = 'js/page1.js';
        break;
    case 'page2':
        jsURL = 'js/page2.js';
        break;
    case 'page3':
        jsURL = 'js/page3.js';
        break;
    case 'page4':
        jsURL = 'js/page4.js';
        break;
    case 'page5':
        jsURL = 'js/page5.js';
        break;
    default:
        reject(new Error('Invalid pageId'));
}

// すでにロードされているJSファイルがある場合、アンロードする
if (loadedJSURL) {
    unloadPageSpecificJS();
}


// Script要素を作成してJSファイルをロードする
const scriptElement = document.createElement('script');
scriptElement.src = jsURL;
scriptElement.onload = () => {
    // ロードが成功したら、loadedJSURLを更新する
    loadedJSURL = jsURL;
    resolve(); // ロードが成功したらresolve()を呼び出す
};
scriptElement.onerror = () => {
    reject(new Error(`Failed to load JS file: ${jsURL}`)); // ロードが失敗したらreject()を呼び出す
};
document.body.appendChild(scriptElement);
});
}

// 前のページのJSファイルをアンロードする関数
function unloadPageSpecificJS() {
if (loadedJSURL) {
// 読み込まれているJSファイルをScript要素から削除する
const scriptElements = document.querySelectorAll(`script[src="${loadedJSURL}"]`);
scriptElements.forEach((element) => {
    element.parentNode.removeChild(element);
});
// loadedJSURLをリセットする
loadedJSURL = null;
}
}

// storeAndReloadPage関数を定義
function storeAndReloadPage(pageId) {
// ページのIDをセッションストレージに保存
sessionStorage.setItem('gomicheckerTargetPage', pageId);

// ページをリロード
window.location.reload();
}

// ページロード時の初期設定
document.addEventListener('DOMContentLoaded', function () {
// セッションストレージから保存されたページIDと選択されたレベルを取得
var targetPage = sessionStorage.getItem('gomicheckerTargetPage');
var selectedLevel = sessionStorage.getItem('gomicheckerSelectedLevel');

if (targetPage) {
    // セッションストレージにページIDが保存されている場合、対応するページを表示
    togglePage(targetPage);
    toggleMenu();

    // セッションストレージから保存されたページIDを削除
    sessionStorage.removeItem('gomicheckerTargetPage');
} else {
    // セッションストレージにページIDが保存されていない場合、初期ページを表示
    togglePage('page1');
    toggleMenu();
}

if (selectedLevel) {
    // セッションストレージに選択されたレベルが保存されている場合、レベルを表示するselect要素に反映させる
    var levelSelect = document.getElementById('levelSelect');
    levelSelect.value = selectedLevel;
}

});