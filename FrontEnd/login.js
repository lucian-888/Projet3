
    const loginForm = document.querySelector('#login form');
    const errorMessage = document.getElementById('error-message');

    if (loginForm) {
        loginForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            const email = document.getElementById('username').value;
            const password = document.getElementById('password').value;

            try {
                const token = await login(email, password);
                localStorage.setItem('authToken', token);
                window.location.href = 'index.html'; // Redirect to the main page
            } catch (error) {
                errorMessage.textContent = 'Login failed. Please check your credentials.';
                console.error('Login error:', error);
            }
        });
    } else {
        console.error('Error: #login form element not found');
    }

   
       
    


async function login(email, password) {
   
        const response = await fetch('http://localhost:5678/api/users/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });

        if (response.ok) {
            const data = await response.json();
            return data.token;
        } else {
            throw new Error('Login failed');
        }
}
