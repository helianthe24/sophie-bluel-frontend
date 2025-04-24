const API_BASE = 'http://localhost:5678';
const apiUrlWorks = `${API_BASE}/api/works`;
const apiUrlCategories = `${API_BASE}/api/categories`;

// Fonction pour récupérer les données des travaux et des catégories
async function fetchData() {
    try {
        const [worksResponse, categoriesResponse] = await Promise.all([
            fetch(apiUrlWorks),
            fetch(apiUrlCategories),
        ]);

        if (!worksResponse.ok || !categoriesResponse.ok) {
            throw new Error('Erreur lors de la récupération des données');
        }

        const works = await worksResponse.json(); // Transformation de la réponse en JSON
        const categories = await categoriesResponse.json(); // Transformation de la réponse en JSON

        // Affichage des données dans la console
        console.log(works);
        console.log(categories);

        // Création du menu de filtres
        createCategoryMenu(categories);

        // Affichage des travaux
        console.log("Works:", works);
        console.log("Categories:", categories);
        displayWorks(works, categories);

    } catch (error) {
        console.error('Erreur:', error);
    }
}

// Fonction pour créer dynamiquement le menu de catégories
function createCategoryMenu(categories) {
    const filtersUl = document.querySelector('.filters ul');

    // Supprime le "Tous" par défaut pour éviter les doublons
    filtersUl.innerHTML = '';

    // Crée le bouton "Tous"
    const allButton = document.createElement('li');
    allButton.innerHTML = `
        <button class="active" data-category="all">Tous</button>
    `;
    filtersUl.appendChild(allButton);

    // Ajoute les boutons pour chaque catégorie
    categories.forEach(category => {
        const li = document.createElement('li');
        li.innerHTML = `
            <button data-category="${category.id}">${category.name}</button>
        `;
        filtersUl.appendChild(li);
    });

    // Gestionnaire de clic pour les boutons
    document.querySelectorAll('.filters button').forEach(button => {
        button.addEventListener('click', (e) => {
            // Retire la classe active de tous les boutons
            document.querySelectorAll('.filters button').forEach(btn => {
                btn.classList.remove('active');
            });

            // Ajoute la classe active au bouton cliqué
            e.target.classList.add('active');

            // Déclenche le filtrage
            const categoryId = e.target.dataset.category;
            filterWorksByCategory(categoryId);
        });
    });
}

// Fonction pour filtrer les travaux selon la catégorie sélectionnée
function filterWorksByCategory(categoryId) {
    const works = document.querySelectorAll('.work');

    works.forEach(work => {
        const workCategoryId = work.dataset.categoryId; // Récupère le data-category-id
        if (categoryId === 'all' || workCategoryId === categoryId) {
            work.style.display = ''; // Affiche le travail
        } else {
            work.style.display = 'none'; // Cache le travail
        }
    });
}

// Fonction pour afficher les travaux dans la galerie
function displayWorks(works, categories) {
    const gallery = document.querySelector('.gallery');
    gallery.innerHTML = ''; // Efface tous les travaux déjà affichés

    works.forEach(work => {
        const workElement = document.createElement('figure');
        workElement.classList.add('work');
        workElement.dataset.categoryId = work.categoryId; // Associe la catégorie du travail avec un data-attribute

        // Recherche le nom de la catégorie en fonction de l'id
        const category = categories.find(c => c.id === work.categoryId);
        const categoryName = category ? category.name : 'Non spécifié';

        // Correction du chemin vers l'image
        const src = work.imageUrl.startsWith('http') ?
            work.imageUrl :
            `${API_BASE}${work.imageUrl}`;

        workElement.innerHTML = `
            <img src="${src}" alt="${work.title}" class="work-image" />
            <figcaption class="work-title">${work.title} — ${categoryName}</figcaption>
        `;
        gallery.appendChild(workElement); // Ajoute chaque travail dans la galerie
    });
}

// Appel de la fonction pour récupérer et afficher les travaux
fetchData();

// Gestion du bouton login/logout
const loginLink = document.getElementById('login-link');
const token = localStorage.getItem('authToken');

if (loginLink) {
    if (token) {
        // Utilisateur·rice connecté·e : transformer en logout
        loginLink.textContent = 'logout';
        loginLink.href = '#';

        loginLink.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.removeItem('authToken');
            window.location.reload();
        });
    } else {
        // Non connecté·e : lien normal vers login
        loginLink.textContent = 'login';
        loginLink.href = 'login.html';
    }
}
