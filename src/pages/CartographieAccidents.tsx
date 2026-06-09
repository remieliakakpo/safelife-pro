import React, { useState, useEffect, useRef, useCallback } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { supabase } from '../lib/supabase';
import { lotisecRealtime } from '../lib/realtime';

const BASE_URL = process.env.REACT_APP_API_URL || 'https://safelife.up.railway.app';

interface Hotspot {
  latitude: number; longitude: number;
  nb_accidents: number;
  niveau_risque: 'CRITIQUE' | 'ELEVE' | 'MODERE';
  rayon_metres: number;
  dernier_accident: string;
}

interface Stats {
  total_accidents: number;
  zones_touchees:  number;
  vehicule_dominant: string;
  zone_plus_dangereuse: any;
}

// ── Icônes personnalisées ──────────────────────────────────────
const iconeHopital = L.divIcon({
  html: `<div style="background:#4CAF7D;width:28px;height:28px;border-radius:50%;border:2px solid #fff;display:flex;align-items:center;justify-content:center;font-size:14px;box-shadow:0 2px 8px rgba(0,0,0,0.4)">🏥</div>`,
  iconSize: [28, 28], iconAnchor: [14, 14], className: '',
});

const iconeSentinelle = (type: string) => L.divIcon({
  html: `<div style="background:${type === 'inondation' ? '#5B9BD5' : '#CFA237'};width:26px;height:26px;border-radius:4px;border:2px solid #fff;display:flex;align-items:center;justify-content:center;font-size:12px;box-shadow:0 2px 8px rgba(0,0,0,0.4)">${type === 'inondation' ? '💧' : '⚠️'}</div>`,
  iconSize: [26, 26], iconAnchor: [13, 13], className: '',
});

export default function CartographieAccidents() {
  const mapRef       = useRef<HTMLDivElement>(null);
  const mapInst      = useRef<L.Map | null>(null);
  const heatLayer    = useRef<any>(null);
  const layersRef    = useRef<{ [key: string]: L.Layer[] }>({
    accidents: [], hotspots: [], hopitaux: [], sentinelles: [], secours: [],
  });

  const [hotspots,  setHotspots]  = useState<Hotspot[]>([]);
  const [stats,     setStats]     = useState<Stats | null>(null);
  const [periode,   setPeriode]   = useState(90);
  const [vue,       setVue]       = useState<'heatmap'|'hotspots'|'mixte'>('mixte');
  const [loading,   setLoading]   = useState(true);
  const [connected, setConnected] = useState(false);
  const [lastAlert, setLastAlert] = useState<any>(null);
  const [zooming,   setZooming]   = useState(false);

  // ── Init carte ────────────────────────────────────────────
  useEffect(() => {
    if (!mapRef.current || mapInst.current) return;

    mapInst.current = L.map(mapRef.current, {
      center: [6.1375, 1.2124],
      zoom: 13,
      zoomControl: false,
    });

    // Zoom control en bas à droite
    L.control.zoom({ position: 'bottomright' }).addTo(mapInst.current);

    // Fond de carte sombre
    L.tileLayer(
      'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
      { attribution: '© OpenStreetMap © CARTO', maxZoom: 19 }
    ).addTo(mapInst.current);

    return () => {
      mapInst.current?.remove();
      mapInst.current = null;
    };
  }, []);

  // ── Charger toutes les données ────────────────────────────
  const chargerDonnees = useCallback(async () => {
    if (!mapInst.current) return;
    setLoading(true);

    try {
      const [heatRes, hotRes, statsRes, hopitauxRes, sentRes] = await Promise.all([
        fetch(`${BASE_URL}/accidents/heatmap?days=${periode}`),
        fetch(`${BASE_URL}/accidents/hotspots?days=${periode}&seuil=2`),
        fetch(`${BASE_URL}/accidents/stats?days=${periode}`),
        supabase.from('medical_facilities').select('*'),
        supabase.from('road_reports').select('*').eq('statut', 'valide'),
      ]);

      const heatData  = heatRes.ok  ? await heatRes.json()  : { points: [] };
      const hotData   = hotRes.ok   ? await hotRes.json()   : { hotspots: [] };
      const statsData = statsRes.ok ? await statsRes.json() : {};

      setHotspots(hotData.hotspots || []);
      setStats(statsData);

      // Nettoyer les couches existantes
      Object.values(layersRef.current).flat().forEach(l => {
        mapInst.current?.removeLayer(l);
      });
      layersRef.current = { accidents: [], hotspots: [], hopitaux: [], sentinelles: [], secours: [] };
      if (heatLayer.current) { mapInst.current.removeLayer(heatLayer.current); heatLayer.current = null; }

      // ── Couche 2 — Heatmap ──────────────────────────────
      if ((vue === 'heatmap' || vue === 'mixte') && heatData.points?.length > 0) {
        heatLayer.current = (L as any).heatLayer(heatData.points, {
          radius: 28, blur: 18, maxZoom: 17,
          gradient: { 0.0: '#00FF00', 0.4: '#FFFF00', 0.7: '#FF8800', 1.0: '#FF0000' },
        }).addTo(mapInst.current);
      }

      // ── Couche 3 — Hotspots avec cercles pulsants ────────
      if ((vue === 'hotspots' || vue === 'mixte') && hotData.hotspots?.length > 0) {
        hotData.hotspots.forEach((h: Hotspot) => {
          const couleur = h.niveau_risque === 'CRITIQUE' ? '#E07E6B'
                        : h.niveau_risque === 'ELEVE'    ? '#CFA237' : '#F5F0E8';

          const circle = L.circle([h.latitude, h.longitude], {
            radius: h.rayon_metres, color: couleur,
            fillColor: couleur, fillOpacity: 0.12,
            weight: 2, dashArray: h.niveau_risque === 'CRITIQUE' ? undefined : '6,4',
          }).addTo(mapInst.current!);

          circle.bindPopup(`
            <div style="min-width:200px;">
              <div style="font-weight:700;color:${couleur};font-size:13px;margin-bottom:8px">
                ⚠️ Zone ${h.niveau_risque}
              </div>
              <div style="font-size:12px;line-height:1.7">
                <b>${h.nb_accidents}</b> accidents · ${periode} jours<br/>
                Rayon : <b>${h.rayon_metres}m</b><br/>
                Dernier : ${new Date(h.dernier_accident).toLocaleDateString('fr-FR')}
              </div>
            </div>
          `);

          layersRef.current.hotspots.push(circle);
        });
      }

      // ── Couche 4 — Hôpitaux ──────────────────────────────
      if (hopitauxRes.data) {
        hopitauxRes.data.forEach((h: any) => {
          const marker = L.marker([h.latitude, h.longitude], { icon: iconeHopital })
            .addTo(mapInst.current!);
          marker.bindPopup(`
            <div style="min-width:180px;">
              <div style="font-weight:700;color:#4CAF7D;margin-bottom:6px">🏥 ${h.nom}</div>
              <div style="font-size:12px">${h.adresse || ''}<br/>
              <a href="tel:${h.telephone}" style="color:#CFA237">${h.telephone || ''}</a></div>
            </div>
          `);
          layersRef.current.hopitaux.push(marker);
        });
      }

      // ── Couche 5 — Signalements sentinelles ──────────────
      if (sentRes.data) {
        sentRes.data.forEach((s: any) => {
          const marker = L.marker([s.latitude, s.longitude], {
            icon: iconeSentinelle(s.type_danger)
          }).addTo(mapInst.current!);
          marker.bindPopup(`
            <div style="min-width:160px;">
              <div style="font-weight:700;color:#CFA237;margin-bottom:4px">
                ${s.type_danger === 'inondation' ? '💧 Inondation' : '⚠️ ' + (s.type_danger || 'Danger')}
              </div>
              <div style="font-size:12px">${s.description || ''}</div>
            </div>
          `);
          layersRef.current.sentinelles.push(marker);
        });
      }

    } catch (e) {
      console.error('Erreur chargement carte:', e);
    } finally {
      setLoading(false);
    }
  }, [periode, vue]);

  useEffect(() => { chargerDonnees(); }, [chargerDonnees]);

  // ── Zoom cinématique façon film policier ─────────────────
  const zoomCinematique = useCallback((lat: number, lng: number, label?: string) => {
    if (!mapInst.current || zooming) return;
    setZooming(true);
  

    const map = mapInst.current;

    // Phase 1 — dézoom global
    map.setZoom(11, { animate: true, duration: 0.6 });

    setTimeout(() => {
      // Phase 2 — voler vers la cible
      map.flyTo([lat, lng], 16, {
        animate: true,
        duration: 1.5,
        easeLinearity: 0.1,
      });
    }, 700);

    setTimeout(() => {
      // Phase 3 — zoom max + effet scan
      map.setZoom(17, { animate: true, duration: 0.8 });

      // Cercle flash rouge sur la zone
      const flash = L.circle([lat, lng], {
        radius: 80, color: '#E07E6B',
        fillColor: '#E07E6B', fillOpacity: 0.3,
        weight: 3,
        className: 'zone-flash',
      }).addTo(map);

      // Pin SOS animé
      const pin = L.divIcon({
        html: `
          <div style="position:relative;text-align:center">
            <div class="map-ripple" style="position:absolute;top:-8px;left:-8px;width:16px;height:16px;border-radius:50%;border:2px solid #E07E6B;"></div>
            <div class="map-ripple" style="position:absolute;top:-16px;left:-16px;width:32px;height:32px;border-radius:50%;border:1px solid #E07E6B;animation-delay:0.5s"></div>
            <div style="width:16px;height:16px;background:#E07E6B;border-radius:50%;border:2px solid #fff;position:relative;z-index:2"></div>
            ${label ? `<div style="background:#1A1710;color:#F5F0E8;font-size:10px;padding:2px 6px;border-radius:4px;white-space:nowrap;margin-top:4px;border:1px solid #2E2A1A">${label}</div>` : ''}
          </div>
        `,
        iconSize: [120, 60], iconAnchor: [60, 16], className: '',
      });

      L.marker([lat, lng], { icon: pin }).addTo(map);

      setTimeout(() => {
        map.removeLayer(flash);
        setZooming(false);
      }, 4000);
    }, 2400);
  }, [zooming]);

  // ── Supabase Realtime — alertes live ─────────────────────
  useEffect(() => {
    const unsub = lotisecRealtime.onNouvealleAlerte((data) => {
      if (!data.latitude || !data.longitude) return;

      // Déclencher le zoom cinématique automatiquement
      setTimeout(() => {
        zoomCinematique(
          data.latitude, data.longitude,
          `${data.prenom || 'SOS'} · ${data.groupeSanguin || '?'}`
        );
      }, 500);

      // Ajouter le point SOS sur la carte immédiatement
      if (mapInst.current) {
        const icon = L.divIcon({
          html: `
            <div style="position:relative">
              <div class="map-ripple" style="position:absolute;border:2px solid #E07E6B;border-radius:50%;width:14px;height:14px;top:-7px;left:-7px"></div>
              <div style="width:14px;height:14px;background:#E07E6B;border-radius:50%;border:2px solid #fff;animation:pulse-dot 1s infinite"></div>
            </div>
          `,
          iconSize: [14, 14], iconAnchor: [7, 7], className: '',
        });
        L.marker([data.latitude, data.longitude], { icon }).addTo(mapInst.current);
      }
    });

    const unsubConn = lotisecRealtime.onConnexion(setConnected);

    return () => { unsub(); unsubConn(); };
  }, [zoomCinematique]);

  const couleurNiveau = (n: string) =>
    n === 'CRITIQUE' ? 'text-urg-red bg-urg-bg border-urg-muted'
    : n === 'ELEVE'  ? 'text-gold bg-gold-bg border-gold-muted'
                     : 'text-t2 bg-s3 border-bord';

  return (
    <div className="flex-1 overflow-hidden flex flex-col">

      {/* ── Header ──────────────────────────────────────── */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-bord bg-s1">
        <div>
          <h1 className="text-sm font-bold text-t1 uppercase tracking-widest">
            Carte géodécisionnelle LOTISEC
          </h1>
          <div className="flex items-center gap-2 mt-0.5">
            <div className={`w-1.5 h-1.5 rounded-full ${connected ? 'bg-urg-green pulse-green' : 'bg-t3'}`}></div>
            <span className="text-[10px] text-t3">
              {connected ? 'Supabase Realtime connecté' : 'Connexion...'}
            </span>
            {loading && <span className="text-[10px] text-gold animate-pulse ml-2">Chargement...</span>}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* Période */}
          {[30, 60, 90].map(j => (
            <button key={j} onClick={() => setPeriode(j)}
              className={`text-[11px] px-3 py-1.5 rounded-lg border transition-all ${
                periode === j
                  ? 'bg-gold-bg text-gold border-gold-muted'
                  : 'bg-s2 text-t2 border-bord hover:text-t1'
              }`}>{j}j</button>
          ))}
          <div className="w-px h-4 bg-bord mx-1"></div>
          {/* Vue */}
          {([
            { id: 'heatmap', label: 'Heatmap' },
            { id: 'hotspots', label: 'Zones' },
            { id: 'mixte', label: 'Mixte' },
          ] as const).map(v => (
            <button key={v.id} onClick={() => setVue(v.id)}
              className={`text-[11px] px-3 py-1.5 rounded-lg border transition-all ${
                vue === v.id
                  ? 'bg-urg-bg text-urg border-urg-muted'
                  : 'bg-s2 text-t2 border-bord hover:text-t1'
              }`}>{v.label}</button>
          ))}
          <button onClick={() => chargerDonnees()}
            className="text-[11px] px-3 py-1.5 rounded-lg border border-bord bg-s2 text-t2 hover:text-t1 ml-1">
            ↺ Actualiser
          </button>
        </div>
      </div>

      {/* ── Stats ────────────────────────────────────────── */}
      {stats && (
        <div className="grid grid-cols-4 gap-3 px-5 py-3 border-b border-bord bg-s1">
          {[
            { val: stats.total_accidents,  label: 'Accidents',        color: 'text-urg',       icon: '🚨' },
            { val: stats.zones_touchees,   label: 'Zones touchées',   color: 'text-gold',      icon: '📍' },
            { val: hotspots.length,        label: 'Hotspots détectés',color: 'text-urg-amber', icon: '⚠️' },
            { val: stats.vehicule_dominant,label: 'Véhicule dominant',color: 'text-urg-blue',  icon: '🏍️' },
          ].map(s => (
            <div key={s.label} className="flex items-center gap-3 bg-s2 border border-bord rounded-xl px-4 py-2.5">
              <span className="text-lg">{s.icon}</span>
              <div>
                <div className={`text-lg font-black ${s.color}`}>{s.val}</div>
                <div className="text-[10px] text-t3 uppercase tracking-wider">{s.label}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Corps principal ──────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden">

        {/* Carte */}
        <div className="flex-1 relative">
          <div ref={mapRef} className="absolute inset-0" />

          {/* Légende */}
          <div className="absolute bottom-4 left-4 z-[1000] bg-s1/90 backdrop-blur border border-bord rounded-xl p-3 space-y-1.5">
            <div className="text-[10px] font-bold text-t2 uppercase tracking-wider mb-2">Légende</div>
            {[
              { color: 'bg-urg-red',    label: 'Alerte SOS active'      },
              { color: 'bg-urg-amber',  label: 'Zone critique'          },
              { color: 'bg-urg-green',  label: 'Hôpital partenaire'     },
              { color: 'bg-gold',       label: 'Signalement sentinelle' },
            ].map(l => (
              <div key={l.label} className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${l.color}`}></div>
                <span className="text-[10px] text-t2">{l.label}</span>
              </div>
            ))}
          </div>

          {/* Indicateur zoom cinématique */}
          {zooming && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] bg-urg-bg border border-urg-muted rounded-xl px-5 py-2.5 flex items-center gap-3 urg-glow animate-fade-up">
              <div className="w-2 h-2 rounded-full bg-urg pulse-red"></div>
              <span className="text-[11px] font-bold text-urg uppercase tracking-wider">
                Zoom zone de crise
              </span>
              <div className="scan-line"></div>
            </div>
          )}
        </div>

        {/* Panel latéral hotspots */}
        <div className="w-72 border-l border-bord bg-s1 flex flex-col overflow-hidden">
          <div className="px-4 py-3 border-b border-bord">
            <div className="text-[11px] font-bold text-t1 uppercase tracking-wider">
              Zones à risque
            </div>
            <div className="text-[10px] text-t3 mt-0.5">
              {hotspots.length} zone(s) · {periode} derniers jours
            </div>
          </div>

          <div className="overflow-y-auto flex-1">
            {hotspots.length === 0 && !loading && (
              <div className="px-4 py-8 text-center">
                <div className="text-2xl mb-2">🗺️</div>
                <div className="text-xs text-t3">Aucune zone détectée</div>
              </div>
            )}
            {hotspots.map((h, i) => (
              <div
                key={i}
                className="px-4 py-3 border-b border-bord cursor-pointer hover:bg-s2 transition-colors group"
                onClick={() => {
                  zoomCinematique(h.latitude, h.longitude, `Zone ${h.niveau_risque}`);
                }}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${couleurNiveau(h.niveau_risque)}`}>
                    {h.niveau_risque}
                  </span>
                  <span className="text-[11px] font-black text-urg">
                    {h.nb_accidents} acc.
                  </span>
                </div>
                <div className="text-[11px] text-t1 font-medium">
                  {h.latitude.toFixed(4)}°N, {h.longitude.toFixed(4)}°E
                </div>
                <div className="text-[10px] text-t3 mt-0.5">
                  Rayon {h.rayon_metres}m · {new Date(h.dernier_accident).toLocaleDateString('fr-FR')}
                </div>
                <div className="text-[9px] text-gold mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  Cliquer pour zoom cinématique ↗
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}