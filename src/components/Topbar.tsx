import React, { useState, useEffect } from 'react';

interface Props {
  titre:          string;
  nbAlertes:      number;
  onLogout:       () => void;
  connected?:     boolean;
  theme?:         'dark' | 'light';
  onToggleTheme?: () => void;
}

const TITRES: Record<string, string> = {
  dashboard:    'Tableau de bord opérationnel',
  alertes:      'Alertes SOS actives',
  carte:        'Carte live',
  victimes:     'Fiches victimes',
  interventions:'Interventions',
  scans:        'Historique des scans',
  cartographie: 'Cartographie géodécisionnelle',
  stats:        'Statistiques & Business Intelligence',
  parametres:   'Paramètres & GRC',
};

export default function Topbar({
  titre, nbAlertes, onLogout,
  connected = false, theme = 'dark', onToggleTheme,
}: Props) {
  const [heure, setHeure] = useState('');
  const [date,  setDate]  = useState('');

  useEffect(() => {
    const maj = () => {
      setHeure(new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }));
      setDate(new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' }));
    };
    maj();
    const t = setInterval(maj, 30000);
    return () => clearInterval(t);
  }, []);

  const isDark = theme === 'dark';

  const baseStyle: React.CSSProperties = {
    background:   isDark ? '#131109' : '#F0EAD8',
    borderBottom: `1px solid ${isDark ? '#2E2A1A' : '#E0D8C4'}`,
    padding:      '0 20px',
    height:       '52px',
    display:      'flex',
    alignItems:   'center',
    justifyContent: 'space-between',
    flexShrink:   0,
  };

  return (
    <div style={baseStyle}>

      {/* Titre + date */}
      <div>
        <div style={{
          fontSize: '13px', fontWeight: 600,
          color: isDark ? '#F5F0E8' : '#1A1209',
          textTransform: 'capitalize',
        }}>
          {TITRES[titre] || titre}
        </div>
        <div style={{
          fontSize: '10px',
          color: isDark ? '#4A4430' : '#8C7D5E',
          marginTop: '1px',
          textTransform: 'capitalize',
        }}>
          {date}{heure ? ` · ${heure}` : ''}
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>

        {/* Alerte active */}
        {nbAlertes > 0 && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            background: 'rgba(224,126,107,0.1)',
            border: '1px solid rgba(224,126,107,0.3)',
            color: '#E07E6B',
            fontSize: '10px', fontWeight: 600,
            padding: '5px 10px', borderRadius: '8px',
          }}>
            <span style={{
              width: '6px', height: '6px', borderRadius: '50%',
              background: '#E07E6B', display: 'inline-block',
            }} className="pulse-red" />
            {nbAlertes} alerte{nbAlertes > 1 ? 's' : ''} active{nbAlertes > 1 ? 's' : ''}
          </div>
        )}

        {/* Statut Realtime */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '6px',
          background: connected
            ? 'rgba(76,175,125,0.1)'
            : (isDark ? 'rgba(74,68,48,0.3)' : 'rgba(140,125,94,0.1)'),
          border: `1px solid ${connected ? 'rgba(76,175,125,0.3)' : (isDark ? '#2E2A1A' : '#E0D8C4')}`,
          color: connected ? '#4CAF7D' : (isDark ? '#9B9070' : '#5A4E35'),
          fontSize: '10px', fontWeight: 600,
          padding: '5px 10px', borderRadius: '8px',
        }}>
          <span style={{
            width: '6px', height: '6px', borderRadius: '50%',
            background: connected ? '#4CAF7D' : (isDark ? '#4A4430' : '#8C7D5E'),
            display: 'inline-block',
          }} className={connected ? 'pulse-green' : ''} />
          {connected ? 'Realtime actif' : 'Connexion...'}
        </div>

        {/* Toggle thème */}
        {onToggleTheme && (
          <button
            onClick={onToggleTheme}
            title={theme === 'dark' ? 'Passer au thème clair' : 'Passer au thème sombre'}
            style={{
              width: '32px', height: '32px',
              background: isDark ? '#1A1710' : '#E0D8C4',
              border: `1px solid ${isDark ? '#2E2A1A' : '#C8BFA8'}`,
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: isDark ? '#9B9070' : '#5A4E35',
              fontSize: '14px',
              transition: 'all 0.15s',
            }}
          >
            <i className={`ti ${theme === 'dark' ? 'ti-sun' : 'ti-moon'}`} aria-hidden="true" />
          </button>
        )}

        {/* Déconnexion */}
        <button
          onClick={onLogout}
          style={{
            fontSize: '11px', fontWeight: 500,
            color: isDark ? '#9B9070' : '#5A4E35',
            padding: '5px 12px',
            background: isDark ? '#1A1710' : '#E0D8C4',
            border: `1px solid ${isDark ? '#2E2A1A' : '#C8BFA8'}`,
            borderRadius: '8px',
            cursor: 'pointer',
            transition: 'all 0.15s',
            display: 'flex', alignItems: 'center', gap: '5px',
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLButtonElement).style.color = '#E07E6B';
            (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(224,126,107,0.3)';
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLButtonElement).style.color = isDark ? '#9B9070' : '#5A4E35';
            (e.currentTarget as HTMLButtonElement).style.borderColor = isDark ? '#2E2A1A' : '#C8BFA8';
          }}
        >
          <i className="ti ti-logout" style={{ fontSize: '13px' }} aria-hidden="true" />
          Déconnexion
        </button>
      </div>
    </div>
  );
}