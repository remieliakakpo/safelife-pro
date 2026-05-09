import React from 'react';
import { Alerte } from '../types';

interface Props {
  alerte:            Alerte;
  onVoirFiche:       (a: Alerte) => void;
  onPrendreEnCharge: (id: string) => void;
  onItineraire:      (lat: number, lng: number) => void;
}

export default function AlerteItem({
  alerte,
  onVoirFiche,
  onPrendreEnCharge,
  onItineraire,
}: Props) {
  const estCritique = alerte.minutesEcoulees <= 5;
  const estUrgent   = alerte.minutesEcoulees <= 15;

  return (
    <div className={`flex items-start gap-3 px-4 py-3 border-b border-bord/60 hover:bg-white/[0.02] transition-colors ${estCritique ? 'bg-urg-red/5' : ''}`}>

      {/* Point de statut */}
      <div className={`w-2 h-2 rounded-full flex-shrink-0 mt-1.5 ${estCritique ? 'bg-urg-red pulse-red' : estUrgent ? 'bg-urg-amber pulse-amber' : 'bg-green-400'}`} />

      {/* Contenu */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[13px] font-bold text-t1">
            {alerte.prenom} {alerte.nom}
          </span>
          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${estCritique ? 'bg-urg-red/10 text-red-400 border-urg-red/25' : 'bg-urg-amber/10 text-yellow-300 border-urg-amber/25'}`}>
            {alerte.groupeSanguin}
            {alerte.electrophorese ? ` · ${alerte.electrophorese}` : ''}
          </span>
        </div>

        <div className="text-[11px] text-t2 mt-1 leading-relaxed">
          {alerte.adresse} · GPS {alerte.latitude.toFixed(4)}°N, {alerte.longitude.toFixed(4)}°E
        </div>

        <div className="flex gap-2 mt-2 flex-wrap">
          <button
            onClick={() => onVoirFiche(alerte)}
            className="px-2.5 py-1 bg-urg-red/10 text-red-400 border border-urg-red/25 rounded text-[9px] font-bold hover:bg-urg-red/20 transition-colors"
          >
            Voir fiche
          </button>
          <button
            onClick={() => onPrendreEnCharge(alerte.id)}
            className="px-2.5 py-1 bg-urg-green/10 text-green-400 border border-urg-green/25 rounded text-[9px] font-bold hover:bg-urg-green/20 transition-colors"
          >
            Prendre en charge
          </button>
          <button
            onClick={() => onItineraire(alerte.latitude, alerte.longitude)}
            className="px-2.5 py-1 bg-blue-500/10 text-blue-400 border border-blue-500/25 rounded text-[9px] font-bold hover:bg-blue-500/20 transition-colors"
          >
            Itinéraire Maps
          </button>
          {alerte.contacts[0] && (
            <a
              href={`tel:${alerte.contacts[0].telephone}`}
              className="px-2.5 py-1 bg-yellow-500/10 text-yellow-300 border border-yellow-500/25 rounded text-[9px] font-bold hover:bg-yellow-500/20 transition-colors"
            >
              Appeler
            </a>
          )}
        </div>
      </div>

      {/* Temps écoulé */}
      <div className="text-right flex-shrink-0">
        <div className="text-[10px] text-t3">
          {new Date(alerte.timestamp).toLocaleTimeString('fr-FR', {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </div>
        <div className={`text-[11px] font-bold mt-1 ${estCritique ? 'text-urg-red' : estUrgent ? 'text-urg-amber' : 'text-green-400'}`}>
          {alerte.minutesEcoulees} min
        </div>
      </div>
    </div>
  );
}