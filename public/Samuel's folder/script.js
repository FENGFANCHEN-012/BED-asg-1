
  const signupForm = document.getElementById("signupForm");

  
    signupForm.addEventListener("submit", async function (e) {
      e.preventDefault(); // Prevent default form submission

      // Get the email and password input elements by their IDs
      const emailInput = document.getElementById("signupEmail");
      const passwordInput = document.getElementById("signupPassword");

      // Get the trimmed values from the input fields
      const email = emailInput.value.trim();
      const password = passwordInput.value.trim();

      // Send the data to your backend /signup endpoint
      try {
        const response = await fetch("http://localhost:3000/signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });

        const result = await response.json(); // Parse the JSON response from the server

        if (response.ok) {
          // If the response status is 2xx (success)
          alert("Sign up successful!");
          // Redirect to the index page after successful registration, matching signup.html's close button
          window.location.href = "index.html";
        } else {
          // If the response status is an error (e.g., 400, 500)
          alert("Error: " + (result.error || "Unknown error occurred.")); // Display error message from server, or a generic one
        }
      } catch (error) {
        // Catch network errors or issues with the fetch request itself
        console.error("Error during signup fetch:", error);
        alert("An error occurred during signup. Please check your network connection and try again.");
      }
    });
  

  