import React, { useState } from 'react';
import FicheVictime from '../components/FicheVictime';
import { getProfilParQR } from '../services/api';
import { Alerte } from '../types';

export default function FichesVictimes() {
  const [qrInput, setQrInput] = useState('');
  const [victime, setVictime] = useState<Alerte | null>(null);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');

  const rechercher = async () => {
    if (!qrInput.trim()) return;
    setLoading(true);
    setError('');
    try {
      const data = await getProfilParQR(qrInput.trim());
      const profil = data.profile || data;
      setVictime({
        id:             profil.id || '1',
        prenom:         profil.first_name || '',
        nom:            profil.last_name  || '',
        groupeSanguin:  profil.blood_type || '',
        electrophorese: profil.electrophoresis,
        latitude:       0,
        longitude:      0,
        adresse:        'Accès professionnel',
        statut:         'active',
        timestamp:      new Date().toISOString(),
        minutesEcoulees:0,
        contacts:       (profil.emergency_contacts || []).map((c: any) => ({
          nom:       c.name,
          telephone: c.phone,
          relation:  c.relation,
        })),
        vehicule: profil.vehicle_type
          ? `${profil.vehicle_type} · ${profil.plate || ''}`
          : undefined,
      });
    } catch (e: any) {
      setError('Profil introuvable. Vérifiez le token QR.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-5 space-y-4">
      <h1 className="text-sm font-bold text-t1 uppercase tracking-wider">
        Fiches victimes
      </h1>

      <div className="bg-s2 border border-bord rounded-xl p-5">
        <label className="block text-xs font-semibold text-t2 mb-2 uppercase tracking-wide">
          Rechercher par token QR
        </label>
        <div className="flex gap-3">
          <input
            type="text"
            value={qrInput}
            onChange={e => setQrInput(e.target.value)}
            placeholder="Coller le token QR ici..."
            className="flex-1 bg-s3 border border-bord text-t1 rounded-xl px-4 py-3 text-sm focus:border-urg-green focus:outline-none placeholder-t3"
            onKeyDown={e => e.key === 'Enter' && rechercher()}
          />
          <button
            onClick={rechercher}
            disabled={loading || !qrInput.trim()}
            className="bg-urg-green hover:bg-togo-green text-white text-sm font-bold px-6 rounded-xl transition-colors disabled:opacity-50"
          >
            {loading ? '...' : 'Rechercher'}
          </button>
        </div>
        {error && (
          <p className="text-red-400 text-xs mt-2">{error}</p>
        )}
      </div>

      {victime && (
        <FicheVictime alerte={victime} onClose={() => setVictime(null)} />
      )}
    </div>
  );
}