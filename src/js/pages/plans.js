// src/js/pages/plans.js
import { loadData } from "../data.js";

function planCardHTML(plan) {
  const chips = (plan.chips || []).map(c => `<span class="chip">${c}</span>`).join("");

  const bg = plan.thumb
    ? `style="background-image:url('${plan.thumb}'); background-size:cover; background-position:center;"`
    : "";

  const duration = Number(plan.duration || 0);
  const stops = Number(plan.stops || 0);

  return `
    <article class="card plan" data-id="${plan.id}">
      <div class="card__thumb" aria-hidden="true" ${bg}></div>
      <h3 class="card__title">${plan.title}</h3>
      <p class="muted small">Duración ${duration} min · ${stops} paradas</p>
      <div class="card__meta">${chips}</div>
    </article>
  `;
}

function normalize(str) {
  return (str || "").toLowerCase().trim();
}

export async function initPlansPage() {
  const grid = document.getElementById("plans-grid");
  if (!grid) return;

  const data = await loadData();
  const allPlans = data.plans || [];

  // buscador (usa tu input existente)
  const searchInput = document.querySelector('.page-head__search input[type="search"]');

  function render(list) {
    grid.innerHTML = list.map(planCardHTML).join("");
  }

  // primer render
  render(allPlans);

  // filtrar por texto
  if (searchInput) {
    searchInput.addEventListener("input", () => {
      const q = normalize(searchInput.value);

      if (!q) return render(allPlans);

      const filtered = allPlans.filter(p => {
        const haystack = [
          p.title,
          p.description,
          p.category,
          ...(p.chips || []),
        ].join(" ");
        return normalize(haystack).includes(q);
      });

      render(filtered);
    });
  }

  // click en tarjeta (opcional): ir a detalle
  grid.addEventListener("click", (e) => {
    const card = e.target.closest(".plan[data-id]");
    if (!card) return;

    const id = card.dataset.id;
    // si tienes o harás detail: plan.html?id=...
    // window.location.href = `plan.html?id=${encodeURIComponent(id)}`;
  });
}
