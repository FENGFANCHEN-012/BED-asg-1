const axios = require('axios');

const EVENTBRITE_API_URL = '';
const TOKEN = process.env.EVENTBRITE_TOKEN;

async function fetchEvents() {
  try {
    const response = await axios.get(`${EVENTBRITE_API_URL}/users/me/events`, {
      headers: {
        Authorization: `Bearer ${TOKEN}`,
      },
    });
    return response.data.events;
  } catch (error) {
    console.error('Error fetching events:', error.response?.data || error.message);
    throw error;
  }
}

module.exports = { fetchEvents };