import Link from "next/link";
import { notFound } from "next/navigation";
import { getRegioneBySlug, getAllSlugs, getSentimentColore } from "@/lib/regions";
import { fetchNotizieByRegione } from "@/lib/fetchers/notizie";
import { fetchMeteoByRegione } from "@/lib/fetchers/meteo";
import { nomiPesi, emojiPesi } from "@/lib/sentiment/weights";
import { pesi } from "@/lib/sentiment/weights";
import NewsFeed from "@/components/NewsFeed";
import type { PesiSentiment } from "@/types";

export function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }));
}

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function RegionePage({ params }: PageProps) {
  const { slug } = await params;
  const regione = getRegioneBySlug(slug);

  if (!regione) {
    notFound();
  }

  const notizie = fetchNotizieByRegione(slug);
  const meteo = fetchMeteoByRegione(slug);
  const colore = getSentimentColore(regione.sentiment);
  const fattoriKeys = Object.keys(regione.fattori) as (keyof PesiSentiment)[];

  return (
    <div className="flex min-h-screen flex-col bg-[var(--background)]">
      {/* Header */}
      <header className="border-b border-[var(--grigio-chiaro)] bg-[var(--background)]">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <Link href="/" className="flex items-center gap-2">
            <span
              className="text-2xl font-bold tracking-tight text-white"
              style={{
                fontFamily: "'Bebas Neue', sans-serif",
              }}
            >
              ITALY{" "}
              <span className="text-[var(--verde-italia)]">PULSE</span>
            </span>
          </Link>
          <Link
            href="/"
            className="text-sm text-[var(--grigio-testo)] transition-colors hover:text-white"
          >
            Torna alla mappa
          </Link>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl px-4 py-8">
        {/* Hero regione */}
        <section className="flex flex-col items-center gap-4 py-8">
          <span className="text-xs font-medium uppercase tracking-[0.3em] text-[var(--grigio-testo)]">
            {regione.capoluogo}
          </span>
          <h1
            className="text-5xl font-bold tracking-tight text-white sm:text-6xl"
            style={{
              fontFamily: "'Bebas Neue', sans-serif",
            }}
          >
            {regione.nome}
          </h1>

          {/* Sentiment numero */}
          <div className="flex items-center gap-4">
            <span
              className="text-8xl font-bold leading-none"
              style={{
                color: colore,
                fontFamily: "'Bebas Neue', sans-serif",
              }}
            >
              {regione.sentiment}
            </span>
            <div className="flex flex-col">
              <span className="text-3xl">{regione.emoji}</span>
              <span className="text-xs text-[var(--grigio-testo)]">/ 100</span>
            </div>
          </div>

          {/* Barra sentiment */}
          <div className="h-2 w-full max-w-md overflow-hidden rounded-full bg-[var(--grigio-medio)]">
            <div
              className="h-full rounded-full"
              style={{
                width: `${regione.sentiment}%`,
                backgroundColor: colore,
              }}
            />
          </div>

          {/* Frase ironica */}
          <p className="max-w-md text-center text-lg italic text-[var(--grigio-testo)]">
            &ldquo;{regione.frase}&rdquo;
          </p>
        </section>

        <div className="my-8 h-px bg-[var(--grigio-chiaro)]" />

        {/* Breakdown fattori */}
        <section>
          <h2 className="mb-4 text-sm font-medium uppercase tracking-[0.3em] text-[var(--grigio-testo)]">
            Breakdown Fattori
          </h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {fattoriKeys.map((key) => {
              const valore = regione.fattori[key];
              const peso = pesi[key];
              const fattoreColore = getSentimentColore(valore);

              return (
                <div
                  key={key}
                  className="flex flex-col gap-2 rounded-lg border border-[var(--grigio-chiaro)] bg-[var(--grigio-scuro)] p-4"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{emojiPesi[key]}</span>
                    <span className="text-xs text-[var(--grigio-testo)]">
                      {nomiPesi[key]}
                    </span>
                  </div>
                  <span
                    className="text-3xl font-bold"
                    style={{
                      color: fattoreColore,
                      fontFamily: "'Bebas Neue', sans-serif",
                    }}
                  >
                    {valore}
                  </span>
                  <div className="h-1 w-full overflow-hidden rounded-full bg-[var(--grigio-medio)]">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${valore}%`,
                        backgroundColor: fattoreColore,
                      }}
                    />
                  </div>
                  <span className="text-[10px] text-[var(--grigio-testo)]">
                    Peso: {Math.round(peso * 100)}%
                  </span>
                </div>
              );
            })}
          </div>
        </section>

        <div className="my-8 h-px bg-[var(--grigio-chiaro)]" />

        {/* Meteo locale */}
        {meteo && (
          <section className="mb-8">
            <h2 className="mb-4 text-sm font-medium uppercase tracking-[0.3em] text-[var(--grigio-testo)]">
              Meteo — {meteo.citta}
            </h2>
            <div className="inline-flex items-center gap-4 rounded-lg border border-[var(--grigio-chiaro)] bg-[var(--grigio-scuro)] px-6 py-4">
              <span className="text-4xl">{meteo.emoji}</span>
              <div>
                <span
                  className="text-4xl font-bold text-white"
                  style={{
                    fontFamily: "'Bebas Neue', sans-serif",
                  }}
                >
                  {meteo.temperatura}°C
                </span>
                <p className="text-xs capitalize text-[var(--grigio-testo)]">
                  {meteo.condizione}
                </p>
              </div>
            </div>
          </section>
        )}

        {/* Notizie locali */}
        {notizie.length > 0 && (
          <section>
            <h2 className="mb-4 text-sm font-medium uppercase tracking-[0.3em] text-[var(--grigio-testo)]">
              Notizie Locali
            </h2>
            <div className="rounded-lg border border-[var(--grigio-chiaro)] bg-[var(--grigio-scuro)] p-4">
              <NewsFeed notizie={notizie} />
            </div>
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-[var(--grigio-chiaro)] bg-[var(--grigio-scuro)]">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
          <Link
            href="/"
            className="text-xs text-[var(--grigio-testo)] hover:text-white"
          >
            ← Torna alla mappa
          </Link>
          <span
            className="text-sm font-bold text-white"
            style={{
              fontFamily: "'Bebas Neue', sans-serif",
            }}
          >
            ITALY <span className="text-[var(--verde-italia)]">PULSE</span>
          </span>
        </div>
      </footer>
    </div>
  );
}
