import React, { useState, useEffect } from 'react';
import { getScans } from '../services/api';

export default function HistoriqueScans() {
  const [scans,   setScans]   = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getScans()
      .then(data => setScans(data || []))
      .catch(() => setScans([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="flex-1 overflow-y-auto p-5 space-y-4">
      <h1 className="text-sm font-bold text-t1 uppercase tracking-wider">
        Historique des scans QR
      </h1>

      <div className="bg-s2 border border-bord rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-bord">
          <span className="text-[11px] font-bold text-t1 uppercase tracking-wider">
            {scans.length} scans enregistrés
          </span>
        </div>
        {loading ? (
          <div className="px-4 py-8 text-center text-xs text-t3">Chargement...</div>
        ) : scans.length === 0 ? (
          <div className="px-4 py-8 text-center text-xs text-t3">
            Aucun scan enregistré
          </div>
        ) : (
          <div className="divide-y divide-bord">
            {scans.map((s: any, i: number) => (
              <div key={i} className="flex items-center gap-4 px-4 py-3">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-black flex-shrink-0 ${
                  s.niveau === 'professionnel'
                    ? 'bg-urg-green/15 text-green-400'
                    : 'bg-blue-500/10 text-blue-400'
                }`}>
                  {(s.initiales || s.nom?.[0] || '?').toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[11px] font-bold text-t1 truncate">
                    {s.nom || s.prenom || 'Anonyme'}
                  </div>
                  <div className="text-[9px] text-t3 truncate">
                    {s.timestamp
                      ? new Date(s.timestamp).toLocaleString('fr-FR')
                      : '-'
                    } · {s.lieu || ''}
                  </div>
                </div>
                <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded border flex-shrink-0 ${
                  s.niveau === 'professionnel'
                    ? 'bg-urg-green/10 text-green-400 border-urg-green/25'
                    : 'bg-blue-500/10  text-blue-400  border-blue-500/25'
                }`}>
                  {s.niveau === 'professionnel' ? 'Pro' : 'Public'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}