import React from 'react';
import { logoutPro } from '../services/api';

interface Props {
  titre:     string;
  nbAlertes: number;
  onLogout:  () => void;
}

const TITRES: Record<string, string> = {
  dashboard:    'Tableau de bord opérationnel',
  alertes:      'Alertes SOS actives',
  carte:        'Carte live',
  victimes:     'Fiches victimes',
  interventions:'Interventions',
  scans:        'Historique des scans',
  cartographie: 'Cartographie des accidents',
  stats:        'Statistiques',
  settings:     'Paramètres',
};

export default function Topbar({ titre, nbAlertes, onLogout }: Props) {
  const heure = new Date().toLocaleTimeString('fr-FR', {
    hour: '2-digit', minute: '2-digit',
  });
  const date = new Date().toLocaleDateString('fr-FR', {
    weekday: 'long', day: 'numeric', month: 'long',
  });

  const handleLogout = () => {
    logoutPro();
    onLogout();
  };

  return (
    <div className="bg-s1 border-b border-bord px-5 h-14 flex items-center justify-between flex-shrink-0">
      <div>
        <div className="text-sm font-bold text-t1 capitalize">
          {TITRES[titre] || titre}
        </div>
        <div className="text-[10px] text-t3 mt-0.5 capitalize">
          {date} · {heure}
        </div>
      </div>

      <div className="flex items-center gap-2">
        {nbAlertes > 0 && (
          <div className="flex items-center gap-1.5 bg-urg-red/10 border border-urg-red/30 text-red-400 text-[10px] font-semibold px-3 py-1.5 rounded-lg">
            <span className="w-1.5 h-1.5 rounded-full bg-red-400 pulse-red inline-block"></span>
            {nbAlertes} alerte{nbAlertes > 1 ? 's' : ''} active{nbAlertes > 1 ? 's' : ''}
          </div>
        )}
        <div className="flex items-center gap-1.5 bg-urg-green/10 border border-urg-green/30 text-green-400 text-[10px] font-semibold px-3 py-1.5 rounded-lg">
          <span className="w-1.5 h-1.5 rounded-full bg-green-400 pulse-green inline-block"></span>
          Système OK
        </div>
        <button
          onClick={handleLogout}
          className="text-[10px] font-semibold text-t3 hover:text-red-400 px-3 py-1.5 bg-s3 border border-bord rounded-lg transition-colors"
        >
          Déconnexion
        </button>
      </div>
    </div>
  );
}