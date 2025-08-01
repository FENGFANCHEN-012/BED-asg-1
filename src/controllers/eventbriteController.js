//////// correct version




const eventbriteService = require('../services/eventbrite');
const eventbriteModel = require('../models/eventbriteModel');

async function fetchAndSyncOrgEvents(req, res) {
  const { orgId, status, pageSize } = req.query;

  try {
  
    let organizationId = orgId;
    if (!organizationId) {
      const organizations = await eventbriteService.fetchMyOrganizations();
      if (!organizations || organizations.length === 0) {
        return res.status(404).json({ 
          success: false,
          message: 'No organizations found for this account'
        });
      }
      organizationId = organizations[0].id;
      console.log(`Using organization ID: ${organizationId}`);
    }

    // Step 2: Fetch events from Eventbrite
    console.log(`Fetching events for orgId: ${organizationId}, status: ${status}, pageSize: ${pageSize}`);
    const events = await eventbriteService.fetchOrganizationEvents(organizationId, {
      status: status || 'live',
      pageSize: pageSize || 50
    });

    console.log(`Fetched ${events.length} events from Eventbrite:`, events);

    if (!events || events.length === 0) {
      return res.json({ 
        success: true,
        message: 'No events found to sync',
        count: 0
      });
    }

    // Step 3: Sync events to database
    await eventbriteModel.syncEvents(events);

    return res.json({
      success: true,
      message: `Successfully synced ${events.length} events from Eventbrite`,
      count: events.length,
      events: events
    });
  } catch (error) {
    console.error('Error in fetchAndSyncOrgEvents:', error);
    return res.status(500).json({ 
      success: false,
      message: 'Failed to sync events from Eventbrite',
      error: error.message
    });
  }
}

async function getEvents(req, res) {
  const { status, type } = req.query;

  try {
    const events = await eventbriteModel.getAllEvents();
    
    // Apply filtering
    let filteredEvents = events;
    if (status) {
      filteredEvents = filteredEvents.filter(e => e.status === status);
    }
    if (type) {
      filteredEvents = filteredEvents.filter(e => e.type === type);
    }

    return res.json({
      success: true,
      count: filteredEvents.length,
      events: filteredEvents
    });
  } catch (error) {
    console.error('Error getting events:', error);
    return res.status(500).json({ 
      success: false,
      message: 'Failed to retrieve events',
      error: error.message
    });
  }
}

module.exports = {
  fetchAndSyncOrgEvents,
  getEvents
};