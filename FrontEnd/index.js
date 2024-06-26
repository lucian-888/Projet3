// Sélection des éléments du DOM
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
const responseMessageAdd = document.getElementById('responseMessageAdd');
const responseMessageGallery = document.getElementById('responseMessageGallery');
const token = localStorage.getItem('authToken'); // Récupérer le jeton depuis le localStorage

// Fonction pour récupérer la liste des œuvres depuis l'API
async function fetchWorks() {
    const response = await fetch("http://localhost:5678/api/works");
    if (!response.ok) {
        throw new Error('Network response was not ok');
    }
    return response.json();
}

// Fonction pour récupérer la liste des catégories depuis l'API
async function fetchCategories() {
    const response = await fetch("http://localhost:5678/api/categories");
    if (!response.ok) {
        throw new Error('Network response was not ok');
    }
    return response.json();
}

// Fonction pour récupérer et afficher les œuvres dans la galerie
async function fetchAndDisplayWorks() {
    try {
        const works = await fetchWorks();
        displayWorks(works);
        modalDisplayWorks(works);
    } catch (error) {
        console.error('Erreur lors de la récupération des œuvres:', error);
    }
}

// Récupérer à la fois les œuvres et les catégories, puis les afficher et configurer le filtrage
(async function init() {
    try {
        const [works, categories] = await Promise.all([fetchWorks(), fetchCategories()]);
        displayWorks(works);
        displayCategories(categories);
        setupFiltering(works, categories);
    } catch (error) {
        console.error('Erreur lors de la récupération des données:', error);
    }
})();

// Fonction pour afficher les œuvres dans la galerie principale
function displayWorks(works) {
    const galleryContainer = document.querySelector('.gallery');
    galleryContainer.innerHTML = ''; // Vider la galerie avant d'afficher les œuvres
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

// Fonction pour afficher les catégories dans le menu des catégories
function displayCategories(categories) {
    const categoryMenu = document.querySelector('.category-menu');
    categoryMenu.innerHTML = ''; // Vider le menu avant d'afficher les catégories

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

// Fonction pour configurer la fonctionnalité de filtrage en fonction des catégories
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

// Vérifier si l'utilisateur est connecté
if (token) {
    // Afficher le bouton d'édition et la bannière de connexion réussie si connecté
    editButton.style.display = "block";
    loginSuccessBanner.style.display = "block";
    // Changer le lien de connexion en déconnexion et configurer la fonctionnalité de déconnexion
    authLink.textContent = "logout";
    authLink.href = "#";
    authLink.addEventListener('click', () => {
        localStorage.removeItem('authToken');
        localStorage.setItem('isLoggedIn', 'false');

        location.reload();
    });
}

// Écouteur d'événement pour ouvrir le modal lorsque le bouton d'édition est cliqué
editButton.addEventListener('click', async () => {
    modal.style.display = 'flex';
    galleryView.style.display = 'block';
    addPhotoView.style.display = 'none';
    await fetchAndDisplayWorks();
    resetResponseMessages(); // Réinitialiser les messages de réponse
});

// Écouteur d'événement pour fermer le modal
closeButton.addEventListener('click', () => {
    modal.style.display = 'none';
});

// Écouteur d'événement pour retourner à la vue de la galerie dans le modal
backButton.addEventListener('click', () => {
    galleryView.style.display = 'block';
    addPhotoView.style.display = 'none';
    resetResponseMessages(); // Réinitialiser les messages de réponse
});

// Écouteur d'événement pour fermer le modal si l'utilisateur clique à l'extérieur
window.addEventListener('click', (event) => {
    if (event.target === modal) {
        modal.style.display = 'none';
    }
});

// Écouteur d'événement pour passer à la vue d'ajout de photo dans le modal
addPhotoButton.addEventListener('click', async () => {
    galleryView.style.display = 'none';
    addPhotoView.style.display = 'block';
    const categories = await fetchCategories();
    populateCategorySelect(categories);
    resetResponseMessages(); // Réinitialiser les messages de réponse
});

// Fonction pour remplir le menu déroulant des catégories
function populateCategorySelect(categories) {
    categorySelect.innerHTML = '<option value="" disabled selected></option>';
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category.id;
        option.textContent = category.name;
        categorySelect.appendChild(option);
    });
}

// Gérer la soumission du formulaire pour ajouter une nouvelle photo
uploadForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    // Valider le titre
    if (titleInput.value.length < 2) {
        const errorMessage = document.getElementById("error-mess");
        errorMessage.textContent = 'Erreur dans le titre';
        return;
    }

    // Réinitialiser le message d'erreur avant de tenter de soumettre le formulaire
    const errorMessage = document.getElementById("error-mess");
    errorMessage.textContent = '';

    const formData = new FormData();
    formData.append('image', photoInput.files[0]);
    formData.append('title', titleInput.value);
    formData.append('category', categorySelect.value);

    try {
        const response = await fetch("http://localhost:5678/api/works", {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: formData
        });

        if (response.ok) {
            responseMessageAdd.innerText = 'Œuvre ajoutée avec succès';
            responseMessageAdd.style.color = 'green';
            uploadForm.reset();
            resetPhotoPreview();
            validateButton.disabled = true;
            await fetchAndDisplayWorks(); // Rafraîchir la galerie
        } else {
            const data = await response.json();
            responseMessageAdd.innerText = 'Erreur: ' + (data.message || response.statusText);
            responseMessageAdd.style.color = 'red';
        }
    } catch (error) {
        responseMessageAdd.innerText = 'Erreur lors de l\'ajout de l\'œuvre: ' + error.message;
        responseMessageAdd.style.color = 'red';
    }
});

// Fonction pour prévisualiser l'image sélectionnée
function previewImage(file) {
    const reader = new FileReader();
    reader.onload = function (e) {
        const elements = document.getElementById('photo-preview').children;

        // Masquer les éléments de prévisualisation actuels
        for (let i = 0; i < elements.length; i++) {
            elements[i].style.display = "none";
        }

        const img = document.createElement('img');
        img.src = e.target.result;

        photoPreview.appendChild(img);
        img.style.display = 'block';
        img.classList.add("remove-photo");
    };

    reader.readAsDataURL(file);
}

// Fonction pour réinitialiser la zone de prévisualisation de la photo
function resetPhotoPreview() {
    const img = document.querySelector(".remove-photo");
    if (img) img.remove();

    const elements = document.getElementById('photo-preview').children;

    // Afficher les éléments par défaut
    for (let i = 0; i < elements.length; i++) {
        elements[i].style.display = "block";
    }
}

// Écouteurs d'événements pour activer ou désactiver le bouton de validation en fonction des entrées du formulaire
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

// Fonction pour supprimer une œuvre
async function deleteWork(workId) {
    try {
        const response = await fetch(`http://localhost:5678/api/works/${workId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            responseMessageGallery.innerText = 'Œuvre supprimée avec succès';
            responseMessageGallery.style.color = 'green';
            await fetchAndDisplayWorks();  // Rafraîchir la galerie
        } else {
            const data = await response.json();
            responseMessageGallery.innerText = 'Erreur: ' + (data.message || response.statusText);
            responseMessageGallery.style.color = 'red';
        }
    } catch (error) {
        responseMessageGallery.innerText = 'Erreur lors de la suppression de l\'œuvre: ' + error.message;
        responseMessageGallery.style.color = 'red';
    }
}

// Afficher les œuvres dans le modal pour la gestion
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
        deleteButton.innerHTML = '<i class="fa-solid fa-trash-can"></i>';
        deleteButton.addEventListener('click', () => deleteWork(work.id));
        workElement.appendChild(deleteButton);

        worksContainer.appendChild(workElement);
    });
}

// Fonction pour réinitialiser les messages de réponse
function resetResponseMessages() {
    responseMessageAdd.innerText = '';
    responseMessageGallery.innerText = '';
}
