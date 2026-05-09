// safelife-pro/src/pages/RapportGouvernemental.tsx
import React, { useState } from 'react';

const BASE_URL = process.env.REACT_APP_API_URL || 'https://safelife.up.railway.app';

export default function RapportGouvernemental() {
  const [generating, setGenerating] = useState(false);

  const downloadReport = async (format: 'json' | 'csv') => {
    setGenerating(true);
    try {
      const res  = await fetch(`${BASE_URL}/accidents/geojson?days=365`);
      const data = await res.json();

      if (format === 'json') {
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url  = URL.createObjectURL(blob);
        const a    = document.createElement('a');
        a.href     = url;
        a.download = `safelife_accidents_${new Date().toISOString().split('T')[0]}.geojson`;
        a.click();
      } else {
        // Convertir en CSV
        const rows = data.features?.map((f: any) => ({
          latitude:    f.geometry.coordinates[1],
          longitude:   f.geometry.coordinates[0],
          zone:        f.properties.zone_name,
          date:        f.properties.timestamp,
          heure:       f.properties.hour_of_day,
          vehicule:    f.properties.vehicle_type,
          gravite:     f.properties.severity,
          route:       f.properties.road_type,
          meteo:       f.properties.weather,
          cause:       f.properties.cause_probable,
        })) || [];

        const headers = Object.keys(rows[0] || {}).join(',');
        const lines   = rows.map((r: any) => Object.values(r).join(','));
        const csv     = [headers, ...lines].join('\n');
        const blob    = new Blob([csv], { type: 'text/csv' });
        const url     = URL.createObjectURL(blob);
        const a       = document.createElement('a');
        a.href        = url;
        a.download    = `safelife_accidents_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
      }
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-5 space-y-4">
      <div>
        <h1 className="text-sm font-bold text-t1 uppercase tracking-wider">
          Rapport gouvernemental
        </h1>
        <p className="text-xs text-t3 mt-0.5">
          Export des données d'accidentologie pour les autorités
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-s2 border border-bord rounded-xl p-5">
          <div className="text-2xl mb-3">📊</div>
          <h3 className="text-sm font-bold text-t1 mb-2">Export GeoJSON</h3>
          <p className="text-xs text-t2 mb-4 leading-relaxed">
            Format standard pour SIG (QGIS, ArcGIS). Compatible avec les outils des ministères et collectivités.
          </p>
          <button
            onClick={() => downloadReport('json')}
            disabled={generating}
            className="w-full bg-urg-green hover:bg-togo-green text-white text-xs font-bold py-2.5 rounded-lg transition-colors disabled:opacity-50"
          >
            {generating ? 'Génération...' : 'Télécharger GeoJSON'}
          </button>
        </div>

        <div className="bg-s2 border border-bord rounded-xl p-5">
          <div className="text-2xl mb-3">📋</div>
          <h3 className="text-sm font-bold text-t1 mb-2">Export CSV/Excel</h3>
          <p className="text-xs text-t2 mb-4 leading-relaxed">
            Tableau de données brutes. Compatible Excel, LibreOffice et tous les outils d'analyse statistique.
          </p>
          <button
            onClick={() => downloadReport('csv')}
            disabled={generating}
            className="w-full bg-urg-blue hover:bg-blue-700 text-white text-xs font-bold py-2.5 rounded-lg transition-colors disabled:opacity-50"
          >
            {generating ? 'Génération...' : 'Télécharger CSV'}
          </button>
        </div>
      </div>

      <div className="bg-s2 border border-bord rounded-xl p-4">
        <div className="text-xs font-bold text-t1 uppercase tracking-wider mb-3">
          Contenu du rapport
        </div>
        <div className="grid grid-cols-2 gap-2">
          {[
            'Position GPS exacte (lat/lng)',
            'Adresse et zone (reverse geocoding)',
            'Date, heure et jour de la semaine',
            'Type de véhicule impliqué',
            'Gravité (léger / grave / mortel)',
            'Conditions météo au moment du fait',
            'Type de route (carrefour, virage...)',
            'Cause probable déclarée',
            'Identification zones à risque',
            'Données anonymisées (RGPD)',
          ].map(item => (
            <div key={item} className="flex items-center gap-2 text-xs text-t2 py-1">
              <span className="text-green-400">✓</span>
              {item}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}