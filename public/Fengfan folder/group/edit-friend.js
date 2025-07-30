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
const urlParams = new URLSearchParams(window.location.search);
const friendId = parseInt(localStorage.getItem("friend_id"), 10);
const userId = 1; // logged-in user

// Load existing data
async function loadFriendData() {
  try {
    const response = await fetch(`${apiBaseUrl}/friends/${userId}/${friendId}`);
    if (!response.ok) throw new Error("Failed to load friend data");

    const data = await response.json();
    document.getElementById("nickname").value = data.nick_name || "";
    document.getElementById("description").value = data.description || "";
  } catch (err) {
    showError("Error loading friend info");
    console.error(err);
  }
}

// Save updated data
document.getElementById("save-btn").addEventListener("click", async () => {
  const nickname = document.getElementById("nickname").value;
  const description = document.getElementById("description").value;

  try {
    const response = await fetch(`${apiBaseUrl}/friends/${userId}/${friendId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nick_name: nickname, description: description }),
    });

    if (!response.ok) throw new Error("Failed to save changes");

    document.getElementById("message").style.display = "block";
    window.location.href='Friend-management.html'
  } catch (err) {
    showError("Failed to update friend info, please contact admin for help");
    console.error(err);
  }
});

document.getElementById("cancel-btn").addEventListener("click", () => {
  window.history.back();
});

window.onload = loadFriendData;
