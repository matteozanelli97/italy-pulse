import Link from "next/link";
import NewsFeed from "@/components/NewsFeed";
import { fetchNotizie } from "@/lib/fetchers/notizie";
import type { CategoriaNotizia } from "@/types";

const categorie: { label: string; value: CategoriaNotizia }[] = [
  { label: "Politica", value: "politica" },
  { label: "Economia", value: "economia" },
  { label: "Cronaca", value: "cronaca" },
  { label: "Intrattenimento", value: "intrattenimento" },
  { label: "Scioperi", value: "scioperi" },
];

export default function NotiziePage() {
  const notizie = fetchNotizie();

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
              href="/economia"
              className="text-sm text-[var(--grigio-testo)] transition-colors hover:text-white"
            >
              Economia
            </Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl px-4 py-8">
        <h1
          className="mb-8 text-4xl font-bold tracking-tight text-white"
          style={{
            fontFamily: "'Bebas Neue', sans-serif",
          }}
        >
          Notizie del Giorno
        </h1>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {categorie.map(({ label, value }) => {
            const notizieCategoria = notizie.filter(
              (n) => n.categoria === value
            );
            if (notizieCategoria.length === 0) return null;
            return (
              <div
                key={value}
                className="rounded-lg border border-[var(--grigio-chiaro)] bg-[var(--grigio-scuro)] p-5"
              >
                <h2 className="mb-4 text-xs font-bold uppercase tracking-widest text-[var(--grigio-testo)]">
                  {label}
                </h2>
                <NewsFeed notizie={notizieCategoria} categorie={[value]} />
              </div>
            );
          })}
        </div>
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
