// src/js/pages/favs.js
import { loadData } from "../data.js";
import { getFavs, removeFav } from "../favsStore.js";

function normalize(str) {
  return (str || "").toLowerCase().trim();
}

function thumbStyle(url) {
  return url
    ? `style="background-image:url('${url}'); background-size:cover; background-position:center;"`
    : "";
}

function favCardHTML({ type, item }) {
  // “subtitle” adaptado a tu diseño
  const subtitle = type === "spots"
    ? `${item.area || "Barcelona"} · ${item.category || ""}`.trim()
    : `${item.category || "Plan"} · ${(item.chips?.includes("Gratis") ? "Gratis" : (item.chips?.includes("Reserva") ? "Reserva" : ""))}`.replace(" · ", " · ").trim();

  return `
    <article class="card fav-card" data-type="${type}" data-id="${item.id}">
      <button class="fav-card__heart" type="button" aria-label="Quitar de favoritos" aria-pressed="true">♥</button>
      <div class="card__thumb" ${thumbStyle(item.thumb)}></div>
      <h3 class="card__title">${item.title}</h3>
      <p class="muted small">${subtitle}</p>
    </article>
  `;
}

export async function initFavsPage() {
  const grid = document.getElementById("favs-grid");
  const empty = document.getElementById("favs-empty");
  if (!grid || !empty) return;

  const data = await loadData();
  const plansById = new Map((data.plans || []).map(p => [p.id, p]));
  const spotsById = new Map((data.spots || []).map(s => [s.id, s]));

  const searchInput = document.querySelector('.page-head__search input[type="search"]');

  function buildList() {
    const favs = getFavs();

    const list = [];

    for (const id of favs.plans) {
      const item = plansById.get(id);
      if (item) list.push({ type: "plans", item });
    }
    for (const id of favs.spots) {
      const item = spotsById.get(id);
      if (item) list.push({ type: "spots", item });
    }

    return list;
  }

  function render() {
    const q = normalize(searchInput?.value || "");
    let list = buildList();

    if (q) {
      list = list.filter(({ item, type }) => {
        const haystack = [
          item.title,
          item.description,
          item.category,
          item.area,
          ...(item.chips || []),
          type,
        ].join(" ");
        return normalize(haystack).includes(q);
      });
    }

    if (list.length === 0) {
      grid.innerHTML = "";
      empty.hidden = false;
      return;
    }

    empty.hidden = true;
    grid.innerHTML = list.map(favCardHTML).join("");
  }

  // render inicial
  render();

  // filtrar por búsqueda
  if (searchInput) {
    searchInput.addEventListener("input", render);
  }

  // quitar favoritos
  grid.addEventListener("click", (e) => {
    const btn = e.target.closest(".fav-card__heart");
    if (!btn) return;

    const card = e.target.closest(".fav-card");
    if (!card) return;

    const type = card.dataset.type; // "plans" | "spots"
    const id = card.dataset.id;

    removeFav(type, id);
    render();
  });
}
