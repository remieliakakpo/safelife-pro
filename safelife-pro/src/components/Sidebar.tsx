import React from 'react';

interface Props {
  page:       string;
  onNavigate: (p: string) => void;
  user:       any;
  nbAlertes:  number;
}

const NAV = [
  { section: 'URGENCES', items: [
    { id: 'dashboard',    label: 'Tableau de bord', icon: '⊞', badge: null },
    { id: 'alertes',      label: 'Alertes SOS',     icon: '⚠', badge: 'red' },
    { id: 'carte',        label: 'Carte live',       icon: '◉', badge: null },
    { id: 'victimes',     label: 'Fiches victimes',  icon: '✎', badge: null },
  ]},
  { section: 'OPÉRATIONS', items: [
    { id: 'interventions',label: 'Interventions',    icon: '☰', badge: 'green' },
    { id: 'scans',        label: 'Historique scans', icon: '⊕', badge: null },
    { id: 'cartographie', label: 'Cartographie',     icon: '▦', badge: null },
  ]},
  { section: 'ADMIN', items: [
    { id: 'stats',        label: 'Statistiques',     icon: '📊', badge: null },
    { id: 'settings',     label: 'Paramètres',       icon: '⚙', badge: null },
  ]},
];

export default function Sidebar({ page, onNavigate, user, nbAlertes }: Props) {
  const initiales = user?.nom
    ? user.nom.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()
    : 'PR';

  return (
    <div className="w-52 bg-s1 border-r border-bord flex flex-col flex-shrink-0">

      {/* Logo */}
      <div className="px-4 py-5 border-b border-bord">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-urg-red rounded-lg flex items-center justify-center text-white font-black text-sm flex-shrink-0">
            SL
          </div>
          <div>
            <div className="flex items-baseline gap-0.5">
              <span className="text-base font-black text-t1">Safe</span>
              <span className="text-base font-black text-togo-yellow">Life</span>
              <span className="ml-1 text-[8px] font-bold bg-urg-green/20 text-urg-green px-1.5 py-0.5 rounded border border-urg-green/30">
                PRO
              </span>
            </div>
            <div className="text-[9px] text-t3">Centre opérationnel</div>
          </div>
        </div>
        <div className="flex h-0.5 mt-2 rounded overflow-hidden">
          <div className="flex-1 bg-togo-green"></div>
          <div className="flex-1 bg-togo-yellow"></div>
          <div className="flex-1 bg-togo-red"></div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-2 overflow-y-auto">
        {NAV.map(section => (
          <div key={section.section}>
            <div className="text-[9px] font-semibold text-t3 px-4 py-2 mt-2 tracking-widest">
              {section.section}
            </div>
            {section.items.map(item => {
              const active = page === item.id;
              const count  = item.badge === 'red'   ? nbAlertes
                           : item.badge === 'green' ? 12
                           : 0;
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={`w-full flex items-center gap-2.5 px-4 py-2.5 text-left transition-colors border-r-2 ${
                    active
                      ? 'bg-urg-red/10 border-urg-red text-t1'
                      : 'border-transparent hover:bg-white/5 text-t2'
                  }`}
                >
                  <span className={`text-sm w-4 text-center flex-shrink-0 ${active ? 'text-urg-red' : ''}`}>
                    {item.icon}
                  </span>
                  <span className={`text-xs font-medium flex-1 ${active ? 'font-semibold text-t1' : ''}`}>
                    {item.label}
                  </span>
                  {count > 0 && (
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                      item.badge === 'red'
                        ? 'bg-urg-red text-white'
                        : 'bg-urg-green text-white'
                    }`}>
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Utilisateur */}
      <div className="px-3.5 py-3 border-t border-bord">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-urg-green/20 border border-urg-green/30 flex items-center justify-center text-[10px] font-bold text-urg-green flex-shrink-0">
            {initiales}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[11px] font-bold text-t1 truncate">
              {user?.nom || 'Professionnel'}
            </div>
            <div className="text-[9px] text-t3 truncate">
              {user?.role || ''} · {user?.unite || ''}
            </div>
          </div>
          <div className="w-2 h-2 rounded-full bg-green-400 flex-shrink-0"></div>
        </div>
      </div>
    </div>
  );
}