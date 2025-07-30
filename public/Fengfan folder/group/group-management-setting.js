// ---------------------------------------------------------
const apiBaseUrl = "http://localhost:3000";
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







const groupDetailsDiv = document.getElementById('group-details');
const memberListDiv = document.getElementById('member-list');
const deleteBox = document.getElementById('delete-box');
      
const storedGroup = JSON.parse(localStorage.getItem("current_group"));

document.addEventListener('DOMContentLoaded', async function() {
    try {
        const storedGroup = JSON.parse(localStorage.getItem("current_group"));
        console.log(storedGroup)
        currentGroupId = storedGroup.group_id;
        currentUserId = parseInt(localStorage.getItem("user_id")) || 1;
        
        if (!currentGroupId) {
            showError("Group ID not found");
            return;
        }
        
        await loadGroupDetails(storedGroup.owner_id);
        await loadGroupMembers();
       
    } catch (error) {
        console.error("Initialization error:", error);
        showError("Failed to initialize page");
    }
});


async function loadGroupDetails() {
    try {
        const response = await fetch(`${apiBaseUrl}/member/detail/${storedGroup.owner_id}`);
        if (!response.ok) throw new Error('Failed to fetch group details');
        
      
  const result = await response.json();
  console.log(result)
  const ownerName = result.data.name; 
      


        
       renderGroupDetails(storedGroup,ownerName)
    } catch (error) {
        console.error('Error loading group details:', error);
        showError('Error loading group details');
    }
}


async function renderGroupDetails(group,name) {
    try{
      console.log(group.group_id)
      const response = await fetch(`${apiBaseUrl}/detail/group/${group.group_id}`);
        if (!response.ok) throw new Error('Failed to fetch group');
        
      
  const result = await response.json();
 const data = result.data[0];
console.log(data)
 
  
    let imageUrl = null;
    if(data.photo_url) {
     imageUrl =  base64ToBlobUrl(data.photo_url, 'image/png') 
    }
  
  
    
    groupDetailsDiv.innerHTML = `
        <img src="${imageUrl}" alt="Group Image">
        <div id="group-info">
            <p><strong>Group Name:</strong> ${data.name}</p>
            <p><strong>Description:</strong> ${data.description || 'No description'}</p>
            <p><strong>Created On:</strong> ${new Date(data.create_date).toLocaleDateString()}</p>
            <p><strong>Members:</strong> ${data.member_count || 0}</p>
            <p><strong>Owner:</strong> ${name || "Unknown"}</p>
        </div>
    `;}
    catch(error){
      console.log(error)
    }
}


async function loadGroupMembers() {
    try {
        const response = await fetch(`${apiBaseUrl}/group/${currentGroupId}/members/profile`);
        if (!response.ok) throw new Error('Failed to fetch group members');
        
        const membersData = await response.json();
        
        if (membersData.success && membersData.data) {
            renderGroupMembers(membersData.data);
            setupMemberClickHandlers(); 
        } else {
            throw new Error('Invalid members data received');
        }
    } catch (error) {
        console.error('Error loading group members:', error);
        memberListDiv.innerHTML = '<p>Error loading group members.</p>';
    }
}

function setupMemberClickHandlers() {
    
    memberListDiv.addEventListener('click', function(e) {
        const memberCard = e.target.closest('.member-card');
        if (memberCard) {
            const userId = memberCard.getAttribute('data-user-id');
            if (userId) {
                localStorage.setItem("view_member_id", userId);
                window.location.href = `member-profile.html?user_id=${userId}`;
            }
        }
    });
}


function renderGroupMembers(members) {
    if (!members || members.length === 0) {
        memberListDiv.innerHTML = '<p>No members found in this group.</p>';
        return;
    }
    
    let membersHTML = '';
    members.forEach(member => {
        const memberImageUrl = base64ToBlobUrl(member.profile_picture, 'image/png') || 'default-profile.png';
        
        membersHTML += `
            <div class="member-card" data-user-id="${member.user_id}">
                <img src="${memberImageUrl}" alt="Member Photo" class="member-photo">
                <div class="member-details">
                    <p><strong>Name:</strong> ${member.name || 'Unknown'}</p>
                    <p><strong>Role:</strong> ${member.role || 'member'}</p>
                    <p><strong>Joined:</strong> ${new Date(member.join_date).toLocaleDateString()}</p>
                </div>
            </div>
        `;
    });
    
    memberListDiv.innerHTML = membersHTML;
}


function deleteGroup() {
    deleteBox.style.display = 'block';
}

function cancelDelete() {
    deleteBox.style.display = 'none';
    document.getElementById('delete-reason').value = '';
}

async function confirmDelete() {
    const reason = document.getElementById('delete-reason').value.trim();
    
    if (!reason) {
        showError('Please enter a reason for deletion');
        return;
    }
    
    try {
        const confirmed = await showConfirm('Are you sure you want to delete this group? This action cannot be undone.');
        if (!confirmed) return;
        
        const response = await fetch(`${apiBaseUrl}/group/${currentGroupId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ reason })
        });
        
        const result = await response.json();
        
        
        if (result) {
            showSuccess('Group deleted successfully!');
            setTimeout(() => {
      window.location.href = 'Group-management.html' 
       ;
}, 1500); 
             
        
            
        } 
        else {
           showError("Delete Group Fail, please contact admin for help, or try again later")
            throw new Error(result.message || 'Failed to delete group');
           
        }
    } 
    
    catch (error) {
        console.error('Error deleting group:', error);
       
    } finally {
        deleteBox.style.display = 'none';
        document.getElementById('delete-reason').value = '';
    }
}


function changeGroupInfo() {
    window.location.href = 'edit-group.html';
}


function setupMemberClickHandlers() {
    document.addEventListener('click', function(e) {
        const memberCard = e.target.closest('.member-card');
        if (memberCard) {
            const userId = memberCard.getAttribute('data-user-id');
            if (userId) {
                localStorage.setItem("view_member_id", userId);
                window.location.href = `member-profile.html?user_id=${userId}`;
            }
        }
    });
}


setupMemberClickHandlers();