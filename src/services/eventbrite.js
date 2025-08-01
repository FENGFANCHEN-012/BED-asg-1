const axios = require('axios');

const EVENTBRITE_API_URL = 'https://www.eventbriteapi.com/v3';
const TOKEN = process.env.EVENTBRITE_TOKEN;
// frontend.js
async function syncEvents() {
  try {
    const response = await fetch('http://localhost:3000/api/events/sync', {
      method: 'GET', // 或 POST，取决于你的路由设置
      headers: {
        'Content-Type': 'application/json',
        // 如果需要认证，添加 token 或其他头
      },
    });
    const data = await response.json();
    if (response.ok) {
      console.log('事件同步成功：', data.message, data.events);
    } else {
      console.error('同步失败：', data.error);
    }
  } catch (error) {
    console.error('前端请求错误：', error.message);
  }
}

// 触发同步，例如通过按钮点击
document.getElementById('syncButton').addEventListener('click', syncEvents);
async function fetchMyOrganizations() {
  if (!TOKEN) {
    console.error('错误：未设置 EVENTBRITE_TOKEN');
    return [];
  }
  try {
    console.log('获取我的组织，令牌：', TOKEN.substring(0, 4) + '...');
    const response = await axios.get(`${EVENTBRITE_API_URL}/users/me/organizations`, {
      headers: { Authorization: `Bearer ${TOKEN}` },
    });
    const organizations = response.data.organizations || [];
    console.log('找到我的组织数：', organizations.length);
    return organizations;
  } catch (error) {
    const status = error.response?.status;
    const data = error.response?.data;
    console.error('获取组织错误：', {
      status,
      message: error.message,
      data: data || '无响应数据',
    });
    return [];
  }
}

async function fetchOrganizationEvents(orgId) {
  if (!TOKEN || !orgId) {
    console.error('错误：未设置 EVENTBRITE_TOKEN 或组织 ID');
    return [];
  }
  try {
    console.log(`获取组织 ${orgId} 的事件，令牌：`, TOKEN.substring(0, 4) + '...');
    const response = await axios.get(`${EVENTBRITE_API_URL}/organizations/${orgId}/events`, {
      headers: { Authorization: `Bearer ${TOKEN}` },
    });
    const events = response.data.events || [];
    console.log(`找到组织 ${orgId} 的事件数：`, events.length);
    return events;
  } catch (error) {
    const status = error.response?.status;
    const data = error.response?.data;
    console.error(`获取组织 ${orgId} 事件错误：`, {
      status,
      message: error.message,
      data: data || '无响应数据',
    });
    return [];
  }
}

