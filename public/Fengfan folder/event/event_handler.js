



document.addEventListener("DOMContentLoaded", function() {
  setupEventPage();
});

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
}

// Initialize alert system
injectAlertStyles();

// Display basic alert dialog
function showAlert(message, buttonText = 'OK', onClose = null) {
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

// Display success alert
function showSuccess(message = 'Operation successful!') {
  showAlert(message, 'OK');
}

// Display error alert
function showError(message = 'An error occurred') {
  showAlert(message, 'Try Again');
}

// Display confirmation dialog (returns Promise)
function showConfirm(message) {
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
    
    // Cleanup function
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
}













// Event page setup
async function setupEventPage() {
  // Set default user if not exists
  if (!localStorage.getItem("userId")) {
    localStorage.setItem("userId", "1");
  }
  const eventID = localStorage.getItem("event_id")

  const apiBaseUrl = "http://localhost:3000";
  const eventData = JSON.parse(localStorage.getItem('currentEvent')) || {};
  
  // Display event details
  document.getElementById("event_name").innerText = eventData.name || "Event Name";
  document.getElementById("event_location").innerText = eventData.location || "Event Location";
  document.getElementById("event_time").innerText = eventData.time || "Event Time";
  document.getElementById("event_description").innerText = eventData.description || "Event Description";
  document.getElementById("event_image").src = eventData.photo || "default-image.jpg";
  document.getElementById("event_fee").innerHTML = eventData.fee || "Event Fee";

  // Check current registration status
  await checkRegistrationStatus();
}

async function checkRegistrationStatus() {
  try {
    const eventId = JSON.parse(localStorage.getItem('currentEvent')).event_id;
    const userId = localStorage.getItem("userId");
    const apiBaseUrl = "http://localhost:3000";
    
    const response = await fetch(`${apiBaseUrl}/user_event/status?event_id=${eventId}&user_id=${userId}`);
    
    if (response.ok) {
      const data = await response.json();
      updateButtonUI(data.status === "signed_up");
    }
  } catch (error) {
    console.error("Status check error:", error);
    // Default to sign up button if check fails
    updateButtonUI(false);
  }
}

function updateButtonUI(isRegistered) {
  const button = document.getElementById("eventActionBtn");
  
  if (isRegistered) {
    button.textContent = "Cancel Registration";
    button.className = "blue-button cancel-btn";
    button.onclick = handleCancel;
  } else {
    button.textContent = "Sign Up";
    button.className = "blue-button signup-btn";
    button.onclick = handleSignUp;
  }
}

async function handleSignUp() {
  try {
    const eventId = JSON.parse(localStorage.getItem('currentEvent')).event_id;
    const userId = localStorage.getItem("userId");
    const apiBaseUrl = "http://localhost:3000";
    
    const response = await fetch(`${apiBaseUrl}/user_event`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        event_id: eventId,
        user_id: userId,
        status: "signed_up"
      })
    });

    if (response.ok) {
 showSuccess('Sign Up Successful! 🎉');

      updateButtonUI(true);
    } else {
      const error = await response.json();
      throw new Error(error.message || "Sign up failed");
    }
  } catch (error) {
    console.error("Sign up error:", error);
    alert(error.message);
  }
}

async function handleCancel() {
  const confirmed = await showConfirm("Are you sure you want to cancel your registration?");
  if (!confirmed) return;

  try {
    const eventId = JSON.parse(localStorage.getItem('currentEvent')).event_id;
    const userId = localStorage.getItem("userId");
    const apiBaseUrl = "http://localhost:3000";
    
    const response = await fetch(`${apiBaseUrl}/user_event`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        event_id: eventId,
        user_id: userId
      })
    });

    if (response.ok) {
      showSuccess("Your registration has been cancelled");
      updateButtonUI(false);
    } else {
      const error = await response.json();
      throw new Error(error.message || "Cancellation failed");
    }
  } catch (error) {
    console.error("Cancellation error:", error);
    showError(error.message);
  }
}


/// alert css
// ALERT FUNCTIONS (standalone, no dependencies)
