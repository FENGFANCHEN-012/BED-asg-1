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