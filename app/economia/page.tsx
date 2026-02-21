import Link from "next/link";
import { fetchMercati } from "@/lib/fetchers/mercati";
import { getSentimentColore } from "@/lib/regions";

export default function EconomiaPage() {
  const mercati = fetchMercati();

  const indicatori = [
    {
      label: "FTSE MIB",
      valore: mercati.ftseMib.toLocaleString("it-IT", {
        minimumFractionDigits: 2,
      }),
      variazione: mercati.ftseMibVariazione,
      unita: "",
      descrizione: "Indice principale della Borsa Italiana",
    },
    {
      label: "Spread BTP-Bund",
      valore: mercati.spreadBtp.toString(),
      variazione: mercati.spreadVariazione,
      unita: "bps",
      descrizione: "Differenziale rendimento titoli di Stato Italia-Germania",
    },
    {
      label: "Benzina",
      valore: `€${mercati.prezzoBenzina.toFixed(3)}`,
      variazione: 0,
      unita: "/L",
      descrizione: "Prezzo medio benzina self-service",
    },
    {
      label: "Oro",
      valore: `$${mercati.prezzoOro.toLocaleString("it-IT", {
        minimumFractionDigits: 2,
      })}`,
      variazione: mercati.oroVariazione,
      unita: "/oz",
      descrizione: "Prezzo dell'oro sui mercati internazionali",
    },
  ];

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
          <nav className="flex items-center gap-4">
            <Link
              href="/"
              className="text-sm text-[var(--grigio-testo)] transition-colors hover:text-white"
            >
              Home
            </Link>
            <Link
              href="/notizie"
              className="text-sm text-[var(--grigio-testo)] transition-colors hover:text-white"
            >
              Notizie
            </Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl px-4 py-8">
        <h1
          className="mb-2 text-4xl font-bold tracking-tight text-white"
          style={{
            fontFamily: "'Bebas Neue', sans-serif",
          }}
        >
          Economia
        </h1>
        <p className="mb-8 text-sm text-[var(--grigio-testo)]">
          Indicatori economici italiani in tempo reale
        </p>

        {/* Grid indicatori */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {indicatori.map((ind) => {
            const isPositive = ind.variazione > 0;
            const isNegative = ind.variazione < 0;
            // Per lo spread, un calo è positivo
            const sentimentScore =
              ind.label === "Spread BTP-Bund"
                ? isNegative
                  ? 70
                  : isPositive
                    ? 30
                    : 50
                : isPositive
                  ? 70
                  : isNegative
                    ? 30
                    : 50;

            return (
              <div
                key={ind.label}
                className="flex flex-col gap-3 rounded-lg border border-[var(--grigio-chiaro)] bg-[var(--grigio-scuro)] p-6"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-widest text-[var(--grigio-testo)]">
                    {ind.label}
                  </span>
                  {ind.variazione !== 0 && (
                    <span
                      className="text-xs font-bold"
                      style={{ color: getSentimentColore(sentimentScore) }}
                    >
                      {ind.variazione > 0 ? "▲" : "▼"}{" "}
                      {ind.variazione > 0 ? "+" : ""}
                      {ind.label === "Spread BTP-Bund"
                        ? ind.variazione
                        : `${ind.variazione}%`}
                    </span>
                  )}
                </div>

                <div className="flex items-baseline gap-1">
                  <span
                    className="text-5xl font-bold text-white"
                    style={{
                      fontFamily:
                        "'Bebas Neue', sans-serif",
                    }}
                  >
                    {ind.valore}
                  </span>
                  {ind.unita && (
                    <span className="text-sm text-[var(--grigio-testo)]">
                      {ind.unita}
                    </span>
                  )}
                </div>

                <p className="text-xs text-[var(--grigio-testo)]">
                  {ind.descrizione}
                </p>
              </div>
            );
          })}
        </div>

        <div className="my-8 h-px bg-[var(--grigio-chiaro)]" />

        {/* Umore Economico */}
        <section>
          <h2 className="mb-4 text-sm font-medium uppercase tracking-[0.3em] text-[var(--grigio-testo)]">
            Panoramica Economica
          </h2>
          <div className="rounded-lg border border-[var(--grigio-chiaro)] bg-[var(--grigio-scuro)] p-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="flex flex-col gap-1">
                <span className="text-xs text-[var(--grigio-testo)]">
                  PIL (ultimo trimestre)
                </span>
                <span
                  className="text-3xl font-bold text-green-400"
                  style={{
                    fontFamily:
                      "'Bebas Neue', sans-serif",
                  }}
                >
                  +0.3%
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-xs text-[var(--grigio-testo)]">
                  Disoccupazione
                </span>
                <span
                  className="text-3xl font-bold text-yellow-400"
                  style={{
                    fontFamily:
                      "'Bebas Neue', sans-serif",
                  }}
                >
                  7.2%
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-xs text-[var(--grigio-testo)]">
                  Inflazione
                </span>
                <span
                  className="text-3xl font-bold text-yellow-400"
                  style={{
                    fontFamily:
                      "'Bebas Neue', sans-serif",
                  }}
                >
                  1.6%
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Timestamp */}
        <p className="mt-6 text-xs text-[var(--grigio-testo)]">
          Ultimo aggiornamento:{" "}
          {new Date(mercati.aggiornamento).toLocaleString("it-IT", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-[var(--grigio-chiaro)] bg-[var(--grigio-scuro)]">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
          <Link
            href="/"
            className="text-xs text-[var(--grigio-testo)] hover:text-white"
          >
            ← Home
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
