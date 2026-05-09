import React from 'react';
import { Alerte } from '../types';

interface Props {
  alerte:  Alerte;
  onClose: () => void;
}

export default function FicheVictime({ alerte, onClose }: Props) {
  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-s2 border border-bord rounded-2xl w-full max-w-lg">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-bord bg-urg-red/5">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-urg-red pulse-red"></div>
              <span className="text-sm font-bold text-t1">
                {alerte.prenom} {alerte.nom}
              </span>
            </div>
            <div className="text-[10px] text-t3 mt-0.5">
              Fiche d'urgence · Accès professionnel
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-s3 border border-bord text-t2 hover:text-t1 transition-colors text-sm"
          >
            ×
          </button>
        </div>

        {/* Corps */}
        <div className="p-5 overflow-y-auto max-h-[70vh] space-y-4">

          {/* Médical priorité max */}
          <div className="bg-urg-red/8 border border-urg-red/25 rounded-xl p-4">
            <div className="text-[10px] font-bold text-red-400 uppercase tracking-wider mb-3">
              Priorité médicale
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-s3 rounded-lg p-3 text-center">
                <div className="text-xl font-black text-urg-red">
                  {alerte.groupeSanguin}
                </div>
                <div className="text-[9px] text-t3 mt-1">Groupe sanguin</div>
              </div>
              {alerte.electrophorese && (
                <div className="bg-s3 rounded-lg p-3 text-center">
                  <div className="text-xl font-black text-yellow-300">
                    {alerte.electrophorese}
                  </div>
                  <div className="text-[9px] text-t3 mt-1">Électrophorèse</div>
                </div>
              )}
            </div>
          </div>

          {/* Identité */}
          <div className="bg-s3 border border-bord rounded-xl p-4">
            <div className="text-[10px] font-bold text-t3 uppercase tracking-wider mb-3">
              Identité
            </div>
            <div className="space-y-2">
              {[
                { label: 'Nom complet',   value: `${alerte.prenom} ${alerte.nom}` },
                { label: 'Position GPS',  value: `${alerte.latitude.toFixed(4)}°N, ${alerte.longitude.toFixed(4)}°E` },
                { label: 'Adresse',       value: alerte.adresse },
                { label: 'Alerte depuis', value: `${alerte.minutesEcoulees} minutes` },
              ].map(row => (
                <div
                  key={row.label}
                  className="flex justify-between items-center py-1.5 border-b border-bord/50 last:border-0"
                >
                  <span className="text-[11px] text-t2">{row.label}</span>
                  <span className="text-[11px] font-semibold text-t1 text-right max-w-[55%]">
                    {row.value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Contacts */}
          <div className="bg-s3 border border-bord rounded-xl p-4">
            <div className="text-[10px] font-bold text-t3 uppercase tracking-wider mb-3">
              Contacts d'urgence
            </div>
            <div className="space-y-2">
              {alerte.contacts.map((c, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between py-1.5 border-b border-bord/50 last:border-0"
                >
                  <div>
                    <div className="text-[11px] font-semibold text-t1">{c.nom}</div>
                    <div className="text-[10px] text-t3">{c.relation || 'Contact'}</div>
                  </div>
                  
                  <a
                    href={`tel:${c.telephone}`}
                    className="text-[10px] font-bold text-green-400 bg-urg-green/10 border border-urg-green/25 px-2.5 py-1 rounded hover:bg-urg-green/20 transition-colors"
                  >
                    {c.telephone}
                  </a>
                </div>
              ))}
            </div>
          </div>

          {/* Véhicule */}
          {alerte.vehicule && (
            <div className="bg-s3 border border-bord rounded-xl p-4">
              <div className="text-[10px] font-bold text-t3 uppercase tracking-wider mb-2">
                Véhicule
              </div>
              <div className="text-[12px] text-t1">{alerte.vehicule}</div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3 px-5 py-4 border-t border-bord">
          
          <a
            href={`https://www.google.com/maps/dir/?api=1&destination=${alerte.latitude},${alerte.longitude}`}
            target="_blank"
            rel="noreferrer"
            className="flex-1 bg-urg-green hover:bg-togo-green text-white text-xs font-bold py-2.5 rounded-lg text-center transition-colors"
          >
            Itinéraire Google Maps
          </a>
          <button
            onClick={onClose}
            className="px-4 bg-s3 border border-bord text-t2 text-xs font-semibold rounded-lg hover:text-t1 transition-colors"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}