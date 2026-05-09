import React, { useState, useEffect } from 'react';
import Sidebar               from './components/Sidebar';
import Topbar                from './components/Topbar';
import LoginPro              from './components/LoginPro';
import Dashboard             from './pages/Dashboard';
import AlertesSOS            from './pages/AlertesSOS';
import CartographieAccidents from './pages/CartographieAccidents';
import FichesVictimes        from './pages/FichesVictimes';
import Interventions         from './pages/Interventions';
import HistoriqueScans       from './pages/HistoriqueScans';
import { isAuthenticated, getCurrentUser, logoutPro } from './services/api';

export default function App() {
  const [authed, setAuthed] = useState(false);
  const [page,   setPage]   = useState('dashboard');
  const [user,   setUser]   = useState<any>(null);

  useEffect(() => {
    const ok = isAuthenticated();
    setAuthed(ok);
    if (ok) setUser(getCurrentUser());
  }, []);

  const handleSuccess = () => {
    setAuthed(true);
    setUser(getCurrentUser());
  };

  const handleLogout = () => {
    logoutPro();
    setAuthed(false);
    setUser(null);
    setPage('dashboard');
  };

  if (!authed) {
    return <LoginPro onSuccess={handleSuccess} />;
  }

  const PAGES: Record<string, React.ReactNode> = {
    dashboard:    <Dashboard />,
    alertes:      <AlertesSOS />,
    carte:        <CartographieAccidents />,
    victimes:     <FichesVictimes />,
    interventions:<Interventions />,
    scans:        <HistoriqueScans />,
    cartographie: <CartographieAccidents />,
    stats:        <div className="flex-1 p-5"><p className="text-t2 text-sm">Statistiques — en développement</p></div>,
    settings:     <div className="flex-1 p-5"><p className="text-t2 text-sm">Paramètres — en développement</p></div>,
  };

  return (
    <div className="flex h-screen bg-bg overflow-hidden">
      <Sidebar
        page={page}
        onNavigate={setPage}
        user={user || { nom: 'Professionnel', role: '', unite: '' }}
        nbAlertes={3}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar
          titre={page}
          nbAlertes={3}
          onLogout={handleLogout}
        />
        {PAGES[page] || PAGES['dashboard']}
      </div>
    </div>
  );
}