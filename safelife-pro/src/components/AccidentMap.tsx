import React, { useEffect, useState, useRef } from 'react';

const BASE_URL = process.env.REACT_APP_API_URL || 'https://safelife.up.railway.app';

interface AccidentPoint {
  lat:      number;
  lng:      number;
  severity: string;
  zone:     string;
  time:     string;
  vehicle:  string;
  weather:  string;
}

interface Stats {
  total:       number;
  hotspots:    number;
  by_hour:     { hour: number; count: number }[];
  by_vehicle:  { type: string; count: number }[];
  by_severity: { severity: string; count: number }[];
  by_weather:  { weather: string; count: number }[];
}

export default function AccidentMap() {
  const mapRef    = useRef<any>(null);
  const leafletRef = useRef<any>(null);

  const [accidents, setAccidents] = useState<AccidentPoint[]>([]);
  const [hotspots,  setHotspots]  = useState<any[]>([]);
  const [stats,     setStats]     = useState<Stats | null>(null);
  const [viewMode,  setViewMode]  = useState<'heatmap' | 'points' | 'hotspots'>('heatmap');
  const [days,      setDays]      = useState(30);
  const [loading,   setLoading]   = useState(true);

  // Charger les données
  const loadData = async () => {
    setLoading(true);
    try {
      const [geoRes, heatRes, hotRes, statRes] = await Promise.all([
        fetch(`${BASE_URL}/accidents/geojson?days=${days}`),
        fetch(`${BASE_URL}/accidents/heatmap?days=${days}`),
        fetch(`${BASE_URL}/accidents/hotspots`),
        fetch(`${BASE_URL}/accidents/stats?days=${days}`),
      ]);

      const geo  = await geoRes.json();
      const heat = await heatRes.json();
      const hot  = await hotRes.json();
      const stat = await statRes.json();

      setHotspots(hot);
      setStats(stat);

      // Convertir GeoJSON en points simples
      const pts = geo.features?.map((f: any) => ({
        lat:      f.geometry.coordinates[1],
        lng:      f.geometry.coordinates[0],
        severity: f.properties.severity,
        zone:     f.properties.zone_name || 'Lomé',
        time:     f.properties.timestamp,
        vehicle:  f.properties.vehicle_type,
        weather:  f.properties.weather,
      })) || [];
      setAccidents(pts);

    } catch (e) {
      console.error('Erreur chargement accidents:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, [days]);

  // Initialiser Leaflet (chargé dynamiquement pour éviter SSR)
  useEffect(() => {
    if (!mapRef.current || leafletRef.current) return;

    // Injecter Leaflet CSS
    const link = document.createElement('link');
    link.rel  = 'stylesheet';
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    document.head.appendChild(link);

    // Charger Leaflet + plugins
    const script1 = document.createElement('script');
    script1.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script1.onload = () => {
      const script2 = document.createElement('script');
      script2.src = 'https://unpkg.com/leaflet.heat@0.2.0/dist/leaflet-heat.js';
      script2.onload = () => initMap();
      document.body.appendChild(script2);
    };
    document.body.appendChild(script1);
  }, []);

  const initMap = () => {
    const L = (window as any).L;
    if (!L || !mapRef.current || leafletRef.current) return;

    // Centré sur Lomé
    const map = L.map(mapRef.current, {
      center:        [6.1375, 1.2124],
      zoom:          13,
      zoomControl:   true,
      scrollWheelZoom: true,
    });

    // Tuiles OpenStreetMap (gratuites)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap',
      maxZoom:     19,
    }).addTo(map);

    leafletRef.current = map;
  };

  // Mettre à jour la carte quand les données changent
  useEffect(() => {
    const L = (window as any).L;
    const map = leafletRef.current;
    if (!L || !map || loading) return;

    // Supprimer les couches existantes
    map.eachLayer((layer: any) => {
      if (!layer._url) map.removeLayer(layer); // garder les tuiles
    });

    if (viewMode === 'heatmap' && accidents.length > 0) {
      // Mode heatmap
      const points = accidents.map(a => {
        const w = a.severity === 'fatal' ? 1.0
                : a.severity === 'serious' ? 0.6
                : 0.3;
        return [a.lat, a.lng, w];
      });

      (L as any).heatLayer(points, {
        radius:    25,
        blur:      15,
        maxZoom:   17,
        gradient:  {
          0.0: '#00ff00',  // vert = peu dangereux
          0.4: '#ffff00',  // jaune
          0.6: '#ff8000',  // orange
          1.0: '#ff0000',  // rouge = très dangereux
        },
      }).addTo(map);

    } else if (viewMode === 'points' && accidents.length > 0) {
      // Mode points avec popups
      const colors: Record<string, string> = {
        fatal:   '#E24B4A',
        serious: '#EF9F27',
        minor:   '#639922',
        unknown: '#888888',
      };

      accidents.forEach(a => {
        const color = colors[a.severity] || '#888888';
        const marker = L.circleMarker([a.lat, a.lng], {
          radius:      a.severity === 'fatal' ? 10 : 7,
          fillColor:   color,
          color:       '#fff',
          weight:      2,
          fillOpacity: 0.85,
        });

        marker.bindPopup(`
          <div style="font-family:sans-serif;font-size:12px;min-width:180px;">
            <strong style="font-size:13px;">${a.zone}</strong><br>
            <hr style="margin:4px 0;border-color:#eee;">
            🕐 ${a.time ? new Date(a.time).toLocaleString('fr-FR') : 'Inconnu'}<br>
            🏍️ Véhicule : ${a.vehicle || 'inconnu'}<br>
            ☁️ Météo : ${a.weather || 'inconnu'}<br>
            <span style="
              display:inline-block;margin-top:4px;
              padding:2px 8px;border-radius:99px;
              background:${color}20;color:${color};
              font-weight:600;font-size:10px;
            ">${a.severity === 'fatal' ? 'Mortel' : a.severity === 'serious' ? 'Grave' : a.severity === 'minor' ? 'Léger' : 'Inconnu'}</span>
          </div>
        `);

        marker.addTo(map);
      });

    } else if (viewMode === 'hotspots') {
      // Mode zones à risque
      hotspots.forEach(h => {
        const radius = 200 + h.count * 50;
        L.circle([h.latitude, h.longitude], {
          radius,
          color:       '#E24B4A',
          fillColor:   '#E24B4A',
          fillOpacity: Math.min(0.15 + h.severity_score * 0.1, 0.5),
          weight:      2,
        }).bindPopup(`
          <div style="font-family:sans-serif;font-size:12px;">
            <strong>🔴 Zone à risque</strong><br>
            ${h.zone_name || 'Zone identifiée'}<br>
            <strong>${h.count} accidents</strong> recensés<br>
            Score de risque : <strong>${h.severity_score}</strong>
          </div>
        `).addTo(map);
      });
    }
  }, [accidents, hotspots, viewMode, loading]);

  const severityColor = (s: string) =>
    s === 'fatal' ? '#E24B4A' : s === 'serious' ? '#EF9F27' : '#639922';

  const severityLabel = (s: string) =>
    s === 'fatal' ? 'Mortel' : s === 'serious' ? 'Grave' : s === 'minor' ? 'Léger' : 'Inconnu';

  return (
    <div className="flex-1 overflow-y-auto p-5 space-y-4">

      {/* ── En-tête ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-sm font-bold text-t1 uppercase tracking-wider">
            Cartographie des accidents
          </h1>
          <p className="text-xs text-t3 mt-0.5">
            {stats?.total || 0} accidents · {stats?.hotspots || 0} zones à risque
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Filtre période */}
          {[7, 30, 90, 365].map(d => (
            <button
              key={d}
              onClick={() => setDays(d)}
              className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${
                days === d
                  ? 'bg-urg-green text-white border-urg-green'
                  : 'bg-s2 text-t2 border-bord hover:text-t1'
              }`}
            >
              {d === 365 ? '1 an' : `${d}j`}
            </button>
          ))}
        </div>
      </div>

      {/* ── Stats rapides ── */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'Total accidents', val: stats?.total || 0,    color: 'text-t1' },
          { label: 'Zones à risque',  val: stats?.hotspots || 0, color: 'text-red-400' },
          { label: 'Cette semaine',   val: stats?.by_hour?.reduce((a,b) => a + b.count, 0) || 0, color: 'text-yellow-300' },
          { label: 'Résolus',         val: 0,                    color: 'text-green-400' },
        ].map(s => (
          <div key={s.label} className="bg-s2 border border-bord rounded-xl p-4">
            <div className={`text-2xl font-black ${s.color}`}>{s.val}</div>
            <div className="text-xs text-t2 mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* ── Carte + contrôles ── */}
      <div className="bg-s2 border border-bord rounded-xl overflow-hidden">
        {/* Barre de modes */}
        <div className="flex items-center gap-2 px-4 py-3 border-b border-bord">
          {[
            { key: 'heatmap',  label: '🌡️ Heatmap densité' },
            { key: 'points',   label: '📍 Points détaillés' },
            { key: 'hotspots', label: '🔴 Zones à risque' },
          ].map(m => (
            <button
              key={m.key}
              onClick={() => setViewMode(m.key as any)}
              className={`text-xs px-3 py-1.5 rounded-lg font-semibold transition-colors ${
                viewMode === m.key
                  ? 'bg-urg-red/20 text-red-400 border border-urg-red/30'
                  : 'text-t2 hover:text-t1'
              }`}
            >
              {m.label}
            </button>
          ))}
          {loading && (
            <span className="text-xs text-t3 ml-auto">Chargement...</span>
          )}
        </div>

        {/* Carte Leaflet */}
        <div
          ref={mapRef}
          style={{ height: '420px', background: '#080E1C' }}
        />

        {/* Légende */}
        <div className="flex items-center gap-6 px-4 py-2 border-t border-bord">
          {['fatal', 'serious', 'minor'].map(s => (
            <div key={s} className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ background: severityColor(s) }} />
              <span className="text-xs text-t2">{severityLabel(s)}</span>
            </div>
          ))}
          <span className="text-xs text-t3 ml-auto">© OpenStreetMap</span>
        </div>
      </div>

      {/* ── Graphiques analytiques ── */}
      <div className="grid grid-cols-2 gap-4">

        {/* Accidents par heure */}
        <div className="bg-s2 border border-bord rounded-xl p-4">
          <div className="text-xs font-bold text-t1 uppercase tracking-wider mb-3">
            Accidents par heure
          </div>
          <div className="flex items-end gap-0.5 h-24">
            {Array.from({ length: 24 }, (_, h) => {
              const found = stats?.by_hour?.find(x => x.hour === h);
              const count = found?.count || 0;
              const max   = Math.max(...(stats?.by_hour?.map(x => x.count) || [1]), 1);
              const pct   = (count / max) * 100;
              const isNight = h < 6 || h >= 22;
              return (
                <div key={h} className="flex-1 flex flex-col items-center gap-0.5">
                  <div
                    className="w-full rounded-t"
                    style={{
                      height:     `${Math.max(pct, 4)}%`,
                      background: isNight ? '#E24B4A' : '#639922',
                      opacity:    count > 0 ? 1 : 0.15,
                    }}
                    title={`${h}h : ${count} accidents`}
                  />
                </div>
              );
            })}
          </div>
          <div className="flex justify-between text-xs text-t3 mt-1">
            <span>0h</span><span>6h</span><span>12h</span><span>18h</span><span>23h</span>
          </div>
          <p className="text-xs text-t3 mt-2">
            🌙 Rouge = nuit (risque élevé) · 🌞 Vert = jour
          </p>
        </div>

        {/* Accidents par type de véhicule */}
        <div className="bg-s2 border border-bord rounded-xl p-4">
          <div className="text-xs font-bold text-t1 uppercase tracking-wider mb-3">
            Par type de véhicule
          </div>
          <div className="space-y-2">
            {(stats?.by_vehicle || []).map(v => {
              const total = stats?.total || 1;
              const pct   = Math.round((v.count / total) * 100);
              return (
                <div key={v.type}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-t2 capitalize">{v.type || 'inconnu'}</span>
                    <span className="text-t1 font-semibold">{v.count} ({pct}%)</span>
                  </div>
                  <div className="h-1.5 bg-bord rounded-full overflow-hidden">
                    <div
                      className="h-full bg-urg-red rounded-full"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
            {(!stats?.by_vehicle || stats.by_vehicle.length === 0) && (
              <p className="text-xs text-t3">Aucune donnée disponible</p>
            )}
          </div>
        </div>

      </div>

      {/* ── Top zones dangereuses ── */}
      <div className="bg-s2 border border-bord rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-bord">
          <span className="text-xs font-bold text-t1 uppercase tracking-wider">
            Top zones dangereuses
          </span>
        </div>
        <div className="divide-y divide-bord">
          {hotspots.slice(0, 5).map((h, i) => (
            <div key={i} className="flex items-center gap-4 px-4 py-3">
              <div className="w-6 h-6 rounded-full bg-urg-red/20 border border-urg-red/30 flex items-center justify-center text-xs font-bold text-red-400 flex-shrink-0">
                {i + 1}
              </div>
              <div className="flex-1">
                <div className="text-xs font-semibold text-t1">
                  {h.zone_name || 'Zone identifiée'}
                </div>
                <div className="text-xs text-t3">
                  {h.count} accidents · Score risque : {h.severity_score}
                </div>
              </div>
              <div className="text-xs font-bold text-red-400 bg-urg-red/10 border border-urg-red/25 px-2 py-1 rounded">
                {h.fatal > 0 ? `${h.fatal} mortel${h.fatal > 1 ? 's' : ''}` : 'Zone à risque'}
              </div>
            </div>
          ))}
          {hotspots.length === 0 && (
            <div className="px-4 py-6 text-center text-xs text-t3">
              Pas encore assez de données pour identifier des zones à risque
            </div>
          )}
        </div>
      </div>

    </div>
  );
}