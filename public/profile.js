// public/profile.js

const displayName = document.getElementById('displayName');
const displayAge = document.getElementById('displayAge');
const displayHobbies = document.getElementById('displayHobbies');
const displayDescription = document.getElementById('displayDescription');

const profileDisplayArea = document.querySelector('.profile-display-area');
const profileEditArea = document.querySelector('.profile-edit-area');

const editProfileNameInput = document.getElementById('editProfileName');
const editProfileAgeInput = document.getElementById('editProfileAge');
const editProfileHobbiesInput = document.getElementById('editProfileHobbies');
const editProfileDescriptionInput = document.getElementById('editProfileDescription');

const editProfileButton = document.getElementById('editProfileButton');
const saveProfileButton = document.getElementById('saveProfileButton');
const cancelEditButton = document.getElementById('cancelEditButton');
const backToDashboardButton = document.getElementById('backToDashboardButton'); // Still exists for now, will redirect to index
const logoutButton = document.getElementById('logoutButton');

// Settings Modal elements (reused from dashboard.js)
const settingsButton = document.getElementById('settingsButton');
const settingsModal = document.getElementById('settingsModal');
const closeButton = document.querySelector('.modal .close-button'); // Select specifically within modal
const languageSelect = document.getElementById('languageSelect');
const applyTranslationButton = document.getElementById('applyTranslationButton');


// showMessage function is available from translation.js (ensure translation.js is loaded first)

let currentProfileData = {}; // To store the fetched profile data

// Function to display profile data
function displayProfile(profile) {
    displayName.textContent = profile.name || 'N/A';
    displayAge.textContent = profile.age || 'N/A';
    displayHobbies.textContent = profile.hobbies || 'N/A';
    displayDescription.textContent = profile.description || 'N/A';
}

// Function to enter edit mode
function enterEditMode() {
    profileDisplayArea.style.display = 'none';
    profileEditArea.style.display = 'block';

    // Populate edit fields with current data
    editProfileNameInput.value = currentProfileData.name || '';
    editProfileAgeInput.value = currentProfileData.age || '';
    editProfileHobbiesInput.value = currentProfileData.hobbies || '';
    editProfileDescriptionInput.value = currentProfileData.description || '';
}

// Function to exit edit mode
function exitEditMode() {
    profileDisplayArea.style.display = 'block';
    profileEditArea.style.display = 'none';
}

// Function to fetch user's own profile
async function fetchOwnProfile() {
    const token = localStorage.getItem('jwtToken');
    if (!token) {
        showMessage('Unauthorized: Please log in.', true);
        window.location.replace('/signin.html'); // Changed to signin.html
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/profiles/me`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.status === 403) { // Forbidden
            showMessage('Access Denied: You are not authorized to view this page.', true);
            setTimeout(() => {
                window.location.replace('/index.html'); // Redirect to home page if not allowed
            }, 1500);
            return;
        }

        if (!response.ok) {
            const errorData = await response.json();
            showMessage(errorData.error || 'Failed to fetch profile.', true);
            console.error('Error fetching profile:', errorData);
            return;
        }

        const profile = await response.json();
        currentProfileData = profile; // Store fetched data
        displayProfile(profile);

    } catch (error) {
        console.error('Network error fetching profile:', error);
        showMessage('An error occurred while fetching your profile.', true);
    }
}

// Function to save updated profile
async function saveProfile() {
    const token = localStorage.getItem('jwtToken');
    if (!token) {
        showMessage('Unauthorized: Please log in.', true);
        window.location.replace('/signin.html'); // Changed to signin.html
        return;
    }

    const updatedName = editProfileNameInput.value.trim();
    const updatedAge = parseInt(editProfileAgeInput.value.trim());
    const updatedHobbies = editProfileHobbiesInput.value.trim();
    const updatedDescription = editProfileDescriptionInput.value.trim();

    // Basic client-side validation for required fields
    if (!updatedName || isNaN(updatedAge)) {
        showMessage('Profile Name and Age are required.', true);
        return;
    }
    if (updatedAge < 1 || updatedAge > 120) {
        showMessage('Age must be between 1 and 120.', true);
        return;
    }

    const updatedData = {
        name: updatedName,
        age: updatedAge,
        hobbies: updatedHobbies,
        description: updatedDescription
    };

    try {
        const response = await fetch(`${API_BASE_URL}/profiles/me`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(updatedData)
        });

        if (response.ok) {
            const result = await response.json();
            showMessage(result.message || 'Profile updated successfully!', false);
            // Update the stored currentProfileData with the newly saved data
            currentProfileData = {
                ...currentProfileData, // Keep username and email as they are not editable here
                name: result.profile.name,
                age: result.profile.age,
                hobbies: result.profile.hobbies,
                description: result.profile.description
            };
            displayProfile(currentProfileData); // Re-render with new data
            exitEditMode(); // Go back to display mode
        } else {
            const errorData = await response.json();
            showMessage(errorData.error || 'Failed to update profile.', true);
            console.error('Failed to update profile:', errorData);
        }
    } catch (error) {
        console.error('Network error updating profile:', error);
        showMessage('Network error: Could not connect to the server to update profile.', true);
    }
}

// --- Event Listeners and Initial Load ---
document.addEventListener('DOMContentLoaded', () => {
    // Check for token on page load and redirect if not present or invalid
    const token = localStorage.getItem('jwtToken');
    if (!token) {
        showMessage('Unauthorized: Please log in.', true);
        window.location.replace('/signin.html'); // Changed to signin.html
        return;
    }
    try {
        const decodedToken = JSON.parse(atob(token.split('.')[1]));
        if (decodedToken.exp * 1000 < Date.now()) {
            showMessage('Session expired. Please log in again.', true);
            localStorage.removeItem('jwtToken');
            localStorage.removeItem('loggedInUsername');
            window.location.replace('/signin.html'); // Changed to signin.html
            return;
        }
    } catch (error) {
        console.error('Error decoding token or token invalid:', error);
        showMessage('Invalid session. Please log in again.', true);
        localStorage.removeItem('jwtToken');
        localStorage.removeItem('loggedInUsername');
        window.location.replace('/signin.html'); // Changed to signin.html
        return;
    }

    fetchOwnProfile(); // Fetch profile data on page load

    editProfileButton.addEventListener('click', enterEditMode);
    saveProfileButton.addEventListener('click', saveProfile);
    cancelEditButton.addEventListener('click', exitEditMode);

    backToDashboardButton.addEventListener('click', () => {
        window.location.href = '/index.html'; // Redirect to home page
    });

    // Logout Logic (Copied from home.js for consistency)
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
                    setTimeout(() => {
                        localStorage.removeItem('jwtToken');
                        localStorage.removeItem('loggedInUsername');
                        window.location.replace('/signin.html'); // Changed to signin.html
                    }, 1000);
                } else {
                    const errorData = await response.json();
                    console.error('Server logout failed:', errorData.message);
                    showMessage(errorData.message || 'Logout failed on server.', true);
                    localStorage.removeItem('jwtToken');
                    localStorage.removeItem('loggedInUsername');
                    window.location.replace('/signin.html'); // Changed to signin.html
                }
            } catch (error) {
                console.error('Network error during logout:', error);
                showMessage('Network error during logout.', true);
                localStorage.removeItem('jwtToken');
                localStorage.removeItem('loggedInUsername');
                window.location.replace('/signin.html'); // Changed to signin.html
            }
        } else {
            localStorage.removeItem('jwtToken');
            localStorage.removeItem('loggedInUsername');
            window.location.replace('/signin.html'); // Changed to signin.html
        }
    });

    // Settings Modal Logic (reused from home.js)
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
        applyTranslation(targetLanguage);
        settingsModal.style.display = 'none';
    });
});