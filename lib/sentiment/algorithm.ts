import type { FattoriSentiment, MoodNazionaleData } from "@/types";
import { pesi } from "./weights";
import { getFraseIronicaDeterministica, getEmojiMood } from "./irony";
import { getSentimentColore } from "@/lib/regions";

// Calcola il Mood Nazionale composito da fattori multipli
export function calcolaMoodNazionale(fattori: FattoriSentiment): MoodNazionaleData {
  const valore = Math.round(
    fattori.umoreEconomico * pesi.umoreEconomico +
    fattori.climaPolitico * pesi.climaPolitico +
    fattori.meteo * pesi.meteo +
    fattori.sentimentSocial * pesi.sentimentSocial +
    fattori.notizie * pesi.notizie +
    // Indice Caos è invertito: alto caos = basso sentiment
    (100 - fattori.indiceCaos) * pesi.indiceCaos
  );

  const valoreClampato = Math.max(0, Math.min(100, valore));

  return {
    valore: valoreClampato,
    emoji: getEmojiMood(valoreClampato),
    colore: getSentimentColore(valoreClampato),
    frase: getFraseIronicaDeterministica(valoreClampato),
    aggiornamento: new Date().toISOString(),
    fattori,
  };
}

// Calcola la media dei fattori di tutte le regioni per il Mood Nazionale
export function calcolaFattoriNazionali(
  fattoriRegionali: FattoriSentiment[]
): FattoriSentiment {
  const n = fattoriRegionali.length;
  if (n === 0) {
    return {
      umoreEconomico: 50,
      climaPolitico: 50,
      meteo: 50,
      sentimentSocial: 50,
      notizie: 50,
      indiceCaos: 50,
    };
  }

  return {
    umoreEconomico: Math.round(
      fattoriRegionali.reduce((sum, f) => sum + f.umoreEconomico, 0) / n
    ),
    climaPolitico: Math.round(
      fattoriRegionali.reduce((sum, f) => sum + f.climaPolitico, 0) / n
    ),
    meteo: Math.round(
      fattoriRegionali.reduce((sum, f) => sum + f.meteo, 0) / n
    ),
    sentimentSocial: Math.round(
      fattoriRegionali.reduce((sum, f) => sum + f.sentimentSocial, 0) / n
    ),
    notizie: Math.round(
      fattoriRegionali.reduce((sum, f) => sum + f.notizie, 0) / n
    ),
    indiceCaos: Math.round(
      fattoriRegionali.reduce((sum, f) => sum + f.indiceCaos, 0) / n
    ),
  };
}
