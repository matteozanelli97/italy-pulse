// Italy Pulse — Tipi globali

export type CategoriaNotizia =
  | "politica"
  | "economia"
  | "cronaca"
  | "intrattenimento"
  | "scioperi";

export interface Regione {
  nome: string;
  slug: string;
  capoluogo: string;
  sentiment: number; // 0-100
  emoji: string;
  frase: string;
  fattori: FattoriSentiment;
}

export interface FattoriSentiment {
  umoreEconomico: number;    // 0-100
  climaPolitico: number;     // 0-100
  meteo: number;             // 0-100
  sentimentSocial: number;   // 0-100
  notizie: number;           // 0-100
  indiceCaos: number;        // 0-100
}

export interface PesiSentiment {
  umoreEconomico: number;
  climaPolitico: number;
  meteo: number;
  sentimentSocial: number;
  notizie: number;
  indiceCaos: number;
}

export interface MoodNazionaleData {
  valore: number;            // 0-100
  emoji: string;
  colore: string;            // hex color
  frase: string;
  aggiornamento: string;     // ISO timestamp
  fattori: FattoriSentiment;
}

export interface Notizia {
  id: string;
  titolo: string;
  sommario: string;
  fonte: string;
  categoria: CategoriaNotizia;
  timestamp: string;
  sentiment: "positivo" | "negativo" | "neutro";
  regione?: string;          // slug regione, opzionale
}

export interface DatiMercato {
  ftseMib: number;
  ftseMibVariazione: number;
  spreadBtp: number;
  spreadVariazione: number;
  prezzoBenzina: number;
  prezzoOro: number;
  oroVariazione: number;
  aggiornamento: string;
}

export interface DatiMeteo {
  citta: string;
  regione: string;
  temperatura: number;
  condizione: CondizioneMeteo;
  emoji: string;
}

export type CondizioneMeteo =
  | "sereno"
  | "nuvoloso"
  | "pioggia"
  | "temporale"
  | "neve"
  | "nebbia"
  | "variabile";

export interface TickerItem {
  label: string;
  valore: string;
  trend?: "up" | "down" | "stable";
}

export interface SentimentResponse {
  moodNazionale: MoodNazionaleData;
  regioni: Regione[];
}

export interface MeteoResponse {
  citta: DatiMeteo[];
  aggiornamento: string;
}

export interface MercatiResponse {
  dati: DatiMercato;
}

export interface NotizieResponse {
  notizie: Notizia[];
  aggiornamento: string;
}
