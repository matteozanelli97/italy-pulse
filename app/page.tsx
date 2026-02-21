import Link from "next/link";
import MoodNazionale from "@/components/MoodNazionale";
import MappaItalia from "@/components/MappaItalia";
import TickerLive from "@/components/TickerLive";
import NewsFeed from "@/components/NewsFeed";
import RegionCard from "@/components/RegionCard";
import { getRegioni } from "@/lib/regions";
import {
  calcolaMoodNazionale,
  calcolaFattoriNazionali,
} from "@/lib/sentiment/algorithm";
import { getMercatiTicker } from "@/lib/fetchers/mercati";
import { getTopCittaMeteo } from "@/lib/fetchers/meteo";
import { fetchNotizie, getUltimoSciopero } from "@/lib/fetchers/notizie";
import type { TickerItem, CategoriaNotizia } from "@/types";

const categorieNotizie: { label: string; value: CategoriaNotizia }[] = [
  { label: "Politica", value: "politica" },
  { label: "Economia", value: "economia" },
  { label: "Cronaca", value: "cronaca" },
  { label: "Intrattenimento", value: "intrattenimento" },
  { label: "Scioperi", value: "scioperi" },
];

export default function Home() {
  const regioni = getRegioni();
  const fattoriNazionali = calcolaFattoriNazionali(
    regioni.map((r) => r.fattori)
  );
  const moodNazionale = calcolaMoodNazionale(fattoriNazionali);
  const notizie = fetchNotizie();

  // Costruisci ticker items
  const mercatiTicker = getMercatiTicker();
  const meteoTop = getTopCittaMeteo(5);
  const ultimoSciopero = getUltimoSciopero();

  const meteoTicker: TickerItem[] = meteoTop.map((m) => ({
    label: m.citta,
    valore: `${m.emoji} ${m.temperatura}°C`,
    trend: "stable" as const,
  }));

  const scioperoTicker: TickerItem[] = ultimoSciopero
    ? [
        {
          label: "SCIOPERO",
          valore: ultimoSciopero.titolo.substring(0, 50) + "...",
          trend: "down" as const,
        },
      ]
    : [];

  const tickerItems: TickerItem[] = [
    ...mercatiTicker,
    ...meteoTicker,
    ...scioperoTicker,
  ];

  return (
    <div className="flex min-h-screen flex-col bg-[var(--background)]">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-[var(--grigio-chiaro)] bg-[var(--background)]/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          <Link href="/" className="flex items-center gap-2">
            <span
              className="text-3xl font-bold tracking-tight text-white"
              style={{
                fontFamily: "'Bebas Neue', sans-serif",
              }}
            >
              ITALY{" "}
              <span className="text-[var(--verde-italia)]">PULSE</span>
            </span>
          </Link>

          <nav className="hidden items-center gap-6 sm:flex">
            <Link
              href="/notizie"
              className="text-sm text-[var(--grigio-testo)] transition-colors hover:text-white"
            >
              Notizie
            </Link>
            <Link
              href="/economia"
              className="text-sm text-[var(--grigio-testo)] transition-colors hover:text-white"
            >
              Economia
            </Link>
          </nav>

          {/* Mobile nav */}
          <nav className="flex items-center gap-4 sm:hidden">
            <Link
              href="/notizie"
              className="text-xs text-[var(--grigio-testo)]"
            >
              Notizie
            </Link>
            <Link
              href="/economia"
              className="text-xs text-[var(--grigio-testo)]"
            >
              Economia
            </Link>
          </nav>
        </div>
      </header>

      {/* Ticker */}
      <TickerLive items={tickerItems} />

      <main className="mx-auto w-full max-w-7xl px-4 py-8">
        {/* Hero — Mood Nazionale */}
        <MoodNazionale data={moodNazionale} />

        {/* Separatore */}
        <div className="my-12 h-px bg-[var(--grigio-chiaro)]" />

        {/* Mappa Italia */}
        <section className="flex flex-col items-center gap-6">
          <h2
            className="text-sm font-medium uppercase tracking-[0.3em] text-[var(--grigio-testo)]"
          >
            Sentiment per Regione
          </h2>
          <MappaItalia regioni={regioni} />
        </section>

        {/* Separatore */}
        <div className="my-12 h-px bg-[var(--grigio-chiaro)]" />

        {/* Grid Regioni */}
        <section>
          <h2
            className="mb-6 text-sm font-medium uppercase tracking-[0.3em] text-[var(--grigio-testo)]"
          >
            Tutte le Regioni
          </h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {regioni
              .sort((a, b) => b.sentiment - a.sentiment)
              .map((regione, i) => (
                <RegionCard key={regione.slug} regione={regione} index={i} />
              ))}
          </div>
        </section>

        {/* Separatore */}
        <div className="my-12 h-px bg-[var(--grigio-chiaro)]" />

        {/* Notizie per categoria */}
        <section>
          <h2
            className="mb-6 text-sm font-medium uppercase tracking-[0.3em] text-[var(--grigio-testo)]"
          >
            Notizie del Giorno
          </h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {categorieNotizie.map(({ label, value }) => {
              const notizieCategoria = notizie.filter(
                (n) => n.categoria === value
              );
              if (notizieCategoria.length === 0) return null;
              return (
                <div
                  key={value}
                  className="rounded-lg border border-[var(--grigio-chiaro)] bg-[var(--grigio-scuro)] p-4"
                >
                  <h3 className="mb-3 text-xs font-bold uppercase tracking-widest text-[var(--grigio-testo)]">
                    {label}
                  </h3>
                  <NewsFeed
                    notizie={notizieCategoria}
                    categorie={[value]}
                  />
                </div>
              );
            })}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-[var(--grigio-chiaro)] bg-[var(--grigio-scuro)]">
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-2 px-4 py-6 text-center">
          <span
            className="text-xl font-bold tracking-tight text-white"
            style={{
              fontFamily: "'Bebas Neue', sans-serif",
            }}
          >
            ITALY <span className="text-[var(--verde-italia)]">PULSE</span>
          </span>
          <p className="text-xs text-[var(--grigio-testo)]">
            Il Mood Nazionale italiano, calcolato in tempo reale.
          </p>
          <p className="text-xs text-[var(--grigio-testo)]">
            Dati aggiornati al{" "}
            {new Date().toLocaleString("it-IT", {
              day: "2-digit",
              month: "long",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
          <p className="mt-2 text-[10px] text-[var(--grigio-testo)]">
            I dati mostrati sono a scopo dimostrativo. Italy Pulse non
            rappresenta un indice finanziario ufficiale.
          </p>
        </div>
      </footer>
    </div>
  );
}
