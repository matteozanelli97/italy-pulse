import type { Regione, FattoriSentiment } from "@/types";

interface RegioneConfig {
  nome: string;
  slug: string;
  capoluogo: string;
  sentiment: number;
  frase: string;
  fattori: FattoriSentiment;
}

const regioniConfig: RegioneConfig[] = [
  {
    nome: "Lombardia",
    slug: "lombardia",
    capoluogo: "Milano",
    sentiment: 61,
    frase: "Lavora, paga le tasse, si lamenta. Ciclo infinito.",
    fattori: { umoreEconomico: 72, climaPolitico: 55, meteo: 40, sentimentSocial: 65, notizie: 58, indiceCaos: 60 },
  },
  {
    nome: "Lazio",
    slug: "lazio",
    capoluogo: "Roma",
    sentiment: 29,
    frase: "Roma caput mundi, Roma caput chaos.",
    fattori: { umoreEconomico: 35, climaPolitico: 15, meteo: 50, sentimentSocial: 25, notizie: 20, indiceCaos: 85 },
  },
  {
    nome: "Campania",
    slug: "campania",
    capoluogo: "Napoli",
    sentiment: 33,
    frase: "Il caffè è perfetto. Il resto è in corso.",
    fattori: { umoreEconomico: 25, climaPolitico: 30, meteo: 65, sentimentSocial: 35, notizie: 28, indiceCaos: 70 },
  },
  {
    nome: "Sicilia",
    slug: "sicilia",
    capoluogo: "Palermo",
    sentiment: 38,
    frase: "Tutto bene tranne lo Stato, il traffico, e il caldo.",
    fattori: { umoreEconomico: 28, climaPolitico: 35, meteo: 55, sentimentSocial: 40, notizie: 32, indiceCaos: 65 },
  },
  {
    nome: "Veneto",
    slug: "veneto",
    capoluogo: "Venezia",
    sentiment: 71,
    frase: "Produttivo ma senza ringraziamenti.",
    fattori: { umoreEconomico: 78, climaPolitico: 65, meteo: 50, sentimentSocial: 72, notizie: 70, indiceCaos: 40 },
  },
  {
    nome: "Piemonte",
    slug: "piemonte",
    capoluogo: "Torino",
    sentiment: 64,
    frase: "Torinese, quindi sobrio. E orgoglioso.",
    fattori: { umoreEconomico: 68, climaPolitico: 60, meteo: 45, sentimentSocial: 66, notizie: 62, indiceCaos: 50 },
  },
  {
    nome: "Emilia-Romagna",
    slug: "emilia-romagna",
    capoluogo: "Bologna",
    sentiment: 73,
    frase: "Tortellini, motori e cooperazione. Funziona.",
    fattori: { umoreEconomico: 80, climaPolitico: 68, meteo: 48, sentimentSocial: 75, notizie: 72, indiceCaos: 35 },
  },
  {
    nome: "Toscana",
    slug: "toscana",
    capoluogo: "Firenze",
    sentiment: 58,
    frase: "Culturalmente superiore, economicamente nella media.",
    fattori: { umoreEconomico: 55, climaPolitico: 58, meteo: 62, sentimentSocial: 60, notizie: 55, indiceCaos: 45 },
  },
  {
    nome: "Puglia",
    slug: "puglia",
    capoluogo: "Bari",
    sentiment: 52,
    frase: "Il mare compensa tutto, anche la burocrazia.",
    fattori: { umoreEconomico: 42, climaPolitico: 50, meteo: 75, sentimentSocial: 55, notizie: 48, indiceCaos: 50 },
  },
  {
    nome: "Calabria",
    slug: "calabria",
    capoluogo: "Catanzaro",
    sentiment: 31,
    frase: "Resilienza livello: infinito.",
    fattori: { umoreEconomico: 22, climaPolitico: 28, meteo: 60, sentimentSocial: 30, notizie: 25, indiceCaos: 72 },
  },
  {
    nome: "Sardegna",
    slug: "sardegna",
    capoluogo: "Cagliari",
    sentiment: 45,
    frase: "Autonomia sì, ma con il mare.",
    fattori: { umoreEconomico: 38, climaPolitico: 45, meteo: 70, sentimentSocial: 42, notizie: 40, indiceCaos: 48 },
  },
  {
    nome: "Liguria",
    slug: "liguria",
    capoluogo: "Genova",
    sentiment: 47,
    frase: "Parsimoniosa per vocazione, non per scelta.",
    fattori: { umoreEconomico: 45, climaPolitico: 42, meteo: 55, sentimentSocial: 48, notizie: 45, indiceCaos: 55 },
  },
  {
    nome: "Marche",
    slug: "marche",
    capoluogo: "Ancona",
    sentiment: 55,
    frase: "Nessuno sa dove siamo, e ci va bene così.",
    fattori: { umoreEconomico: 52, climaPolitico: 55, meteo: 58, sentimentSocial: 54, notizie: 55, indiceCaos: 42 },
  },
  {
    nome: "Abruzzo",
    slug: "abruzzo",
    capoluogo: "L'Aquila",
    sentiment: 50,
    frase: "Forte e gentile, come dice lo slogan.",
    fattori: { umoreEconomico: 45, climaPolitico: 50, meteo: 55, sentimentSocial: 50, notizie: 48, indiceCaos: 48 },
  },
  {
    nome: "Friuli Venezia Giulia",
    slug: "friuli-venezia-giulia",
    capoluogo: "Trieste",
    sentiment: 67,
    frase: "Mitteleuropei dentro, italiani per contratto.",
    fattori: { umoreEconomico: 70, climaPolitico: 62, meteo: 45, sentimentSocial: 68, notizie: 65, indiceCaos: 38 },
  },
  {
    nome: "Trentino-Alto Adige",
    slug: "trentino-alto-adige",
    capoluogo: "Trento",
    sentiment: 78,
    frase: "Tutto funziona. Sospettosamente bene.",
    fattori: { umoreEconomico: 82, climaPolitico: 72, meteo: 60, sentimentSocial: 80, notizie: 78, indiceCaos: 20 },
  },
  {
    nome: "Umbria",
    slug: "umbria",
    capoluogo: "Perugia",
    sentiment: 56,
    frase: "Il cuore verde d'Italia batte piano.",
    fattori: { umoreEconomico: 50, climaPolitico: 55, meteo: 60, sentimentSocial: 56, notizie: 55, indiceCaos: 40 },
  },
  {
    nome: "Basilicata",
    slug: "basilicata",
    capoluogo: "Potenza",
    sentiment: 36,
    frase: "Matera è patrimonio UNESCO. Il resto attende.",
    fattori: { umoreEconomico: 28, climaPolitico: 35, meteo: 55, sentimentSocial: 32, notizie: 30, indiceCaos: 58 },
  },
  {
    nome: "Molise",
    slug: "molise",
    capoluogo: "Campobasso",
    sentiment: 42,
    frase: "Esiste. Fine della discussione.",
    fattori: { umoreEconomico: 35, climaPolitico: 42, meteo: 50, sentimentSocial: 40, notizie: 38, indiceCaos: 45 },
  },
  {
    nome: "Valle d'Aosta",
    slug: "valle-d-aosta",
    capoluogo: "Aosta",
    sentiment: 69,
    frase: "Piccola, autonoma, e con le montagne giuste.",
    fattori: { umoreEconomico: 72, climaPolitico: 65, meteo: 55, sentimentSocial: 70, notizie: 68, indiceCaos: 30 },
  },
];

function getSentimentEmoji(valore: number): string {
  if (valore >= 80) return "🟢";
  if (valore >= 60) return "😊";
  if (valore >= 40) return "😐";
  if (valore >= 20) return "😟";
  return "🔴";
}

export function getRegioni(): Regione[] {
  return regioniConfig.map((r) => ({
    ...r,
    emoji: getSentimentEmoji(r.sentiment),
  }));
}

export function getRegioneBySlug(slug: string): Regione | undefined {
  const config = regioniConfig.find((r) => r.slug === slug);
  if (!config) return undefined;
  return {
    ...config,
    emoji: getSentimentEmoji(config.sentiment),
  };
}

export function getAllSlugs(): string[] {
  return regioniConfig.map((r) => r.slug);
}

export function getSentimentColore(valore: number): string {
  // Interpolazione: rosso (0) → giallo (50) → verde (100)
  if (valore <= 50) {
    const ratio = valore / 50;
    const r = Math.round(206 + (255 - 206) * (1 - ratio));
    const g = Math.round(43 + (200 - 43) * ratio);
    const b = Math.round(55 + (0 - 55) * ratio);
    return `rgb(${r}, ${g}, ${b})`;
  }
  const ratio = (valore - 50) / 50;
  const r = Math.round(255 + (0 - 255) * ratio);
  const g = Math.round(200 + (146 - 200) * ratio + 54 * ratio);
  const b = Math.round(0 + (70 - 0) * ratio);
  return `rgb(${r}, ${g}, ${b})`;
}
