import React from 'react';

interface Props {
  page:        string;
  onNavigate:  (p: string) => void;
  user:        any;
  nbAlertes:   number;
  connected?:  boolean;
  theme?:      'dark' | 'light';
}

const NAV = [
  { section: 'URGENCES', items: [
    { id: 'dashboard',    label: 'Tableau de bord', icon: 'ti-layout-dashboard', badge: null },
    { id: 'alertes',      label: 'Alertes SOS',     icon: 'ti-alert-triangle',   badge: 'red' },
    { id: 'carte',        label: 'Carte live',       icon: 'ti-map-pin',          badge: null },
    { id: 'victimes',     label: 'Fiches victimes',  icon: 'ti-id-badge',         badge: null },
  ]},
  { section: 'OPÉRATIONS', items: [
    { id: 'interventions',label: 'Interventions',    icon: 'ti-ambulance',        badge: 'green' },
    { id: 'scans',        label: 'Historique scans', icon: 'ti-qrcode',           badge: null },
    { id: 'cartographie', label: 'Cartographie',     icon: 'ti-map-2',            badge: null },
  ]},
  { section: 'ANALYSE', items: [
    { id: 'stats',        label: 'Statistiques',     icon: 'ti-chart-bar',        badge: null },
    { id: 'parametres',   label: 'Paramètres & GRC', icon: 'ti-settings',         badge: null },
  ]},
];

export default function Sidebar({
  page, onNavigate, user, nbAlertes, connected = false, theme = 'dark'
}: Props) {
  const initiales = user?.nom
    ? user.nom.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()
    : 'PR';

  const isDark = theme === 'dark';

  return (
    <div style={{
      width: '220px',
      background: isDark ? '#131109' : '#F7F3EB',
      borderRight: `1px solid ${isDark ? '#2E2A1A' : '#E0D8C4'}`,
      display: 'flex',
      flexDirection: 'column',
      flexShrink: 0,
    }}>

      {/* ── Logo ─────────────────────────────────────────── */}
      <div style={{
        padding: '18px 16px 14px',
        borderBottom: `1px solid ${isDark ? '#2E2A1A' : '#E0D8C4'}`,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '34px', height: '34px',
            background: 'linear-gradient(135deg, #CFA237, #A67C20)',
            borderRadius: '10px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 900, fontSize: '13px', color: '#0C0A09',
            flexShrink: 0,
          }}>
            LS
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '2px' }}>
              <span style={{
                fontSize: '15px', fontWeight: 800,
                color: isDark ? '#F5F0E8' : '#1A1209',
              }}>LOTI</span>
              <span style={{ fontSize: '15px', fontWeight: 800, color: '#CFA237' }}>SEC</span>
              <span style={{
                marginLeft: '4px', fontSize: '8px', fontWeight: 700,
                background: 'rgba(207,162,55,0.15)',
                color: '#CFA237',
                padding: '2px 5px', borderRadius: '4px',
                border: '1px solid rgba(207,162,55,0.3)',
              }}>PRO</span>
            </div>
            <div style={{
              fontSize: '9px',
              color: isDark ? '#4A4430' : '#8C7D5E',
              marginTop: '1px',
            }}>
              Centre opérationnel
            </div>
          </div>
        </div>

        {/* Drapeau togolais */}
        <div style={{
          display: 'flex', height: '2px',
          marginTop: '10px', borderRadius: '1px', overflow: 'hidden',
        }}>
          <div style={{ flex: 1, background: '#007A3D' }}></div>
          <div style={{ flex: 1, background: '#CFA237' }}></div>
          <div style={{ flex: 1, background: '#E07E6B' }}></div>
        </div>
      </div>

      {/* ── Navigation ───────────────────────────────────── */}
      <nav style={{ flex: 1, padding: '8px 0', overflowY: 'auto' }}>
        {NAV.map(section => (
          <div key={section.section}>
            <div style={{
              fontSize: '9px', fontWeight: 600,
              color: isDark ? '#4A4430' : '#8C7D5E',
              padding: '10px 16px 4px',
              letterSpacing: '0.08em',
            }}>
              {section.section}
            </div>

            {section.items.map(item => {
              const active = page === item.id;
              const count  = item.badge === 'red'   ? nbAlertes
                           : item.badge === 'green' ? 0 : 0;
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '9px',
                    padding: '8px 16px',
                    border: 'none',
                    borderRight: `2px solid ${active ? '#CFA237' : 'transparent'}`,
                    background: active
                      ? (isDark ? 'rgba(207,162,55,0.08)' : 'rgba(207,162,55,0.1)')
                      : 'transparent',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.15s',
                  }}
                  onMouseEnter={e => {
                    if (!active) (e.currentTarget as HTMLButtonElement).style.background =
                      isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)';
                  }}
                  onMouseLeave={e => {
                    if (!active) (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
                  }}
                >
                  <i
                    className={`ti ${item.icon}`}
                    style={{
                      fontSize: '16px',
                      color: active ? '#CFA237' : (isDark ? '#4A4430' : '#8C7D5E'),
                      flexShrink: 0,
                      width: '18px',
                      textAlign: 'center',
                    }}
                    aria-hidden="true"
                  />
                  <span style={{
                    fontSize: '12px',
                    fontWeight: active ? 600 : 400,
                    color: active
                      ? (isDark ? '#F5F0E8' : '#1A1209')
                      : (isDark ? '#9B9070' : '#5A4E35'),
                    flex: 1,
                  }}>
                    {item.label}
                  </span>
                  {count > 0 && (
                    <span style={{
                      fontSize: '9px', fontWeight: 700,
                      padding: '2px 6px', borderRadius: '99px',
                      background: item.badge === 'red'
                        ? 'rgba(224,126,107,0.2)'
                        : 'rgba(76,175,125,0.2)',
                      color: item.badge === 'red' ? '#E07E6B' : '#4CAF7D',
                      border: `1px solid ${item.badge === 'red' ? 'rgba(224,126,107,0.3)' : 'rgba(76,175,125,0.3)'}`,
                    }}>
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </nav>

      {/* ── Statut connexion ─────────────────────────────── */}
      <div style={{
        padding: '8px 16px',
        borderTop: `1px solid ${isDark ? '#2E2A1A' : '#E0D8C4'}`,
        borderBottom: `1px solid ${isDark ? '#2E2A1A' : '#E0D8C4'}`,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div style={{
            width: '6px', height: '6px', borderRadius: '50%',
            background: connected ? '#4CAF7D' : '#E07E6B',
            flexShrink: 0,
          }} className={connected ? 'pulse-green' : ''} />
          <span style={{
            fontSize: '10px',
            color: connected
              ? '#4CAF7D'
              : (isDark ? '#9B9070' : '#5A4E35'),
          }}>
            {connected ? 'Realtime connecté' : 'Connexion...'}
          </span>
        </div>
      </div>

      {/* ── Utilisateur ──────────────────────────────────── */}
      <div style={{ padding: '12px 14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
          <div style={{
            width: '30px', height: '30px', borderRadius: '50%',
            background: 'rgba(207,162,55,0.15)',
            border: '1px solid rgba(207,162,55,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '11px', fontWeight: 700, color: '#CFA237',
            flexShrink: 0,
          }}>
            {initiales}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              fontSize: '11px', fontWeight: 600,
              color: isDark ? '#F5F0E8' : '#1A1209',
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>
              {user?.nom || 'Professionnel'}
            </div>
            <div style={{
              fontSize: '9px',
              color: isDark ? '#4A4430' : '#8C7D5E',
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>
              {user?.role || ''}{user?.unite ? ` · ${user.unite}` : ''}
            </div>
          </div>
          <div style={{
            width: '7px', height: '7px', borderRadius: '50%',
            background: '#4CAF7D', flexShrink: 0,
          }} />
        </div>
      </div>
    </div>
  );
}