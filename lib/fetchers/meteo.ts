import type { DatiMeteo, CondizioneMeteo } from "@/types";

interface MeteoConfig {
  citta: string;
  regione: string;
  temperatura: number;
  condizione: CondizioneMeteo;
  emoji: string;
}

// Dati meteo mock realistici per febbraio
const meteoMock: MeteoConfig[] = [
  { citta: "Milano", regione: "lombardia", temperatura: 6, condizione: "nebbia", emoji: "🌫️" },
  { citta: "Roma", regione: "lazio", temperatura: 12, condizione: "variabile", emoji: "⛅" },
  { citta: "Napoli", regione: "campania", temperatura: 13, condizione: "nuvoloso", emoji: "☁️" },
  { citta: "Torino", regione: "piemonte", temperatura: 4, condizione: "sereno", emoji: "☀️" },
  { citta: "Palermo", regione: "sicilia", temperatura: 15, condizione: "sereno", emoji: "☀️" },
  { citta: "Bologna", regione: "emilia-romagna", temperatura: 7, condizione: "nebbia", emoji: "🌫️" },
  { citta: "Firenze", regione: "toscana", temperatura: 9, condizione: "variabile", emoji: "⛅" },
  { citta: "Bari", regione: "puglia", temperatura: 11, condizione: "sereno", emoji: "☀️" },
  { citta: "Venezia", regione: "veneto", temperatura: 5, condizione: "nuvoloso", emoji: "☁️" },
  { citta: "Genova", regione: "liguria", temperatura: 10, condizione: "pioggia", emoji: "🌧️" },
  { citta: "Cagliari", regione: "sardegna", temperatura: 14, condizione: "sereno", emoji: "☀️" },
  { citta: "Catanzaro", regione: "calabria", temperatura: 10, condizione: "pioggia", emoji: "🌧️" },
  { citta: "Trieste", regione: "friuli-venezia-giulia", temperatura: 6, condizione: "variabile", emoji: "⛅" },
  { citta: "Trento", regione: "trentino-alto-adige", temperatura: 2, condizione: "neve", emoji: "❄️" },
  { citta: "Ancona", regione: "marche", temperatura: 8, condizione: "nuvoloso", emoji: "☁️" },
  { citta: "Perugia", regione: "umbria", temperatura: 7, condizione: "variabile", emoji: "⛅" },
  { citta: "L'Aquila", regione: "abruzzo", temperatura: 3, condizione: "neve", emoji: "❄️" },
  { citta: "Potenza", regione: "basilicata", temperatura: 5, condizione: "nuvoloso", emoji: "☁️" },
  { citta: "Campobasso", regione: "molise", temperatura: 4, condizione: "nuvoloso", emoji: "☁️" },
  { citta: "Aosta", regione: "valle-d-aosta", temperatura: -1, condizione: "neve", emoji: "❄️" },
];

export function fetchMeteo(): DatiMeteo[] {
  return meteoMock;
}

export function fetchMeteoByCitta(citta: string): DatiMeteo | undefined {
  return meteoMock.find(
    (m) => m.citta.toLowerCase() === citta.toLowerCase()
  );
}

export function fetchMeteoByRegione(slug: string): DatiMeteo | undefined {
  return meteoMock.find((m) => m.regione === slug);
}

export function getTopCittaMeteo(n: number = 5): DatiMeteo[] {
  return meteoMock.slice(0, n);
}
