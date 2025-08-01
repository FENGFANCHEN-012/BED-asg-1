const signupUsernameInput = document.getElementById('signupUsername');
const signupEmailInput = document.getElementById('signupEmail');
const signupPasswordInput = document.getElementById('signupPassword');
const profileNameInput = document.getElementById('profileName');
const profileAgeInput = document.getElementById('profileAge');
const profileHobbiesInput = document.getElementById('profileHobbies');
const profileDescriptionInput = document.getElementById('profileDescription');
const submitSignupButton = document.getElementById('submitSignupButton');

// Removed: const API_BASE_URL = 'http://localhost:3000'; // This is now defined in translation.js

// The showMessage function is available from translation.js

submitSignupButton.addEventListener('click', async () => {
    const username = signupUsernameInput.value.trim();
    const email = signupEmailInput.value.trim();
    const password = signupPasswordInput.value.trim();
    const name = profileNameInput.value.trim();
    const age = parseInt(profileAgeInput.value.trim());
    const hobbies = profileHobbiesInput.value.trim();
    const description = profileDescriptionInput.value.trim();

    // Basic client-side validation
    if (!username || !email || !password || !name || isNaN(age)) {
        showMessage('Please fill in all required fields (Username, Email, Password, Profile Name, Age).', true);
        return;
    }
    if (password.length < 6) {
        showMessage('Password must be at least 6 characters long.', true);
        return;
    }
    if (age < 1 || age > 120) {
        showMessage('Age must be between 1 and 120.', true);
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/users`, { // API_BASE_URL is now accessed globally
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username,
                email,
                password,
                name,
                hobbies,
                age,
                description
            })
        });

        const data = await response.json();

        if (response.ok) {
            showMessage('Account created successfully! Redirecting to login...', false);
            setTimeout(() => {
                window.location.href = '/'; // Redirect to index.html (login page)
            }, 2000);
        } else {
            showMessage(data.error || data.message || 'Signup failed. Please try again.', true);
        }
    } catch (error) {
        console.error('Error during signup:', error);
        showMessage('An error occurred during signup. Please try again.', true);
    }
});