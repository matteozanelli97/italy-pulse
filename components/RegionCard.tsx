import Link from "next/link";
import type { Regione } from "@/types";
import { getSentimentColore } from "@/lib/regions";

interface RegionCardProps {
  regione: Regione;
  index: number;
}

export default function RegionCard({ regione, index }: RegionCardProps) {
  const colore = getSentimentColore(regione.sentiment);

  return (
    <Link
      href={`/regioni/${regione.slug}`}
      className="animate-slide-in group flex flex-col gap-3 rounded-lg border border-[var(--grigio-chiaro)] bg-[var(--grigio-scuro)] p-4 transition-all hover:border-[var(--grigio-testo)] hover:bg-[var(--grigio-medio)]"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-white">
          {regione.nome}
        </h3>
        <span className="text-xl">{regione.emoji}</span>
      </div>

      <div className="flex items-end gap-2">
        <span
          className="text-4xl font-bold leading-none"
          style={{
            color: colore,
            fontFamily: "'Bebas Neue', sans-serif",
          }}
        >
          {regione.sentiment}
        </span>
        <span className="mb-1 text-xs text-[var(--grigio-testo)]">/ 100</span>
      </div>

      {/* Barra sentiment */}
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-[var(--grigio-medio)]">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${regione.sentiment}%`,
            backgroundColor: colore,
          }}
        />
      </div>

      <p className="text-xs italic text-[var(--grigio-testo)] group-hover:text-gray-400">
        &ldquo;{regione.frase}&rdquo;
      </p>

      <span className="text-[10px] uppercase tracking-widest text-[var(--grigio-testo)]">
        {regione.capoluogo}
      </span>
    </Link>
  );
}
