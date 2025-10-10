// ====== 各自のAPIキーを入れてください ======
const API_KEY = "ここに自分のOpenWeatherMap APIキー";

const cityInput = document.getElementById("cityInput");
const searchBtn = document.getElementById("searchBtn");
const geoBtn = document.getElementById("geoBtn");
const statusEl = document.getElementById("status");
const resultEl = document.getElementById("result");

// 検索ボタン
searchBtn.addEventListener("click", () => {
  const city = cityInput.value.trim();
  if (!city) {
    setStatus("都市名を入力してください。");
    return;
  }
  fetchByCity(city);
});

// Enterキーでも検索
cityInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") searchBtn.click();
});

// 現在地ボタン
geoBtn.addEventListener("click", () => {
  if (!navigator.geolocation) {
    setStatus("この端末では現在地取得に対応していません。");
    return;
  }
  setStatus("現在地から検索中…");
  navigator.geolocation.getCurrentPosition(
    (pos) => {
      const { latitude, longitude } = pos.coords;
      fetchByGeo(latitude, longitude);
    },
    (err) => {
      console.warn(err);
      setStatus("現在地の取得を許可してください。");
    },
    { enableHighAccuracy: true, timeout: 8000 }
  );
});

// 都市名で検索
async function fetchByCity(city) {
  setStatus(`「${city}」の天気を取得中…`);
  const url = makeUrl({ q: city });
  await fetchAndRender(url);
}

// 緯度経度で検索
async function fetchByGeo(lat, lon) {
  const url = makeUrl({ lat, lon });
  await fetchAndRender(url);
}

// API URL生成（日本語＆摂氏）
function makeUrl(params) {
  const base = "https://api.openweathermap.org/data/2.5/weather";
  const url = new URL(base);
  Object.entries({
    ...params,
    appid: API_KEY,
    units: "metric",
    lang: "ja",
  }).forEach(([k, v]) => url.searchParams.set(k, v));
  return url.toString();
}

// 取得→描画
async function fetchAndRender(url) {
  try {
    const res = await fetch(url);
    if (!res.ok) {
      if (res.status === 401) throw new Error("APIキーが不正です（401）");
      if (res.status === 404) throw new Error("都市名が見つかりません（404）");
      throw new Error(`取得に失敗しました（${res.status}）`);
    }
    const data = await res.json();
    render(data);
    setStatus("取得完了");
  } catch (e) {
    setStatus("エラー：" + e.message);
    resultEl.innerHTML = `<p class="muted">データの取得に失敗しました。都市名・APIキーをご確認ください。</p>`;
    console.error(e);
  }
}

// 画面描画
function render(data) {
  const name = `${data.name}, ${data.sys?.country ?? ""}`;
  const temp = Math.round(data.main?.temp);
  const feels = Math.round(data.main?.feels_like);
  const desc = data.weather?.[0]?.description ?? "";
  const icon = data.weather?.[0]?.icon
    ? `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`
    : "";
  const humid = data.main?.humidity;
  const wind = data.wind?.speed;
  const dt = data.dt ? new Date(data.dt * 1000) : new Date();
  const time = dt.toLocaleString("ja-JP");

  resultEl.innerHTML = `
    <h2>${escapeHtml(name)}</h2>
    <div class="row">
      ${icon ? `<img src="${icon}" alt="${desc}" />` : ""}
      <div class="meta">
        <div class="kv"><b>${temp ?? "-"}℃</b>（体感 ${feels ?? "-"}℃）</div>
        <div>${escapeHtml(desc)}</div>
        <div>湿度：${humid ?? "-"}％　風速：${wind ?? "-"} m/s</div>
        <div class="muted">更新：${time}</div>
      </div>
    </div>
  `;
}

function setStatus(msg) {
  statusEl.textContent = msg;
}

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, (s) => {
    const map = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
    return map[s];
  });
}

cityInput.focus();