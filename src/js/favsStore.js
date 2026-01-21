// src/js/favsStore.js
const KEY = "umbral:favs";

function defaultState() {
  return { plans: [], spots: [] };
}

export function getFavs() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return defaultState();
    const parsed = JSON.parse(raw);
    return {
      plans: Array.isArray(parsed.plans) ? parsed.plans : [],
      spots: Array.isArray(parsed.spots) ? parsed.spots : [],
    };
  } catch {
    return defaultState();
  }
}

export function saveFavs(state) {
  localStorage.setItem(KEY, JSON.stringify(state));
}

export function isFav(type, id) {
  const favs = getFavs();
  return favs[type]?.includes(id) ?? false;
}

export function addFav(type, id) {
  const favs = getFavs();
  if (!favs[type]) favs[type] = [];
  if (!favs[type].includes(id)) favs[type].push(id);
  saveFavs(favs);
}

export function removeFav(type, id) {
  const favs = getFavs();
  favs[type] = (favs[type] || []).filter(x => x !== id);
  saveFavs(favs);
}

export function toggleFav(type, id) {
  if (isFav(type, id)) {
    removeFav(type, id);
    return false;
  }
  addFav(type, id);
  return true;
}
