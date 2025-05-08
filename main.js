// main.js

const API_BASE = "http://localhost:5678";
const apiUrlWorks = `${API_BASE}/api/works`;
const apiUrlCategories = `${API_BASE}/api/categories`;
const token = localStorage.getItem("authToken");
const loginLink = document.getElementById("login-link");

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

    const works = await worksResponse.json();
    const categories = await categoriesResponse.json();

    createCategoryMenu(categories);
    displayWorks(works);
  } catch (error) {
    console.error("Erreur :", error);
  }
}

// Affichage dynamique des projets dans le DOM
function displayWorks(works) {
  const gallery = document.querySelector(".gallery");
  gallery.innerHTML = "";
  works.forEach((work) => {
    const figure = document.createElement("figure");
    const img = document.createElement("img");
    img.src = work.imageUrl;
    img.alt = work.title;
    const caption = document.createElement("figcaption");
    caption.innerText = work.title;
    figure.appendChild(img);
    figure.appendChild(caption);
    gallery.appendChild(figure);
  });
}

// Création du menu de filtres catégories
function createCategoryMenu(categories) {
  const filtersContainer = document.querySelector(".filters");
  if (!filtersContainer) return;

  // Vise le <ul> à l’intérieur de .filters
  const ul = filtersContainer.querySelector("ul");
  if (!ul) return;

  ul.innerHTML = ""; // Vide les anciens filtres si jamais

  const createFilterButton = (text, categoryId = null, isActive = false) => {
    const li = document.createElement("li");
    const button = document.createElement("button");
    button.textContent = text;
    button.classList.add("filter-btn");
    if (isActive) button.classList.add("active");

    button.dataset.category = categoryId ?? "all";
    li.appendChild(button);
    ul.appendChild(li);

    button.addEventListener("click", async () => {
      document
        .querySelectorAll(".filter-btn")
        .forEach((btn) => btn.classList.remove("active"));
      button.classList.add("active");

      const res = await fetch(apiUrlWorks);
      const data = await res.json();

      if (!categoryId) {
        displayWorks(data); // Tous
      } else {
        const filtered = data.filter((work) => work.categoryId === categoryId);
        displayWorks(filtered);
      }
    });
  };

  createFilterButton("Tous", null, true);

  categories.forEach((category) => {
    createFilterButton(category.name, category.id);
  });
}

// Fonction propre pour logout
function logoutUser() {
  localStorage.removeItem("authToken");
  const editBar = document.getElementById("edit-bar");
  if (editBar) editBar.remove();
  if (loginLink) {
    loginLink.textContent = "login";
    loginLink.href = "login.html";
  }
  const editIcons = document.querySelectorAll(".edit-icon");
  editIcons.forEach((icon) => icon.remove());
}

// Barre noire de mode édition
function createEditBar() {
  const topBar = document.createElement("div");
  topBar.id = "edit-bar";

  Object.assign(topBar.style, {
    position: "fixed",
    top: "0",
    left: "0",
    width: "100vw",
    zIndex: "1000",
    backgroundColor: "black",
    color: "white",
    padding: "8px 0",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: "10px",
    fontSize: "16px",
    height: "59px",
    fontWeight: "normal",
  });

  const editModeText = document.createElement("span");
  editModeText.textContent = "Mode édition";

  const editIcon = document.createElement("i");
  editIcon.className = "fa-solid fa-pen-to-square";
  editIcon.style.fontSize = "18px";
  editIcon.style.cursor = "pointer";
  editIcon.style.fontWeight = "normal";
  editIcon.addEventListener("click", () => {
    createModal();
  });

  topBar.appendChild(editModeText);
  topBar.appendChild(editIcon);

  document.body.prepend(topBar);

  // Décaler le reste de la page vers le bas
  document.body.style.paddingTop = "40px";
}

function addEditIcon() {
  const portfolioTitle = document.querySelector("#portfolio h2");
  if (portfolioTitle) {
    // Conteneur inline pour l’icône + le texte "modifier"
    const editContainer = document.createElement("span");
    editContainer.classList.add("edit-icon");
    editContainer.style.display = "inline-flex";
    editContainer.style.alignItems = "center";
    editContainer.style.gap = "6px";
    editContainer.style.marginLeft = "10px";
    editContainer.style.fontSize = "16px";
    editContainer.style.color = "black";
    editContainer.style.cursor = "pointer";

    const editIcon = document.createElement("i");
    editIcon.className = "fa-solid fa-pen-to-square";

    const editText = document.createElement("span");
    editText.textContent = "modifier";
    editText.style.fontFamily = "'Work Sans', sans-serif"; // <- on force ici la bonne police
    editText.style.fontWeight = "normal"; // <-- ici on enlève le gras

    editContainer.appendChild(editIcon);
    editContainer.appendChild(editText);

    portfolioTitle.appendChild(editContainer);

    editContainer.addEventListener("click", () => {
      createModal();
    });
  }
}

function createModal() {
  const modalContainer = document.getElementById("modal-container");

  const overlay = document.createElement("div");
  overlay.id = "modal-overlay";
  Object.assign(overlay.style, {
    position: "fixed",
    top: "0",
    left: "0",
    width: "100vw",
    height: "100vh",
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: "2000",
  });

  const modal = document.createElement("div");
  modal.id = "modal";
  Object.assign(modal.style, {
    width: "600px",
    backgroundColor: "#fff",
    borderRadius: "10px",
    padding: "30px",
    position: "relative",
    fontFamily: "'Work Sans', sans-serif",
  });

  const closeBtn = document.createElement("button");
  closeBtn.innerHTML = "&times;";
  Object.assign(closeBtn.style, {
    position: "absolute",
    top: "15px",
    right: "20px",
    background: "none",
    border: "none",
    fontSize: "24px",
    cursor: "pointer",
  });
  closeBtn.addEventListener("click", () => overlay.remove());

  const title = document.createElement("h3");
  title.textContent = "Ajout photo";
  Object.assign(title.style, {
    textAlign: "center",
    fontSize: "24px",
    marginBottom: "20px",
  });

  const form = document.createElement("form");
  form.id = "add-work-form";

  // ZONE D’APERCU
  const preview = document.createElement("div");
  preview.id = "preview-image";
  Object.assign(preview.style, {
    height: "180px",
    backgroundColor: "#E8F1F6",
    borderRadius: "3px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "column",
    marginBottom: "20px",
    overflow: "hidden",
    position: "relative",
    cursor: "pointer",
  });

  const icon = document.createElement("i");
  icon.className = "fa-regular fa-image";
  Object.assign(icon.style, {
    fontSize: "60px",
    color: "#B9C5CC",
    marginBottom: "10px",
  });

  const previewText = document.createElement("p");
  previewText.textContent = "+ Ajouter photo";
  Object.assign(previewText.style, {
    fontSize: "14px",
    color: "#444",
  });

  preview.appendChild(icon);
  preview.appendChild(previewText);

  // INPUT invisible mais déclenché par clic sur preview
  const inputImage = document.createElement("input");
  inputImage.type = "file";
  inputImage.accept = "image/*";
  inputImage.required = true;
  inputImage.style.display = "none";

  preview.addEventListener("click", () => inputImage.click());

  inputImage.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (file) {
      const imgPreview = document.createElement("img");
      imgPreview.src = URL.createObjectURL(file);
      Object.assign(imgPreview.style, {
        height: "100%",
        objectFit: "cover",
      });
      preview.innerHTML = "";
      preview.appendChild(imgPreview);
    }
  });

  const inputTitle = document.createElement("input");
  inputTitle.type = "text";
  inputTitle.placeholder = "Titre";
  inputTitle.required = true;
  Object.assign(inputTitle.style, {
    display: "block",
    margin: "10px 0",
    width: "100%",
    padding: "10px",
    borderRadius: "5px",
    border: "1px solid #ccc",
    fontSize: "14px",
    fontFamily: "inherit",
  });

  const selectCategory = document.createElement("select");
  selectCategory.required = true;
  Object.assign(selectCategory.style, {
    display: "block",
    margin: "10px 0",
    width: "100%",
    padding: "10px",
    borderRadius: "5px",
    border: "1px solid #ccc",
    fontSize: "14px",
    fontFamily: "inherit",
  });

  fetch(apiUrlCategories)
    .then((res) => res.json())
    .then((categories) => {
      categories.forEach((cat) => {
        const option = document.createElement("option");
        option.value = cat.id;
        option.textContent = cat.name;
        selectCategory.appendChild(option);
      });
    });

  const submitBtn = document.createElement("button");
  submitBtn.type = "submit";
  submitBtn.textContent = "Valider";
  Object.assign(submitBtn.style, {
    marginTop: "20px",
    display: "block",
    width: "100%",
    padding: "10px",
    backgroundColor: "#1D6154",
    color: "#fff",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    fontSize: "16px",
  });

  form.appendChild(preview);
  form.appendChild(inputImage);
  form.appendChild(inputTitle);
  form.appendChild(selectCategory);
  form.appendChild(submitBtn);

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("image", inputImage.files[0]);
    formData.append("title", inputTitle.value);
    formData.append("category", selectCategory.value);

    try {
      const res = await fetch(`${API_BASE}/api/works`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!res.ok) throw new Error("Erreur lors de l’envoi");

      overlay.remove();
      await fetchData(); // recharge les projets
    } catch (err) {
      alert("Erreur lors de l’ajout de la photo");
      console.error(err);
    }
  });

  modal.appendChild(closeBtn);
  modal.appendChild(title);
  modal.appendChild(form);
  overlay.appendChild(modal);
  modalContainer.appendChild(overlay);
}

// Initialisation de la page

document.addEventListener("DOMContentLoaded", async () => {
  await fetchData();

  if (loginLink) {
    if (token) {
      loginLink.textContent = "logout";
      loginLink.href = "#";
      loginLink.addEventListener("click", (e) => {
        e.preventDefault();
        logoutUser();
      });
      createEditBar();
      addEditIcon();
    } else {
      loginLink.textContent = "login";
      loginLink.href = "login.html";
    }
  }
});

function createManageGalleryModal(works) {
  const modalContainer = document.getElementById("modal-container");
  modalContainer.innerHTML = "";

  const overlay = document.createElement("div");
  overlay.id = "modal-overlay";
  Object.assign(overlay.style, {
    position: "fixed",
    top: "0",
    left: "0",
    width: "100vw",
    height: "100vh",
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: "2000",
  });

  const modal = document.createElement("div");
  modal.id = "modal";
  Object.assign(modal.style, {
    width: "600px",
    backgroundColor: "#fff",
    borderRadius: "10px",
    padding: "30px",
    position: "relative",
    fontFamily: "'Work Sans', sans-serif",
  });

  const closeBtn = document.createElement("button");
  closeBtn.innerHTML = "&times;";
  Object.assign(closeBtn.style, {
    position: "absolute",
    top: "15px",
    right: "20px",
    background: "none",
    border: "none",
    fontSize: "24px",
    cursor: "pointer",
  });
  closeBtn.addEventListener("click", () => overlay.remove());

  const title = document.createElement("h3");
  title.textContent = "Galerie photo";
  title.style.textAlign = "center";
  title.style.marginBottom = "20px";

  const gallery = document.createElement("div");
  gallery.style.display = "grid";
  gallery.style.gridTemplateColumns = "repeat(auto-fill, minmax(100px, 1fr))";
  gallery.style.gap = "10px";
  gallery.style.marginBottom = "20px";

  works.forEach((work) => {
    const figure = document.createElement("figure");
    figure.style.position = "relative";

    const img = document.createElement("img");
    img.src = work.imageUrl;
    img.alt = work.title;
    img.style.width = "100%";

    const trash = document.createElement("span");
    trash.innerHTML = '<i class="fa-solid fa-trash-can"></i>';
    Object.assign(trash.style, {
      position: "absolute",
      top: "5px",
      right: "5px",
      background: "black",
      color: "white",
      borderRadius: "3px",
      padding: "4px",
      cursor: "pointer",
      fontSize: "12px",
    });
    trash.addEventListener("click", async () => {
      try {
        const res = await fetch(`${apiUrlWorks}/${work.id}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (res.ok) {
          figure.remove();
          await fetchData();
        } else {
          throw new Error("Erreur lors de la suppression");
        }
      } catch (err) {
        alert("Erreur lors de la suppression");
        console.error(err);
      }
    });

    figure.appendChild(img);
    figure.appendChild(trash);
    gallery.appendChild(figure);
  });

  const addPhotoBtn = document.createElement("button");
  addPhotoBtn.textContent = "Ajouter une photo";
  Object.assign(addPhotoBtn.style, {
    display: "block",
    margin: "0 auto",
    padding: "10px 20px",
    backgroundColor: "#1D6154",
    color: "white",
    border: "none",
    borderRadius: "20px",
    cursor: "pointer",
  });
  addPhotoBtn.addEventListener("click", () => {
    overlay.remove();
    createModal();
  });

  modal.appendChild(closeBtn);
  modal.appendChild(title);
  modal.appendChild(gallery);
  modal.appendChild(addPhotoBtn);
  overlay.appendChild(modal);
  modalContainer.appendChild(overlay);
}

document.addEventListener("DOMContentLoaded", () => {
  document.addEventListener("click", async (e) => {
    if (e.target.closest(".edit-icon") || e.target.closest("#edit-bar")) {
      e.preventDefault();
      try {
        const res = await fetch(`${API_BASE}/api/works`);
        const works = await res.json();
        createManageGalleryModal(works);
      } catch (err) {
        console.error("Erreur chargement modale gestion :", err);
      }
    }
  });
});
