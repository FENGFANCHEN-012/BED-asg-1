const API_HISTORY_URL = "http://localhost:3000/medications/history";

document.addEventListener("DOMContentLoaded", () => {
  fetchHistory();
});

async function fetchHistory() {
  try {
    const res = await fetch(API_HISTORY_URL);
    const history = await res.json();
    renderHistory(history);
  } catch (err) {
    console.error("Failed to fetch history:", err);
    document.getElementById("historyList").innerHTML = "<p>Unable to load history.</p>";
  }
}

function renderHistory(data) {
  const container = document.getElementById("historyList");
  container.innerHTML = "";
  if (data.length === 0) {
    container.innerHTML = "<p>No history logged yet.</p>";
    return;
  }

  data.forEach(entry => {
    const time = new Date(entry.taken_at).toLocaleString();
    const div = document.createElement("div");
    div.className = "med-item";
    div.innerHTML = `
      <strong>${entry.name} (${entry.dosage})</strong><br />
      <small>Taken at: ${time}</small>
    `;
    container.appendChild(div);
  });
}

