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
const user_id = localStorage.getItem("user_id") || 1;
const selectedFriends = JSON.parse(localStorage.getItem('selected_friends')) || [];
let file_name= document.getElementById("file-name")
let file = document.getElementById("group-avatar")


file.addEventListener("change", function() {
    if (this.files && this.files.length > 0) {
        
        file_name.textContent = this.files[0].name;
        
        
      
    } else {
        fileNameDisplay.textContent = "No file chosen";
    }
});

document.addEventListener('DOMContentLoaded', function() {
  renderSelectedFriends();
  
  document.getElementById('create-btn').addEventListener('click', createGroup);
  document.getElementById('cancel-btn').addEventListener('click', function() {
    window.location.href = 'Group-management.html';
  });
});

function renderSelectedFriends() {


   const selectedFriends = JSON.parse(localStorage.getItem('selected_friends')) || [];
   console.log(selectedFriends)


  const container = document.getElementById('selected-friends-container');
  if (!container) return;
  
  if (selectedFriends.length === 0) {
    container.innerHTML = '<p>No friends selected</p>';
    return;
  }

  container.innerHTML = selectedFriends.map(id => `
    <div class="selected-friend" data-user-id="${id}">
      <span>User ID: ${id}</span>
    </div>
  `).join('');
}

async function createGroup() {
  const name = document.getElementById('group_names').value.trim();
  const description = document.getElementById('group-description').value.trim();
  const avatarFile = document.getElementById('group-avatar').files[0];
 const selectedFriends = JSON.parse(localStorage.getItem('selected_friends')) ;


  if (!name) {
    showError('Group name is required');
    return;
  }

  try {
    
    let photo_url = null;
    if (avatarFile) {
      photo_url = await fileToBase64(avatarFile);
    }

  
    const groupResponse = await fetch(`${apiBaseUrl}/create/groups`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name,
        description,
        owner_id: parseInt(user_id),
        photo_url,
        is_public: 1,
        member_count:selectedFriends.length+1
      })
    });

    if (!groupResponse.ok) {
      const error = await groupResponse.json();
      throw new Error(error.message || 'Failed to create group');
    }




    
    const groupData = await groupResponse.json();
    const groupId = parseInt(groupData.group_id);
    console.log(groupId +1312)


     const add_owner = await fetch(`${apiBaseUrl}/group-owner`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        group_id: groupId,
        user_id: parseInt(user_id),
        role: "owner",
      })
    });
   if (!add_owner.ok) {
      const error = await groupResponse.json();
      throw new Error(error.message || 'Failed to create group');
    }

   
    
    const addMemberPromises = selectedFriends.map(async (friendId) => {
  try {
    const response = await fetch(`${apiBaseUrl}/group-members`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        group_id: groupId,
        user_id: parseInt(friendId),
        role: "member"
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json(); 
      console.error('Server error details:', errorData);
      throw new Error(`Failed to add member ${friendId}: ${errorData.message || 'Unknown error'}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error adding member:', {
      friendId,
      error: error.message,
      stack: error.stack
    });
    throw error;
  }
});

    await Promise.all(addMemberPromises);

    
    localStorage.removeItem('selected_friends');
    localStorage.removeItem('add_group');
    
    document.getElementById('message').style.display = 'block';
    setTimeout(() => {
      window.location.href = './Group-management.html';
    }, 1500);

  } catch (error) {
    console.error('Error:', error);
    alert(`Error: ${error.message}`);
  }
}
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
    reader.readAsDataURL(file);
  });
}