// L'URL de ton back-end où les travaux et les catégories sont récupérés
const apiUrlWorks = "http://localhost:5678/api/works";
const apiUrlCategories = "http://localhost:5678/api/categories";

// Fonction pour récupérer les données des travaux et des catégories
async function fetchData() {
  try {
    const [worksResponse, categoriesResponse] = await Promise.all([
      fetch(apiUrlWorks),
      fetch(apiUrlCategories),
    ]);

    if (!worksResponse.ok || !categoriesResponse.ok) {
      throw new Error("Erreur lors de la récupération des données");
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
    console.log("Categories:", categories); // Ajoute ceci avant d'appeler displayWorks()
    displayWorks(works, categories);
  } catch (error) {
    console.error("Erreur:", error);
  }
}

// Fonction pour créer dynamiquement le menu de catégories
function createCategoryMenu(categories) {
  const menu = document.querySelector(".category-menu");
  menu.innerHTML = ""; // Efface le menu précédent

  // Ajoute une option pour afficher tous les travaux
  const allOption = document.createElement("option");
  allOption.value = "all";
  allOption.textContent = "Tous";
  menu.appendChild(allOption);

  // Ajoute les options de catégories
  categories.forEach((category) => {
    const option = document.createElement("option");
    option.value = category.id;
    option.textContent = category.name;
    menu.appendChild(option);
  });

  // Ajoute un gestionnaire d'événements pour filtrer les travaux
  menu.addEventListener("change", (event) => {
    const selectedCategoryId = event.target.value;
    filterWorksByCategory(selectedCategoryId);
  });
}

// Fonction pour filtrer les travaux selon la catégorie sélectionnée
function filterWorksByCategory(categoryId) {
  const works = document.querySelectorAll(".work");

  works.forEach((work) => {
    const workCategoryId = work.dataset.categoryId; // Récupère le data-category-id
    if (categoryId === "all" || workCategoryId === categoryId) {
      work.style.display = ""; // Affiche le travail
    } else {
      work.style.display = "none"; // Cache le travail
    }
  });
}

// Fonction pour afficher les travaux dans la galerie
function displayWorks(works, categories) {
  const gallery = document.querySelector(".gallery");
  gallery.innerHTML = ""; // Efface tous les travaux déjà affichés

  works.forEach((work) => {
    const workElement = document.createElement("figure");
    workElement.classList.add("work");
    workElement.dataset.categoryId = work.categoryId; // Associe la catégorie du travail avec un data-attribute

    // Recherche le nom de la catégorie en fonction de l'id
    const category = categories.find((c) => c.id === work.categoryId);
    const categoryName = category ? category.name : "Non spécifié";

    workElement.innerHTML = `
            <img src="${work.imageUrl}" alt="${work.title}" class="work-image" />
            <figcaption class="work-title">${work.title} - ${categoryName}</figcaption>
        `;
    gallery.appendChild(workElement); // Ajoute chaque travail dans la galerie
  });
}

// Appel de la fonction pour récupérer et afficher les travaux
fetchData();
