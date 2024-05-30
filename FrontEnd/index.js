    document.addEventListener('DOMContentLoaded', async () => {
        try {
            const [works, categories] = await Promise.all([fetchWorks(), fetchCategories()]);
            displayWorks(works);
            displayCategories(categories);
            setupFiltering(works, categories);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    });
    
    async function fetchWorks() {
        const response = await fetch("http://localhost:5678/api/works");
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
    
    async function fetchCategories() {
        const response = await fetch("http://localhost:5678/api/categories");
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    }
    
    function displayCategories(categories) {
        const categoryMenu = document.querySelector('.category-menu');
        categoryMenu.innerHTML = ''; // Clear the menu before displaying categories
    
        // Add "All" option
        const allItem = document.createElement('li');
        allItem.textContent = 'Tous';
        allItem.dataset.id = 'all';
        categoryMenu.appendChild(allItem);
    
        // Add categories
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
    
  