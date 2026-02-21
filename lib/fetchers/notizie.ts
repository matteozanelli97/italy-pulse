import type { Notizia, CategoriaNotizia } from "@/types";

// Notizie mock realistiche e plausibili
const notizieMock: Notizia[] = [
  {
    id: "1",
    titolo: "Il governo annuncia nuovi incentivi per le energie rinnovabili",
    sommario: "Il piano prevede 2 miliardi di investimenti nel fotovoltaico e nell'eolico entro il 2028.",
    fonte: "ANSA",
    categoria: "politica",
    timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    sentiment: "positivo",
  },
  {
    id: "2",
    titolo: "Spread BTP-Bund in calo: mercati reagiscono bene alla manovra",
    sommario: "Lo spread scende sotto i 140 punti base, ai minimi da tre mesi.",
    fonte: "Il Sole 24 Ore",
    categoria: "economia",
    timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    sentiment: "positivo",
  },
  {
    id: "3",
    titolo: "Sciopero dei trasporti venerdì: bus e metro a rischio in tutta Italia",
    sommario: "Le organizzazioni sindacali confermano 24 ore di stop per il trasporto pubblico locale.",
    fonte: "Repubblica",
    categoria: "scioperi",
    timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
    sentiment: "negativo",
  },
  {
    id: "4",
    titolo: "Maltempo al Nord: allerta arancione in Lombardia e Veneto",
    sommario: "Previste forti piogge e rischio esondazioni lungo il Po. Scuole chiuse in alcune province.",
    fonte: "Corriere della Sera",
    categoria: "cronaca",
    timestamp: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
    sentiment: "negativo",
    regione: "lombardia",
  },
  {
    id: "5",
    titolo: "L'Italia vince ai David di Donatello con sei premi",
    sommario: "Il cinema italiano celebra una serata memorabile con riconoscimenti internazionali.",
    fonte: "Sky TG24",
    categoria: "intrattenimento",
    timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    sentiment: "positivo",
  },
  {
    id: "6",
    titolo: "Crisi politica: tensioni nella maggioranza sul ddl concorrenza",
    sommario: "Scontro tra i partiti della coalizione sui balneari e le concessioni.",
    fonte: "La Stampa",
    categoria: "politica",
    timestamp: new Date(Date.now() - 1000 * 60 * 150).toISOString(),
    sentiment: "negativo",
  },
  {
    id: "7",
    titolo: "Export made in Italy: record storico per il settore agroalimentare",
    sommario: "Le esportazioni di prodotti alimentari italiani superano i 60 miliardi di euro.",
    fonte: "Il Sole 24 Ore",
    categoria: "economia",
    timestamp: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
    sentiment: "positivo",
  },
  {
    id: "8",
    titolo: "Sciopero aereo confermato: voli cancellati da Fiumicino e Malpensa",
    sommario: "Il personale di terra incrocia le braccia per 4 ore. Disagi per i passeggeri.",
    fonte: "ANSA",
    categoria: "scioperi",
    timestamp: new Date(Date.now() - 1000 * 60 * 200).toISOString(),
    sentiment: "negativo",
  },
  {
    id: "9",
    titolo: "Napoli: scoperto un nuovo sito archeologico sotto il centro storico",
    sommario: "Gli scavi della metro portano alla luce resti di un antico mercato romano.",
    fonte: "Il Mattino",
    categoria: "cronaca",
    timestamp: new Date(Date.now() - 1000 * 60 * 240).toISOString(),
    sentiment: "positivo",
    regione: "campania",
  },
  {
    id: "10",
    titolo: "Festival di Sanremo: polemiche sui biglietti e prezzi alle stelle",
    sommario: "I biglietti per la serata finale hanno raggiunto i 3.000 euro sul mercato secondario.",
    fonte: "Repubblica",
    categoria: "intrattenimento",
    timestamp: new Date(Date.now() - 1000 * 60 * 300).toISOString(),
    sentiment: "negativo",
  },
  {
    id: "11",
    titolo: "PIL italiano in crescita: +0.3% nel quarto trimestre",
    sommario: "I dati ISTAT confermano una ripresa modesta ma costante dell'economia nazionale.",
    fonte: "Il Sole 24 Ore",
    categoria: "economia",
    timestamp: new Date(Date.now() - 1000 * 60 * 360).toISOString(),
    sentiment: "positivo",
  },
  {
    id: "12",
    titolo: "Roma: disservizi sulla linea metro B, pendolari infuriati",
    sommario: "Guasti tecnici causano ritardi fino a 40 minuti nelle ore di punta.",
    fonte: "Il Messaggero",
    categoria: "cronaca",
    timestamp: new Date(Date.now() - 1000 * 60 * 420).toISOString(),
    sentiment: "negativo",
    regione: "lazio",
  },
];

export function fetchNotizie(): Notizia[] {
  return [...notizieMock];
}

export function fetchNotizieByCategoria(categoria: CategoriaNotizia): Notizia[] {
  return notizieMock.filter((n) => n.categoria === categoria);
}

export function fetchNotizieByRegione(slug: string): Notizia[] {
  return notizieMock.filter((n) => n.regione === slug);
}

export function getUltimoSciopero(): Notizia | undefined {
  return notizieMock.find((n) => n.categoria === "scioperi");
}
