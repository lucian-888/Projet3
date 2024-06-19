// Selecting the login form element from the DOM
const loginForm = document.querySelector('#login-form');

// Selecting the error message element from the DOM
const errorMessage = document.getElementById('error-message');

// Check if the login form exists
if (loginForm) {
    // Add a submit event listener to the login form
    loginForm.addEventListener('submit', async (event) => {
        event.preventDefault(); // Prevent the default form submission behavior

        // Extracting the email and password values from the form inputs
        const email = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        try {
            // Attempt to login and retrieve the auth token
            const token = await login(email, password);

            // Store the auth token and login status in localStorage
            localStorage.setItem('authToken', token);
            localStorage.setItem('isLoggedIn', 'true');

            // Show the login success banner
            const loginSuccessBanner = document.getElementById('login-success-banner');
            if (loginSuccessBanner) {
                loginSuccessBanner.style.display = 'flex';
            }

            // Redirect to the main page after successful login
            window.location.href = 'index.html';
        } catch (error) {
            // Display an error message if login fails
            errorMessage.textContent = 'Erreur dans l’identifiant ou le mot de passe';
            console.error('Login error:', error);
        }
    });
} else {
    console.error('Error: #login form element not found');
}

// Function to handle the login process
async function login(email, password) {
    // Send a POST request to the login API endpoint
    const response = await fetch('http://localhost:5678/api/users/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password }) // Include email and password in the request body
    });

    // Check if the response is successful
    if (response.ok) {
        const data = await response.json(); // Parse the response JSON data
        return data.token; // Return the auth token
    } else {
        throw new Error('Login failed'); // Throw an error if login fails
    }
}

