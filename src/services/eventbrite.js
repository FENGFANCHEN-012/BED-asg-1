//////// correct version


const axios = require('axios');

const EVENTBRITE_API_URL = 'https://www.eventbriteapi.com/v3';
const TOKEN = process.env.EVENTBRITE_TOKEN;

// Configure axios instance for Eventbrite API
const eventbriteApi = axios.create({
  baseURL: EVENTBRITE_API_URL,
  headers: {
    'Authorization': `Bearer ${TOKEN}`,
    'Content-Type': 'application/json'
  }
});

/**
 * Fetch all organizations for the authenticated user
 */
async function fetchMyOrganizations() {
  try {
    const response = await eventbriteApi.get('/users/me/organizations');
    console.log('Fetched organizations:', response.data.organizations);
    return response.data.organizations;
  } catch (error) {
    console.error('Failed to fetch organizations:', error.message, error.response?.data);
    throw new Error(`Failed to fetch organizations: ${error.message}`);
  }
}

/**
 * Fetch events for a specific organization
 * @param {string} orgId - Organization ID
 * @param {object} options - Optional parameters
 * @param {string} options.status - Event status (live, draft, etc.)
 * @param {number} options.pageSize - Number of events per page
 */
async function fetchOrganizationEvents(orgId, options = {}) {
  try {
    const params = {
      'expand': 'venue,logo,ticket_classes',
      'page_size': options.pageSize || 50,
      'status': options.status || 'live'
    };

    console.log(`Fetching events for orgId: ${orgId}, params:`, params);
    const response = await eventbriteApi.get(`/organizations/${orgId}/events/`, { params });
    console.log(`API response for orgId ${orgId}:`, response.data);

    const events = response.data.events.map(event => ({
      external_id: event.id,
      name: event.name?.text || '',
      location: event.venue?.address?.localized_address_display || null,
      time: event.created || null,
      description: event.description?.text || null,
      image: event.logo?.url || null,
      start: event.start?.utc || new Date().toISOString(), // Default to current time if null
      end: event.end?.utc || new Date(Date.now() + 3600000).toISOString(), // Default to 1 hour from now
      url: event.url || null,
      status: event.status || 'unknown',
      fee: event.is_free ? 'Free' : (event.ticket_classes?.[0]?.cost?.display || 'Paid'),
      type: event.format?.name || 'General'
    }));

    console.log(`Mapped ${events.length} events:`, events);
    return events;
  } catch (error) {
    console.error(`Failed to fetch events for organization ${orgId}:`, error.message, error.response?.data);
    throw new Error(`Failed to fetch events: ${error.message}`);
  }
}

module.exports = {
  fetchMyOrganizations,
  fetchOrganizationEvents
};