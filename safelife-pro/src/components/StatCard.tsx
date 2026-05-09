import React from 'react';

interface Props {
  valeur:  string | number;
  label:   string;
  delta:   string;
  hausse:  boolean;
  couleur: 'red' | 'green' | 'amber' | 'blue';
}

const CONFIG = {
  red:   { text: 'text-red-400',    bar: 'bg-urg-red',   delta: 'text-red-400'  },
  green: { text: 'text-green-400',  bar: 'bg-urg-green', delta: 'text-green-400'},
  amber: { text: 'text-yellow-300', bar: 'bg-urg-amber', delta: 'text-yellow-300'},
  blue:  { text: 'text-blue-400',   bar: 'bg-urg-blue',  delta: 'text-blue-400' },
};

export default function StatCard({ valeur, label, delta, hausse, couleur }: Props) {
  const c = CONFIG[couleur];
  return (
    <div className="bg-s2 border border-bord rounded-xl p-4 relative overflow-hidden">
      <div className={`absolute top-0 left-0 right-0 h-0.5 ${c.bar}`}></div>
      <div className={`text-3xl font-black ${c.text} leading-none`}>{valeur}</div>
      <div className="text-[10px] text-t2 mt-1.5">{label}</div>
      <div className={`text-[9px] mt-2 ${hausse ? c.delta : 'text-green-400'}`}>
        {hausse ? '▲' : '▼'} {delta}
      </div>
    </div>
  );
}