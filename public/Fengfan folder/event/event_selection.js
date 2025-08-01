 // ---------------------------------------------------------

function injectAlertStyles() {
  const style = document.createElement('style');
  style.textContent = `
    .alert-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: rgba(0,0,0,0.85);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 99999;
    }
    .alert-box {
      background-color: #ffffff;
      padding: 50px 60px;
      border-radius: 25px;
      box-shadow: 0 15px 40px rgba(0,0,0,0.5);
      width: 70%;
      max-width: 700px;
      min-width: 500px;
      text-align: center;
      border: 4px solid #f5f5f5;
    }
    .alert-message {
      font-size: 32px;
      margin-bottom: 40px;
      color: #111111;
      line-height: 1.8;
      font-weight: 600;
      letter-spacing: 1px;
    }
    .alert-button {
      background-color: #1E4A9B;
      color: white;
      border: none;
      padding: 25px 50px;
      font-size: 28px;
      border-radius: 15px;
      cursor: pointer;
      transition: all 0.3s;
      min-width: 250px;
      box-shadow: 0 8px 16px rgba(0,0,0,0.2);
      font-weight: 600;
      letter-spacing: 1px;
    }
    .alert-button:hover {
      background-color: #265BB8;
      transform: translateY(-3px);
      box-shadow: 0 12px 24px rgba(0,0,0,0.3);
    }
    .alert-button:active {
      transform: translateY(2px);
      box-shadow: 0 4px 8px rgba(0,0,0,0.2);
    }
    @media (max-width: 768px) {
      .alert-box {
        width: 90%;
        min-width: 90%;
        padding: 40px 30px;
      }
      .alert-message {
        font-size: 28px;
        margin-bottom: 30px;
      }
      .alert-button {
        font-size: 24px;
        padding: 20px 40px;
        min-width: 80%;
      }
    }
  `;
  document.head.appendChild(style);
}function showAlert(message, buttonText = 'OK', onClose = null) {
  const overlay = document.createElement('div');
  overlay.className = 'alert-overlay';
  
  const alertBox = document.createElement('div');
  alertBox.className = 'alert-box';
  
  const messageElement = document.createElement('div');
  messageElement.className = 'alert-message';
  messageElement.textContent = message;
  
  const button = document.createElement('button');
  button.className = 'alert-button';
  button.textContent = buttonText;
  
  alertBox.appendChild(messageElement);
  alertBox.appendChild(button);
  overlay.appendChild(alertBox);
  document.body.appendChild(overlay);
  
  button.onclick = () => {
    document.body.removeChild(overlay);
    if (onClose) onClose();
  };
}
function showSuccess(message = 'Operation successful!') {
  showAlert(message, 'OK');
}
function showError(message = 'An error occurred') {
  showAlert(message, 'Try Again');
}function showConfirm(message) {
  return new Promise((resolve) => {
    const overlay = document.createElement('div');
    overlay.className = 'alert-overlay';
    
    const alertBox = document.createElement('div');
    alertBox.className = 'alert-box';
    
    const messageElement = document.createElement('div');
    messageElement.className = 'alert-message';
    messageElement.textContent = message;
    
    const buttonContainer = document.createElement('div');
    buttonContainer.style.display = 'flex';
    buttonContainer.style.gap = '20px';
    buttonContainer.style.justifyContent = 'center';
    
    const confirmButton = document.createElement('button');
    confirmButton.className = 'alert-button';
    confirmButton.textContent = 'Confirm';
    
    const cancelButton = document.createElement('button');
    cancelButton.className = 'alert-button';
    cancelButton.textContent = 'Cancel';
    cancelButton.style.backgroundColor = '#ff4d4d';
    
    buttonContainer.appendChild(cancelButton);
    buttonContainer.appendChild(confirmButton);
    alertBox.appendChild(messageElement);
    alertBox.appendChild(buttonContainer);
    overlay.appendChild(alertBox);
    document.body.appendChild(overlay);
    
    const cleanup = () => {
      document.body.removeChild(overlay);
    };
    
    confirmButton.onclick = () => {
      cleanup();
      resolve(true);
    };
    
    cancelButton.onclick = () => {
      cleanup();
      resolve(false);
    };
  });
}function base64ToBlobUrl(base64, mimeType = 'image/png') {
  if (!base64) return null; 
  
  if (typeof base64 === 'string' && 
      (base64.startsWith('http://') || base64.startsWith('https://'))) {
    return base64;
  }

  try {
    const base64Data = base64.split(',')[1] || base64;
    const byteCharacters = atob(base64Data);
    const byteNumbers = new Array(byteCharacters.length);
    
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: mimeType });
    return URL.createObjectURL(blob);
  } catch (error) {
    console.error('Base64:', error);
    return null; 
  }
}injectAlertStyles();

// -----------------------------------------------------------




 
 
 
 
 
 
 
 
 
 const apiBaseUrl = "http://localhost:3000";
let eventsData = {};

// Get user preferences
const user_id = parseInt(localStorage.getItem("user_id")) || 1
const userHobby = localStorage.getItem("hobby")?.toLowerCase() || "";
const userDetail = localStorage.getItem("detail")?.toLowerCase() || "";

async function loadEvents() {
    try {
        const response = await fetch(`${apiBaseUrl}/getEvent`);
        if (!response.ok) throw new Error(`HTTP error: ${response.status}`);
        
        const data = await response.json();
        console.log("API Response:", data); 

        if (Array.isArray(data)) {
            eventsData = data.reduce((obj, event) => {
                if (event.event_id) obj[event.event_id] = event;
                return obj;
            }, {});
        } else if (data && data.event_id) {
            eventsData = { [data.event_id]: data };
        } else {
            eventsData = {};
        }

        console.log("Processed Events Data:", eventsData); 

        if (Object.keys(eventsData).length === 0) {
            showMessage("No events found");
            return;
        }

        renderEvents(sortEvents(eventsData));
    } catch (error) {
        console.error("Error:", error);
        showMessage("Failed to load events, please contact admin for help");
    }
}

function sortEvents(eventsObj) {
    return Object.entries(eventsObj)
        .map(([id, event]) => ({ id, ...event }))
        .sort((a, b) => {
            const scoreA = getRelevanceScore(a);
            const scoreB = getRelevanceScore(b);
            return scoreB - scoreA;
        });
}

function getRelevanceScore(event) {
    let score = 0;
    if (event.detail?.toLowerCase() === userDetail) score += 2;
    if (event.type?.toLowerCase() === userHobby) score += 2;
    return score;
}

function renderEvents(sortedEvents) {
    const container = document.getElementById('specialEvents');
    container.innerHTML = '';
    
    sortedEvents.forEach(event => {
        const eventElement = document.createElement('div');
        eventElement.className = 'friend';
        
        // Create website button if URL exists
        const websiteButton = event.url 
            ? `<button class="visit-website" data-url="${event.url}">Visit Website</button>`
            : '';
            
        eventElement.innerHTML = `
            <div class="friend-info">
                <div class="friend-photo" 
                     style="background-image: url('${event.image || ''}');
                            background-size: cover;"></div>
                <div class="friend-details">
                    <h1 style="font-size:2vw">${event.name}</h1>
                    <p>Location: ${event.location || 'TBD'}</p>
                    <p>Time: ${formatTime(event.time)}</p>
                    <p>Fee: ${event.fee ? `$${event.fee}` : 'Free'}</p>
                    ${websiteButton}
                </div>
            </div>
            <div class="friend-actions">
                <button class="delete" data-id="${event.id || event.event_id}">Sign Up</button>
            </div>
        `;
        
        container.appendChild(eventElement);
    });

    bindSignupButtons();
    bindWebsiteButtons();
}

function formatTime(isoString) {
    if (!isoString) return 'Time not specified';
    const date = new Date(isoString);
    return date.toLocaleString();
}

function bindSignupButtons() {
    document.querySelectorAll('.delete').forEach(button => {
        button.addEventListener('click', function() {
            const eventId = this.getAttribute('data-id');
            const event = eventsData[eventId];
            
            if (event) {
                localStorage.setItem('currentEvent', JSON.stringify(event));
                window.location.href = "Event-interface.html";
            }
        });
    });
}

function bindWebsiteButtons() {
    document.querySelectorAll('.visit-website').forEach(button => {
        button.addEventListener('click', function() {
            const url = this.getAttribute('data-url');
            // Ensure URL has protocol
            const fullUrl = url.startsWith('http') ? url : `https://${url}`;
            window.open(fullUrl, '_blank');
        });
    });
}

function showMessage(msg) {
    document.getElementById('specialEvents').innerHTML = `
        <p style="font-size:24px;text-align:center;">${msg}</p>
    `;
}

document.addEventListener('DOMContentLoaded', loadEvents);