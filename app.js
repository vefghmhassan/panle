const API = {
  categories: "/api/categories",
  prompts: "/api/prompts",
  uploadImage: "/api/upload-image",
};

const HARD_CODED = {
  username: "admin",
  password: "123456",
};

const state = {
  categories: [],
  prompts: [],
  editingCategoryId: null,
  editingPromptId: null,
};

const elements = {
  loginScreen: document.getElementById("login-screen"),
  panelScreen: document.getElementById("panel-screen"),
  loginForm: document.getElementById("login-form"),
  loginMessage: document.getElementById("login-message"),
  loginUsername: document.getElementById("login-username"),
  loginPassword: document.getElementById("login-password"),
  logout: document.getElementById("logout"),
  sessionUser: document.getElementById("session-user"),
  tabs: document.querySelectorAll(".tab"),
  tabPanels: document.querySelectorAll(".tab-panel"),
  categoryForm: document.getElementById("category-form"),
  categoryNameFa: document.getElementById("category-name-fa"),
  categoryNameEn: document.getElementById("category-name-en"),
  categorySubmit: document.getElementById("category-submit"),
  categoryCancel: document.getElementById("category-cancel"),
  categoryMessage: document.getElementById("category-message"),
  categoriesList: document.getElementById("categories-list"),
  promptForm: document.getElementById("prompt-form"),
  promptTitleFa: document.getElementById("prompt-title-fa"),
  promptTitleEn: document.getElementById("prompt-title-en"),
  promptCategory: document.getElementById("prompt-category"),
  promptImage: document.getElementById("prompt-image"),
  promptSubmit: document.getElementById("prompt-submit"),
  promptCancel: document.getElementById("prompt-cancel"),
  promptMessage: document.getElementById("prompt-message"),
  promptsList: document.getElementById("prompts-list"),
};

function setMessage(element, message) {
  element.textContent = message || "";
}

function setScreen(isLoggedIn) {
  elements.loginScreen.classList.toggle("hidden", isLoggedIn);
  elements.panelScreen.classList.toggle("hidden", !isLoggedIn);
}

function saveSession(username) {
  localStorage.setItem("panel_auth", username);
}

function clearSession() {
  localStorage.removeItem("panel_auth");
}

function getSession() {
  return localStorage.getItem("panel_auth");
}

async function fetchJson(url, options = {}) {
  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
    },
    ...options,
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || "خطا در ارتباط با سرور");
  }
  return data;
}

async function loadCategories() {
  const data = await fetchJson(API.categories);
  state.categories = data.items || [];
  renderCategories();
  renderCategoryOptions();
}

async function loadPrompts() {
  const data = await fetchJson(API.prompts);
  state.prompts = data.items || [];
  renderPrompts();
}

function renderCategories() {
  elements.categoriesList.innerHTML = "";

  if (state.categories.length === 0) {
    elements.categoriesList.innerHTML = "<p class=\"message\">هیچ دسته‌بندی ثبت نشده است.</p>";
    return;
  }

  state.categories.forEach((item) => {
    const row = document.createElement("div");
    row.className = "list-item";
    row.innerHTML = `
      <div>
        <div class="list-title">${item.name_fa}</div>
        <div class="prompt-meta">${item.name_en}</div>
      </div>
      <div class="list-actions">
        <button class="btn ghost" data-action="edit" data-id="${item.id}">ویرایش</button>
        <button class="btn ghost" data-action="delete" data-id="${item.id}">حذف</button>
      </div>
    `;
    elements.categoriesList.appendChild(row);
  });
}

function renderCategoryOptions() {
  const selected = elements.promptCategory.value;
  elements.promptCategory.innerHTML = "<option value=\"\">بدون دسته‌بندی</option>";
  state.categories.forEach((item) => {
    const option = document.createElement("option");
    option.value = item.id;
    option.textContent = `${item.name_fa} (${item.name_en})`;
    elements.promptCategory.appendChild(option);
  });
  elements.promptCategory.value = selected;
}

function getCategoryName(categoryId) {
  if (!categoryId) {
    return "بدون دسته‌بندی";
  }
  const category = state.categories.find((item) => item.id === categoryId);
  return category ? category.name_fa : "نامشخص";
}

function renderPrompts() {
  elements.promptsList.innerHTML = "";

  if (state.prompts.length === 0) {
    elements.promptsList.innerHTML = "<p class=\"message\">هیچ پرامپتی ثبت نشده است.</p>";
    return;
  }

  state.prompts.forEach((item) => {
    const card = document.createElement("div");
    card.className = "prompt-card";
    const imageUrl = item.image_key ? `/api/image?id=${item.image_key}` : "";
    card.innerHTML = `
      <img src="${imageUrl}" alt="${item.title_fa}" />
      <div class="prompt-body">
        <div>
          <div class="prompt-title">${item.title_fa}</div>
          <div class="prompt-meta">${item.title_en}</div>
        </div>
        <div class="prompt-meta">${getCategoryName(item.category_id)}</div>
        <div class="prompt-actions">
          <button class="btn ghost" data-action="edit" data-id="${item.id}">ویرایش</button>
          <button class="btn ghost" data-action="delete" data-id="${item.id}">حذف</button>
        </div>
      </div>
    `;
    elements.promptsList.appendChild(card);
  });
}

function resetCategoryForm() {
  state.editingCategoryId = null;
  elements.categoryForm.reset();
  elements.categorySubmit.textContent = "ثبت دسته‌بندی";
  elements.categoryCancel.classList.add("hidden");
}

function resetPromptForm() {
  state.editingPromptId = null;
  elements.promptForm.reset();
  elements.promptSubmit.textContent = "ثبت پرامپت";
  elements.promptCancel.classList.add("hidden");
}

async function handleCategorySubmit(event) {
  event.preventDefault();
  setMessage(elements.categoryMessage, "");

  const payload = {
    name_fa: elements.categoryNameFa.value.trim(),
    name_en: elements.categoryNameEn.value.trim(),
  };

  try {
    if (state.editingCategoryId) {
      await fetchJson(API.categories, {
        method: "PUT",
        body: JSON.stringify({ ...payload, id: state.editingCategoryId }),
      });
      setMessage(elements.categoryMessage, "دسته‌بندی ویرایش شد.");
    } else {
      await fetchJson(API.categories, {
        method: "POST",
        body: JSON.stringify(payload),
      });
      setMessage(elements.categoryMessage, "دسته‌بندی جدید ثبت شد.");
    }

    resetCategoryForm();
    await loadCategories();
  } catch (error) {
    setMessage(elements.categoryMessage, error.message);
  }
}

async function handlePromptSubmit(event) {
  event.preventDefault();
  setMessage(elements.promptMessage, "");

  const payload = {
    title_fa: elements.promptTitleFa.value.trim(),
    title_en: elements.promptTitleEn.value.trim(),
    category_id: elements.promptCategory.value || null,
  };

  try {
    let imageId = null;
    if (state.editingPromptId) {
      const current = state.prompts.find((item) => item.id === state.editingPromptId);
      imageId = current ? current.image_key : null;
    }

    const file = elements.promptImage.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        throw new Error("حجم تصویر بیشتر از ۲ مگابایت است.");
      }
      const dataUrl = await readFileAsDataUrl(file);
      const upload = await fetchJson(API.uploadImage, {
        method: "POST",
        body: JSON.stringify({
          data_url: dataUrl,
          filename: file.name,
          content_type: file.type,
        }),
      });
      imageId = upload.id;
    }

    if (!imageId) {
      throw new Error("برای پرامپت یک تصویر انتخاب کنید.");
    }

    if (state.editingPromptId) {
      await fetchJson(API.prompts, {
        method: "PUT",
        body: JSON.stringify({ ...payload, id: state.editingPromptId, image_key: imageId }),
      });
      setMessage(elements.promptMessage, "پرامپت ویرایش شد.");
    } else {
      await fetchJson(API.prompts, {
        method: "POST",
        body: JSON.stringify({ ...payload, image_key: imageId }),
      });
      setMessage(elements.promptMessage, "پرامپت جدید ثبت شد.");
    }

    resetPromptForm();
    await loadPrompts();
  } catch (error) {
    setMessage(elements.promptMessage, error.message);
  }
}

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("خواندن فایل با خطا مواجه شد."));
    reader.readAsDataURL(file);
  });
}

async function handleCategoryAction(event) {
  const button = event.target.closest("button");
  if (!button) {
    return;
  }

  const { action, id } = button.dataset;
  if (!action || !id) {
    return;
  }

  if (action === "edit") {
    const category = state.categories.find((item) => item.id === id);
    if (!category) {
      return;
    }
    state.editingCategoryId = id;
    elements.categoryNameFa.value = category.name_fa;
    elements.categoryNameEn.value = category.name_en;
    elements.categorySubmit.textContent = "ذخیره تغییرات";
    elements.categoryCancel.classList.remove("hidden");
    return;
  }

  if (action === "delete") {
    const ok = confirm("آیا از حذف این دسته‌بندی مطمئن هستید؟");
    if (!ok) {
      return;
    }
    try {
      await fetchJson(API.categories, {
        method: "DELETE",
        body: JSON.stringify({ id }),
      });
      await loadCategories();
      await loadPrompts();
    } catch (error) {
      setMessage(elements.categoryMessage, error.message);
    }
  }
}

async function handlePromptAction(event) {
  const button = event.target.closest("button");
  if (!button) {
    return;
  }

  const { action, id } = button.dataset;
  if (!action || !id) {
    return;
  }

  if (action === "edit") {
    const prompt = state.prompts.find((item) => item.id === id);
    if (!prompt) {
      return;
    }
    state.editingPromptId = id;
    elements.promptTitleFa.value = prompt.title_fa;
    elements.promptTitleEn.value = prompt.title_en;
    elements.promptCategory.value = prompt.category_id || "";
    elements.promptSubmit.textContent = "ذخیره تغییرات";
    elements.promptCancel.classList.remove("hidden");
    return;
  }

  if (action === "delete") {
    const ok = confirm("آیا از حذف این پرامپت مطمئن هستید؟");
    if (!ok) {
      return;
    }
    try {
      await fetchJson(API.prompts, {
        method: "DELETE",
        body: JSON.stringify({ id }),
      });
      await loadPrompts();
    } catch (error) {
      setMessage(elements.promptMessage, error.message);
    }
  }
}

function handleTabClick(event) {
  const tab = event.target.closest(".tab");
  if (!tab) {
    return;
  }

  const target = tab.dataset.tab;
  elements.tabs.forEach((item) => item.classList.toggle("active", item === tab));
  elements.tabPanels.forEach((panel) => {
    panel.classList.toggle("hidden", panel.dataset.tabPanel !== target);
  });
}

function initLogin() {
  const username = getSession();
  if (username) {
    elements.sessionUser.textContent = username;
    setScreen(true);
    boot();
  }

  elements.loginForm.addEventListener("submit", (event) => {
    event.preventDefault();
    setMessage(elements.loginMessage, "");

    const usernameInput = elements.loginUsername.value.trim();
    const passwordInput = elements.loginPassword.value.trim();

    if (
      usernameInput === HARD_CODED.username &&
      passwordInput === HARD_CODED.password
    ) {
      saveSession(usernameInput);
      elements.sessionUser.textContent = usernameInput;
      setScreen(true);
      boot();
    } else {
      setMessage(elements.loginMessage, "نام کاربری یا گذرواژه نادرست است.");
    }
  });

  elements.logout.addEventListener("click", () => {
    clearSession();
    setScreen(false);
  });
}

async function boot() {
  try {
    await loadCategories();
    await loadPrompts();
  } catch (error) {
    setMessage(elements.promptMessage, error.message);
  }
}

function initEvents() {
  elements.tabs.forEach((tab) => tab.addEventListener("click", handleTabClick));
  elements.categoryForm.addEventListener("submit", handleCategorySubmit);
  elements.categoryCancel.addEventListener("click", resetCategoryForm);
  elements.categoriesList.addEventListener("click", handleCategoryAction);
  elements.promptForm.addEventListener("submit", handlePromptSubmit);
  elements.promptCancel.addEventListener("click", resetPromptForm);
  elements.promptsList.addEventListener("click", handlePromptAction);
}

initLogin();
initEvents();
