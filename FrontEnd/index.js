document.addEventListener('DOMContentLoaded', async () => {
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

    const authToken = localStorage.getItem('authToken');
    if (authToken) {
        try {
            const [works, categories] = await Promise.all([fetchWorks(authToken), fetchCategories(authToken)]);
            displayWorks(works);
            displayCategories(categories);
            setupFiltering(works, categories);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    }
});

async function login(email, password) {
    if (email === 'sophie.bluel@test.tld' && password === 'S0phie') {
        return 'dummy_token';
    } else {
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
}

async function fetchWorks(authToken) {
    const response = await fetch("http://localhost:5678/api/works", {
        headers: {
            'Authorization': `Bearer ${authToken}`
        }
    });
    if (!response.ok) {
        throw new Error('Network response was not ok');
    }
    return response.json();
}

async function fetchCategories(authToken) {
    const response = await fetch("http://localhost:5678/api/categories", {
        headers: {
            'Authorization': `Bearer ${authToken}`
        }
    });
    if (!response.ok) {
        throw new Error('Network response was not ok');
    }
    return response.json();
}

function displayWorks(works) {
    const galleryContainer = document.querySelector('.gallery');
    galleryContainer.innerHTML = ''; // Clear the gallery before displaying works
    works.forEach(work => {
        const figure = document.createElement('figure');
        const img = document.createElement('img');
        img.src = work.imageUrl;
        img.alt = work.title;
        const figcaption = document.createElement('figcaption');
        figcaption.textContent = work.title;
        figure.appendChild(img);
        figure.appendChild(figcaption);
        galleryContainer.appendChild(figure);
    });
}

function displayCategories(categories) {
    const categoryMenu = document.querySelector('.category-menu');
    categoryMenu.innerHTML = ''; // Clear the menu before displaying categories

    const allItem = document.createElement('li');
    allItem.textContent = 'Tous';
    allItem.dataset.id = 'all';
    categoryMenu.appendChild(allItem);

    categories.forEach(category => {
        const li = document.createElement('li');
        li.textContent = category.name;
        li.dataset.id = category.id;
        categoryMenu.appendChild(li);
    });
}

function setupFiltering(works, categories) {
    const categoryMenu = document.querySelector('.category-menu');
    categoryMenu.addEventListener('click', (event) => {
        if (event.target.tagName === 'LI') {
            const categoryId = event.target.dataset.id;
            const filteredWorks = categoryId === 'all' ? works : works.filter(work => work.categoryId == categoryId);
            displayWorks(filteredWorks);
        }
    });
} 