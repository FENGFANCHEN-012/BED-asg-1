// ========================
// CONFIGURATION
// ========================
const API_BASE = "http://localhost:3000/api";

// Retrieve user ID from token
let user_id = null;
const token = localStorage.getItem('jwtToken');
if (token) {
  try {
    const decoded = JSON.parse(atob(token.split('.')[1]));
    user_id = decoded.user_id;
  } catch (e) {
    console.error('Invalid token:', e);
    showError("Session expired. Please log in again.");
    window.location.href = "/";
  }
}
if (!user_id) {
  showError("Unauthorized. Please log in.");
  window.location.href = "/";
}

// ========================
// Inject Custom Alert Styles
// ========================
function injectAlertStyles() {
  const style = document.createElement('style');
  style.textContent = `
    .alert-overlay { position: fixed; top:0; left:0; right:0; bottom:0;
      background: rgba(0,0,0,0.85); display:flex;
      justify-content:center; align-items:center; z-index:99999; }
    .alert-box { background:#fff; padding:50px 60px;
      border-radius:25px; box-shadow:0 15px 40px rgba(0,0,0,0.5);
      width:70%; max-width:700px; min-width:500px;
      text-align:center; border:4px solid #f5f5f5; }
    .alert-message { font-size:32px; margin-bottom:40px;
      color:#111; line-height:1.8; font-weight:600;
      letter-spacing:1px; }
    .alert-button { background:#1E4A9B; color:#fff; border:none;
      padding:25px 50px; font-size:28px; border-radius:15px;
      cursor:pointer; transition:all .3s; min-width:250px;
      box-shadow:0 8px 16px rgba(0,0,0,0.2);
      font-weight:600; letter-spacing:1px; }
    .alert-button:hover { background:#265BB8;
      transform:translateY(-3px); box-shadow:0 12px 24px rgba(0,0,0,0.3); }
    .alert-button:active { transform:translateY(2px);
      box-shadow:0 4px 8px rgba(0,0,0,0.2); }
    @media (max-width:768px) {
      .alert-box { width:90%; min-width:90%; padding:40px 30px; }
      .alert-message { font-size:28px; margin-bottom:30px; }
      .alert-button { font-size:24px; padding:20px 40px; min-width:80%; }
    }`;
  document.head.appendChild(style);
}
injectAlertStyles();

function showAlert(message, buttonText = 'OK', onClose = null) {
  const overlay = document.createElement('div');
  overlay.className = 'alert-overlay';
  const alertBox = document.createElement('div'); alertBox.className = 'alert-box';
  const messageEl = document.createElement('div'); messageEl.className = 'alert-message';
  messageEl.textContent = message;
  const btn = document.createElement('button'); btn.className = 'alert-button';
  btn.textContent = buttonText;
  btn.onclick = () => {
    document.body.removeChild(overlay);
    if (typeof onClose === 'function') onClose();
  };
  alertBox.append(messageEl, btn);
  overlay.appendChild(alertBox);
  document.body.appendChild(overlay);
}
const showSuccess = (msg = 'Success!') => showAlert(msg);
const showError = (msg = 'Something went wrong.') => showAlert(msg, 'Try Again');

// ========================
// DOM Element References
// ========================
const tempElem = document.getElementById("temperature");
const humidElem = document.getElementById("humidity");
const uvElem = document.getElementById("uv");
const precipElem = document.getElementById("precipitation");
const psiElem = document.getElementById("psi");
const tipElem = document.getElementById("weatherTip");
const nowcastTable = document.getElementById("nowcast-table");
const rainAlert = document.getElementById("rainAlert");
const alertPlaceholder = document.getElementById("weatherAlertPlaceholder");

// ========================
// Text-to-Speech
// ========================
function readAloud() {
  const tips = Array.from(tipElem.querySelectorAll("li")).map(el => el.textContent).join(". ");
  const msg = new SpeechSynthesisUtterance(
    `Here's the current weather in Singapore. Temperature: ${tempElem.innerText}, Humidity: ${humidElem.innerText}, Precipitation Chance: ${precipElem.innerText}, UV Index: ${uvElem.innerText}, PSI: ${psiElem.innerText}. Tips: ${tips}`
  );
  msg.rate = 1; msg.pitch = 1;
  speechSynthesis.speak(msg);
}

// ========================
// Update Last Updated Time
// ========================
function showLastUpdated() {
  const now = new Date();
  document.getElementById("last-updated").textContent = `⏱️ Last updated: ${now.toLocaleString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit', hour12: true
  })}`;
}

// ========================
// Reverse Geocoding
// ========================
async function reverseGeocode(lat, lon) {
  try {
    const res = await fetch(`https://developers.onemap.sg/commonapi/revgeocode?latitude=${lat}&longitude=${lon}&buffer=200&addressType=All`);
    const data = await res.json();
    const result = data.GeocodeInfo?.[0];
    return result ? `${result.BLOCK ?? ''} ${result.ROAD ?? ''}`.trim() || result.POSTAL : "Singapore";
  } catch (err) {
    console.error("Reverse geocode failed:", err);
    return "Singapore";
  }
}
navigator.geolocation.getCurrentPosition(
  async ({ coords }) => {
    const address = await reverseGeocode(coords.latitude, coords.longitude);
    document.getElementById("user-location").textContent = `📍 Your location: ${address}`;
  },
  () => {
    document.getElementById("user-location").textContent = `📍 Your location: Unavailable`;
  }
);

// ========================
// Fetch Weather Data
// ========================
async function fetchWeatherData() {
  try {
    const [tempRes, humidRes, uvRes, nowcastRes, psiRes, forecastRes] = await Promise.all([
      fetch("https://api.data.gov.sg/v1/environment/air-temperature").then(r => r.json()),
      fetch("https://api.data.gov.sg/v1/environment/relative-humidity").then(r => r.json()),
      fetch("https://api.data.gov.sg/v1/environment/uv-index").then(r => r.json()),
      fetch("https://api.data.gov.sg/v1/environment/2-hour-weather-forecast").then(r => r.json()),
      fetch("https://api.data.gov.sg/v1/environment/psi").then(r => r.json()),
      fetch("https://api.data.gov.sg/v1/environment/24-hour-weather-forecast").then(r => r.json())
    ]);

    const temperature = tempRes.items[0]?.readings[0]?.value ?? "--";
    const humidity = humidRes.items[0]?.readings[0]?.value ?? "--";
    const uv = uvRes.items[0]?.index[0]?.value ?? "N/A";
    const psi = psiRes.items[0]?.readings.psi_twenty_four_hourly["west"] ?? "--";

    tempElem.innerText = `${temperature} °C`;
    humidElem.innerText = `${humidity} %`;
    uvElem.innerText = uv;
    psiElem.innerText = psi;

    const general = (forecastRes.items || [])[0]?.general || {};
    precipElem.innerText = general.forecast || "N/A";

    if (humidity >= 85) rainAlert.classList.remove("d-none");

    const tips = [];
    if (humidity >= 85) tips.push("High humidity today — rain is likely. Bring an umbrella!");
    if (psi >= 100) tips.push("Air quality isn’t great. Consider wearing a mask when you head out.");
    if (temperature >= 34) tips.push("Hot day ahead! Bring a mini fan and stay hydrated.");
    if (parseFloat(uv) >= 7) tips.push("UV is high today. Wear sunscreen!");
    if (tips.length === 0) tips.push("Have a pleasant day!");
    tipElem.innerHTML = tips.map(t => `<li>${t}</li>`).join("");

    const zoneMap = { North:"Yishun", South:"Sentosa", East:"Changi", West:"Jurong East", Central:"City" };
    const nowItems = nowcastRes.items?.[0]?.forecasts ?? [];
    const rows = [];
    Object.entries(zoneMap).forEach(([zone, town]) => {
      const entry = nowItems.find(f => f.area === town);
      rows.push(`<tr><td>${zone}</td><td>${entry ? entry.forecast : 'N/A'}</td></tr>`);
    });
    nowcastTable.innerHTML = rows.join('') || `<tr><td colspan="2">No forecast available right now.</td></tr>`;

    const forecastContainer = document.getElementById("forecast-cards");
    forecastContainer.innerHTML = "";
    const today = new Date();
    for (let i = 1; i <= 3; i++) {
      const future = new Date(today); future.setDate(today.getDate() + i);
      const label = future.toLocaleDateString('en-GB', {
        weekday: 'long', day: '2-digit', month: '2-digit'
      });
      forecastContainer.innerHTML += `
        <div class="col-md-4 mb-3">
          <div class="card p-3 shadow-sm"><h5>${label}</h5><p>${general.forecast}</p></div>
        </div>`;
    }

    showLastUpdated();
  } catch (err) {
    console.error(err);
    showError("Unable to fetch weather data. Please try again later.");
  }
}

// ========================
// Alert Form Submission
// ========================
document.getElementById("alertForm").addEventListener("submit", async e => {
  e.preventDefault();
  const weather = document.querySelector('input[name="weatherType"]:checked')?.value;
  const time = document.querySelector('input[name="alertTime"]:checked')?.value;
  if (!weather || !time) return showError("Please select both weather type and time.");

  try {
    const res = await fetch(`${API_BASE}/alerts`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id, weather_type: weather, alert_time: parseInt(time) })
    });
    const result = await res.json();
    if (res.ok) {
      showSuccess(result.message || "Alert saved!");
      loadUserAlerts();
    } else {
      showError(result.error || "Failed to save alert.");
    }
  } catch (err) {
    console.error(err);
    showError("Server error. Please try again later.");
  }
});

async function loadUserAlerts() {
  try {
    const res = await fetch(`${API_BASE}/alerts?user_id=${user_id}`);
    const alerts = await res.json();
    const table = document.getElementById("saved-alerts");
    table.innerHTML = "";
    if (!alerts.length) {
      table.innerHTML = `<tr><td colspan="4">No saved alerts.</td></tr>`;
    } else {
      alerts.forEach(alert => {
        const row = document.createElement("tr");
        row.innerHTML = `
          <td>${alert.weather_type}</td>
          <td>${alert.alert_time} min</td>
          <td>${new Date(alert.created_at).toLocaleString()}</td>
          <td><button class="btn btn-sm btn-danger" onclick="deleteAlert(${alert.id})">Delete</button></td>
        `;
        table.appendChild(row);
      });
    }
  } catch (err) {
    console.error(err);
    showError("Failed to load alerts.");
  }
}

async function deleteAlert(alertId) {
  try {
    const res = await fetch(`${API_BASE}/alerts/${alertId}`, { method: 'DELETE' });
    const result = await res.json();
    if (res.ok) {
      showSuccess(result.message || "Alert deleted.");
      loadUserAlerts();
    } else {
      showError(result.error || "Failed to delete alert.");
    }
  } catch (err) {
    console.error(err);
    showError("Server error.");
  }
}

async function deleteAllAlerts() {
  if (!confirm("Are you sure you want to delete all alerts?")) return;
  try {
    const res = await fetch(`${API_BASE}/alerts?user_id=${user_id}`, { method: 'DELETE' });
    const result = await res.json();
    if (res.ok) {
      showSuccess(result.message || "All alerts deleted.");
      loadUserAlerts();
    } else {
      showError(result.error || "Failed to delete alerts.");
    }
  } catch (err) {
    console.error(err);
    showError("Server error.");
  }
}

// ========================
// INIT
// ========================
fetchWeatherData();
loadUserAlerts();
