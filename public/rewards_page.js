// public/js/rewards_page.js

const USER_ID = 1;
const API_BASE = '/api';

async function fetchPoints() {
  const res = await fetch(`${API_BASE}/points`, { headers: { 'x-user-id': USER_ID } });
  const { points } = await res.json();
  document.getElementById('user-points').innerHTML = `<span>${points}</span>`;
}

async function fetchCart() {
  const res = await fetch(`${API_BASE}/cart`, { headers: { 'x-user-id': USER_ID } });
  const { cart } = await res.json();
  const listEl = document.getElementById('cart-list');
  listEl.innerHTML = '';
  let total = 0;
  cart.forEach(item => {
    total += item.cost_points * item.quantity;
    const li = document.createElement('li');
    li.innerHTML = `
      <span>${item.quantity}× ${item.title}</span>
      <span>${item.cost_points * item.quantity} LC 
        <button class="btn btn-link btn-sm" onclick="removeFromCart(${item.cart_id})">remove</button>
      </span>
    `;
    listEl.appendChild(li);
  });
  document.getElementById('total-cost').textContent = `${total} LionCoins`;
}

async function addToCart(voucherId) {
  await fetch(`${API_BASE}/cart`, {
    method: 'POST',
    headers: { 'x-user-id': USER_ID, 'Content-Type': 'application/json' },
    body: JSON.stringify({ voucher_id: voucherId, quantity: 1 })
  });
  fetchCart();
}

async function removeFromCart(cartId) {
  await fetch(`${API_BASE}/cart/${cartId}`, {
    method: 'DELETE',
    headers: { 'x-user-id': USER_ID }
  });
  fetchCart();
}

document.addEventListener('DOMContentLoaded', () => {
  fetchPoints();
  fetchCart();
});
