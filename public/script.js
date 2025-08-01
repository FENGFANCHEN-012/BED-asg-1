// public/script.js

// Ensure showMessage and API_BASE_URL are available from translation.js
// This script will run on index.html (the home page)

const logoutButton = document.getElementById('logoutButton');
const viewProfileButton = document.getElementById('viewProfileButton');
const mailboxButton = document.querySelector('.mailbox-button');
const notificationSpan = document.getElementById('notification');
const mailboxContent = document.getElementById('mailboxContent');
const messageList = document.getElementById('messageList');

// Settings Modal elements (moved from dashboard.js)
const settingsButton = document.getElementById('settingsButton');
const settingsModal = document.getElementById('settingsModal');
const closeButton = document.querySelector('.modal .close-button'); // Select specifically within modal
const languageSelect = document.getElementById('languageSelect');
const applyTranslationButton = document.getElementById('applyTranslationButton');


// --- Authorization Check on Load ---
document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('jwtToken');
    // If no token, or token is expired/invalid, redirect to sign-in page immediately
    if (!token) {
        showMessage('Please sign in to access the home page.', true);
        window.location.replace('/signin.html');
        return;
    }

    try {
        const decodedToken = JSON.parse(atob(token.split('.')[1]));
        if (decodedToken.exp * 1000 < Date.now()) {
            showMessage('Session expired. Please sign in again.', true);
            localStorage.removeItem('jwtToken');
            localStorage.removeItem('loggedInUsername');
            window.location.replace('/signin.html');
            return;
        }
    } catch (error) {
        console.error('Error decoding token or token invalid:', error);
        showMessage('Invalid session. Please sign in again.', true);
        localStorage.removeItem('jwtToken');
        localStorage.removeItem('loggedInUsername');
        window.location.replace('/signin.html');
        return;
    }

    // If token is valid, fetch mailbox messages (placeholder for now)
    fetchMailboxMessages();
});

// --- Logout Logic (Copied from dashboard.js for consistency) ---
if (logoutButton) {
    logoutButton.addEventListener('click', async () => {
        const token = localStorage.getItem('jwtToken');
        if (token) {
            try {
                const response = await fetch(`${API_BASE_URL}/users/logout`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (response.ok) {
                    console.log('Logged out successfully.');
                    showMessage('Logged out successfully!', false);
                    localStorage.removeItem('jwtToken'); // Always remove token from client
                    localStorage.removeItem('loggedInUsername'); // Remove username on logout
                    window.location.replace('/signin.html'); // Redirect immediately
                } else {
                    const errorData = await response.json();
                    console.error('Server logout failed:', errorData.message);
                    showMessage(errorData.message || 'Logout failed on server.', true);
                    localStorage.removeItem('jwtToken'); // Still remove token
                    localStorage.removeItem('loggedInUsername'); // Remove username on logout
                    window.location.replace('/signin.html'); // Redirect immediately
                }
            } catch (error) {
                console.error('Network error during logout:', error);
                showMessage('Network error during logout.', true);
                localStorage.removeItem('jwtToken');
                localStorage.removeItem('loggedInUsername');
                window.location.replace('/signin.html'); // Redirect immediately
            }
        } else {
            localStorage.removeItem('jwtToken');
            localStorage.removeItem('loggedInUsername');
            window.location.replace('/signin.html'); // Redirect immediately
        }
    });
}

// --- View Profile Button Logic ---
if (viewProfileButton) {
    viewProfileButton.addEventListener('click', () => {
        window.location.href = '/profile.html';
    });
}

// --- Mailbox Functionality ---
// This function is called by the onclick attribute in index.html
function toggleMailbox() {
    mailboxContent.classList.toggle('active');
    // Optionally, clear notification when mailbox is opened
    if (mailboxContent.classList.contains('active')) {
        notificationSpan.textContent = '0';
        notificationSpan.classList.remove('active');
        // In a real app, you'd mark messages as read on the server here
    }
}

// Close mailbox if user clicks outside of it
window.addEventListener('click', (event) => {
    if (!mailboxButton.contains(event.target) && !mailboxContent.contains(event.target) && mailboxContent.classList.contains('active')) {
        mailboxContent.classList.remove('active');
    }
});


// Placeholder function to fetch messages (requires backend API)
async function fetchMailboxMessages() {
    const token = localStorage.getItem('jwtToken');
    if (!token) {
        console.warn('No token found for fetching mailbox messages.');
        return;
    }

    try {
        // This endpoint needs to be implemented on the backend.
        // It should return an array of message objects: [{ message: "...", receive_date: "..." }]
        const response = await fetch(`${API_BASE_URL}/mailbox/me`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            const messages = await response.json();
            renderMailboxMessages(messages);
            updateNotificationCount(messages.length); // Assuming all are unread for now
        } else {
            const errorData = await response.json();
            console.error('Failed to fetch mailbox messages:', errorData);
            showMessage('Failed to load messages.', true);
        }
    } catch (error) {
        console.error('Network error fetching mailbox messages:', error);
        showMessage('Network error: Could not load messages.', true);
    }
}

function renderMailboxMessages(messages) {
    messageList.innerHTML = ''; // Clear existing messages
    if (messages.length === 0) {
        messageList.innerHTML = '<p>No new messages.</p>';
        return;
    }
    messages.forEach(msg => {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message');
        const date = new Date(msg.receive_date).toLocaleString(); // Format date nicely
        messageDiv.innerHTML = `<p>${msg.message}</p><p class="date">${date}</p>`;
        messageList.appendChild(messageDiv);
    });
}

function updateNotificationCount(count) {
    if (notificationSpan) {
        notificationSpan.textContent = count;
        if (count > 0) {
            notificationSpan.classList.add('active');
        } else {
            notificationSpan.classList.remove('active');
        }
    }
}

// Make toggleMailbox globally accessible since it's used in onclick
window.toggleMailbox = toggleMailbox;


// --- Settings Modal Logic (Moved from dashboard.js) ---
if (settingsButton) {
    settingsButton.addEventListener('click', () => {
        settingsModal.style.display = 'flex'; // Show the modal
        // Set the dropdown to the currently stored language on opening
        const storedLanguage = localStorage.getItem('selectedLanguage') || 'en';
        languageSelect.value = storedLanguage;
    });
}

if (closeButton) {
    closeButton.addEventListener('click', () => {
        settingsModal.style.display = 'none'; // Hide the modal
    });
}

// Close modal if user clicks outside of it
window.addEventListener('click', (event) => {
    if (event.target == settingsModal) {
        settingsModal.style.display = 'none';
    }
});

// --- Language Selection and Apply Button (Moved from dashboard.js) ---
if (languageSelect) {
    languageSelect.addEventListener('change', () => {
        localStorage.setItem('selectedLanguage', languageSelect.value);
    });
}

if (applyTranslationButton) {
    applyTranslationButton.addEventListener('click', () => {
        const targetLanguage = languageSelect.value;
        applyTranslation(targetLanguage); // Call the reusable function from translation.js
        settingsModal.style.display = 'none'; // Close modal after applying
    });
}
