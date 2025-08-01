require('dotenv').config();
const { syncMyEvents } = require('./eventbrite-sync');

async function test() {
  try {
    await syncMyEvents();
    console.log('测试完成');
  } catch (error) {
    console.error('测试失败：', error.message);
  }
}

test();