// src/js/pages/home.js
import { loadData } from "../data.js";

function planCardHTML(plan) {
  const chips = (plan.chips || []).map(c => `<span class="chip">${c}</span>`).join("");
  const bg = plan.thumb
    ? `style="background-image:url('${plan.thumb}'); background-size:cover; background-position:center;"`
    : "";

  return `
    <article class="card">
      <div class="card__thumb" aria-hidden="true" ${bg}></div>
      <h3 class="card__title">${plan.title}</h3>
      <div class="card__meta">${chips}</div>
    </article>
  `;
}

function mountHomeMap(assets = {}) {
  const img = document.getElementById("home-map-img");
  const link = document.getElementById("home-map-link");
  if (!img || !link) return;

  img.src = assets.map_home || "/img/mapa/mapa_home.png";
  link.href = assets.map_link || "/mapa.html";
}

export async function initHome() {
  const track = document.getElementById("home-plans-track");
  const data = await loadData();

  // planes
  if (track) {
    const plans = (data.plans || []).slice(0, 10);
    track.innerHTML = plans.map(planCardHTML).join("");
  }

  // mapa home
  mountHomeMap(data.assets);
}
