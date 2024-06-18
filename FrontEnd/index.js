// Selecting elements from the DOM
const loginSuccessBanner = document.getElementById('login-success-banner');
const editButton = document.getElementById('edit-button');
const authLink = document.getElementById('auth-link');
const modal = document.getElementById('modal');
const closeButton = document.getElementsByClassName('close-button')[0];
const backButton = document.getElementsByClassName('back-button')[0];
const galleryView = document.getElementById('gallery-view');
const addPhotoView = document.getElementById('add-photo-view');
const addPhotoButton = document.getElementById('add-photo-button');
const uploadForm = document.getElementById('upload-form');
const validateButton = document.getElementById('validate-button');
const photoInput = document.getElementById('photo-input');
const titleInput = document.getElementById('title-input');
const categorySelect = document.getElementById('category-select');
const photoPreview = document.getElementById('photo-preview');
const token = localStorage.getItem('authToken'); // Retrieve the token from localStorage

// Fetch the list of works from the API
async function fetchWorks() {
    const response = await fetch("http://localhost:5678/api/works");
    if (!response.ok) {
        throw new Error('Network response was not ok');
    }
    return response.json();
}

// Fetch the list of categories from the API
async function fetchCategories() {
    const response = await fetch("http://localhost:5678/api/categories");
    if (!response.ok) {
        throw new Error('Network response was not ok');
    }
    return response.json();
}

// Fetch and display works in the gallery
async function fetchAndDisplayWorks() {
    try {
        const works = await fetchWorks();
        displayWorks(works);
        modalDisplayWorks(works);
    } catch (error) {
        console.error('Error fetching works:', error);
    }
}

// Fetch both works and categories, then display them and set up filtering
try {
    const [works, categories] = await Promise.all([fetchWorks(), fetchCategories()]);
    displayWorks(works);
    displayCategories(categories);
    setupFiltering(works, categories);
} catch (error) {
    console.error('Error fetching data:', error);
}

// Display the works in the main gallery
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

// Display the categories in the category menu
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

// Set up filtering functionality based on categories
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

// Check if the user is logged in
if (token) {
    // Display edit button and login success banner if logged in
    editButton.style.display = "block";
    loginSuccessBanner.style.display = "block";
    // Change the login link to logout and set up logout functionality
    authLink.textContent = "logout";
    authLink.href = "#";
    authLink.addEventListener('click', () => {
        localStorage.removeItem('authToken');
        location.reload();
    });
}

// Event listener to open the modal when edit button is clicked
editButton.addEventListener('click', async () => {
    modal.style.display = 'block';
    galleryView.style.display = 'block';
    addPhotoView.style.display = 'none';
    await fetchAndDisplayWorks();
});

// Event listener to close the modal
closeButton.addEventListener('click', () => {
    modal.style.display = 'none';
});

// Event listener to go back to the gallery view in the modal
backButton.addEventListener('click', () => {
    galleryView.style.display = 'block';
    addPhotoView.style.display = 'none';
});

// Event listener to close the modal if the user clicks outside of it
window.addEventListener('click', (event) => {
    if (event.target === modal) {
        modal.style.display = 'none';
    }
});

// Event listener to switch to add photo view in the modal
addPhotoButton.addEventListener('click', async () => {
    galleryView.style.display = 'none';
    addPhotoView.style.display = 'block';
    const categories = await fetchCategories();
    populateCategorySelect(categories);
});

// Function to populate the category select dropdown
function populateCategorySelect(categories) {
    categorySelect.innerHTML = '<option value="" disabled selected></option>';
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category.id;
        option.textContent = category.name;
        categorySelect.appendChild(option);
    });
}

// Handle form submission for adding a new photo
uploadForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const formData = new FormData();
    formData.append('image', photoInput.files[0]);
    formData.append('title', titleInput.value);
    formData.append('category', categorySelect.value);

    try {
        const response = await fetch('http://localhost:5678/api/works', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: formData
        });

        if (response.ok) {
            console.log('Work added successfully');
            await fetchAndDisplayWorks();  // Refresh the gallery
            galleryView.style.display = 'block';
            addPhotoView.style.display = 'none';
            uploadForm.reset();
            resetPhotoPreview();
        } else {
            console.error('Failed to add work:', response.statusText);
        }
    } catch (error) {
        console.error('Error adding work:', error);
    }
});

// Function to preview the selected image
function previewImage(file) {
    const reader = new FileReader();
    reader.onload = function (e) {
        const img = document.createElement('img');
        img.src = e.target.result;
        resetPhotoPreview();
        photoPreview.appendChild(img);
        img.style.display = 'block';
    }
    reader.readAsDataURL(file);
}

// Function to reset the photo preview area
function resetPhotoPreview() {
    photoPreview.innerHTML = '<span>+ Ajouter photo</span><p>jpg, png : 4mo max</p>'; 
}

// Event listeners to enable or disable the validate button based on form inputs
photoInput.addEventListener('change', () => {
    validateButton.disabled = !photoInput.files.length || !titleInput.value.trim() || !categorySelect.value;
    previewImage(photoInput.files[0]);
});

titleInput.addEventListener('input', () => {
    validateButton.disabled = !photoInput.files.length || !titleInput.value.trim() || !categorySelect.value;
});

categorySelect.addEventListener('change', () => {
    validateButton.disabled = !photoInput.files.length || !titleInput.value.trim() || !categorySelect.value;
});

// Function to delete a work
async function deleteWork(workId) {
    try {
        const response = await fetch(`http://localhost:5678/api/works/${workId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            console.log('Work deleted:', workId);
            await fetchAndDisplayWorks();  // Refresh the gallery
        } else {
            console.error('Failed to delete work:', response.statusText);
        }
    } catch (error) {
        console.error('Error deleting work:', error);
    }
}

// Display works in the modal for management
function modalDisplayWorks(works) {
    const worksContainer = document.getElementById('works-container');
    worksContainer.innerHTML = '';

    works.forEach(work => {
        const workElement = document.createElement('div');
        workElement.classList.add('work');

        const imageElement = document.createElement('img');
        imageElement.src = work.imageUrl;
        workElement.appendChild(imageElement);

        const deleteButton = document.createElement('button');
        deleteButton.classList.add('delete-button');
        deleteButton.innerHTML = '🗑';
        deleteButton.addEventListener('click', () => deleteWork(work.id));
        workElement.appendChild(deleteButton);

        worksContainer.appendChild(workElement);
    });
}

// Initial fetch and display of works when the page loads
document.addEventListener('DOMContentLoaded', async () => {
    await fetchAndDisplayWorks();
});




