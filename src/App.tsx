import React, { useState, useEffect, useCallback } from 'react';
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
import { wsClient } from './services/websocket';
import { Alerte } from './types';

// ─── Son d'alerte généré en JS — pas de fichier audio requis ──
function jouerSonAlerte() {
  try {
    const ctx = new (window.AudioContext ||
      (window as any).webkitAudioContext)();
    const osc  = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = 880;
    osc.type = 'sine';
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.8);
  } catch (_) {}
}

// ─── Notification navigateur ──────────────────────────────────
function afficherNotification(alerte: any) {
  if (!('Notification' in window)) return;
  const body = `${alerte.prenom || ''} ${alerte.nom || ''} · ${alerte.adresse || 'Position GPS'}`;
  if (Notification.permission === 'granted') {
    new Notification('🚨 Nouvelle alerte SOS — SafeLife', { body });
  } else if (Notification.permission !== 'denied') {
    Notification.requestPermission().then(perm => {
      if (perm === 'granted') {
        new Notification('🚨 Nouvelle alerte SOS — SafeLife', { body });
      }
    });
  }
}

export default function App() {
  const [authed,    setAuthed]    = useState(false);
  const [page,      setPage]      = useState('dashboard');
  const [user,      setUser]      = useState<any>(null);
  const [alertes,   setAlertes]   = useState<Alerte[]>([]);
  const [nbAlertes, setNbAlertes] = useState(0);

  // ─── Auth ────────────────────────────────────────────────
  useEffect(() => {
    const ok = isAuthenticated();
    setAuthed(ok);
    if (ok) setUser(getCurrentUser());
  }, []);

  // ─── WebSocket — écoute des alertes temps réel ────────────
  useEffect(() => {
    if (!authed) return;

    wsClient.reconnect();
    wsClient.connect();

    const unsubscribe = wsClient.onMessage((data) => {
      if (data.type === 'NOUVELLE_ALERTE') {
        jouerSonAlerte();
        afficherNotification(data);
        setAlertes(prev => {
          if (prev.some(a => a.id === data.id)) return prev;
          // Ajouter minutes_ecoulees = 0 pour la nouvelle alerte
          const nouvelleAlerte: Alerte = {
            ...data,
            minutesEcoulees: 0,
            contacts: data.contacts || [],
          };
          return [nouvelleAlerte, ...prev];
        });
        setNbAlertes(prev => prev + 1);
      }

      if (data.type === 'ALERTE_MISE_A_JOUR') {
        setAlertes(prev =>
          prev.map(a => a.id === data.id
            ? { ...a, statut: data.statut as any }
            : a
          )
        );
      }

      if (data.type === 'ALERTE_RESOLUE') {
        setAlertes(prev => prev.filter(a => a.id !== data.id));
        setNbAlertes(prev => Math.max(0, prev - 1));
      }
    });

    // Mettre à jour les minutes écoulées chaque minute
    const minuteInterval = setInterval(() => {
      setAlertes(prev =>
        prev.map(a => ({
          ...a,
          minutesEcoulees: Math.floor(
            (Date.now() - new Date(a.timestamp).getTime()) / 60000
          ),
        }))
      );
    }, 60000);

    return () => {
      unsubscribe();
      clearInterval(minuteInterval);
      wsClient.disconnect();
    };
  }, [authed]);

  const handleSuccess = () => {
    setAuthed(true);
    setUser(getCurrentUser());
  };

  const handleLogout = () => {
    logoutPro();
    wsClient.disconnect();
    setAuthed(false);
    setUser(null);
    setPage('dashboard');
    setAlertes([]);
    setNbAlertes(0);
  };

  const handleNavigate = useCallback((p: string) => {
    setPage(p);
    // Réinitialiser le compteur quand on va sur la page alertes
    if (p === 'alertes') setNbAlertes(0);
  }, []);

  if (!authed) {
    return <LoginPro onSuccess={handleSuccess} />;
  }

  interface DashboardProps {
  alertesTempsReel: Alerte[];
  }

  const PAGES: Record<string, React.ReactNode> = {
    dashboard:    <Dashboard alertesTempsReel={alertes} />,
    alertes:      <AlertesSOS alertesTempsReel={alertes} />,
    carte:        <CartographieAccidents />,
    victimes:     <FichesVictimes />,
    interventions:<Interventions />,
    scans:        <HistoriqueScans />,
    cartographie: <CartographieAccidents />,
    stats: (
      <div className="flex-1 p-5">
        <p className="text-t2 text-sm">Statistiques — en développement</p>
      </div>
    ),
    settings: (
      <div className="flex-1 p-5">
        <p className="text-t2 text-sm">Paramètres — en développement</p>
      </div>
    ),
  };

  return (
    <div className="flex h-screen bg-bg overflow-hidden">
      <Sidebar
        page={page}
        onNavigate={handleNavigate}
        user={user || { nom: 'Professionnel', role: '', unite: '' }}
        nbAlertes={nbAlertes}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar
          titre={page}
          nbAlertes={nbAlertes}
          onLogout={handleLogout}
        />
        {PAGES[page] || PAGES['dashboard']}
      </div>
    </div>
  );
}