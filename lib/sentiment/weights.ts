import type { PesiSentiment } from "@/types";
import pesiConfig from "@/config/sentiment-weights.json";

export const pesi: PesiSentiment = pesiConfig;

// Nomi leggibili per la UI
export const nomiPesi: Record<keyof PesiSentiment, string> = {
  umoreEconomico: "Umore Economico",
  climaPolitico: "Clima Politico",
  meteo: "Meteo Nazionale",
  sentimentSocial: "Sentiment Social",
  notizie: "Notizie del Giorno",
  indiceCaos: "Indice Caos",
};

// Emoji per ogni fattore
export const emojiPesi: Record<keyof PesiSentiment, string> = {
  umoreEconomico: "📈",
  climaPolitico: "🏛️",
  meteo: "☀️",
  sentimentSocial: "💬",
  notizie: "📰",
  indiceCaos: "⚠️",
};
