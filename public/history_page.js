// public/js/history_page.js
const USER_ID = 1;
const API_BASE = '/api';

async function fetchHistory() {
  try {
    const res = await fetch(`${API_BASE}/history`, {
      headers: { 'x-user-id': USER_ID }
    });
    if (!res.ok) throw new Error('Failed to fetch history');

    const { history } = await res.json();
    const listEl = document.getElementById('history-list');
    listEl.innerHTML = '';

    if (history.length === 0) {
      listEl.innerHTML = '<li>No voucher history found.</li>';
      return;
    }

    history.forEach(item => {
      const totalPts = item.cost_points * item.quantity;
      const li = document.createElement('li');
      li.innerHTML = `
        <span class="entry-text">
          ${item.voucher_title} × ${item.quantity}
          <span class="timestamp">${new Date(item.redeemed_at).toLocaleString()}</span>
        </span>
        <span class="points">${totalPts} LC</span>
      `;
      listEl.appendChild(li);
    });
  } catch (err) {
    console.error(err);
    document.getElementById('history-list').innerHTML =
      '<li>Unable to load history.</li>';
  }
}

document.addEventListener('DOMContentLoaded', fetchHistory);
