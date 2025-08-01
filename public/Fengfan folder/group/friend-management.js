
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
const add = localStorage.getItem("add_group") 
const user_id = localStorage.getItem("user_id") || 1 // local


   document.addEventListener('DOMContentLoaded', function() {
    
   loadFriends();
   localStorage.setItem('add_group',false)
   })



   async function deleteFriend(friendId) {
  try {
   const confirmed = await showConfirm("Are you sure you want to delete your friend?");
    if (!confirmed) return; // Return if user clicks "Cancel"
    
    const userId = parseInt(localStorage.getItem("user_id")) || 1;
    const numericFriendId = parseInt(friendId);
    
    const response = await fetch(`${apiBaseUrl}/friends/${userId}/${numericFriendId}`, {
      method: "DELETE"
    });

    if (!response.ok) throw new Error('Delete failed');
    
    document.querySelector(`[data-friend-id="${friendId}"]`).closest('.friend').remove();
    showSuccess('Friend deleted ! He is no longer your friend.');
  } catch (error) {
    console.error(error);
    showError('Delete error: ' + error.message);
  }
}


async function loadFriends() {
  const friendList = document.getElementById('friendList');
  friendList.innerHTML = '<div class="loading">Loading friends...</div>';

  try {
    const response = await fetch(`${apiBaseUrl}/friends/${user_id}`);
    if (!response.ok) throw new Error('Failed to fetch friends');

    const friends = await response.json();
  console.log(friends)
    if (!friends || friends.length === 0) {
      friendList.innerHTML = '<p style="text-align: center; font-size: 24px;">You have no friends yet.</p>';
      return;
    }

    friendList.innerHTML = '';

    friends.forEach(friend => {
      const friendElement = document.createElement('div');
      friendElement.className = 'friend';

 
      const checkboxHtml = add === 'true' ? `
        <input type="checkbox" 
               class="friend-select" 
               data-user-id="${friend.user_id}"
               style="width: 40px; height: 40px; margin-right: 15px;">
      ` : '';

      friendElement.innerHTML = `
        <div class="friend-info">
          ${checkboxHtml}
          <div class="friend-photo">${friend.name.charAt(0)}</div>
          <div class="friend-details">
            <h1 style='font-size:3vw'>${friend.nick_name || ''}</h1>
            <p class="friend-name">${friend.name}</p>
            <p>Hobby: ${friend.hobbies}</p>
            
          </div>
        </div>
        <div class="friend-actions">
            <button class="action-button chatting-btn" data-friend-id="${friend.user_id}">Chat</button>
          <button class="action-button delete-btn" data-friend-id="${friend.user_id}">Delete</button>
          <button class="action-button settings-btn" data-friend-id="${friend.user_id}">Settings</button>
        </div>
      `;

      friendList.appendChild(friendElement);
    });
    
    //chat button
  
    document.querySelectorAll('.chatting-btn').forEach(btn => {
      btn.addEventListener('click', function (e) {
        e.stopPropagation(); 
        const friendId = this.getAttribute('data-friend-id');
        console.log(friendId)
      
        chatting(friendId);
      });
    });
 document.querySelectorAll('.delete-btn').forEach(btn => {
      btn.addEventListener('click', function (e) {
        e.stopPropagation(); 
        const friendId = this.getAttribute('data-friend-id');
        console.log(friendId)
      
       deleteFriend(friendId)
      });
    });
//setting button
    document.querySelectorAll('.settings-btn').forEach(btn => {
      btn.addEventListener('click', function (e) {
        e.stopPropagation();
        const friend_id = this.getAttribute('data-friend-id');
        localStorage.setItem("friend_id",friend_id)
        
        window.location.href='edit_friend.html'
      });
    });

   function chatting(friend_id){
    localStorage.setItem("friend_id",friend_id);
    window.location.href='../chat/Chat.html'
   }
    if (add === 'true') {
      addSelectConfirmButton();
    }

  } catch (error) {
    console.error('Error loading friends:', error);
    friendList.innerHTML = `
      <div style="text-align: center; color: red; font-size: 24px;">
        Error loading friends. Please try again.
      </div>
    `;
  }
}


function addSelectConfirmButton() {

  let confirmBtn = document.getElementById('confirmSelectionBtn');
  if (!confirmBtn) {
    confirmBtn = document.createElement('button');
    confirmBtn.id = 'confirmSelectionBtn';
    confirmBtn.textContent = 'Confirm Decision';
    confirmBtn.style.position = 'fixed';
    confirmBtn.style.bottom = '30px';
    confirmBtn.style.left = '50%';
    confirmBtn.style.transform = 'translateX(-50%)';
    confirmBtn.style.padding = '15px 30px';
    confirmBtn.style.fontSize = '35px';
    confirmBtn.style.backgroundColor = '#f44336';
    confirmBtn.style.color = '#fff';
    confirmBtn.style.border = 'none';
    confirmBtn.style.borderRadius = '10px';
    confirmBtn.style.cursor = 'pointer';
    confirmBtn.style.display = 'none';
    confirmBtn.style.zIndex = '1000';

    document.body.appendChild(confirmBtn);

    confirmBtn.addEventListener('click', () => {
      const checkedBoxes = document.querySelectorAll('.friend-select:checked');
      const selectedIds = Array.from(checkedBoxes).map(cb => cb.getAttribute('data-user-id'));

      if (selectedIds.length === 0) {
        showError('You need choose at least one Friend');
        return;
      }

      localStorage.setItem('selected_friends', JSON.stringify(selectedIds));
      localStorage.setItem("add_group",false); 
     console.log(localStorage.getItem('selected_friends'))
      
      window.location.href = 'add_group.html';
    });
  }


  document.querySelectorAll('.friend-select').forEach(cb => {
    cb.addEventListener('change', () => {
      const anyChecked = Array.from(document.querySelectorAll('.friend-select')).some(c => c.checked);
      confirmBtn.style.display = anyChecked ? 'block' : 'none';
    });
  });
}

