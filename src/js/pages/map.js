// src/js/pages/map.js
import { loadData } from "../data.js";

/**
 * Bounding box aproximado de Barcelona (para convertir lat/lng a %).
 * Si luego quieres más precisión, lo afinamos con tu propio mapa.
 */
const BBOX = {
  latMin: 41.32,
  latMax: 41.45,
  lngMin: 2.08,
  lngMax: 2.25,
};

function clamp01(x) {
  return Math.max(0, Math.min(1, x));
}

/**
 * Convierte lat/lng -> porcentajes dentro del contenedor del mapa.
 * Nota: Y va invertida porque en pantalla 0% es arriba.
 */
function latLngToPercent(lat, lng) {
  const x = (lng - BBOX.lngMin) / (BBOX.lngMax - BBOX.lngMin);
  const y = 1 - (lat - BBOX.latMin) / (BBOX.latMax - BBOX.latMin);
  return { x: clamp01(x), y: clamp01(y) };
}

function pinHTML(spot) {
  const { x, y } = latLngToPercent(spot.lat, spot.lng);
  const left = (x * 100).toFixed(4);
  const top  = (y * 100).toFixed(4);

  // usamos "category" del spot (Fotografía, Comer, Miradores...)
  return `
    <button
      class="map-pin"
      type="button"
      style="left:${left}%; top:${top}%;"
      data-id="${spot.id}"
      data-cat="${spot.category}"
      aria-label="${spot.title}"
      title="${spot.title}"
    >
      <span class="map-pin__dot" aria-hidden="true"></span>
    </button>
  `;
}

function getSelectedCategories() {
  // ids de tus checkboxes (ajusta si cambias nombres)
  const map = {
    "cat-foto": "Fotografía",
    "cat-comer": "Comer",
    "cat-activ": "Actividades",
    "cat-miradores": "Miradores",
    // "cat-cultura": "Cultura", // si lo añades de verdad en spots/categories
  };

  const selected = Object.entries(map)
    .filter(([id]) => document.getElementById(id)?.checked)
    .map(([, name]) => name);

  return selected; // [] = ninguno marcado
}

function filterSpots(spots) {
  const selectedCats = getSelectedCategories();
  if (selectedCats.length === 0) return spots; // sin filtros = todos
  return spots.filter(s => selectedCats.includes(s.category));
}

export async function initMapPage() {
  const mapEl = document.getElementById("map");
  const markersEl = document.getElementById("map-markers");
  if (!mapEl || !markersEl) return;

  const data = await loadData();
  const allSpots = data.spots || [];

  function render() {
    const visible = filterSpots(allSpots);
    markersEl.innerHTML = visible.map(pinHTML).join("");
  }

  // primer render
  render();

  // escuchar cambios en filtros
  ["cat-foto","cat-comer","cat-activ","cat-miradores","cat-cultura"].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener("change", render);
  });

  // click en pin (por ahora redirige a ficha o muestra alert)
  markersEl.addEventListener("click", (e) => {
    const btn = e.target.closest(".map-pin");
    if (!btn) return;

    const spotId = btn.dataset.id;

    // TODO: tu flujo: abrir modal / ir a spot.html?id=...
    // De momento: redirigir simple
    window.location.href = `spots.html?id=${encodeURIComponent(spotId)}`;
  });
}
