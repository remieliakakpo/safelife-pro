import React from 'react';
import { Alerte } from '../types';
import AlerteItem from '../components/AlerteItem';

// Interface obligatoire pour recevoir les alertes
interface AlertesSOSProps {
  alertesTempsReel: Alerte[];
}

export default function AlertesSOS({ alertesTempsReel }: AlertesSOSProps) {
  return (
    <div className="flex-1 p-5 overflow-y-auto">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold text-gray-800">Gestion des Alertes SOS</h1>
        <span className="px-3 py-1 bg-red-100 text-red-600 rounded-full text-xs font-bold">
          {alertesTempsReel.length} alertes en direct
        </span>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm">
        {alertesTempsReel.length > 0 ? (
          alertesTempsReel.map(alerte => (
            <AlerteItem 
              key={alerte.id} 
              alerte={alerte}
              onVoirFiche={() => {}} 
              onPrendreEnCharge={() => {}} 
              onItineraire={() => {}}
            />
          ))
        ) : (
          <div className="p-10 text-center text-gray-500">
            En attente de nouvelles alertes via le réseau SafeLife...
          </div>
        )}
      </div>
    </div>
  );
}