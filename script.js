"use strict";

const THEME_KEY = "theme";

/* ---------- Ініціалізація ---------- */

document.addEventListener("DOMContentLoaded", () => {
  bindHandlers();
  initTheme();
});

function bindHandlers() {
  document.querySelector("#theme-toggle").addEventListener("click", toggleTheme);
  document.querySelector("#visitor-name").addEventListener("input", updateGreeting);
  document.querySelector("#comment-form").addEventListener("submit", addComment);
  document.querySelector("#load-html").addEventListener("click", loadHtml);
  document.querySelector("#load-json").addEventListener("click", loadJson);
}

/* ---------- 1. Перемикання теми ---------- */

function applyTheme(dark) {
  document.body.classList.toggle("dark-theme", dark);
  document.body.classList.toggle("light-theme", !dark);
  document.querySelector("#theme-toggle").setAttribute("aria-pressed", String(dark));
}

function toggleTheme() {
  const dark = !document.body.classList.contains("dark-theme");
  applyTheme(dark);
  try {
    localStorage.setItem(THEME_KEY, dark ? "dark" : "light");
  } catch (error) {
    console.warn("localStorage недоступне:", error);
  }
}

function initTheme() {
  try {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved === "dark" || saved === "light") {
      applyTheme(saved === "dark");
    }
  } catch (error) {
    console.warn("localStorage недоступне:", error);
  }
}

/* ---------- 2. Привітання ---------- */

function updateGreeting(event) {
  const name = event.target.value.trim();
  document.querySelector("#greeting").textContent = name ? `Вітаємо, ${name}!` : "";
}

/* ---------- 3. Додавання коментарів ---------- */

function addComment(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const authorField = form.elements.namedItem("author");
  const textField = form.elements.namedItem("comment");
  const author = authorField.value.trim();
  const text = textField.value.trim();
  if (!author || !text) return;

  const item = document.createElement("li");
  const heading = document.createElement("strong");
  const paragraph = document.createElement("p");
  heading.textContent = author;
  paragraph.textContent = text;
  item.appendChild(heading);
  item.appendChild(paragraph);
  document.querySelector("#comments").appendChild(item);

  form.reset();
  authorField.focus();
}

/* ---------- 4. Завантаження HTML ---------- */

function loadHtml(event) {
  const button = event.currentTarget;
  const status = document.querySelector("#html-status");
  const container = document.querySelector("#html-content");

  button.disabled = true;
  status.textContent = "Завантаження…";
  container.replaceChildren();

  // Для віддаленого джерела замініть URL, напр.
  // "https://web2025-test-data.ikto.net/autumn-note.html" (потрібен CORS).
  fetch("fragment.html")
    .then(response => {
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return response.text();
    })
    .then(html => {
      // Допустимо лише для контрольованого навчального фрагмента.
      container.innerHTML = html;
      status.textContent = "HTML завантажено.";
    })
    .catch(error => {
      status.textContent = "Не вдалося завантажити дані.";
      console.error("Помилка завантаження HTML:", error);
    })
    .finally(() => { button.disabled = false; });
}

/* ---------- 5. Завантаження JSON ---------- */

async function loadJson(event) {
  const button = event.currentTarget;
  const status = document.querySelector("#json-status");
  const container = document.querySelector("#json-content");

  button.disabled = true;
  status.textContent = "Завантаження…";
  container.replaceChildren();

  try {
    const response = await fetch("data.json");
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();

    if (!Array.isArray(data) || !data.every(item =>
      item !== null && typeof item === "object" &&
      typeof item.author === "string" && typeof item.text === "string"
    )) {
      throw new Error("Невідповідна структура JSON");
    }

    const fragment = document.createDocumentFragment();
    for (const item of data) {
      const li = document.createElement("li");
      const name = document.createElement("strong");
      name.textContent = item.author;
      li.appendChild(name);
      li.appendChild(document.createTextNode(`: ${item.text}`));
      fragment.appendChild(li);
    }
    container.appendChild(fragment);
    status.textContent = data.length ? "JSON завантажено." : "Даних немає.";
  } catch (error) {
    status.textContent = "Не вдалося завантажити дані.";
    console.error("Помилка завантаження JSON:", error);
  } finally {
    button.disabled = false;
  }
}
