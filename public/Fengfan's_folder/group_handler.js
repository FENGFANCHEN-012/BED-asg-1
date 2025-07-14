

 const apiBaseUrl = "http://localhost:3000";
    let groupsData = {};
  
 

    //

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




// loadGroups
 
 // let userId = localStorage.getItem("userId")
let userId = 1;
document.addEventListener('DOMContentLoaded', () => {
  // Get user ID (use actual user ID retrieval in production)
  const userId = localStorage.getItem("user_id") || 1; // Fallback to 1 for testing
  
  // Load groups and setup event listeners
  loadGroups(userId).then(groups => {
    if (groups && groups.data) {
      // Store all groups data in localStorage
      localStorage.setItem("user_groups", JSON.stringify(groups.data));
      
      // Setup click handlers for detail buttons
      document.querySelectorAll('.blue-button').forEach(button => {
        button.addEventListener('click', function(e) {
          e.preventDefault();
          
          // Get the group ID from the attribute
          const groupId = this.getAttribute('group_data');
          
          // Find the full group data
          const groupData = groups.data.find(g => g.group_id == groupId);
          
          if (groupData) {
            // Store the specific group's data
            localStorage.setItem("current_group", JSON.stringify(groupData));
            
            // Redirect to management page
            window.location.href = `group-management-setting.html`;
          } else {
            showError("Group data not found");
          }
        });
      });
    }
  });
});

// Modified loadGroups function to return the data
async function loadGroups(userId) {
  const groupsContainer = document.getElementById('groupsContainer');
  groupsContainer.innerHTML = '<p>Loading...</p>';

  if (!userId) {
    groupsContainer.innerHTML = '<p style="color: red;">User ID is missing!</p>';
    return;
  }

  try {
    const response = await fetch(`${apiBaseUrl}/group/${userId}`);
    if (!response.ok) throw new Error('Failed to fetch groups');

    const data = await response.json();
    
    if (!data.success || !data.data.length) {
      groupsContainer.innerHTML = '<p>No groups found.</p>';
      return data; // Still return the data even if empty
    }

    groupsContainer.innerHTML = '';

    data.data.forEach(group => {
      const groupDiv = document.createElement('div');
      groupDiv.classList.add('friend');
       
      groupDiv.innerHTML = `
        <div class="friend-info">
          <img src="${group.photo_url || 'default-group.png'}" alt="${group.name}" class="friend-photo" />
          <div class="friend-details">
            <p><strong>${group.name}</strong></p>
            <p>${group.description || ''}</p>
            <p>Members: ${group.member_count}</p>
            <p>Role: ${group.role}</p>
          </div>
        </div>
        <div class="friend-actions">
          <button class="blue-button detail" style="width:10vw" group_data="${group.group_id}">Details</button>
        </div>
      `;

      groupsContainer.appendChild(groupDiv);
    });

    return data; // Return the fetched data

  } catch (error) {
    groupsContainer.innerHTML = `<p style="color: red;">Error loading groups: ${error.message}</p>`;
    throw error; // Re-throw the error for handling upstream
  }
}
    
