// public/script.js

const loginUsernameInput = document.getElementById('loginUsername');
const loginPasswordInput = document.getElementById('loginPassword');
const loginButton = document.getElementById('loginButton');
const signupButton = document.getElementById('signupButton');
// messageBox and API_BASE_URL are now provided by translation.js

// The showMessage function is available globally from translation.js

// Handle Login
loginButton.addEventListener('click', async () => {
    const username = loginUsernameInput.value.trim();
    const password = loginPasswordInput.value.trim();

    if (!username || !password) {
        showMessage('Please enter both username and password.', true); // Use the global showMessage
        return;
    }

    try {
        // Use the global API_BASE_URL
        const response = await fetch(`${API_BASE_URL}/users/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();

        if (response.ok) {
            localStorage.setItem('jwtToken', data.token); // Store the token
            showMessage('Login successful! Redirecting...', false);
            console.log('Login successful. Token:', data.token);
            // Example: Redirect to a dummy dashboard page
            setTimeout(() => {
                // Check user role and redirect accordingly
                if (data.role === 'admin') {
                    window.location.href = '/admin.html';
                } else {
                    window.location.href = '/dashboard.html';
                }
            }, 1000);

        } else {
            showMessage(data.message || 'Login failed. Please check your credentials.', true);
        }
    } catch (error) {
        console.error('Error during login:', error);
        showMessage('An error occurred during login. Please try again.', true);
    }
});

// Handle Signup Button Click (Redirect to a signup page)
signupButton.addEventListener('click', () => {
    // Redirect to a dedicated signup page
    window.location.href = '/signup.html';
});