// src/js/data.js
let cache = null;

export async function loadData() {
  if (cache) return cache;

  const res = await fetch("/data/spots.json", { cache: "no-store" });
  if (!res.ok) throw new Error(`No puedo cargar /data/spots.json (${res.status})`);

  cache = await res.json();
  return cache;
}
