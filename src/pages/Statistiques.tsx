import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const BASE_URL = process.env.REACT_APP_API_URL || 'https://safelife.up.railway.app';

export default function Statistiques() {
  const [stats,    setStats]    = useState<any>(null);
  const [alertes,  setAlertes]  = useState<any[]>([]);
  const [periode,  setPeriode]  = useState(30);
  const [loading,  setLoading]  = useState(true);
  const [exporting,setExporting]= useState(false);

  useEffect(() => {
    const charger = async () => {
      setLoading(true);
      try {
        const [statsRes, alertesRes] = await Promise.all([
          fetch(`${BASE_URL}/accidents/stats?days=${periode}`),
          supabase.from('alerte_events')
            .select('*')
            .order('timestamp', { ascending: false })
            .limit(100),
        ]);
        if (statsRes.ok) setStats(await statsRes.json());
        if (alertesRes.data) setAlertes(alertesRes.data);
      } catch {}
      finally { setLoading(false); }
    };
    charger();
  }, [periode]);

  const exportCSV = () => {
    setExporting(true);
    const headers = ['ID','Prénom','Nom','Groupe Sanguin','Latitude','Longitude','Adresse','Statut','Date'];
    const rows = alertes.map(a => [
      a.id, a.prenom || '', a.nom || '',
      a.groupe_sanguin || '',
      a.latitude, a.longitude,
      (a.adresse || '').replace(/,/g, ';'),
      a.statut,
      new Date(a.timestamp).toLocaleString('fr-FR'),
    ]);
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url; a.download = `lotisec_alertes_${periode}j.csv`; a.click();
    URL.revokeObjectURL(url);
    setExporting(false);
  };

  const exportJSON = () => {
    const anonymise = alertes.map(({ id, groupe_sanguin, latitude, longitude, vehicle_type, timestamp, statut }) => ({
      id, groupe_sanguin, latitude, longitude, vehicle_type, timestamp, statut
    }));
    const blob = new Blob([JSON.stringify(anonymise, null, 2)], { type: 'application/json' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url; a.download = `lotisec_donnees_anonymisees_${periode}j.json`; a.click();
    URL.revokeObjectURL(url);
  };

  const statCards = [
    { val: stats?.total_accidents || 0,   label: 'Accidents total',      color: 'text-urg',      icon: '🚨', bg: 'bg-urg-bg border-urg-muted'  },
    { val: alertes.filter(a=>a.statut==='resolue').length, label: 'Alertes résolues', color: 'text-urg-green', icon: '✅', bg: 'bg-s2 border-bord' },
    { val: alertes.filter(a=>a.statut==='active').length,  label: 'Alertes actives',  color: 'text-gold',      icon: '⚡', bg: 'bg-gold-bg border-gold-muted' },
    { val: stats?.zones_touchees || 0,    label: 'Zones touchées',       color: 'text-urg-blue', icon: '📍', bg: 'bg-s2 border-bord'            },
  ];

  return (
    <div className="flex-1 overflow-y-auto p-5 space-y-5">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-sm font-bold text-t1 uppercase tracking-widest">
            Statistiques & Business Intelligence
          </h1>
          <p className="text-xs text-t3 mt-0.5">Données réelles · Export CSV/JSON pour ministères</p>
        </div>
        <div className="flex items-center gap-2">
          {[7, 30, 90].map(j => (
            <button key={j} onClick={() => setPeriode(j)}
              className={`text-[11px] px-3 py-1.5 rounded-lg border transition-all ${
                periode === j ? 'bg-gold-bg text-gold border-gold-muted' : 'bg-s2 text-t2 border-bord hover:text-t1'
              }`}>{j}j</button>
          ))}
          <button onClick={exportCSV} disabled={exporting}
            className="text-[11px] px-4 py-1.5 rounded-lg bg-gold text-bg font-bold hover:bg-gold-light transition-colors ml-2">
            ↓ CSV
          </button>
          <button onClick={exportJSON}
            className="text-[11px] px-4 py-1.5 rounded-lg bg-s2 text-t1 border border-bord hover:bg-s3 transition-colors">
            ↓ JSON
          </button>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-4 gap-3">
        {statCards.map(s => (
          <div key={s.label} className={`border rounded-xl p-4 ${s.bg}`}>
            <div className="text-xl mb-1">{s.icon}</div>
            <div className={`text-2xl font-black ${s.color}`}>
              {loading ? '—' : s.val}
            </div>
            <div className="text-[10px] text-t3 mt-1 uppercase tracking-wider">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Tableau des alertes */}
      <div className="bg-s2 border border-bord rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-bord">
          <span className="text-[11px] font-bold text-t1 uppercase tracking-wider">
            Historique des alertes SOS
          </span>
          <span className="text-[9px] text-t3">{alertes.length} entrées</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-bord">
                {['Victime', 'Groupe Sanguin', 'Adresse', 'Véhicule', 'Statut', 'Date'].map(h => (
                  <th key={h} className="text-left px-4 py-2.5 text-t3 font-medium uppercase tracking-wider text-[10px]">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-t3">Chargement...</td></tr>
              ) : alertes.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-t3">Aucune donnée</td></tr>
              ) : alertes.map((a, i) => (
                <tr key={a.id} className={`border-b border-bord hover:bg-s3 transition-colors ${i % 2 === 0 ? '' : 'bg-s1/30'}`}>
                  <td className="px-4 py-2.5 font-medium text-t1">
                    {a.prenom || 'Inconnu'} {a.nom || ''}
                  </td>
                  <td className="px-4 py-2.5">
                    <span className="bg-urg-bg text-urg border border-urg-muted px-2 py-0.5 rounded text-[10px] font-bold">
                      {a.groupe_sanguin || '?'}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-t2 max-w-[200px] truncate">{a.adresse || '—'}</td>
                  <td className="px-4 py-2.5 text-t2">{a.vehicle_type || '—'}</td>
                  <td className="px-4 py-2.5">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      a.statut === 'active'   ? 'bg-urg-bg text-urg border border-urg-muted'
                      : a.statut === 'en_cours' ? 'bg-gold-bg text-gold border border-gold-muted'
                      : 'bg-s3 text-t2 border border-bord'
                    }`}>{a.statut}</span>
                  </td>
                  <td className="px-4 py-2.5 text-t3">
                    {new Date(a.timestamp).toLocaleString('fr-FR')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}