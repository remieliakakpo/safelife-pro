// src/lib/realtime.ts
import { supabase } from './supabase';
import { RealtimeChannel } from '@supabase/supabase-js';

type AlerteHandler    = (alerte: any)  => void;
type StatutHandler    = (data: any)    => void;
type ConnexionHandler = (ok: boolean)  => void;

class LotisecRealtime {
  private channel:        RealtimeChannel | null = null;
  private alerteHandlers: AlerteHandler[]        = [];
  private statutHandlers: StatutHandler[]        = [];
  private connexionCbs:   ConnexionHandler[]     = [];
  private _connected      = false;

  connect() {
    if (this.channel) return;
    console.log('🔌 LOTISEC Realtime — connexion Supabase...');

    this.channel = supabase
      .channel('lotisec-alertes', {
        config: { broadcast: { self: true } },
      })
      .on(
        'postgres_changes' as const,
        { event: 'INSERT', schema: 'public', table: 'alerte_events' },
        (payload: { new: Record<string, any> }) => {
          console.log('🚨 NOUVELLE ALERTE:', payload.new);
          const alerte = this.mapAlerte(payload.new);
          this.alerteHandlers.forEach(h => h({ type: 'NOUVELLE_ALERTE', ...alerte }));
        }
      )
      .on(
        'postgres_changes' as const,
        { event: 'UPDATE', schema: 'public', table: 'alerte_events' },
        (payload: { new: Record<string, any> }) => {
          const row = payload.new;
          if (row['statut'] === 'resolue') {
            this.statutHandlers.forEach(h => h({ type: 'ALERTE_RESOLUE', id: row['id'] }));
          } else {
            this.statutHandlers.forEach(h => h({
              type:   'ALERTE_MISE_A_JOUR',
              id:     row['id'],
              statut: row['statut'],
            }));
          }
        }
      )
      .on(
        'postgres_changes' as const,
        { event: 'INSERT', schema: 'public', table: 'accident_events' },
        (payload: { new: Record<string, any> }) => {
          this.statutHandlers.forEach(h => h({
            type: 'NOUVEL_ACCIDENT',
            ...payload.new,
          }));
        }
      )
      .subscribe((status: string) => {
        this._connected = status === 'SUBSCRIBED';
        console.log(`📡 Supabase Realtime: ${status}`);
        this.connexionCbs.forEach(h => h(this._connected));
      });
  }

  onNouvealleAlerte(handler: AlerteHandler): () => void {
    this.alerteHandlers.push(handler);
    return () => {
      this.alerteHandlers = this.alerteHandlers.filter(h => h !== handler);
    };
  }

  onStatut(handler: StatutHandler): () => void {
    this.statutHandlers.push(handler);
    return () => {
      this.statutHandlers = this.statutHandlers.filter(h => h !== handler);
    };
  }

  onConnexion(handler: ConnexionHandler): () => void {
    this.connexionCbs.push(handler);
    return () => {
      this.connexionCbs = this.connexionCbs.filter(h => h !== handler);
    };
  }

  disconnect() {
    if (this.channel) {
      supabase.removeChannel(this.channel);
      this.channel = null;
    }
    this._connected = false;
  }

  get isConnected() { return this._connected; }

  private mapAlerte(row: Record<string, any>) {
    return {
      id:             row['id'],
      prenom:         row['prenom']         || 'Inconnu',
      nom:            row['nom']            || '',
      groupeSanguin:  row['groupe_sanguin'] || '?',
      electrophorese: row['electrophorese'] || null,
      latitude:       row['latitude'],
      longitude:      row['longitude'],
      adresse:        row['adresse']        || 'Position GPS',
      vehicule:       row['vehicle_type']   || 'moto',
      statut:         row['statut']         || 'active',
      timestamp:      row['timestamp']      || new Date().toISOString(),
      minutesEcoulees: 0,
      contacts:       [],
    };
  }
}

export const lotisecRealtime = new LotisecRealtime();