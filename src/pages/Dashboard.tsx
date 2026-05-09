import React, { useState, useEffect } from 'react';
import StatCard     from '../components/StatCard';
import AlerteItem   from '../components/AlerteItem';
import FicheVictime from '../components/FicheVictime';
import { getAlertes, prendreEnCharge } from '../services/api';
import { Alerte } from '../types';

const DEMO_ALERTES: Alerte[] = [
  {
    id: '1', prenom: 'Kofi', nom: 'Mensah',
    groupeSanguin: 'O+', electrophorese: 'AS',
    latitude: 6.1375, longitude: 1.2124,
    adresse: 'Avenue de la Marina, Lomé',
    statut: 'active', timestamp: new Date(Date.now() - 3 * 60000).toISOString(),
    minutesEcoulees: 3,
    contacts: [{ nom: 'Papa Mensah', telephone: '+22890000000', relation: 'Parent' }],
    vehicule: 'Moto · Yamaha DT125 · TG-1234-AB',
  },
  {
    id: '2', prenom: 'Ama', nom: 'Sodzi',
    groupeSanguin: 'A+',
    latitude: 6.1201, longitude: 1.2244,
    adresse: 'Quartier Bè, Lomé',
    statut: 'active', timestamp: new Date(Date.now() - 11 * 60000).toISOString(),
    minutesEcoulees: 11,
    contacts: [{ nom: 'Mère Sodzi', telephone: '+22891000000', relation: 'Parent' }],
  },
];

export default function Dashboard() {
  const [alertes,      setAlertes]      = useState<Alerte[]>(DEMO_ALERTES);
  const [ficheOuverte, setFicheOuverte] = useState<Alerte | null>(null);

  useEffect(() => {
    getAlertes().then(data => {
      if (data && data.length > 0) setAlertes(data);
    }).catch(() => {});
  }, []);

  const handlePrendreEnCharge = async (id: string) => {
    await prendreEnCharge(id).catch(() => {});
    setAlertes(prev =>
      prev.map(a => a.id === id ? { ...a, statut: 'en_cours' as any } : a)
    );
  };

  const ouvrirItineraire = (lat: number, lng: number) => {
    window.open(
      `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=driving`,
      '_blank'
    );
  };

  return (
    <div className="flex-1 overflow-y-auto p-5 space-y-4">

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3">
        <StatCard valeur={alertes.length} label="Alertes SOS actives"      delta="+2 cette heure" hausse={true}  couleur="red"   />
        <StatCard valeur={12}             label="Interventions aujourd'hui" delta="+4 vs hier"     hausse={false} couleur="green" />
        <StatCard valeur="8 min"          label="Temps de réponse moyen"   delta="+2 min vs hier" hausse={true}  couleur="amber" />
        <StatCard valeur={47}             label="Scans QR aujourd'hui"     delta="+12 vs hier"    hausse={false} couleur="blue"  />
      </div>

      {/* Alertes + mini carte */}
      <div className="grid grid-cols-5 gap-4">

        {/* Alertes */}
        <div className="col-span-3 bg-s2 border border-urg-red/35 rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-bord bg-urg-red/5">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-urg-red pulse-red inline-block"></span>
              <span className="text-[11px] font-bold text-red-400 uppercase tracking-wider">
                Alertes SOS actives
              </span>
            </div>
            <span className="text-[9px] font-bold text-red-400 bg-urg-red/10 border border-urg-red/25 px-2 py-1 rounded">
              {alertes.length} EN COURS
            </span>
          </div>
          <div>
            {alertes.map(a => (
              <AlerteItem
                key={a.id}
                alerte={a}
                onVoirFiche={setFicheOuverte}
                onPrendreEnCharge={handlePrendreEnCharge}
                onItineraire={ouvrirItineraire}
              />
            ))}
            {alertes.length === 0 && (
              <div className="px-4 py-8 text-center text-xs text-t3">
                Aucune alerte active en ce moment
              </div>
            )}
          </div>
        </div>

        {/* Mini carte */}
        <div className="col-span-2 bg-s2 border border-bord rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-bord">
            <span className="text-[11px] font-bold text-t1 uppercase tracking-wider">Carte live</span>
            <span className="text-[9px] text-t3">Lomé · Togo</span>
          </div>
          <div className="bg-[#080E1C] m-3 rounded-lg h-52 relative overflow-hidden border border-bord2">
            {[35,60,80].map(p => (
              <div key={p} className="absolute left-0 right-0" style={{ top:`${p}%`, height:'1px', background:'rgba(255,255,255,0.06)' }} />
            ))}
            {[25,55,78].map(p => (
              <div key={p} className="absolute top-0 bottom-0" style={{ left:`${p}%`, width:'1px', background:'rgba(255,255,255,0.06)' }} />
            ))}
            {alertes.map((a, i) => {
              const positions = [{ top:'37%',left:'42%' },{ top:'63%',left:'64%' },{ top:'24%',left:'74%' }];
              const pos = positions[i] || positions[0];
              return (
                <div key={a.id}>
                  <div className="map-ripple absolute border border-urg-red rounded-full" style={{ top:pos.top, left:pos.left, transform:'translate(-50%,-50%)' }} />
                  <div className="absolute w-3 h-3 rounded-full bg-urg-red border-2 border-bg pulse-red" style={{ top:pos.top, left:pos.left, transform:'translate(-50%,-50%)' }} />
                  <div className="absolute text-[8px] font-semibold text-white/50" style={{ top:pos.top, left:pos.left, transform:'translate(-50%,8px)' }}>
                    {a.prenom}
                  </div>
                </div>
              );
            })}
            <div className="absolute w-3 h-3 rounded-full bg-togo-yellow border-2 border-white" style={{ top:'50%', left:'50%', transform:'translate(-50%,-50%)' }} />
            <div className="absolute bottom-2 right-2 flex gap-2">
              {[{color:'bg-urg-red',label:'SOS'},{color:'bg-togo-yellow',label:'Vous'}].map(l => (
                <div key={l.label} className="flex items-center gap-1">
                  <div className={`w-1.5 h-1.5 rounded-full ${l.color}`}></div>
                  <span className="text-[8px] text-white/40">{l.label}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="flex gap-2 mx-3 mb-3">
            {[
              {num:alertes.length,label:'SOS actifs',color:'text-urg-red'},
              {num:4,label:'Hôpitaux',color:'text-green-400'},
              {num:6,label:'Équipes',color:'text-blue-400'},
            ].map(s => (
              <div key={s.label} className="flex-1 bg-s3 border border-bord rounded-lg py-2 text-center">
                <div className={`text-base font-black ${s.color}`}>{s.num}</div>
                <div className="text-[9px] text-t2 mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Scans récents */}
      <div className="bg-s2 border border-bord rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-bord">
          <span className="text-[11px] font-bold text-t1 uppercase tracking-wider">
            Derniers scans QR
          </span>
          <span className="text-[9px] text-t3">Aujourd'hui</span>
        </div>
        <div className="grid grid-cols-4 divide-x divide-bord">
          {[
            { i:'KM', n:'Kofi Mensah',  m:'14h32 · Marina · SAMU-CHU-0812',    niv:'pro',    bg:'bg-urg-green/15', c:'text-green-400' },
            { i:'AS', n:'Ama Sodzi',    m:"13h15 · Bè · Public",               niv:'public', bg:'bg-blue-500/10',  c:'text-blue-400'  },
            { i:'KD', n:'Kwame Doe',    m:'12h50 · Tokoin · POLICE-LME-4471',  niv:'sos',    bg:'bg-urg-red/10',   c:'text-red-400'   },
            { i:'YA', n:'Yawa Agbeko',  m:'11h40 · Kodjo · AMBU-BE-0021',      niv:'pro',    bg:'bg-urg-green/15', c:'text-green-400' },
          ].map(s => (
            <div key={s.i} className="flex items-center gap-3 px-4 py-3">
              <div className={`w-8 h-8 rounded-full ${s.bg} flex items-center justify-center text-[11px] font-black ${s.c} flex-shrink-0`}>
                {s.i}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[11px] font-bold text-t1 truncate">{s.n}</div>
                <div className="text-[9px] text-t3 truncate">{s.m}</div>
              </div>
              <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded border flex-shrink-0 ${
                s.niv==='pro'    ? 'bg-urg-green/10 text-green-400 border-urg-green/25'
                : s.niv==='sos' ? 'bg-urg-red/10   text-red-400   border-urg-red/25'
                :                 'bg-blue-500/10  text-blue-400  border-blue-500/25'
              }`}>
                {s.niv==='pro' ? 'Pro' : s.niv==='sos' ? 'SOS' : 'Public'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {ficheOuverte && (
        <FicheVictime
          alerte={ficheOuverte}
          onClose={() => setFicheOuverte(null)}
        />
      )}
    </div>
  );
}