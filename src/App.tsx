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
import Statistiques          from './pages/Statistiques';
import Parametres            from './pages/Parametres';
import { isAuthenticated, getCurrentUser, logoutPro } from './services/api';
import { lotisecRealtime } from './lib/realtime';
import { Alerte } from './types';

// ── Son d'alerte double bip ───────────────────────────────────
function jouerSonAlerte() {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    [
      { freq: 660, start: 0,    end: 0.3  },
      { freq: 880, start: 0.35, end: 0.7  },
    ].forEach(({ freq, start, end }) => {
      const osc  = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = freq;
      osc.type = 'sine';
      gain.gain.setValueAtTime(0.4, ctx.currentTime + start);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + end);
      osc.start(ctx.currentTime + start);
      osc.stop(ctx.currentTime + end);
    });
  } catch (_) {}
}

// ── Notification navigateur ───────────────────────────────────
function afficherNotification(alerte: any) {
  if (!('Notification' in window)) return;
  const titre = '🚨 ALERTE SOS — LOTISEC';
  const body  = [
    alerte.prenom, alerte.nom, '·',
    alerte.adresse || 'Position GPS', '·',
    alerte.groupeSanguin || '?',
  ].filter(Boolean).join(' ');

  if (Notification.permission === 'granted') {
    new Notification(titre, { body, icon: '/favicon.ico', tag: alerte.id });
  } else if (Notification.permission !== 'denied') {
    Notification.requestPermission().then(p => {
      if (p === 'granted') new Notification(titre, { body });
    });
  }
}

// ── Flash onglet ──────────────────────────────────────────────
function flashOnglet() {
  const titre = document.title;
  let   i     = 0;
  const flash = setInterval(() => {
    document.title = i++ % 2 === 0 ? '🚨 ALERTE SOS !' : titre;
  }, 800);
  setTimeout(() => { clearInterval(flash); document.title = titre; }, 8000);
}

// ═════════════════════════════════════════════════════════════
export default function App() {
  const [authed,    setAuthed]    = useState(false);
  const [page,      setPage]      = useState('dashboard');
  const [user,      setUser]      = useState<any>(null);
  const [alertes,   setAlertes]   = useState<Alerte[]>([]);
  const [nbAlertes, setNbAlertes] = useState(0);
  const [connected, setConnected] = useState(false);
  const [theme,     setTheme]     = useState<'dark' | 'light'>('dark');

  // ── Auth + thème au chargement ──────────────────────────
  useEffect(() => {
    const ok = isAuthenticated();
    setAuthed(ok);
    if (ok) setUser(getCurrentUser());

    const t = (localStorage.getItem('lotisec_theme') as 'dark' | 'light') || 'dark';
    setTheme(t);
    document.body.classList.toggle('theme-light', t === 'light');
  }, []);

  // ── Supabase Realtime ───────────────────────────────────
  useEffect(() => {
    if (!authed) return;

    lotisecRealtime.connect();

    // Nouvelles alertes SOS
    const unsubAlerte = lotisecRealtime.onNouvealleAlerte((data) => {
      jouerSonAlerte();
      afficherNotification(data);
      flashOnglet();
      setAlertes(prev => {
        if (prev.some(a => a.id === data.id)) return prev;
        return [data as Alerte, ...prev];
      });
      setNbAlertes(prev => prev + 1);
    });

    // Mises à jour statut
    const unsubStatut = lotisecRealtime.onStatut((data) => {
      if (data.type === 'ALERTE_MISE_A_JOUR') {
        setAlertes(prev =>
          prev.map(a => a.id === data.id ? { ...a, statut: data.statut } : a)
        );
      }
      if (data.type === 'ALERTE_RESOLUE') {
        setAlertes(prev => prev.filter(a => a.id !== data.id));
        setNbAlertes(prev => Math.max(0, prev - 1));
      }
    });

    // Statut connexion Realtime
    const unsubConn = lotisecRealtime.onConnexion(setConnected);

    // Compteur minutes écoulées — tick toutes les 60s
    const tick = setInterval(() => {
      setAlertes(prev => prev.map(a => ({
        ...a,
        minutesEcoulees: Math.floor(
          (Date.now() - new Date(a.timestamp).getTime()) / 60000
        ),
      })));
    }, 60000);

    return () => {
      unsubAlerte();
      unsubStatut();
      unsubConn();
      clearInterval(tick);
      lotisecRealtime.disconnect();
    };
  }, [authed]);

  // ── Handlers ────────────────────────────────────────────
  const handleSuccess = () => {
    setAuthed(true);
    setUser(getCurrentUser());
  };

  const handleLogout = () => {
    logoutPro();
    lotisecRealtime.disconnect();
    setAuthed(false);
    setUser(null);
    setPage('dashboard');
    setAlertes([]);
    setNbAlertes(0);
  };

  const handleNavigate = useCallback((p: string) => {
    setPage(p);
    // Réinitialiser badge quand on ouvre la page alertes
    if (p === 'alertes') setNbAlertes(0);
  }, []);

  const toggleTheme = useCallback(() => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    localStorage.setItem('lotisec_theme', next);
    document.body.classList.toggle('theme-light', next === 'light');
  }, [theme]);

  // ── Écran de connexion ──────────────────────────────────
  if (!authed) return <LoginPro onSuccess={handleSuccess} />;

  // ── Mapping IDs sidebar → composants ────────────────────
  // IMPORTANT : chaque id dans Sidebar NAV doit avoir une entrée ici
  const PAGES: Record<string, React.ReactNode> = {
    // Urgences
    dashboard:     <Dashboard    alertesTempsReel={alertes} />,
    alertes:       <AlertesSOS   alertesTempsReel={alertes} />,
    carte:         <CartographieAccidents />,
    victimes:      <FichesVictimes />,
    // Opérations
    interventions: <Interventions />,
    scans:         <HistoriqueScans />,
    cartographie:  <CartographieAccidents />,
    // Analyse
    stats:         <Statistiques />,
    parametres:    <Parametres onToggleTheme={toggleTheme} theme={theme} />,
  };

  return (
    <div
      className="flex h-screen overflow-hidden"
      style={{
        background: theme === 'light' ? '#FDFAF5' : '#0C0A09',
        color:      theme === 'light' ? '#1A1209' : '#F5F0E8',
      }}
    >
      <Sidebar
        page={page}
        onNavigate={handleNavigate}
        user={user || { nom: 'Professionnel', role: '', unite: '' }}
        nbAlertes={nbAlertes}
        connected={connected}
        theme={theme}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar
          titre={page}
          nbAlertes={nbAlertes}
          onLogout={handleLogout}
          connected={connected}
          theme={theme}
          onToggleTheme={toggleTheme}
        />
        <div className="flex-1 overflow-hidden">
          {PAGES[page] ?? PAGES['dashboard']}
        </div>
      </div>
    </div>
  );
}