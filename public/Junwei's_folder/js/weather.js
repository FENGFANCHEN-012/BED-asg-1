// Inject Alert Styles
function injectAlertStyles() {
  const style = document.createElement('style');
  style.textContent = `
    .alert-overlay { position: fixed; top:0;left:0;right:0;bottom:0; background: rgba(0,0,0,0.85); display:flex; justify-content:center; align-items:center; z-index:99999; }
    .alert-box { background:#fff; padding:50px 60px; border-radius:25px; box-shadow:0 15px 40px rgba(0,0,0,0.5); width:70%; max-width:700px; min-width:500px; text-align:center; border:4px solid #f5f5f5; }
    .alert-message { font-size:32px; margin-bottom:40px; color:#111; line-height:1.8; font-weight:600; letter-spacing:1px; }
    .alert-button { background:#1E4A9B; color:#fff; border:none; padding:25px 50px; font-size:28px; border-radius:15px; cursor:pointer; transition:all .3s; min-width:250px; box-shadow:0 8px 16px rgba(0,0,0,0.2); font-weight:600; letter-spacing:1px; }
    .alert-button:hover { background:#265BB8; transform:translateY(-3px); box-shadow:0 12px 24px rgba(0,0,0,0.3); }
    .alert-button:active { transform:translateY(2px); box-shadow:0 4px 8px rgba(0,0,0,0.2); }
    @media (max-width:768px) {
      .alert-box { width:90%; min-width:90%; padding:40px 30px; }
      .alert-message { font-size:28px; margin-bottom:30px; }
      .alert-button { font-size:24px; padding:20px 40px; min-width:80%; }
    }`;
  document.head.appendChild(style);
}
injectAlertStyles();

function showAlert(message, buttonText = 'OK', onClose = null) {
  const overlay = document.createElement('div'); overlay.className = 'alert-overlay';
  const alertBox = document.createElement('div'); alertBox.className = 'alert-box';
  const messageElement = document.createElement('div'); messageElement.className = 'alert-message'; messageElement.textContent = message;
  const button = document.createElement('button'); button.className = 'alert-button'; button.textContent = buttonText;
  alertBox.appendChild(messageElement); alertBox.appendChild(button); overlay.appendChild(alertBox); document.body.appendChild(overlay);
  button.onclick = () => { document.body.removeChild(overlay); onClose && onClose(); };
}
function showSuccess(message = 'Success!') { showAlert(message, 'OK'); }
function showError(message = 'An error occurred') { showAlert(message, 'Try Again'); }

// Main Functionality
const tempElem = document.getElementById("temperature");
const humidElem = document.getElementById("humidity");
const uvElem = document.getElementById("uv");
const precipElem = document.getElementById("precipitation");
const psiElem = document.getElementById("psi");
const tipElem = document.getElementById("weatherTip");
const nowcastTable = document.getElementById("nowcast-table");
const rainAlert = document.getElementById("rainAlert");

function readAloud() {
  const msg = new SpeechSynthesisUtterance(
    `The weather now: ${tempElem.innerText}, humidity ${humidElem.innerText}, precipitation ${precipElem.innerText}, UV index ${uvElem.innerText}, air quality PSI ${psiElem.innerText}.`
  );
  speechSynthesis.speak(msg);
}

function showLastUpdated() {
  const now = new Date();
  const str = now.toLocaleString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit', hour12: true
  });
  document.getElementById("last-updated").textContent = `⏱️ Last updated: ${str}`;
}

navigator.geolocation.getCurrentPosition(
  pos => {
    const { latitude, longitude } = pos.coords;
    document.getElementById("user-location").textContent = `📍 Your location: ${latitude.toFixed(3)}, ${longitude.toFixed(3)}`;
  },
  () => {
    document.getElementById("user-location").textContent = `📍 Your location: Unavailable`;
  }
);

document.getElementById("alertForm").addEventListener("submit", e => {
  e.preventDefault();
  const weather = document.querySelector('input[name="weatherType"]:checked')?.value;
  const time = document.querySelector('input[name="alertTime"]:checked')?.value;
  if (!weather || !time) return showError("Please select both weather type and time.");
  sessionStorage.setItem("weatherAlert", JSON.stringify({ weather, time }));
  showSuccess(`You will be alerted for ${weather} weather ${time} minutes before.`);
});

async function fetchWeatherData() {
  try {
    const [tR, hR, uvR, nowR, psiR, fR] = await Promise.all([
      fetch('https://api.data.gov.sg/v1/environment/air-temperature').then(r => r.json()),
      fetch('https://api.data.gov.sg/v1/environment/relative-humidity').then(r => r.json()),
      fetch('https://api.data.gov.sg/v1/environment/uv-index').then(r => r.json()),
      fetch('https://api.data.gov.sg/v1/environment/2-hour-weather-forecast').then(r => r.json()),
      fetch('https://api.data.gov.sg/v1/environment/psi').then(r => r.json()),
      fetch('https://api.data.gov.sg/v1/environment/24-hour-weather-forecast').then(r => r.json())
    ]);

    const temp = tR.items[0].readings[0].value;
    const humid = hR.items[0].readings[0].value;
    const uv = uvR.items[0].index[0]?.value ?? "N/A";
    const psi = psiR.items[0].readings.psi_twenty_four_hourly["west"];
    tempElem.innerText = `${temp} °C`;
    humidElem.innerText = `${humid} %`;
    uvElem.innerText = uv;
    psiElem.innerText = psi;

    const regions = ["north", "south", "east", "west", "central"];
    const filtered = nowR.items[0].forecasts.filter(f => regions.includes(f.area.toLowerCase()));
    nowcastTable.innerHTML = filtered.map(f => `<tr><td>${f.area}</td><td>${f.forecast}</td></tr>`).join('');

    const rainSoon = filtered.some(f => /rain/i.test(f.forecast));
    precipElem.innerText = rainSoon ? "High" : "Low";
    if (rainSoon) rainAlert.classList.remove("d-none");

    const now = new Date();
    const fb = fR.items[0];
    let cards = '';
    for (let i = 1; i <= 3; i++) {
      const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() + i);
      const dp = d.toLocaleDateString('en-GB', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' });
      cards += `<div class="col-md-4 mb-3"><div class="card p-3"><h5>${dp}</h5><p>${fb.general.forecast}</p></div></div>`;
    }
    document.getElementById("forecast-cards").innerHTML = cards;

    tipElem.innerText = rainSoon
      ? "Remember to bring an umbrella!"
      : (uv >= 7 ? "UV's high today, apply sunscreen!" : "Have a great day!");

    showLastUpdated();
  } catch (err) {
    console.error(err);
    showError("Error fetching weather data. Try again later.");
  }
}

fetchWeatherData();
