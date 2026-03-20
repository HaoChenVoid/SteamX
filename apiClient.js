const memoryCache = new Map();

export async function cachedFetch(url, ttlMs = 5 * 60 * 1000) {
  const now = Date.now();
  const cached = memoryCache.get(url);
  if (cached && now - cached.time < ttlMs) return cached.data;
  const res = await fetch(url, { headers: { 'User-Agent': 'SteamDealsUltimate/1.0' } });
  if (!res.ok) throw new Error(`Request failed: ${res.status}`);
  const data = await res.json();
  memoryCache.set(url, { time: now, data });
  return data;
}

export async function fetchSteamApp(appid, cc = 'us', l = 'english') {
  const res = await fetch(`/api/steam?appid=${appid}&cc=${cc}&l=${l}`);
  if (!res.ok) throw new Error('Steam proxy failed');
  return await res.json();
}

export async function fetchSteamReviews(appid) {
  const res = await fetch(`/api/reviews?appid=${appid}`);
  if (!res.ok) throw new Error('Review proxy failed');
  return await res.json();
}
