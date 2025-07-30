



const apiBaseUrl = "http://localhost:3000";
const chatBody = document.getElementById('chatBody');
const messageInput = document.getElementById('messageInput');
const sendBtn = document.getElementById('sendBtn');
const cancelBtn = document.getElementById('cancelBtn');
const groupName = document.getElementById('groupName');

const currentGroup = JSON.parse(localStorage.getItem('current_group')) || { group_id: 1, name: 'Default Group' };
const userId = localStorage.getItem('user_id') || '1';
let lastMessageId = 0;

// Inject alert styles (from your provided code)
function injectAlertStyles() {
  const style = document.createElement('style');
  style.textContent = `
    .alert-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background-color: rgba(0,0,0,0.85); display: flex; justify-content: center; align-items: center; z-index: 99999; }
    .alert-box { background-color: #ffffff; padding: 50px 60px; border-radius: 25px; box-shadow: 0 15px 40px rgba(0,0,0,0.5); width: 70%; max-width: 700px; min-width: 500px; text-align: center; border: 4px solid #f5f5f5; }
    .alert-message { font-size: 32px; margin-bottom: 40px; color: #111111; line-height: 1.8; font-weight: 600; letter-spacing: 1px; }
    .alert-button { background-color: #1E4A9B; color: white; border: none; padding: 25px 50px; font-size: 28px; border-radius: 15px; cursor: pointer; transition: all 0.3s; min-width: 250px; box-shadow: 0 8px 16px rgba(0,0,0,0.2); font-weight: 600; letter-spacing: 1px; }
    .alert-button:hover { background-color: #265BB8; transform: translateY(-3px); box-shadow: 0 12px 24px rgba(0,0,0,0.3); }
    .alert-button:active { transform: translateY(2px); box-shadow: 0 4px 8px rgba(0,0,0,0.2); }
    @media (max-width: 768px) {
      .alert-box { width: 90%; min-width: 90%; padding: 40px 30px; }
      .alert-message { font-size: 28px; margin-bottom: 30px; }
      .alert-button { font-size: 24px; padding: 20px 40px; min-width: 80%; }
    }
  `;
  document.head.appendChild(style);
}

function showError(message = 'An error occurred') {
  const overlay = document.createElement('div');
  overlay.className = 'alert-overlay';
  const alertBox = document.createElement('div');
  alertBox.className = 'alert-box';
  const messageElement = document.createElement('div');
  messageElement.className = 'alert-message';
  messageElement.textContent = message;
  const button = document.createElement('button');
  button.className = 'alert-button';
  button.textContent = 'Try Again';
  alertBox.appendChild(messageElement);
  alertBox.appendChild(button);
  overlay.appendChild(alertBox);
  document.body.appendChild(overlay);
  button.onclick = () => {
    document.body.removeChild(overlay);
  };
}

function base64ToBlobUrl(base64, mimeType = 'image/png') {
  if (!base64) return 'https://i.pravatar.cc/70?img=12';
  if (typeof base64 === 'string' && (base64.startsWith('http://') || base64.startsWith('https://'))) {
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
    console.error('Base64 conversion error:', error);
    return 'https://i.pravatar.cc/70?img=12';
  }
}

// Load group chat history
async function loadGroupChatHistory() {
  try {
    // Set group name from localStorage
    groupName.innerText = currentGroup.name || 'Group Chat';

    // Fetch chat history
    const response = await fetch(`${apiBaseUrl}/group-chat/${currentGroup.group_id}`);
    if (!response.ok) throw new Error('Failed to fetch chat history');
    const messages = await response.json();

    // Only append new messages
    const newMessages = messages.filter(msg => msg.chat_id > lastMessageId);
    newMessages.forEach(appendMessage);

    if (messages.length > 0) {
      lastMessageId = Math.max(...messages.map(msg => msg.chat_id));
    }

    chatBody.scrollTop = chatBody.scrollHeight;
  } catch (error) {
    console.error('Error loading group chat:', error);
    // Avoid repeated alerts during polling
  }
}

// Append a message to the chat body
function appendMessage(message) {
  const isSent = message.sender_id == userId;
  const senderName = isSent ? 'You' : (message.sender_display_name || message.sender_name);
  const avatarImg = message.profile_picture ? base64ToBlobUrl(message.profile_picture) : `https://i.pravatar.cc/70?img=${message.sender_id}`;

  const messageDiv = document.createElement('div');
  messageDiv.className = `message ${isSent ? 'sent' : 'received'}`;
  messageDiv.setAttribute('role', 'article');
  messageDiv.innerHTML = `
    <img src="${avatarImg}" alt="${senderName} Avatar" class="avatar" />
    <div class="name">${senderName}</div>
    <div class="text">${message.message}</div>
  `;
  chatBody.appendChild(messageDiv);
}

// Send a group message
async function sendGroupMessage() {
  const message = messageInput.value.trim();
  if (!message) return;

  try {
    const response = await fetch(`${apiBaseUrl}/group-chat/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        group_id: currentGroup.group_id,
        sender_id: userId,
        message
      })
    });

    if (response.ok) {
      messageInput.value = '';
      await loadGroupChatHistory();
    } else {
      const errorData = await response.json();
      showError(errorData.error || 'Failed to send message');
    }
  } catch (error) {
    console.error('Error sending message:', error);
    showError('Error sending message');
  }
}

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
  injectAlertStyles();
  sendBtn.addEventListener('click', sendGroupMessage);
  messageInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') sendGroupMessage();
  });
  cancelBtn.addEventListener('click', () => {
    messageInput.value = '';
    window.location.href = '../group/group-management.html';
  });

  // Initial load
  loadGroupChatHistory();
  // Poll for new messages every 5 seconds
  setInterval(loadGroupChatHistory, 5000);
});