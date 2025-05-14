// main.js

const API_BASE = "http://localhost:5678";
const apiUrlWorks = `${API_BASE}/api/works`;
const apiUrlCategories = `${API_BASE}/api/categories`;
const token = localStorage.getItem("authToken");
const loginLink = document.getElementById("login-link");

// Function to fetch project and category data
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

    // 1️⃣ Affiche toujours tous les projets
    displayWorks(works);

    // 2️⃣ Gère l'affichage des filtres
    const filtersContainer = document.querySelector(".filters");
    const portfolioTitle = document.querySelector("#portfolio h2");

    if (localStorage.getItem("authToken")) {
      // Si l'utilisateur est connecté, on cache complètement les filtres
      if (filtersContainer) filtersContainer.style.display = "none";
      // Et on ajoute 96px de marge au titre
      if (portfolioTitle) portfolioTitle.style.marginBottom = "96px";
    } else {
      // Sinon, on affiche le bloc et on génère les boutons
      if (filtersContainer) filtersContainer.style.display = "";
      if (portfolioTitle) portfolioTitle.style.marginTop = ""; // réinitialise
      createCategoryMenu(categories);
    }
  } catch (error) {
    console.error("Erreur :", error);
  }
}

// Dynamically display projects in the DOM
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

// Create the category filter menu
function createCategoryMenu(categories) {
  if (localStorage.getItem("authToken")) return;
  const filtersContainer = document.querySelector(".filters");
  if (!filtersContainer) return;

  // Target the <ul> inside .filters
  const ul = filtersContainer.querySelector("ul");
  if (!ul) return;

  ul.innerHTML = ""; // Clear any existing filters if necessary

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
        displayWorks(data); // All
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

// Clean function for logout
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

// Black edition mode bar
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

  // Push the rest of the page downward
  document.body.style.paddingTop = "40px";
}

function addEditIcon() {
  const portfolioTitle = document.querySelector("#portfolio h2");
  if (portfolioTitle) {
    // Inline container for the icon + "edit" text
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

function createModal(works) {
  const modalContainer = document.getElementById("modal-container");

  // Overlay
  const overlay = document.createElement("div");
  overlay.id = "modal-overlay";
  Object.assign(overlay.style, {
    position: "fixed",
    top: "0",
    left: "0",
    width: "100vw",
    height: "100vh",
    backgroundColor: "rgba(0,0,0,0.6)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: "2000",
  });

  // Modal (630×670)
  const modal = document.createElement("div");
  modal.id = "modal";
  Object.assign(modal.style, {
    width: "630px",
    height: "670px",
    backgroundColor: "#fff",
    borderRadius: "10px",
    padding: "30px 20px",
    position: "relative",
    fontFamily: "'Work Sans', sans-serif",
    fontWeight: "400",
    boxSizing: "border-box",
    overflowY: "auto",
  });

  // ← Back
  const backBtn = document.createElement("button");
  backBtn.textContent = "←";
  Object.assign(backBtn.style, {
    position: "absolute",
    top: "20px",
    left: "20px",
    background: "none",
    border: "none",
    fontSize: "20px",
    cursor: "pointer",
  });
  backBtn.onclick = () => {
    createManageGalleryModal(works);
    overlay.remove();
  };

  // × Close
  const closeBtn = document.createElement("button");
  closeBtn.innerHTML = "×";
  Object.assign(closeBtn.style, {
    position: "absolute",
    top: "20px",
    right: "20px",
    background: "none",
    border: "none",
    fontSize: "20px",
    cursor: "pointer",
  });
  closeBtn.onclick = () => overlay.remove();

  // Title
  const title = document.createElement("h3");
  title.textContent = "Ajout photo";
  Object.assign(title.style, {
    textAlign: "center",
    fontSize: "20px",
    margin: "0 0 20px",
    fontWeight: "400",
  });

  // Form
  const form = document.createElement("form");
  form.id = "add-work-form";

  // --- Preview area (initial) ---
  const preview = document.createElement("div");
  preview.id = "preview-image";
  Object.assign(preview.style, {
    width: "400px",
    height: "200px",
    backgroundColor: "transparent",
    border: "none",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
    cursor: "pointer",
    margin: "0 auto 30px",
    boxSizing: "border-box",
  });
  const dlIcon = document.createElement("img");
  dlIcon.src = "assets/images/dl.png";
  dlIcon.alt = "Ajouter photo";
  Object.assign(dlIcon.style, {
    width: "100%",
    height: "100%",
    objectFit: "contain",
  });
  preview.appendChild(dlIcon);

  const inputImage = document.createElement("input");
  inputImage.type = "file";
  inputImage.accept = "image/jpeg,image/png";
  inputImage.required = true;
  inputImage.style.display = "none";

  preview.addEventListener("click", () => inputImage.click());
  inputImage.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (!file) return;
    // Restore border & background
    preview.style.backgroundColor = "#E8F1F6";
    preview.style.border = "2px dashed #CBD6DC";
    preview.innerHTML = "";
    const img = document.createElement("img");
    img.src = URL.createObjectURL(file);
    Object.assign(img.style, {
      maxWidth: "100%",
      maxHeight: "100%",
      objectFit: "contain",
    });
    preview.appendChild(img);
  });

  // --- Label + Title ---
  const labelTitle = document.createElement("label");
  labelTitle.textContent = "Titre";
  Object.assign(labelTitle.style, {
    display: "block",
    width: "400px",
    margin: "0 auto 8px",
    fontSize: "14px",
    fontWeight: "400",
  });
  const inputTitle = document.createElement("input");
  inputTitle.type = "text";
  inputTitle.placeholder = "Titre du projet";
  inputTitle.required = true;
  Object.assign(inputTitle.style, {
    display: "block",
    width: "400px",
    padding: "12px",
    fontSize: "14px",
    borderRadius: "5px",
    border: "1px solid #E2E2E2",
    margin: "0 auto 20px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
    boxSizing: "border-box",
  });

  // --- Label + Category ---
  const labelCategory = document.createElement("label");
  labelCategory.textContent = "Catégorie";
  Object.assign(labelCategory.style, {
    display: "block",
    width: "400px",
    margin: "0 auto 8px",
    fontSize: "14px",
    fontWeight: "400",
  });
  const selectCategory = document.createElement("select");
  selectCategory.required = true;
  Object.assign(selectCategory.style, {
    display: "block",
    width: "400px",
    padding: "12px",
    fontSize: "14px",
    borderRadius: "5px",
    border: "1px solid #E2E2E2",
    margin: "0 auto 47px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
    boxSizing: "border-box",
  });
  fetch(apiUrlCategories)
    .then((r) => r.json())
    .then((cats) =>
      cats.forEach((cat) => {
        const opt = document.createElement("option");
        opt.value = cat.id;
        opt.textContent = cat.name;
        selectCategory.appendChild(opt);
      })
    )
    .catch(console.error);

  // --- Divider ---
  const divider = document.createElement("hr");
  Object.assign(divider.style, {
    border: "none",
    borderTop: "1px solid #E2E2E2",
    margin: "0 0 30px",
  });

  // --- Submit button ---
  const submitBtn = document.createElement("button");
  submitBtn.type = "submit";
  submitBtn.textContent = "Valider";
  Object.assign(submitBtn.style, {
    display: "block",
    margin: "0 auto",
    padding: "12px 50px",
    backgroundColor: "#1D6154",
    color: "#fff",
    fontSize: "16px",
    border: "none",
    borderRadius: "30px",
    cursor: "pointer",
    width: "237px",
  });

  // Assemble form
  form.append(preview, inputImage);
  form.append(labelTitle, inputTitle);
  form.append(labelCategory, selectCategory);
  form.append(divider, submitBtn);

  // ---- Submit handler ----
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    // Validation
    if (
      !inputImage.files[0] ||
      !inputTitle.value.trim() ||
      !selectCategory.value
    ) {
      alert("Veuillez remplir tous les champs du formulaire.");
      return;
    }

    // Build FormData
    const formData = new FormData();
    formData.append("image", inputImage.files[0]);
    formData.append("title", inputTitle.value.trim());
    formData.append("category", selectCategory.value);

    try {
      // Send to API
      const token = localStorage.getItem("authToken");
      const res = await fetch(`${API_BASE}/api/works`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });
      if (!res.ok) throw new Error("Erreur lors de l’envoi");

      // On success : close & refresh
      overlay.remove();
      await fetchData();
    } catch (err) {
      alert("Erreur lors de l’ajout de la photo");
      console.error(err);
    }
  });

  // Mount modal
  modal.append(backBtn, closeBtn, title, form);
  overlay.appendChild(modal);
  modalContainer.appendChild(overlay);
}

// Page initialization

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
    createModal(works); // ← on transmet la liste des works
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
