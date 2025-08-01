// public/profile.js

const displayUsername = document.getElementById('displayUsername');
const displayEmail = document.getElementById('displayEmail');
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
const backToDashboardButton = document.getElementById('backToDashboardButton');
const logoutButton = document.getElementById('logoutButton');

// Settings Modal elements (reused from dashboard.js)
const settingsButton = document.getElementById('settingsButton');
const settingsModal = document.getElementById('settingsModal');
const closeButton = document.querySelector('.modal .close-button');
const languageSelect = document.getElementById('languageSelect');
const applyTranslationButton = document.getElementById('applyTranslationButton');


let currentProfileData = {}; // Store the fetched profile data to revert on cancel

document.addEventListener('DOMContentLoaded', async () => {
    // Initial fetch and display of profile data
    await fetchAndDisplayProfile();

    // Event Listeners
    editProfileButton.addEventListener('click', enterEditMode);
    saveProfileButton.addEventListener('click', saveProfileChanges);
    cancelEditButton.addEventListener('click', exitEditMode); // Exit without saving
    backToDashboardButton.addEventListener('click', () => {
        window.location.href = '/dashboard.html';
    });

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
                } else {
                    const errorData = await response.json();
                    console.error('Server logout failed:', errorData.message);
                    showMessage(errorData.message || 'Logout failed on server.', true);
                }
            } catch (error) {
                console.error('Network error during logout:', error);
                showMessage('Network error during logout.', true);
            } finally {
                localStorage.removeItem('jwtToken'); // Always remove token from client
                window.location.href = '/'; // Redirect to login page
            }
        } else {
            localStorage.removeItem('jwtToken');
            window.location.href = '/';
        }
    });

    // Settings Modal Logic (reused from dashboard.js)
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

    languageSelect.addEventListener('change', () => {
        localStorage.setItem('selectedLanguage', languageSelect.value);
    });

    applyTranslationButton.addEventListener('click', () => {
        const targetLanguage = languageSelect.value;
        applyTranslation(targetLanguage); // Call the reusable function from translation.js
        settingsModal.style.display = 'none';
    });
});

async function fetchAndDisplayProfile() {
    const token = localStorage.getItem('jwtToken');
    if (!token) {
        showMessage('Unauthorized: Please log in.', true);
        window.location.href = '/';
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/profiles/me`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            const profile = await response.json();
            currentProfileData = profile; // Store for later use (e.g., cancelling edit)
            displayProfile(profile);
            applyTranslation(localStorage.getItem('selectedLanguage') || 'en'); // Apply translation after loading content
        } else if (response.status === 404) {
            showMessage('Profile not found. Please ensure your account has a profile.', true);
            console.warn('Profile not found for this user.');
            // Optionally redirect or provide a way to create a profile if it's genuinely missing.
        } else {
            const errorData = await response.json();
            showMessage(errorData.error || 'Failed to fetch profile.', true);
            console.error('Failed to fetch profile:', errorData);
            if (response.status === 401 || response.status === 403) {
                 setTimeout(() => { window.location.href = '/'; }, 1500);
            }
        }
    } catch (error) {
        console.error('Network error fetching profile:', error);
        showMessage('Network error: Could not connect to the server to fetch profile.', true);
    }
}

function displayProfile(profile) {
    displayUsername.textContent = profile.username || 'N/A';
    displayEmail.textContent = profile.email || 'N/A';
    displayName.textContent = profile.name || 'Not set';
    displayAge.textContent = profile.age || 'Not set';
    displayHobbies.textContent = profile.hobbies || 'None';
    displayDescription.textContent = profile.description || 'No description provided.';
}

function enterEditMode() {
    // Populate edit fields with current profile data
    editProfileNameInput.value = currentProfileData.name || '';
    editProfileAgeInput.value = currentProfileData.age || '';
    editProfileHobbiesInput.value = currentProfileData.hobbies || '';
    editProfileDescriptionInput.value = currentProfileData.description || '';

    profileDisplayArea.style.display = 'none';
    profileEditArea.style.display = 'block';
}

function exitEditMode() {
    profileDisplayArea.style.display = 'block';
    profileEditArea.style.display = 'none';
    // Re-display the original data in case user cancelled
    displayProfile(currentProfileData);
}

async function saveProfileChanges() {
    const token = localStorage.getItem('jwtToken');
    if (!token) {
        showMessage('Unauthorized: Please log in.', true);
        window.location.href = '/';
        return;
    }

    const updatedName = editProfileNameInput.value.trim();
    const updatedAge = parseInt(editProfileAgeInput.value.trim());
    const updatedHobbies = editProfileHobbiesInput.value.trim();
    const updatedDescription = editProfileDescriptionInput.value.trim();

    // Client-side validation
    if (!updatedName) {
        showMessage('Profile Name cannot be empty.', true);
        return;
    }
    if (isNaN(updatedAge) || updatedAge < 1 || updatedAge > 120) {
        showMessage('Age must be a number between 1 and 120.', true);
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