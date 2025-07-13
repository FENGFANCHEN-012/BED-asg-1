// public/profile-display.js

document.addEventListener('DOMContentLoaded', async () => {

    const userId = 1; // Placeholder User ID for demonstration

    const profileDetailsDiv = document.getElementById('profileDetails');
    const displayName = document.getElementById('display-name');
    const displayHobbies = document.getElementById('display-hobbies');
    const displayAge = document.getElementById('display-age');
    const displayDescription = document.getElementById('display-description');

    const editProfileBtn = document.getElementById('editProfileBtn');
    const deleteProfileBtn = document.getElementById('deleteProfileBtn');

    const editProfileModal = document.getElementById('editProfileModal');
    const closeEditModalBtn = document.getElementById('closeEditModal');
    const editProfileForm = document.getElementById('editProfileForm');
    const editNameInput = document.getElementById('editName');
    const editHobbiesInput = document.getElementById('editHobbies');
    const editAgeInput = document.getElementById('editAge');
    const editDescriptionTextarea = document.getElementById('editDescription');
    const editNameValidationMessage = document.getElementById('editNameValidationMessage');

    let currentProfileData = null; // To store the fetched profile data

    // --- Function to Fetch and Display Profile ---
    async function fetchAndDisplayProfile() {
        try {
            const response = await fetch(`/profiles/${userId}`); // Fetch profile by userId
            const data = await response.json();

            if (response.ok) {
                currentProfileData = data; // Store current profile data
                displayName.textContent = data.name;
                displayHobbies.textContent = data.hobbies || 'Not specified';
                displayAge.textContent = data.age || 'Not specified';
                displayDescription.textContent = data.description || 'No description provided.';
                profileDetailsDiv.classList.remove('hidden'); // Show profile details
            } else {
                // If profile not found, maybe redirect to setup page or show a message
                profileDetailsDiv.innerHTML = `<p class="error-message">${data.message || 'Profile not found.'}</p>
                                               <button onclick="window.location.href='setUpProfile.html'" class="profile-action-button edit-button">Create Profile</button>`;
                profileDetailsDiv.classList.add('error-state');
            }
        } catch (error) {
            console.error('Error fetching profile:', error);
            profileDetailsDiv.innerHTML = `<p class="error-message">Failed to load profile. Please try again later.</p>`;
            profileDetailsDiv.classList.add('error-state');
        }
    }

    // --- Event Listeners ---

    // Load profile on page load
    fetchAndDisplayProfile();

    // Edit Profile Button Click
    if (editProfileBtn) {
        editProfileBtn.addEventListener('click', () => {
            if (currentProfileData) {
                editNameInput.value = currentProfileData.name;
                editHobbiesInput.value = currentProfileData.hobbies || '';
                editAgeInput.value = currentProfileData.age || '';
                editDescriptionTextarea.value = currentProfileData.description || '';
                editProfileModal.classList.remove('hidden'); // Show the modal
                editNameValidationMessage.textContent = ''; // Clear previous messages
            } else {
                alert('No profile data to edit. Please create a profile first.');
            }
        });
    }


    // Close Edit Modal Button Click
    if (closeEditModalBtn) {
        closeEditModalBtn.addEventListener('click', () => {
            editProfileModal.classList.add('hidden'); // Hide the modal
        });
    }

    // Handle Edit Profile Form Submission (Update)
    if (editProfileForm) {
        editProfileForm.addEventListener('submit', async (event) => {
            event.preventDefault();

            const updatedName = editNameInput.value.trim();
            const updatedHobbies = editHobbiesInput.value.trim();
            const updatedAge = parseInt(editAgeInput.value.trim(), 10);
            const updatedDescription = editDescriptionTextarea.value.trim();

            // Client-side validation for update form
            if (!updatedName) {
                editNameValidationMessage.textContent = 'Name cannot be empty.';
                editNameValidationMessage.style.color = '#d9534f';
                return;
            }
            if (isNaN(updatedAge) || updatedAge <= 0 || updatedAge > 120) {
                alert('Please enter a valid age (1-120).');
                return;
            }
            if (!updatedDescription) {
                alert('Please enter a description.');
                return;
            }

            // Check if name is taken ONLY if it's changed and different from current name
            if (updatedName !== currentProfileData.name) {
                try {
                    const nameCheckResponse = await fetch('/profile/check-name', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ name: updatedName })
                    });
                    const nameCheckResult = await nameCheckResponse.json();
                    if (!nameCheckResult.available) {
                        editNameValidationMessage.textContent = nameCheckResult.message;
                        editNameValidationMessage.style.color = '#d9534f';
                        return;
                    }
                } catch (error) {
                    console.error('Error checking updated name:', error);
                    editNameValidationMessage.textContent = 'Network error checking name. Please try again.';
                    editNameValidationMessage.style.color = '#d9534f';
                    return;
                }
            }


            try {
                const response = await fetch(`/profiles/${userId}`, { // PUT request to update by userId
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        name: updatedName,
                        hobbies: updatedHobbies,
                        age: updatedAge,
                        description: updatedDescription
                    })
                });

                const result = await response.json();

                if (response.ok) {
                    alert(result.message);
                    editProfileModal.classList.add('hidden'); // Hide modal
                    fetchAndDisplayProfile(); // Re-fetch and display updated profile
                } else {
                    alert('Profile update failed: ' + (result.error || 'Unknown error'));
                }
            } catch (error) {
                console.error('Error updating profile:', error);
                alert('An error occurred during profile update. Please try again.');
            }
        });
    }

    // Delete Profile Button Click
    if (deleteProfileBtn) {
        deleteProfileBtn.addEventListener('click', async () => {
            if (confirm('Are you sure you want to delete your profile? This action cannot be undone.')) {
                try {
                    const response = await fetch(`/profiles/${userId}`, { // DELETE request by userId
                        method: 'DELETE',
                        headers: { 'Content-Type': 'application/json' }
                    });

                    if (response.ok) {
                        alert('Profile deleted successfully!');
                        // Redirect to a page where a new profile can be created, or login page
                        window.location.href = 'setUpProfile.html';
                    } else {
                        const data = await response.json();
                        alert('Profile deletion failed: ' + (data.message || 'Unknown error'));
                    }
                } catch (error) {
                    console.error('Error deleting profile:', error);
                    alert('An error occurred during profile deletion. Please try again.');
                }
            }
        });
    }
});
