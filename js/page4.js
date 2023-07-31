function loadMap() {
    // 既に一度呼び出されている場合は、何もせずに関数を終了
    if (isPage4Done) {
        return;
    }

    initializeMap();
    window.addEventListener("resize", resizeMap); // ウィンドウのリサイズイベントを監視
    resizeMap(); // 初回読み込み時に地図のサイズを調整

    isPage4Done = true;
}

// 画面の幅と高さに応じて地図のサイズをリサイズする関数
function resizeMap() {
    const mapContainer = document.getElementById("map-container");
    mapContainer.style.height = window.innerHeight - 60 + 'px'; // 画面高さから上部メニューの高さを引いた分に合わせる

    if (map) {
        map.invalidateSize(); // 地図のサイズを更新
    }
}

// 現在地のマーカーを格納する変数
let currentLocationMarker = null;

// 地図を初期化する関数
function initializeMap() {
    const map = L.map('map');
    // デフォルトの緯度経度（越前市役所）
    const defaultLat = 35.90405283816124;
    const defaultLng = 136.16881110592442;
    const defaultZoom = 16; // デフォルトのズームレベル

    // 現在地のマーカーを追加する関数
    function addCurrentLocationMarker(latitude, longitude) {
        if (currentLocationMarker) {
            // すでにマーカーが存在する場合は、位置を更新
            currentLocationMarker.setLatLng([latitude, longitude]);
        } else {
            // マーカーが存在しない場合は、新しく作成して地図に追加
            currentLocationMarker = L.marker([latitude, longitude], {
                icon: L.icon({
                    iconUrl: 'image/icon.png', // カスタムマーカーアイコンのパスを指定
                    iconSize: [50, 50], // アイコンのサイズを指定
                }),
            }).addTo(map);
        }
    }

    // Geolocation APIを使用して現在の位置を取得します
    if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
            function (position) {
                const latitude = position.coords.latitude;
                const longitude = position.coords.longitude;

                // 現在地に色違いのマーカーを追加
                addCurrentLocationMarker(latitude, longitude);

                map.setView([latitude, longitude], defaultZoom); // 現在の位置をセンタリングしてズームレベルを設定

                // 国土地理院のタイルサーバーのURLを指定します
                const tileUrl = 'https://cyberjapandata.gsi.go.jp/xyz/std/{z}/{x}/{y}.png';

                // タイルレイヤーを作成して地図に追加します
                L.tileLayer(tileUrl, {
                    attribution: '<a href="https://maps.gsi.go.jp/development/ichiran.html">地理院タイル</a>'
                }).addTo(map);


                // マーカーをクリックしたときにポップアップ表示
                currentLocationMarker.bindPopup('現在地');

                // CSVデータを読み込んでマーカーを配置する
                fetchCSV().then((csvData) => {
                    addMarkersFromCSV(map, csvData);
                });

                // 位置情報が変更された際に実行されるイベントリスナーを追加
                navigator.geolocation.watchPosition(
                    function (position) {
                        const latitude = position.coords.latitude;
                        const longitude = position.coords.longitude;

                        // 現在地のマーカーの位置をリアルタイムで更新
                        addCurrentLocationMarker(latitude, longitude);
                    },
                    function (error) {
                        console.error('現在地情報の取得に失敗しました:', error);
                    }
                );
            },
            function (error) {
                // Geolocationがブロックされた場合やエラーが発生した場合はデフォルトの位置を設定
                map.setView([defaultLat, defaultLng], defaultZoom);

                // 国土地理院のタイルサーバーのURLを指定します
                const tileUrl = 'https://cyberjapandata.gsi.go.jp/xyz/std/{z}/{x}/{y}.png';

                // タイルレイヤーを作成して地図に追加します
                L.tileLayer(tileUrl, {
                    attribution: '<a href="https://maps.gsi.go.jp/development/ichiran.html">地理院タイル</a>'
                }).addTo(map);

                // CSVデータを読み込んでマーカーを配置する
                fetchCSV().then((csvData) => {
                    addMarkersFromCSV(map, csvData);
                });
            }
        );
    } else {
        alert("Geolocationは利用できません");
    }

    return map;
}

// CSVデータを読み込む関数
async function fetchCSV() {
    try {
        const response = await fetch(csvURL7); // CSVファイルのパスを指定して読み込み
        const data = await response.text();
        return data;
    } catch (error) {
        console.error('CSV読み込みエラー:', error);
    }
}

// CSVデータからマーカーを配置する関数
function addMarkersFromCSV(map, csvData) {
    const lines = csvData.replace(/\r/g, '').split('\n'); // 改行で行に分割
    const header = lines[0].split(','); // ヘッダー行を取得
    const markers = [];

    // ヘッダー行を処理して、各項目のインデックスを取得
    const nameIndex = header.indexOf('施設名称');
    const phoneNumberIndex = header.indexOf('電話番号');
    const postalCodeIndex = header.indexOf('郵便番号');
    const addressIndex = header.indexOf('所在地');
    const openingHoursIndex = header.indexOf('開館時間');
    const closingDaysIndex = header.indexOf('休館日');
    const admissionFeeIndex = header.indexOf('入館料');
    const latitudeIndex = header.indexOf('緯度');
    const longitudeIndex = header.indexOf('経度');

    // ヘッダー行以降のデータを処理
    for (let i = 1; i < lines.length - 1; i++) {
        const data = lines[i].split(',');

        // 各項目の値を取得
        const locationName = data[nameIndex];

        // 「清掃センター」を含むデータのみ処理
        if (locationName.includes('清掃センター')) {
            const phoneNumber = data[phoneNumberIndex];
            const postalCode = data[postalCodeIndex];
            const address = data[addressIndex];
            const openingHours = data[openingHoursIndex];
            const closingDays = data[closingDaysIndex];
            const admissionFee = data[admissionFeeIndex];
            const latitude = parseFloat(data[latitudeIndex]);
            const longitude = parseFloat(data[longitudeIndex]);

            // マーカーを作成して地図に追加
            const marker = L.marker([latitude, longitude]).addTo(map);

            // ポップアップに情報を表形式で表示
            let popupContent = `<b>${locationName}</b><br><br>`;
            popupContent += '<table class="nowrap">';
            if (phoneNumber) popupContent += `<tr><td>電話番号</td><td><a href="tel:${phoneNumber}">${phoneNumber}</a></td></tr>`;
            if (postalCode) popupContent += `<tr><td>郵便番号</td><td>${postalCode}</td></tr>`;
            if (address) popupContent += `<tr><td>所在地</td><td>${address}</td></tr>`;
            if (openingHours) popupContent += `<tr><td>開館時間</td><td>${openingHours}</td></tr>`;
            if (closingDays) popupContent += `<tr><td>休館日</td><td>${closingDays}</td></tr>`;
            if (admissionFee) popupContent += `<tr><td>入館料</td><td>${admissionFee}</td></tr>`;
            popupContent += '</table>';


            marker.bindPopup(popupContent); // ポップアップに情報を設定
            markers.push(marker);
        }
    }

    // マーカーが収まるように地図をフィットさせる
    const group = new L.featureGroup(markers);
    map.fitBounds(group.getBounds());

    return markers;
}

