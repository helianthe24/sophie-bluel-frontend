// The backend URL to fetch works and categories
const apiUrlWorks = "http://localhost:5678/api/works";
const apiUrlCategories = "http://localhost:5678/api/categories";

// Function to fetch work and category data
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

    // Display data in the console
    console.log(works);
    console.log(categories);

    // Create the filter menu
    createCategoryMenu(categories);

    // Display the works
    console.log("Works:", works);
    console.log("Categories:", categories);
    displayWorks(works, categories);
  } catch (error) {
    console.error("Erreur:", error);
  }
}

// Function to dynamically create the category menu
function createCategoryMenu(categories) {
  const menu = document.querySelector(".category-menu");
  menu.innerHTML = ""; // Remove the previous menu

  // Add an option to show all works
  const allOption = document.createElement("option");
  allOption.value = "all";
  allOption.textContent = "Tous";
  menu.appendChild(allOption);

  // Add the category options
  categories.forEach((category) => {
    const option = document.createElement("option");
    option.value = category.id;
    option.textContent = category.name;
    menu.appendChild(option);
  });

  // Add an event listener to filter works
  menu.addEventListener("change", (event) => {
    const selectedCategoryId = event.target.value;
    filterWorksByCategory(selectedCategoryId);
  });
}

// Function to filter works by selected category
function filterWorksByCategory(categoryId) {
  const works = document.querySelectorAll(".work");

  works.forEach((work) => {
    const workCategoryId = work.dataset.categoryId; // Get the data-category-id
    if (categoryId === "all" || workCategoryId === categoryId) {
      work.style.display = ""; // Display the work
    } else {
      work.style.display = "none"; // Hide the work
    }
  });
}

// Function to display works in the gallery
function displayWorks(works, categories) {
  const gallery = document.querySelector(".gallery");
  gallery.innerHTML = ""; // Remove all currently displayed works

  works.forEach((work) => {
    const workElement = document.createElement("figure");
    workElement.classList.add("work");
    workElement.dataset.categoryId = work.categoryId; // Attach the project's category using a data attribute

    // Find the category name based on its ID
    const category = categories.find((c) => c.id === work.categoryId);
    const categoryName = category ? category.name : "Non spécifié";

    workElement.innerHTML = `
            <img src="${work.imageUrl}" alt="${work.title}" class="work-image" />
            <figcaption class="work-title">${work.title} - ${categoryName}</figcaption>
        `;
    gallery.appendChild(workElement); // Add each project to the gallery
  });
}

// Call the function to fetch and display projects
fetchData();
