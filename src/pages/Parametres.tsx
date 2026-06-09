import React, { useState } from 'react';
import { getCurrentUser } from '../services/api';

interface Props {
  onToggleTheme: () => void;
  theme: 'dark' | 'light';
}

export default function Parametres({ onToggleTheme, theme }: Props) {
  const user     = getCurrentUser();
  const [saved,  setSaved]  = useState(false);
  const [notif,  setNotif]  = useState(Notification.permission === 'granted');
  const [sound,  setSound]  = useState(localStorage.getItem('lotisec_sound') !== 'off');
  const [apiKey, setApiKey] = useState(localStorage.getItem('lotisec_gmaps_key') || '');

  const sauvegarder = () => {
    localStorage.setItem('lotisec_sound',    sound ? 'on' : 'off');
    localStorage.setItem('lotisec_gmaps_key', apiKey);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const activerNotifs = async () => {
    const perm = await Notification.requestPermission();
    setNotif(perm === 'granted');
  };

  const Section = ({ titre, children }: { titre: string; children: React.ReactNode }) => (
    <div className="bg-s2 border border-bord rounded-xl overflow-hidden">
      <div className="px-5 py-3 border-b border-bord">
        <span className="text-[11px] font-bold text-t1 uppercase tracking-wider">{titre}</span>
      </div>
      <div className="p-5 space-y-4">{children}</div>
    </div>
  );

  const Toggle = ({ label, sub, value, onChange }: { label:string; sub?:string; value:boolean; onChange:(v:boolean)=>void }) => (
    <div className="flex items-center justify-between">
      <div>
        <div className="text-sm text-t1 font-medium">{label}</div>
        {sub && <div className="text-xs text-t3 mt-0.5">{sub}</div>}
      </div>
      <button onClick={() => onChange(!value)}
        className={`w-10 h-6 rounded-full transition-all relative ${value ? 'bg-gold' : 'bg-s4'}`}>
        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all shadow ${value ? 'left-5' : 'left-1'}`}></div>
      </button>
    </div>
  );

  return (
    <div className="flex-1 overflow-y-auto p-5 space-y-5 max-w-3xl">

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-sm font-bold text-t1 uppercase tracking-widest">Paramètres</h1>
          <p className="text-xs text-t3 mt-0.5">Configuration & Gestion de la Relation Client</p>
        </div>
        <button onClick={sauvegarder}
          className={`text-[11px] px-4 py-2 rounded-lg font-bold transition-all ${
            saved ? 'bg-urg-green text-white' : 'bg-gold text-bg hover:bg-gold-light'
          }`}>
          {saved ? '✓ Sauvegardé' : 'Sauvegarder'}
        </button>
      </div>

      {/* Profil */}
      <Section titre="Profil du compte">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gold-bg border border-gold-muted flex items-center justify-center text-xl font-black text-gold">
            {user?.nom?.[0] || 'P'}
          </div>
          <div>
            <div className="text-sm font-bold text-t1">{user?.nom || 'Professionnel'}</div>
            <div className="text-xs text-t3">{user?.role || 'Régulateur'} · {user?.unite || 'Unité'}</div>
            <div className="text-[10px] text-gold mt-0.5">Code : {user?.code || '—'}</div>
          </div>
        </div>
      </Section>

      {/* Alertes */}
      <Section titre="Alertes & Notifications">
        <Toggle
          label="Son d'alerte SOS"
          sub="Bip double lors de la réception d'un SOS"
          value={sound}
          onChange={setSound}
        />
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm text-t1 font-medium">Notifications navigateur</div>
            <div className="text-xs text-t3 mt-0.5">
              {notif ? '✓ Activées' : 'Désactivées — cliquer pour activer'}
            </div>
          </div>
          <button onClick={activerNotifs}
            className={`text-[11px] px-3 py-1.5 rounded-lg border transition-all ${
              notif ? 'bg-urg-green/10 text-urg-green border-urg-green/25'
                    : 'bg-gold-bg text-gold border-gold-muted hover:bg-gold-bg'
            }`}>
            {notif ? '✓ Actif' : 'Activer'}
          </button>
        </div>
        <Toggle
          label="Flash onglet navigateur"
          sub="Le titre de l'onglet clignote lors d'une alerte"
          value={true}
          onChange={() => {}}
        />
      </Section>

      {/* Apparence */}
      <Section titre="Apparence">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm text-t1 font-medium">Thème</div>
            <div className="text-xs text-t3 mt-0.5">Actuellement : {theme === 'dark' ? 'Sombre' : 'Clair'}</div>
          </div>
          <button onClick={onToggleTheme}
            className="text-[11px] px-4 py-1.5 rounded-lg bg-s3 border border-bord text-t1 hover:bg-s4 transition-colors">
            {theme === 'dark' ? '☀️ Thème clair' : '🌙 Thème sombre'}
          </button>
        </div>
      </Section>

      {/* API */}
      <Section titre="Intégrations API">
        <div>
          <div className="text-sm text-t1 font-medium mb-2">Clé Google Maps API</div>
          <div className="text-xs text-t3 mb-2">
            Requis pour le routage intelligent (hôpital le plus rapide avec trafic réel)
          </div>
          <input
            type="password"
            value={apiKey}
            onChange={e => setApiKey(e.target.value)}
            placeholder="AIza..."
            className="w-full bg-s3 border border-bord rounded-lg px-3 py-2 text-sm text-t1 outline-none focus:border-gold transition-colors"
          />
        </div>
        <div className="bg-s3 border border-bord rounded-lg p-3">
          <div className="text-[11px] font-bold text-gold mb-1">Supabase Realtime</div>
          <div className="text-xs text-t3">
            Projet : xtalrmoacijdwioazfps.supabase.co<br/>
            Latence garantie : &lt;2 secondes<br/>
            Protocole : PostgreSQL LISTEN/NOTIFY via WebSocket
          </div>
        </div>
      </Section>

      {/* GRC */}
      <Section titre="GRC — Gestion de la Relation Client">
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: 'CHU Sylvanus Olympio',  code: 'SAMU-CHU-0812',   statut: 'Actif',   color: 'text-urg-green' },
            { label: 'Pompiers Lomé',          code: 'POMPIERS-LME-118',statut: 'Actif',   color: 'text-urg-green' },
            { label: 'Police Lomé',            code: 'POLICE-LME-4471', statut: 'Actif',   color: 'text-urg-green' },
            { label: 'Ambulance Bè',           code: 'AMBU-BE-0021',    statut: 'Actif',   color: 'text-urg-green' },
          ].map(c => (
            <div key={c.code} className="bg-s3 border border-bord rounded-lg p-3">
              <div className="text-sm font-bold text-t1">{c.label}</div>
              <div className="text-[10px] text-t3 mt-0.5 font-mono">{c.code}</div>
              <div className={`text-[10px] font-bold mt-1 ${c.color}`}>{c.statut}</div>
            </div>
          ))}
        </div>
        <button className="w-full text-[11px] py-2 rounded-lg border border-gold-muted text-gold bg-gold-bg hover:bg-gold-bg transition-colors">
          + Ajouter un partenaire institutionnel
        </button>
      </Section>

    </div>
  );
}