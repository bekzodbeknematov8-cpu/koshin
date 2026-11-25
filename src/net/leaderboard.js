// Global reyting uchun tayyor joy. Hozircha server yo'q: natijalar faqat telefonda saqlanadi.
// Keyinchalik: LEADERBOARD.endpoint = 'https://...' qilib, submit/top ni haqiqiy so'rovlar bilan ishlatish kifoya.
export const LEADERBOARD = { endpoint: null, timeoutMs: 5000 };

// mode: 'endless' | 'daily'; payload: { score, day? , name? }
export async function submitScore(mode, payload) {
  if (!LEADERBOARD.endpoint) return { ok: false, offline: true };
  try {
    const ctrl = typeof AbortController !== 'undefined' ? new AbortController() : null;
    const t = ctrl && setTimeout(() => ctrl.abort(), LEADERBOARD.timeoutMs);
    const res = await fetch(`${LEADERBOARD.endpoint}/scores/${encodeURIComponent(mode)}`, {
      method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(payload), signal: ctrl && ctrl.signal,
    });
    if (t) clearTimeout(t);
    return { ok: res.ok };
  } catch {
    return { ok: false };
  }
}

export async function topScores(mode, limit = 50) {
  if (!LEADERBOARD.endpoint) return [];
  try {
    const res = await fetch(`${LEADERBOARD.endpoint}/scores/${encodeURIComponent(mode)}?limit=${limit}`);
    return res.ok ? await res.json() : [];
  } catch {
    return [];
  }
}
