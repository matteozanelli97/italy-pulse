import type { Notizia, CategoriaNotizia } from "@/types";
import Badge from "@/components/ui/Badge";

interface NewsFeedProps {
  notizie: Notizia[];
  categorie?: CategoriaNotizia[];
}

const sentimentIndicatore: Record<string, string> = {
  positivo: "text-green-400",
  negativo: "text-red-400",
  neutro: "text-gray-400",
};

const sentimentEmoji: Record<string, string> = {
  positivo: "▲",
  negativo: "▼",
  neutro: "●",
};

function formatTimestamp(timestamp: string): string {
  const diff = Date.now() - new Date(timestamp).getTime();
  const minuti = Math.floor(diff / 60000);
  if (minuti < 60) return `${minuti}m fa`;
  const ore = Math.floor(minuti / 60);
  if (ore < 24) return `${ore}h fa`;
  return `${Math.floor(ore / 24)}g fa`;
}

export default function NewsFeed({ notizie, categorie }: NewsFeedProps) {
  const filtrate = categorie
    ? notizie.filter((n) => categorie.includes(n.categoria))
    : notizie;

  return (
    <div className="flex flex-col divide-y divide-[var(--grigio-chiaro)]">
      {filtrate.map((notizia) => (
        <article
          key={notizia.id}
          className="flex flex-col gap-2 py-4 first:pt-0 last:pb-0"
        >
          <div className="flex items-center gap-2">
            <Badge categoria={notizia.categoria} />
            <span className="text-xs text-[var(--grigio-testo)]">
              {notizia.fonte}
            </span>
            <span className="text-xs text-[var(--grigio-testo)]">
              {formatTimestamp(notizia.timestamp)}
            </span>
            <span
              className={`ml-auto text-xs font-bold ${sentimentIndicatore[notizia.sentiment]}`}
            >
              {sentimentEmoji[notizia.sentiment]}
            </span>
          </div>

          <h4 className="text-sm font-semibold leading-snug text-white">
            {notizia.titolo}
          </h4>

          <p className="text-xs leading-relaxed text-[var(--grigio-testo)]">
            {notizia.sommario}
          </p>
        </article>
      ))}
    </div>
  );
}
