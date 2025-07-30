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




   
   
   
   
   
   
   
   
   // Global variables
    const currentUserId = localStorage.getItem('userId') || 1; // Default to 1 for demo
    
    // Load recommended profiles when page loads
    document.addEventListener('DOMContentLoaded', loadRecommendedProfiles);

    // Main function to load recommended profiles
    async function loadRecommendedProfiles() {
      try {
        showLoadingState();
        
        const response = await fetch(`http://localhost:3000/profiles/recommended/${currentUserId}`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const profiles = await response.json();
        renderProfiles(profiles);
      } catch (error) {
        showErrorState(error);
      }
    }

    // Function to render profiles
    function renderProfiles(profiles) {
      const container = document.getElementById('profileList');
      
      if (!profiles || profiles.length === 0) {
        container.innerHTML = '<div class="empty">No recommended friends found.</div>';
        return;
      }
      
      container.innerHTML = '';
      
      profiles.forEach(profile => {
        const profileElement = createProfileCard(profile);
        container.appendChild(profileElement);
      });
    }

    // Create individual profile card
    function createProfileCard(profile) {
      const profileElement = document.createElement('div');
      profileElement.className = 'profile-card';
      
      // Get initials for profile picture placeholder
      const initials = getInitials(profile.name);
      
      // Process hobbies for display
      const hobbies = profile.hobbies ? profile.hobbies.split(',') : [];
      
      profileElement.innerHTML = `
        <div class="profile-header">
          ${profile.profile_picture ? 
            `<img src="${profile.profile_picture}" class="profile-photo" alt="${profile.name}">` : 
            `<div class="profile-photo">${initials}</div>`}
          <div>
            <span class="profile-name">${profile.name}</span>
            <span class="match-score">${profile.match_score || 0} common interests</span>
          </div>
        </div>
        <div class="profile-details">
          ${profile.age ? `<div class="detail-item"><span class="detail-label">Age:</span> ${profile.age}</div>` : ''}
          ${profile.description ? `<div class="detail-item"><span class="detail-label">About:</span> ${profile.description}</div>` : ''}
          
          ${hobbies.length > 0 ? `
            <div class="detail-item">
              <span class="detail-label">Interests:</span>
              <div class="hobbies-list">
                ${hobbies.map(hobby => `<span class="hobby-tag">${hobby.trim()}</span>`).join('')}
              </div>
            </div>
          ` : ''}
        </div>
        <button class="action-button add-friend-btn" 
                onclick="addFriend(${profile.user_id})"
                data-user-id="${profile.user_id}">
          Add Friend
        </button>
      `;
      
      return profileElement;
    }

    // Function to handle adding a friend
 async function addFriend(friendId) {
    try {
        const userId = localStorage.getItem('userId') || 1;
        const button = document.querySelector(`.add-friend-btn[data-user-id="${friendId}"]`);
        button.disabled = true;
        button.textContent = 'Processing...';

        const response = await fetch(`http://localhost:3000/friends/${userId}/${friendId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        const result = await response.json();
        
        if (!response.ok) {
             showError("Fail to add friend, please contact admin for help")
            throw new Error(result.error || 'Failed to add friend');
           
        }

        
        if (result.success) {
            if (result.message.includes('already')) {
                button.textContent = 'Already Friends';
            } else {
                button.textContent = 'Friends ✓';
            }
            button.style.backgroundColor = '#6c757d';
            showSuccess(result.message);
        } else {
            throw new Error(result.error);
        }
    } catch (error) {
        console.error('Add friend error:', error);
        const button = document.querySelector(`.add-friend-btn[data-user-id="${friendId}"]`);
        button.disabled = false;
        button.textContent = 'Add Friend';
        
       
        const errorMsg = error.message.includes('Parameter conflict') 
            ? "System busy. Please try again later." 
            : error.message;
            
        showError(errorMsg, true);
    }
}

    // Helper function to get initials from name
    function getInitials(name) {
      return name.split(' ').map(n => n[0]).join('').toUpperCase();
    }

    // Show loading state
    function showLoadingState() {
      document.getElementById('profileList').innerHTML = '<div class="loading">Loading recommended friends...</div>';
    }

    // Show error state
    function showErrorState(error) {
      console.error('Error:', error);
      document.getElementById('profileList').innerHTML = `
        <div class="error">
          Failed to load friends. Please check:
          <ul>
            <li>Backend server is running</li>
            <li>API endpoint is correct</li>
            <li>Network connection</li>
          </ul>
          Error details: ${error.message}
        </div>
      `;
    }

    // Show toast notification
    

    // Add CSS animations for toast
    const style = document.createElement('style');
    style.textContent = `
      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
      }
      @keyframes fadeOut {
        from { opacity: 1; transform: translateY(0); }
        to { opacity: 0; transform: translateY(20px); }
      }
    `;
    document.head.appendChild(style);