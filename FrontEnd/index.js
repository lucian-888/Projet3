const loginSuccessBanner = document.getElementById('login-success-banner');
const editButton = document.getElementById('edit-button');
const modal = document.getElementById('modal');
const closeButton = document.getElementsByClassName('close-button')[0];
const galleryView = document.getElementById('gallery-view');
const addPhotoView = document.getElementById('add-photo-view');
const addPhotoButton = document.getElementById('add-photo-button');
const token = localStorage.getItem('authToken');
   

async function fetchWorks() {
    const response = await fetch("http://localhost:5678/api/works"
    );
    if (!response.ok) {
        throw new Error('Network response was not ok');
    }
    return response.json();
}

async function fetchCategories() {
    const response = await fetch("http://localhost:5678/api/categories");
    if (!response.ok) {
        throw new Error('Network response was not ok');
    }
    return response.json();

}


try {
    const [works, categories] = await Promise.all([fetchWorks(), fetchCategories()]);
    displayWorks(works);
    displayCategories(categories);
    setupFiltering(works, categories);
} catch (error) {
    console.error('Error fetching data:', error);
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

    

    if (!token){
        editButton.style.display = "none";
        loginSuccessBanner.style.display = "none";
    }
    
   
  
    editButton.addEventListener('click', () => {
      modal.style.display = 'block';
      galleryView.style.display = 'block';
      addPhotoView.style.display = 'none';
      fetchWorks();
    });
  
    closeButton.addEventListener('click', () => {
      modal.style.display = 'none';
    });
  
    window.addEventListener('click', (event) => {
      if (event.target === modal) {
        modal.style.display = 'none';
      }
    });
  
    addPhotoButton.addEventListener('click', () => {
      galleryView.style.display = 'none';
      addPhotoView.style.display = 'block';
      fetchCategories();
    });
  
    try {
        const [works] = await Promise.all([fetchWorks()]);
        modaldisplayWorks(works);
        
    } catch (error) {
        console.error('Error fetching data:', error);
    }
    
  
    function modaldisplayWorks(works) {

       

      const worksContainer = document.getElementById('works-container');
      worksContainer.innerHTML = '';
  
      works.forEach(work => {
        const workElement = document.createElement('div');
        workElement.classList.add('work');
  
        const imageElement = document.createElement('img');
        imageElement.src = work.imageUrl;
        /*imageElement.alt = work.title;*/
        workElement.appendChild(imageElement);
  
        const titleElement = document.createElement('h3');
        /*titleElement.textContent = work.title;*/
        workElement.appendChild(titleElement);
  
        worksContainer.appendChild(workElement);
      });
    }