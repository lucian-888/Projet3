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

            // Update the login status to reflect the user is logged in
            updateLoginStatus();

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

// Event listener to update login status when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', function() {
    updateLoginStatus();
});

// Function to update the login status in the navigation
function updateLoginStatus() {
    // Select the login link in the navigation
    const loginLink = document.querySelector('nav ul li a[href="login.html"]');

    // Create a new logout link element
    const logoutLink = document.createElement('a');
    logoutLink.href = "#";
    logoutLink.textContent = "Logout"; /* change with login ??*/
    logoutLink.addEventListener('click', handleLogout);

    // Check if the user is logged in
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';

    if (isLoggedIn) {
        if (loginLink) {
            // Replace the login link with the logout link
            loginLink.parentNode.insertBefore(logoutLink, loginLink);
            loginLink.parentNode.removeChild(loginLink);
        } else {
            // If login link is not found, append the logout link to the navigation
            const navUl = document.querySelector('nav ul');
            const logoutLi = document.createElement('li');
            logoutLi.appendChild(logoutLink);
            navUl.appendChild(logoutLi);
        }
    } else {
        if (logoutLink.parentNode) {
            // Remove the logout link if the user is not logged in
            logoutLink.parentNode.removeChild(logoutLink);
        }
        // Ensure the login link is present in the navigation
        const navUl = document.querySelector('nav ul');
        const loginLi = document.createElement('li');
        const newLoginLink = document.createElement('a');
        newLoginLink.href = "login.html";
        newLoginLink.textContent = "login";
        loginLi.appendChild(newLoginLink);
        navUl.appendChild(loginLi);
    }
}

// Function to handle user logout
function handleLogout() {
    // Remove the auth token and set login status to false
    localStorage.removeItem('authToken');
    localStorage.setItem('isLoggedIn', 'false');
    

    // Update the login status in the navigation
    updateLoginStatus();

    // Redirect to the main page after logout
    window.location.href = 'index.html';
}
