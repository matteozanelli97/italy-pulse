import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const { titles, category } = await req.json();
    if (!titles || !Array.isArray(titles) || titles.length === 0) {
      return NextResponse.json({ summary: 'Nessuna notizia disponibile per questa categoria.' });
    }

    const categoryLabel = ({
      Politics: 'politica',
      Economy: 'economia',
      World: 'mondo',
      Cronaca: 'cronaca',
    } as Record<string, string>)[category] || category;

    // Build a concise summary from the headlines without external AI calls
    const bulletPoints = titles.slice(0, 15).map((t: string, i: number) => `${i + 1}. ${t}`).join('\n');

    const summary = `Riepilogo ${categoryLabel} (ultime 24h):\n\n${bulletPoints}\n\n— ${titles.length} notizie totali in questa categoria.`;

    return NextResponse.json({ summary, category, count: titles.length });
  } catch {
    return NextResponse.json({ summary: 'Errore nel generare il riepilogo.', error: true }, { status: 500 });
  }
}
