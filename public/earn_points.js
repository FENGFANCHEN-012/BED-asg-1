function getJWT() {
  const token = localStorage.getItem('jwtToken');
  if (!token) {
    window.location.href = '/signin.html';
    throw new Error('Not logged in');
  }
  return token;
}

function getUserIdFromJWT() {
  const token = getJWT();
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    if (!payload.user_id) {
      window.location.href = '/signin.html';
      throw new Error('JWT missing user_id');
    }
    return payload.user_id;
  } catch (err) {
    window.location.href = '/signin.html';
    throw new Error('Invalid JWT');
  }
}

async function refreshPoints() {
  const token = getJWT();
  const res = await fetch(`/points`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const { points } = await res.json();
  document.querySelector('#user-points span').textContent = points;
}

async function fetchTasks() {
  const token = getJWT();
  const res = await fetch(`/video-tasks`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const { tasks } = await res.json();
  return tasks;
}

function imageForCategory(cat) {
  switch (cat) {
    case 'Daily Exercise':    return 'activity1.png';
    case 'Daily Learning':    return 'activity2.png';
    case 'Daily Mindfulness': return 'activity3.png';
    default:                   return 'default.png';
  }
}

function renderSections(grouped) {
  const container = document.getElementById('task-sections');
  container.innerHTML = '';
  for (let [category, tasks] of Object.entries(grouped)) {
    const section = document.createElement('div');
    section.className = 'task-section';
    section.innerHTML = `
      <h5>${category}</h5>
      <div class="task-cards"></div>
    `;
    const row = section.querySelector('.task-cards');
    tasks.forEach(t => {
      const card = document.createElement('div');
      card.className = 'task-card';
      card.innerHTML = `
        <div class="row align-items-center">
          <div class="col">
            <h6>${t.title}</h6>
            <p>${t.description}</p>
            <button class="btn btn-primary ${t.watched ? 'disabled' : ''}"
                    ${t.watched ? 'disabled' : ''}
                    onclick="location.href='video.html?task_id=${t.task_id}'">
              ${t.watched
                ? 'Completed'
                : `Watch & Earn ${t.point_value} LC`}
            </button>
          </div>
          <div class="col-auto">
            <img src="images/${imageForCategory(t.category)}"
                 class="task-img"
                 alt="${t.title}">
          </div>
        </div>
      `;
      row.appendChild(card);
    });
    container.appendChild(section);
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  await refreshPoints();
  const tasks  = await fetchTasks();
  const grouped = tasks.reduce((acc, t) => {
    (acc[t.category] = acc[t.category] || []).push(t);
    return acc;
  }, {});
  renderSections(grouped);
});
