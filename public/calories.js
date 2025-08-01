const user_id = 3;
let quantity = 1;
let selectedFoodId = null;
const qtyDisplay = document.getElementById('quantity');
const decreaseBtn = document.getElementById('decreaseBtn');
const increaseBtn = document.getElementById('increaseBtn');
const foodInput = document.getElementById('foodInput');

function showAlert(msg, btnText = 'OK', onClose = null) {
  const overlay = document.createElement('div');
  overlay.className = 'alert-overlay';
  overlay.innerHTML = `
    <div class="alert-box" role="alert" aria-live="assertive">
      <div class="alert-message">${msg}</div>
      <button class="alert-button">${btnText}</button>
    </div>`;
  document.body.appendChild(overlay);
  overlay.querySelector('.alert-button').onclick = () => {
    overlay.remove();
    if (onClose) onClose();
  };
}

function showSuccess(txt) { showAlert(txt, 'OK'); }
function showError(txt) { showAlert(txt, 'Try Again'); }

increaseBtn.onclick = () => {
  quantity++;
  qtyDisplay.textContent = quantity;
  decreaseBtn.disabled = quantity <= 1;
};

decreaseBtn.onclick = () => {
  if (quantity > 1) {
    quantity--;
    qtyDisplay.textContent = quantity;
    decreaseBtn.disabled = quantity <= 1;
  }
};

document.querySelectorAll('.btn-outline-primary').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.btn-outline-primary').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
  });
});

let debounceTimer;
foodInput.addEventListener('input', () => {
  selectedFoodId = null;
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(fetchFoods, 300);
});

async function fetchFoods() {
  const q = foodInput.value.trim();
  if (q.length < 2) return;

  try {
    const res = await fetch(`http://localhost:3000/api/food/search?q=${encodeURIComponent(q)}`);
    const foods = await res.json();
    let dropdown = document.getElementById('foodDropdown');
    if (!dropdown) {
      dropdown = document.createElement('div');
      dropdown.id = 'foodDropdown';
      dropdown.className = 'list-group position-absolute';
      foodInput.parentNode.appendChild(dropdown);
    }
    dropdown.innerHTML = '';
    foods.forEach(food => {
      const item = document.createElement('button');
      item.type = 'button';
      item.className = 'list-group-item list-group-item-action';
      item.textContent = `${food.food_name} (${food.calories_per_unit} cal/unit)`;
      item.onclick = () => {
        foodInput.value = food.food_name;
        selectedFoodId = food.food_id;
        dropdown.remove();
      };
      dropdown.appendChild(item);
    });
  } catch (e) {
    console.error(e);
  }
}

async function loadCalorieGraph() {
  try {
    const res = await fetch(`http://localhost:3000/api/graph?user_id=${user_id}`);
    const { totalCalories, recommended } = await res.json();
    const div = document.getElementById('calorieGraph');
    div.innerHTML = `<h1>${totalCalories} kcal</h1><p>Recommended: ${recommended} kcal</p>`;
    const ratio = totalCalories / recommended;
    div.style.backgroundColor = ratio < 0.8 ? '#d4edda' : ratio <= 1 ? '#fff3cd' : '#f8d7da';

    const message = document.getElementById('intake-message');
    if (ratio < 0.5) message.textContent = "Your calories intake is still low. Please eat more to stay healthy.";
    else if (ratio < 0.8) message.textContent = "Your calorie intake is moderate. Consider eating a bit more.";
    else if (ratio <= 1.2) message.textContent = "Well done! Your calorie intake level is healthy.";
    else message.textContent = "Your calorie intake is very high. Try to eat lighter foods and exercise more.";

    loadFoodRecommendations(recommended - totalCalories);
  } catch (e) {
    console.error(e);
  }
}

async function loadHistory() {
  try {
    const res = await fetch(`http://localhost:3000/api/history?user_id=${user_id}`);
    const data = await res.json();
    const history = document.getElementById('history');
    history.innerHTML = '';
    data.forEach(item => {
      const entry = document.createElement('div');
      entry.className = 'history-item';
      entry.innerHTML = `
        <div class="d-flex justify-content-between align-items-start">
          <div>
            <p class="mb-1"><strong>${item.time}</strong></p>
            <p class="mb-1">${item.food_name} — ${item.total_calories} Cal</p>
          </div>
          <div class="dropdown">
            <button class="dropdown-dots" data-bs-toggle="dropdown" aria-expanded="false">&#x22EE;</button>
            <ul class="dropdown-menu dropdown-menu-end">
              <li><a class="dropdown-item" href="#" onclick="deleteMeal(${item.id})">Delete</a></li>
              <li><a class="dropdown-item" href="#" onclick="changeTime(${item.id})">Change saved time</a></li>
            </ul>
          </div>
        </div>
        <hr>`;
      history.appendChild(entry);
    });

    // Scroll to top after history is loaded
    window.scrollTo(0, 0);
  } catch (e) {
    console.error(e);
  }
}

async function deleteMeal(id) {
  try {
    const res = await fetch(`http://localhost:3000/api/food/delete/${id}`, { method: 'DELETE' });
    const msg = await res.text();
    if (!res.ok) return showError(msg);
    showSuccess("Meal deleted");
    loadHistory();
    loadCalorieGraph();
  } catch (e) {
    console.error(e);
    showError("Could not delete.");
  }
}

function changeTime(id) {
  const overlay = document.getElementById('changeTimeOverlay');
  overlay.style.display = 'flex';
  const hourSelect = document.getElementById('hourSelect');
  const minuteSelect = document.getElementById('minuteSelect');

  if (hourSelect.children.length <= 1) {
    for (let h = 0; h < 24; h++) {
      const option = document.createElement('option');
      option.value = option.text = h.toString().padStart(2, '0');
      hourSelect.appendChild(option);
    }
  }

  window.saveTimeChange = async function () {
    const hour = hourSelect.value;
    const minute = minuteSelect.value;

    if (!hour || !minute || hour === 'Hour' || minute === 'Minute') {
      return showError("Please select hour and minute.");
    }

    const time = `${hour}:${minute}`;

    try {
      const res = await fetch(`http://localhost:3000/api/food/update-time/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ time })
      });
      const msg = await res.text();
      if (!res.ok) return showError(msg);
      showSuccess("Time updated");
      overlay.style.display = 'none';
      loadHistory();
    } catch (e) {
      console.error(e);
      showError("Update failed");
    }
  };
}

async function loadFoodRecommendations(remainingCalories) {
  const recDiv = document.getElementById('foodRecommendation');
  recDiv.innerHTML = 'Loading recommendations...';
  try {
    const res = await fetch(`http://localhost:3000/api/food/recommend?max=${remainingCalories}`);
    const data = await res.json();
    if (!data.length) return recDiv.innerHTML = 'No suitable food items found.';
    recDiv.innerHTML = '<ul>' + data.map(item => `<li>${item.food_name} (${item.calories_per_unit} cal/unit)</li>`).join('') + '</ul>';
  } catch (err) {
    console.error(err);
    recDiv.innerHTML = 'Error loading recommendations.';
  }
}

document.getElementById('foodForm').addEventListener('submit', async e => {
  e.preventDefault();
  const meal = document.querySelector('.btn-outline-primary.active')?.innerText || 'Breakfast';
  const now = new Date();
  const time = now.toTimeString().slice(0, 5); // Format: HH:mm

  if (!selectedFoodId || !foodInput.value.trim()) return showError("Please select a valid food.");
  if (quantity < 1) return showError("Quantity must be at least 1.");

  try {
    const res = await fetch('http://localhost:3000/api/food/add', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id, meal_type: meal, food_id: selectedFoodId, quantity, time })
    });
    const txt = await res.text();
    if (!res.ok) return showError(txt);

    showSuccess(txt);

    // Reset form to defaults
    quantity = 1;
    qtyDisplay.textContent = quantity;
    decreaseBtn.disabled = true;
    foodInput.value = '';
    selectedFoodId = null;
    document.querySelectorAll('.btn-outline-primary').forEach(b => b.classList.remove('active'));
    document.querySelector('.btn-outline-primary')?.click(); // Re-select default

    loadCalorieGraph();
    loadHistory();
  } catch (e) {
    console.error(e);
    showError("Network error");
  }
});

// Force scroll to top on reload
window.onbeforeunload = function () {
  window.scrollTo(0, 0);
};

decreaseBtn.disabled = true;
loadCalorieGraph();
loadHistory();
