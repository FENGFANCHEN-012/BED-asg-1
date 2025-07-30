
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






document.addEventListener("DOMContentLoaded", () => {
  const uploadBtn = document.getElementById("upload-btn");
  const fileInput = document.getElementById("group-avatar");
  const fileNameSpan = document.getElementById("file-name");
  const saveBtn = document.getElementById("save-btn");
  const cancelBtn = document.getElementById("cancel-btn");
  const message = document.getElementById("message");

  const user_id = '1'// localStorage.getItem("user_id");
  const groupData = JSON.parse(localStorage.getItem("current_group"));
  const owner_id = localStorage.getItem("group_owner_id");
  let base64Image = "";


function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    if (!file) {
      reject(new Error("No file provided"));
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      const base64String = reader.result.split(',')[1]; 
      resolve(base64String);
    };

    reader.onerror = (error) => {
      reject(error);
    };

    reader.readAsDataURL(file);
  });
}





  if (groupData) {
    document.getElementById("group-name").value = groupData.name || "";
    document.getElementById("group-description").value = groupData.description || "";
  }

  uploadBtn.addEventListener("click", () => {
    fileInput.click();
  });





fileInput.addEventListener("change", async () => {
  const file = fileInput.files[0];
  const MAX_SIZE = 2 * 1024 * 1024; 
  if (!file) return;

  if (file.size > MAX_SIZE) {
    showError("This Picture is too big, please choose a smaller size picture");
    fileInput.value = "";  
    return;
  }

  
  fileNameSpan.textContent = file ? file.name : "No file chosen";

  try {
    const base64 = await  fileToBase64(file);
    localStorage.setItem("base_64", base64);
    console.log("Base64 string:", base64);
  } catch (error) {
    console.error("Failed to convert file:", error);
  }
});









  saveBtn.addEventListener("click", async () => {
    const name = document.getElementById("group-name").value.trim();
    const desc = document.getElementById("group-description").value.trim();

    if (!name) return showError("Please enter a group name.");
    if (!groupData || !groupData.group_id) return alert("Group ID not found.");
    if (owner_id !== user_id) return showError("You are not the owner of this group. You can't change group information.");

    try {
      const payload = {
        name: name,
        description: desc,
        photo_url: localStorage.getItem("base_64")
      };

      const response = await fetch(`http://localhost:3000/group/${groupData.group_id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Failed to save changes");
      }

      const result = await response.json();
      message.textContent = "Changes saved successfully!";
      message.style.display = "block";
      setTimeout(() => {
        message.style.display = "none";
        window.location.href = "group-management-setting.html";
      }, 2000);
    } catch (error) {
      alert(error.message || "Failed to save changes.");
    }
  });

  cancelBtn.addEventListener("click", () => {
    localStorage.setItem("")
    window.location.href = "group-management-setting.html";
  });
});
