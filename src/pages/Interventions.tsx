import React, { useState } from 'react';

interface Intervention {
  id:        string;
  type:      string;
  victime:   string;
  adresse:   string;
  statut:    'en_cours' | 'resolue';
  timestamp: string;
  operateur: string;
}

const DEMO: Intervention[] = [
  { id:'1', type:'Accident moto',   victime:'Kofi Mensah',  adresse:'Avenue de la Marina', statut:'en_cours', timestamp: new Date(Date.now()-10*60000).toISOString(), operateur:'Dr. Ama Koffi' },
  { id:'2', type:'Malaise cardiaque',victime:'Ama Sodzi',   adresse:'Quartier Bè',         statut:'en_cours', timestamp: new Date(Date.now()-22*60000).toISOString(), operateur:'Agent Kokou'   },
  { id:'3', type:'Chute piéton',    victime:'Marc Attivor', adresse:'Tokoin Doumassesse',  statut:'resolue',  timestamp: new Date(Date.now()-2*3600000).toISOString(), operateur:'Dr. Ama Koffi' },
];

export default function Interventions() {
  const [interventions, setInterventions] = useState<Intervention[]>(DEMO);

  const resoudre = (id: string) => {
    setInterventions(prev =>
      prev.map(i => i.id === id ? { ...i, statut: 'resolue' } : i)
    );
  };

  return (
    <div className="flex-1 overflow-y-auto p-5 space-y-4">
      <h1 className="text-sm font-bold text-t1 uppercase tracking-wider">
        Interventions
      </h1>

      <div className="bg-s2 border border-bord rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-bord flex items-center justify-between">
          <span className="text-[11px] font-bold text-t1 uppercase tracking-wider">
            Toutes les interventions
          </span>
          <span className="text-[9px] text-t3">{interventions.length} total</span>
        </div>
        <div className="divide-y divide-bord">
          {interventions.map(i => (
            <div key={i.id} className="flex items-center gap-4 px-4 py-3">
              <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                i.statut === 'en_cours' ? 'bg-urg-red pulse-red' : 'bg-green-400'
              }`} />
              <div className="flex-1 min-w-0">
                <div className="text-xs font-bold text-t1">{i.type} · {i.victime}</div>
                <div className="text-[10px] text-t3 mt-0.5">
                  📍 {i.adresse} · {i.operateur} ·{' '}
                  {new Date(i.timestamp).toLocaleTimeString('fr-FR', { hour:'2-digit', minute:'2-digit' })}
                </div>
              </div>
              <span className={`text-[9px] font-bold px-2 py-1 rounded border ${
                i.statut === 'en_cours'
                  ? 'bg-urg-red/10 text-red-400 border-urg-red/25'
                  : 'bg-urg-green/10 text-green-400 border-urg-green/25'
              }`}>
                {i.statut === 'en_cours' ? 'En cours' : 'Résolue'}
              </span>
              {i.statut === 'en_cours' && (
                <button
                  onClick={() => resoudre(i.id)}
                  className="text-[9px] font-bold px-2 py-1 bg-urg-green/10 text-green-400 border border-urg-green/25 rounded hover:bg-urg-green/20 transition-colors"
                >
                  Résoudre
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}