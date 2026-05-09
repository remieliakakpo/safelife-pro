const BASE_URL = process.env.REACT_APP_API_URL
  || 'https://safelife.up.railway.app';

const getToken = (): string | null =>
  localStorage.getItem('safelife_pro_token');

const authHeaders = (): Record<string, string> => ({
  'Content-Type': 'application/json',
  ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}),
});

// ─── AUTH ─────────────────────────────────────────────────────
export const loginPro = async (
  code: string,
  password: string
): Promise<any> => {
  const res = await fetch(`${BASE_URL}/pro/login`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({ code, password }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Code ou mot de passe invalide');
  }
  const data = await res.json();
  localStorage.setItem('safelife_pro_token', data.token);
  localStorage.setItem('safelife_pro_user',  JSON.stringify(data.user));
  return data;
};

export const logoutPro = (): void => {
  localStorage.removeItem('safelife_pro_token');
  localStorage.removeItem('safelife_pro_user');
};

export const getCurrentUser = (): any | null => {
  const raw = localStorage.getItem('safelife_pro_user');
  return raw ? JSON.parse(raw) : null;
};

export const isAuthenticated = (): boolean => !!getToken();

// ─── ALERTES ──────────────────────────────────────────────────
export const getAlertes = async (): Promise<any[]> => {
  const res = await fetch(`${BASE_URL}/alertes`, {
    headers: authHeaders(),
  });
  if (!res.ok) return [];
  const data = await res.json();
  return data.alertes || [];
};

export const prendreEnCharge = async (id: string): Promise<void> => {
  await fetch(`${BASE_URL}/alertes/${id}/prendre-en-charge`, {
    method:  'POST',
    headers: authHeaders(),
  });
};

// ─── ACCIDENTS (cartographie) ─────────────────────────────────
export const getAccidentsGeoJSON = async (days = 30): Promise<any> => {
  const res = await fetch(
    `${BASE_URL}/accidents/geojson?days=${days}`,
    { headers: authHeaders() }
  );
  if (!res.ok) return { type: 'FeatureCollection', features: [] };
  return res.json();
};

export const getAccidentsStats = async (days = 30): Promise<any> => {
  const res = await fetch(
    `${BASE_URL}/accidents/stats?days=${days}`,
    { headers: authHeaders() }
  );
  if (!res.ok) return {};
  return res.json();
};

export const getHotspots = async (): Promise<any[]> => {
  const res = await fetch(
    `${BASE_URL}/accidents/hotspots`,
    { headers: authHeaders() }
  );
  if (!res.ok) return [];
  return res.json();
};

export const getHeatmapData = async (days = 90): Promise<any> => {
  const res = await fetch(
    `${BASE_URL}/accidents/heatmap?days=${days}`,
    { headers: authHeaders() }
  );
  if (!res.ok) return { points: [] };
  return res.json();
};

// ─── SCANS ────────────────────────────────────────────────────
export const getScans = async (): Promise<any[]> => {
  const res = await fetch(
    `${BASE_URL}/scans/historique`,
    { headers: authHeaders() }
  );
  if (!res.ok) return [];
  const data = await res.json();
  return data.scans || [];
};

// ─── PROFIL PAR QR ────────────────────────────────────────────
export const getProfilParQR = async (qrToken: string): Promise<any> => {
  const res = await fetch(
    `${BASE_URL}/profil/scan/${qrToken}`,
    { headers: authHeaders() }
  );
  if (!res.ok) throw new Error('Profil introuvable');
  return res.json();
};