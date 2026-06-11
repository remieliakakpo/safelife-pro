import React, { useState } from 'react';
import { getCurrentUser } from '../services/api';

interface Props {
  onSuccess: () => void;
}

/*const CODES_TEST = [
  { code: 'SAMU-CHU-0812',   role: 'SAMU · CHU Sylvanus Olympio' },
  { code: 'POMPIERS-LME-118',role: 'Pompiers · Caserne de Lomé' },
  { code: 'POLICE-LME-4471', role: 'Police Nationale · Lomé' },
  { code: 'AMBU-BE-0021',    role: 'Ambulanciers · Hôpital de Bè' },
];*/

const CODES_VALIDES: Record<string, { nom: string; role: string; unite: string }> = {
  'SAMU-CHU-0812':    { nom: 'Dr. Kofi Mensah',   role: 'Médecin SAMU',    unite: 'CHU Sylvanus Olympio' },
  'POMPIERS-LME-118': { nom: 'Cpt. Ama Sodzi',    role: 'Capitaine',       unite: 'Caserne Lomé Centre'  },
  'POLICE-LME-4471':  { nom: 'Insp. Kwame Doe',   role: 'Inspecteur',      unite: 'Police Nationale'     },
  'AMBU-BE-0021':     { nom: 'Yawa Agbeko',        role: 'Ambulancier',     unite: 'Ambulance Bè'         },
  'MEDC3737':         { nom: 'Dr. Fiifi Asante',   role: 'Médecin urgence', unite: 'Clinique Biasa'       },
  'POL1717':          { nom: 'Adj. Kokou Dossou',  role: 'Adjudant',        unite: 'Gendarmerie Lomé'     },
};

export default function LoginPro({ onSuccess }: Props) {
  const [code,     setCode]     = useState('');
  const [password, setPassword] = useState('');
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');
  const [showPwd,  setShowPwd]  = useState(false);

  /*const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || !password.trim()) {
      setError('Veuillez remplir tous les champs.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await loginPro(code.trim().toUpperCase(), password);
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Code ou mot de passe invalide.');
    } finally {
      setLoading(false);
    }
  };*/

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!code.trim() || !password.trim()) {
    setError('Veuillez remplir tous les champs.');
    return;
  }
  setLoading(true);
  setError('');

  await new Promise(r => setTimeout(r, 500));

  const codeUpper = code.trim().toUpperCase();
  const user      = CODES_VALIDES[codeUpper];

  if (!user) {
    setError('Code institutionnel non reconnu.');
    setLoading(false);
    return;
  }
  if (password !== 'safelife2024') {
    setError('Mot de passe incorrect.');
    setLoading(false);
    return;
  }

  localStorage.setItem('safelife_pro_token', `local_${codeUpper}_${Date.now()}`);
  localStorage.setItem('safelife_pro_user',  JSON.stringify({
    code:  codeUpper,
    nom:   user.nom,
    role:  user.role,
    unite: user.unite,
  }));

  setLoading(false);
  onSuccess();
};

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-4">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-urg-red rounded-xl flex items-center justify-center text-white font-black text-lg">
              SL
            </div>
            <div className="text-left">
              <div className="flex items-baseline gap-0.5">
                <span className="text-2xl font-black text-t1">Safe</span>
                <span className="text-2xl font-black text-togo-yellow">Life</span>
                <span className="ml-2 text-xs font-bold bg-urg-green/20 text-urg-green px-2 py-0.5 rounded border border-urg-green/30">
                  PRO
                </span>
              </div>
              <div className="text-xs text-t3">Centre opérationnel · Lomé, Togo</div>
            </div>
          </div>

          <div className="flex h-1 w-24 mx-auto rounded overflow-hidden mb-4">
            <div className="flex-1 bg-togo-green"></div>
            <div className="flex-1 bg-togo-yellow"></div>
            <div className="flex-1 bg-togo-red"></div>
          </div>
          <p className="text-t2 text-sm">
            Accès réservé aux professionnels autorisés
          </p>
        </div>

        {/* Formulaire */}
        <form
          onSubmit={handleSubmit}
          className="bg-s2 border border-bord rounded-2xl p-6 mb-4"
        >
          <h2 className="text-t1 font-bold text-lg mb-1">Connexion professionnelle</h2>
          <p className="text-t3 text-xs mb-6">
            Entrez votre code institutionnel et votre mot de passe
          </p>

          {error && (
            <div className="bg-urg-red/10 border border-urg-red/30 text-red-400 text-xs px-4 py-3 rounded-xl mb-4">
              {error}
            </div>
          )}

          {/* Code institutionnel */}
          <div className="mb-4">
            <label className="block text-xs font-semibold text-t2 mb-2 uppercase tracking-wide">
              Code institutionnel
            </label>
            <input
              type="text"
              value={code}
              onChange={e => setCode(e.target.value.toUpperCase())}
              placeholder="Ex : POMPIERS-LME-118"
              className="w-full bg-s3 border border-bord text-t1 rounded-xl px-4 py-3 text-sm font-mono focus:border-urg-green focus:outline-none placeholder-t3"
              autoCapitalize="characters"
              autoComplete="off"
            />
            <p className="text-t3 text-xs mt-1">Format : CORPS-VILLE-CODE</p>
          </div>

          {/* Mot de passe */}
          <div className="mb-6">
            <label className="block text-xs font-semibold text-t2 mb-2 uppercase tracking-wide">
              Mot de passe
            </label>
            <div className="relative">
              <input
                type={showPwd ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-s3 border border-bord text-t1 rounded-xl px-4 py-3 text-sm focus:border-urg-green focus:outline-none pr-16 placeholder-t3"
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPwd(!showPwd)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-t3 text-xs hover:text-t2 px-2 py-1"
              >
                {showPwd ? 'Masquer' : 'Voir'}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !code || !password}
            className="w-full bg-urg-green hover:bg-togo-green text-white font-bold py-3 rounded-xl text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Connexion...' : 'Accéder au centre opérationnel'}
          </button>
        </form>

        {/* Codes de test */}
        <div className="bg-s2 border border-bord rounded-2xl p-4">
          <p className="text-xs font-semibold text-t3 mb-3 uppercase tracking-wide">
            Codes de test — mot de passe : <span className="text-urg-green font-mono">safelife2024</span>
          </p>
          <div className="flex flex-col gap-2">
            {CODES_VALIDES && Object.entries(CODES_VALIDES).map(([code, user]) => (
              <button
                key={code}
                type="button"
                onClick={() => { setCode(code); setPassword('safelife2024'); }}
                className="text-left px-3 py-2 bg-s3 border border-bord rounded-xl hover:border-urg-green/40 transition-colors"
              >
                <span className="text-xs font-mono text-urg-green">{code}</span>
                <span className="text-xs text-t3 ml-2">— {user.role}</span>
              </button>
            ))}
          </div>
        </div>

        <p className="text-center text-t3 text-xs mt-4">
          SafeLife Pro · Usage professionnel exclusivement
        </p>
      </div>
    </div>
  );
}