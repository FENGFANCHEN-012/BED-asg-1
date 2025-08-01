const userTableBody = document.getElementById('userTableBody');
const logoutButton = document.getElementById('logoutButton');
const settingsButton = document.getElementById('settingsButton');
const settingsModal = document.getElementById('settingsModal');
const closeButton = document.querySelector('.modal .close-button'); // Select specifically within modal
const languageSelect = document.getElementById('languageSelect');
const applyTranslationButton = document.getElementById('applyTranslationButton');


// showMessage function is available from translation.js (ensure translation.js is loaded first)

// Function to fetch and display user profiles
async function fetchUserProfiles() {
    const token = localStorage.getItem('jwtToken');
    if (!token) {
        showMessage('Unauthorized: Please log in.', true);
        window.location.replace('/signin.html'); // Changed to signin.html
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/users/profiles`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.status === 403) { // Forbidden
            showMessage('Access Denied: You do not have admin privileges.', true);
            setTimeout(() => {
                window.location.replace('/index.html'); // Redirect non-admins to home page
            }, 1500);
            return;
        }

        if (!response.ok) {
            const errorData = await response.json();
            showMessage(errorData.error || 'Failed to fetch user profiles.', true);
            console.error('Error fetching profiles:', errorData);
            return;
        }

        const users = await response.json();
        renderUserTable(users);

    } catch (error) {
        console.error('Network error fetching user profiles:', error);
        showMessage('An error occurred while fetching user profiles.', true);
    }
}

// Function to render user data in the table
function renderUserTable(users) {
    userTableBody.innerHTML = ''; // Clear existing rows
    if (users.length === 0) {
        userTableBody.innerHTML = `<tr><td colspan="7" data-translate-key="no_users_found">No users found.</td></tr>`;
        return;
    }

    users.forEach(user => {
        const row = userTableBody.insertRow();
        row.innerHTML = `
            <td>${user.user_id}</td>
            <td>${user.username}</td>
            <td>${user.email || 'N/A'}</td>
            <td>${user.role}</td>
            <td>${user.name || 'N/A'}</td>
            <td>${user.age || 'N/A'}</td>
            <td><button class="delete-button" data-user-id="${user.user_id}" data-translate-key="delete_button">Delete</button></td>
        `;
        // Add event listener to the delete button
        row.querySelector('.delete-button').addEventListener('click', (event) => {
            const userIdToDelete = event.target.dataset.userId;
            // Using a simple confirm. In a real app, replace with a custom modal for better UX.
            if (confirm('Are you sure you want to delete this user?')) {
                deleteUser(userIdToDelete);
            }
        });
    });
}

// Function to delete a user
async function deleteUser(userId) {
    const token = localStorage.getItem('jwtToken');
    if (!token) {
        showMessage('Unauthorized: Please log in.', true);
        window.location.replace('/signin.html'); // Changed to signin.html
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/users/profiles/${userId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            const errorData = await response.json();
            showMessage(errorData.error || 'Failed to delete user.', true);
            console.error('Error deleting user:', errorData);
            return;
        }

        showMessage(`User ${userId} deleted successfully.`, false);
        fetchUserProfiles(); // Refresh the table after deletion

    } catch (error) {
        console.error('Network error deleting user:', error);
        showMessage('An error occurred while deleting the user.', true);
    }
}

// --- Event Listeners and Initial Load ---
document.addEventListener('DOMContentLoaded', () => {
    // Initial check for admin role and fetch profiles
    const token = localStorage.getItem('jwtToken');
    if (token) {
        try {
            // Basic token decode to check role. For robust check, server-side validation is primary.
            const decodedToken = JSON.parse(atob(token.split('.')[1]));
            // Check decodedToken.role as it's directly in the payload
            if (decodedToken.role === 'admin') {
                fetchUserProfiles();
            } else {
                showMessage('Access Denied: You are not authorized to view this page.', true);
                setTimeout(() => {
                    window.location.replace('/index.html'); // Redirect non-admins to home page
                }, 1500);
            }
        } catch (error) {
            console.error('Error decoding token:', error);
            showMessage('Invalid token. Please log in again.', true);
            localStorage.removeItem('jwtToken');
            window.location.replace('/signin.html'); // Changed to signin.html
        }
    } else {
        showMessage('Unauthorized: Please log in.', true);
        window.location.replace('/signin.html'); // Changed to signin.html
    }

    // Logout Logic
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
                        window.location.replace('/signin.html'); // Changed to signin.html
                    }, 1000); // Wait 1 second for message to be seen
                } else {
                    const errorData = await response.json();
                    console.error('Server logout failed:', errorData.message);
                    showMessage(errorData.message || 'Logout failed on server.', true);
                    // No setTimeout for error, redirect immediately if server logout failed
                    localStorage.removeItem('jwtToken'); // Still remove token
                    window.location.replace('/signin.html'); // Changed to signin.html
                }
            } catch (error) {
                console.error('Network error during logout:', error);
                showMessage('Network error during logout.', true);
                localStorage.removeItem('jwtToken'); // Still remove token
                window.location.replace('/signin.html'); // Changed to signin.html
            }
        } else {
            localStorage.removeItem('jwtToken');
            window.location.replace('/signin.html'); // Changed to signin.html
        }
    });

    // Settings Modal Logic
    settingsButton.addEventListener('click', () => {
        settingsModal.style.display = 'flex';
        const storedLanguage = localStorage.getItem('selectedLanguage') || 'en';
        languageSelect.value = storedLanguage;
    });

    closeButton.addEventListener('click', () => {
        settingsModal.style.display = 'none';
    });

    window.addEventListener('click', (event) => {
        if (event.target == settingsModal) {
            settingsModal.style.display = 'none';
        }
    });

    // Language Selection and Apply Button
    languageSelect.addEventListener('change', () => {
        localStorage.setItem('selectedLanguage', languageSelect.value);
    });

    applyTranslationButton.addEventListener('click', () => {
        const targetLanguage = languageSelect.value;
        applyTranslation(targetLanguage); // Call the reusable function from translation.js
        settingsModal.style.display = 'none';
    });
});
