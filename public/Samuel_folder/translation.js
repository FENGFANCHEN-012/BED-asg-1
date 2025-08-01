// public/translation.js

const API_BASE_URL = 'http://localhost:3000'; // Make sure this matches your backend URL
const messageBox = document.getElementById('messageBox'); // Assuming a messageBox exists on all pages

// Function to display messages (success/error)
function showMessage(message, isError = false) {
    if (!messageBox) {
        console.warn("Message box element not found. Cannot display message:", message);
        return;
    }
    messageBox.textContent = message;
    messageBox.classList.remove('error');
    if (isError) {
        messageBox.classList.add('error');
    }
    messageBox.style.display = 'block';
    messageBox.style.opacity = '1';

    setTimeout(() => {
        messageBox.style.opacity = '0';
        setTimeout(() => {
            messageBox.style.display = 'none';
        }, 300); // Wait for fade out
    }, 3000); // Display for 3 seconds
}

// Function to apply translation to elements on the page
async function applyTranslation(targetLanguage) {
    const translatableElements = document.querySelectorAll('[data-translate-key]');
    const token = localStorage.getItem('jwtToken');

    if (!token) {
        showMessage('You must be logged in to translate content.', true);
        return;
    }

    if (targetLanguage === 'en') { // If English is selected, revert to original text
        translatableElements.forEach(element => {
            const originalText = element.dataset.originalText || element.textContent;
            element.textContent = originalText;
        });
        showMessage('Content reverted to English.', false);
        return;
    }

    let allTranslationsSuccessful = true;
    for (const element of translatableElements) {
        const originalText = element.textContent;
        // Store original text in a data attribute to revert later if needed
        if (!element.dataset.originalText) {
            element.dataset.originalText = originalText;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/translate`, {
                method: 'POST', // <-- This is correctly set to POST
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    text: originalText,
                    targetLanguageCode: targetLanguage
                })
            });

            const data = await response.json();

            if (response.ok) {
                element.textContent = data.translatedText;
            } else {
                allTranslationsSuccessful = false;
                console.error(`Translation failed for: "${originalText}"`, data.error);
            }
        } catch (error) {
            allTranslationsSuccessful = false;
            console.error(`Network error during translation for: "${originalText}"`, error);
        }
    }

    if (allTranslationsSuccessful) {
        showMessage('Content translated successfully!', false);
    } else {
        showMessage('Some content could not be translated. See console for details.', true);
    }
}

// Apply translation on page load if a language is already selected
document.addEventListener('DOMContentLoaded', () => {
    const storedLanguage = localStorage.getItem('selectedLanguage');
    if (storedLanguage && storedLanguage !== 'en') {
        applyTranslation(storedLanguage);
    }
});
