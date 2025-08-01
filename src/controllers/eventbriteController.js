const { fetchMyOrganizations, fetchOrganizationEvents } = require('../services/eventbrite');
const EventModel = require('../models/eventbriteModel');

async function fetchAndSyncOrgEvents(req, res) {
  try {
    console.log('开始获取并同步组织事件');
    const organizations = await fetchMyOrganizations();
    if (organizations.length === 0) {
      return res.status(200).json({ message: '没有找到组织', organizations: [], events: [] });
    }
    const orgId = organizations[0].id; // 取第一个组织 ID
    console.log(`组织 ID: ${orgId}`);
    const events = await fetchOrganizationEvents(orgId);
    if (events.length === 0) {
      return res.status(200).json({ message: `组织 ${orgId} 没有找到事件`, organizations, events });
    }
    await syncEvents(events); // 假设 syncEvents 已定义或在其他文件中
    console.log(`成功同步 ${events.length} 个事件`);
    res.status(200).json({ message: '事件同步完成', organizations, events });
  } catch (error) {
    console.error('获取并同步组织事件错误：', error.message);
    res.status(500).json({ error: `同步事件失败：${error.message}` });
  }
}

module.exports = { fetchAndSyncOrgEvents };