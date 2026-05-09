export type NiveauAcces = 'public' | 'professionnel';
export type StatutAlerte = 'active' | 'en_cours' | 'resolue';
export type TypeEtablissement = 'hopital' | 'clinique' | 'dispensaire' | 'cs';

export interface Alerte {
  id:          string;
  nom:         string;
  prenom:      string;
  groupeSanguin: string;
  electrophorese?: string;
  latitude:    number;
  longitude:   number;
  adresse:     string;
  statut:      StatutAlerte;
  timestamp:   string;
  minutesEcoulees: number;
  contacts:    ContactUrgence[];
  vehicule?:   string;
}

export interface ContactUrgence {
  nom:      string;
  telephone: string;
  relation?: string;
}

export interface ScanRecord {
  id:           string;
  nom:          string;
  prenom:       string;
  initiales:    string;
  timestamp:    string;
  lieu:         string;
  codeAcces?:   string;
  niveau:       NiveauAcces;
  statut?:      'sos' | 'normal';
}

export interface StatsDashboard {
  alertesActives:     number;
  interventions:      number;
  tempsReponse:       number;
  scansAujourdhui:    number;
  deltaAlertes:       number;
  deltaInterventions: number;
  deltaTemps:         number;
  deltaScans:         number;
}

export interface MembreEquipe {
  id:        string;
  nom:       string;
  initiales: string;
  role:      string;
  unite:     string;
  statut:    'disponible' | 'en_intervention' | 'hors_service';
}