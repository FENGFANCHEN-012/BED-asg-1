const logoutButton = document.getElementById('logoutButton');
const settingsButton = document.getElementById('settingsButton');
const settingsModal = document.getElementById('settingsModal');
const closeButton = document.querySelector('.close-button');
const languageSelect = document.getElementById('languageSelect');
const applyTranslationButton = document.getElementById('applyTranslationButton');
const viewProfileButton = document.getElementById('viewProfileButton');
const displayUsernamePlaceholder = document.getElementById('displayUsernamePlaceholder'); // New: Get the placeholder element


// Add this new event listener in the DOMContentLoaded block or after other listeners
viewProfileButton.addEventListener('click', () => {
    window.location.href = '/profile.html';
});

// --- Display Username and Authorization Check on Load ---
document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('jwtToken');
    const username = localStorage.getItem('loggedInUsername');

    if (!token) {
        // If no token, user is not logged in, redirect immediately
        showMessage('Unauthorized: Please log in.', true);
        window.location.replace('/');
        return;
    }

    try {
        // Basic client-side token decode to check if it's malformed or expired.
        // Server-side validation (via verifyJWT) is the ultimate authority.
        const decodedToken = JSON.parse(atob(token.split('.')[1]));

        // Check for token expiration (client-side check)
        if (decodedToken.exp * 1000 < Date.now()) {
            showMessage('Session expired. Please log in again.', true);
            localStorage.removeItem('jwtToken');
            localStorage.removeItem('loggedInUsername');
            window.location.replace('/');
            return;
        }

        // If token exists and is not expired (client-side check), display username
        if (displayUsernamePlaceholder && username) {
            displayUsernamePlaceholder.textContent = username;
        } else if (displayUsernamePlaceholder) {
            // Fallback if username is not found but token exists (shouldn't happen with proper login flow)
            displayUsernamePlaceholder.textContent = 'User';
        }

    } catch (error) {
        console.error('Error decoding token or token invalid:', error);
        showMessage('Invalid session. Please log in again.', true);
        localStorage.removeItem('jwtToken');
        localStorage.removeItem('loggedInUsername');
        window.location.replace('/');
    }
});


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

// --- Settings Modal Logic ---
settingsButton.addEventListener('click', () => {
    settingsModal.style.display = 'flex'; // Show the modal
    // Set the dropdown to the currently stored language on opening
    const storedLanguage = localStorage.getItem('selectedLanguage') || 'en';
    languageSelect.value = storedLanguage;
});

closeButton.addEventListener('click', () => {
    settingsModal.style.display = 'none'; // Hide the modal
});

// Close modal if user clicks outside of it
window.addEventListener('click', (event) => {
    if (event.target == settingsModal) {
        settingsModal.style.display = 'none';
    }
});

// --- Language Selection and Apply Button ---
languageSelect.addEventListener('change', () => {
    localStorage.setItem('selectedLanguage', languageSelect.value);
});

applyTranslationButton.addEventListener('click', () => {
    const targetLanguage = languageSelect.value;
    applyTranslation(targetLanguage); // Call the reusable function from translation.js
    settingsModal.style.display = 'none'; // Close modal after applying
});

// The DOMContentLoaded listener for initial translation is now in translation.js
