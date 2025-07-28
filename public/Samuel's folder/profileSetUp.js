// public/profileSetUp.js

document.addEventListener('DOMContentLoaded', async () => {
    // Get elements for the combined form
    const profileCreationForm = document.getElementById('profileCreationForm');
    const profileNameInput = document.getElementById('profileNameInput');
    const nameValidationMessage = document.getElementById('nameValidationMessage');
    const nameAvailabilityMessage = document.getElementById('nameAvailabilityMessage'); // New element for availability
    const hobbiesSelect = document.getElementById('hobbiesSelect');
    const ageInput = document.getElementById('ageInput');
    const descriptionTextarea = document.getElementById('descriptionTextarea');

    const userId = 1; // Placeholder User ID for demonstration 


    // --- Real-time Profile Name Availability Check ---
    let nameCheckTimeout;
    profileNameInput.addEventListener('input', () => {
        clearTimeout(nameCheckTimeout);
        nameValidationMessage.textContent = ''; // Clear Joi validation messages
        nameAvailabilityMessage.textContent = ''; // Clear availability messages

        const name = profileNameInput.value.trim();
        if (name.length === 0) {
            nameAvailabilityMessage.textContent = '';
            return;
        }

        // Add a small delay to prevent excessive API calls
        nameCheckTimeout = setTimeout(async () => {
            try {
                const response = await fetch('/profile/check-name', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name: name })
                });

                const data = await response.json();
                if (response.ok) {
                    if (data.available) {
                        nameAvailabilityMessage.textContent = data.message;
                        nameAvailabilityMessage.style.color = 'green';
                    } else {
                        nameAvailabilityMessage.textContent = data.message;
                        nameAvailabilityMessage.style.color = 'red';
                    }
                } else {
                    // Handle validation errors or other server errors
                    nameAvailabilityMessage.textContent = data.error || 'Error checking name.';
                    nameAvailabilityMessage.style.color = 'red';
                }
            } catch (error) {
                console.error('Error checking profile name:', error);
                nameAvailabilityMessage.textContent = 'Network error checking name.';
                nameAvailabilityMessage.style.color = 'red';
            }
        }, 500); // Check 500ms after user stops typing
    });


    // --- Handle Combined Form Submission ---
    if (profileCreationForm) {
        profileCreationForm.addEventListener('submit', async (event) => {
            event.preventDefault(); // Prevent default form submission

            const name = profileNameInput.value.trim();
            const hobbies = Array.from(hobbiesSelect.selectedOptions).map(option => option.value);
            const hobbiesString = hobbies.join(', '); // Convert array to comma-separated string
            const age = parseInt(ageInput.value, 10);
            const description = descriptionTextarea.value.trim();

            // Client-side validation (basic checks, Joi will do more on server)
            if (!name) {
                nameValidationMessage.textContent = 'Profile name is required.';
                nameValidationMessage.style.color = 'red';
                return;
            } else {
                 nameValidationMessage.textContent = '';
            }

            if (!age || age < 1 || age > 120) {
                alert('Please enter a valid age between 1 and 120.');
                return;
            }
            if (!description) {
                alert('Please provide a description.');
                return;
            }

            // Perform final name availability check before submitting the entire profile
            try {
                const nameCheckResponse = await fetch('/profile/check-name', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name: name })
                });
                const nameCheckData = await nameCheckResponse.json();

                if (!nameCheckResponse.ok || !nameCheckData.available) {
                    nameAvailabilityMessage.textContent = nameCheckData.message || 'Profile name is not available.';
                    nameAvailabilityMessage.style.color = 'red';
                    return; // Stop submission if name is not available
                }
            } catch (error) {
                console.error('Error during final name check:', error);
                alert('Could not verify profile name availability. Please try again.');
                return;
            }

            // If name is available, proceed with full profile creation request
            try {
                const response = await fetch('/profiles', { // Using /profiles POST for creation
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        userId: userId,
                        name: name,
                        hobbies: hobbiesString,
                        age: age,
                        description: description
                    })
                });

                const result = await response.json();

                if (response.ok) {
                    alert(result.message);
                    // IMPORTANT: If profile_id is now the primary identifier, you might want to store
                    // result.profile.profile_id in local storage or a session for future use
                    // (e.g., to load this specific profile on profile.html)
                    if (result.profile && result.profile.profile_id) {
                         localStorage.setItem('currentProfileId', result.profile.profile_id);
                    }
                    window.location.href = 'profile.html'; // Redirect to profile display
                } else {
                    alert('Profile creation failed: ' + (result.error || result.message || 'Unknown error'));
                }
            } catch (error) {
                console.error('Error creating profile:', error);
                alert('An error occurred during profile creation. Please try again.');
            }
        });
    }
});