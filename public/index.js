const logoutButton = document.getElementById('logoutButton');
  
  // Function to fetch messages from the backend
        async function fetchMessages() {
            try {
                // Hardcoded user_id for demo; replace with authenticated user ID
                const userId = localStorage.getItem("user_id")
                const response = await fetch(`http://localhost:3000/mailbox/${userId}`);
                if (!response.ok) {
                    throw new Error('Failed to fetch messages');
                }
                const messages = await response.json();
                return messages;
            } catch (error) {
                console.error('Error fetching messages:', error);
                return [];
            }
        }

        // Function to update notification and message list
        async function updateMailbox() {
            const notification = document.getElementById('notification');
            const messageList = document.getElementById('messageList');
            const messages = await fetchMessages();

            // Update notification count
            const messageCount = messages.length;
            notification.textContent = messageCount;
            if (messageCount > 0) {
                notification.classList.add('active');
            } else {
                notification.classList.remove('active');
            }

            // Populate message list
            messageList.innerHTML = '';
            if (messageCount === 0) {
                messageList.innerHTML = '<p>No new messages.</p>';
            } else {
                messages.forEach(message => {
                    const messageElement = document.createElement('div');
                    messageElement.classList.add('message');
                    messageElement.innerHTML = `
                        <p class="date">Received: ${message.receive_date}</p>
                        <p>${message.message}</p>
                    `;
                    messageList.appendChild(messageElement);
                });
            }
        }

        // Function to toggle mailbox visibility
        function toggleMailbox() {
            const mailboxContent = document.getElementById('mailboxContent');
            mailboxContent.classList.toggle('active');
        }

        // Initialize mailbox on page load
        window.onload = updateMailbox;


// --- Logout Logic ---
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
                showMessage('Logged out successfully!', false); // Show message first
                setTimeout(() => { // Then redirect after a short delay
                    localStorage.removeItem('jwtToken'); // Always remove token from client
                    localStorage.removeItem('loggedInUsername'); // Remove username on logout
                    window.location.replace('/'); // Use replace for immediate redirection
                }, 1000); // Wait 1 second for message to be seen
            } else {
                const errorData = await response.json();
                console.error('Server logout failed:', errorData.message);
                showMessage(errorData.message || 'Logout failed on server.', true);
                // No setTimeout for error, redirect immediately if server logout failed
                localStorage.removeItem('jwtToken'); // Still remove token
                localStorage.removeItem('loggedInUsername'); // Remove username on logout
                window.location.replace('/'); // Redirect even on server error
            }
        } catch (error) {
            console.error('Network error during logout:', error);
            showMessage('Network error during logout.', true);
            localStorage.removeItem('jwtToken'); // Still remove token
            localStorage.removeItem('loggedInUsername'); // Remove username on logout
            window.location.replace('/'); // Redirect on network error
        }
    } else {
        localStorage.removeItem('jwtToken');
        localStorage.removeItem('loggedInUsername'); // Remove username if no token found
        window.location.replace('/'); // Use replace for immediate redirection
    }
});