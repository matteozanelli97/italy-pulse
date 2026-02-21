// Frasi ironiche per il Mood Nazionale, divise per fascia di sentiment

interface FasciaIronica {
  min: number;
  max: number;
  frasi: string[];
  emoji: string;
}

const fasce: FasciaIronica[] = [
  {
    min: 0,
    max: 20,
    emoji: "💀",
    frasi: [
      "Oggi è meglio restare a letto.",
      "L'Italia ha visto giorni migliori. Tipo il Rinascimento.",
      "Situazione critica: si consiglia spritz terapeutico.",
      "Il Paese è in modalità sopravvivenza.",
      "Neanche il caffè può salvare questa giornata.",
    ],
  },
  {
    min: 20,
    max: 40,
    emoji: "😤",
    frasi: [
      "Si potrebbe andare peggio. Aspetta domani.",
      "L'umore nazionale richiede un intervento strutturale.",
      "Italia in fase di manutenzione ordinaria (straordinaria).",
      "Giornata da dimenticare, come le promesse elettorali.",
      "Il sentiment è basso come la pazienza degli italiani.",
    ],
  },
  {
    min: 40,
    max: 60,
    emoji: "😐",
    frasi: [
      "Né bene né male. Come il Wi-Fi in autostrada.",
      "L'Italia è in standby. Come sempre, del resto.",
      "Giornata nella media. Che per l'Italia è già un risultato.",
      "Tutto nella norma: traffico, lamentele, e buon cibo.",
      "Mood stabile. Miracolosamente.",
    ],
  },
  {
    min: 60,
    max: 80,
    emoji: "😊",
    frasi: [
      "Giornata positiva. Qualcuno controlli se è vero.",
      "L'Italia sorride. Forse è il sole.",
      "Oggi va bene. Non dite niente, non portateci sfortuna.",
      "Umore alto. Sarà l'effetto della carbonara.",
      "Il Paese funziona. Ripetiamo: il Paese funziona.",
    ],
  },
  {
    min: 80,
    max: 100,
    emoji: "🇮🇹",
    frasi: [
      "Italia al massimo. Convocate la Nazionale.",
      "Tutto perfetto. Controllate se siamo ancora in Italia.",
      "Mood eccellente. Il Rinascimento è tornato.",
      "Giornata storica: zero scioperi, zero ritardi.",
      "Italia in vetta. Come nei Mondiali dell'82.",
    ],
  },
];

export function getFraseIronica(valore: number): string {
  const fascia = fasce.find((f) => valore >= f.min && valore < f.max) ?? fasce[fasce.length - 1];
  const indice = Math.floor(Math.random() * fascia.frasi.length);
  return fascia.frasi[indice];
}

export function getEmojiMood(valore: number): string {
  const fascia = fasce.find((f) => valore >= f.min && valore < f.max) ?? fasce[fasce.length - 1];
  return fascia.emoji;
}

// Versione deterministica basata sul giorno (per evitare cambi ad ogni render)
export function getFraseIronicaDeterministica(valore: number): string {
  const fascia = fasce.find((f) => valore >= f.min && valore < f.max) ?? fasce[fasce.length - 1];
  const oggi = new Date();
  const indice = (oggi.getDate() + oggi.getMonth()) % fascia.frasi.length;
  return fascia.frasi[indice];
}
