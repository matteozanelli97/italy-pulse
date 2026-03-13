import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// Free translation via LibreTranslate-compatible API or MyMemory API (no key required, 5000 chars/day free)
// MyMemory is reliable and doesn't need authentication for reasonable usage.
async function translateText(text: string, from: string = 'en', to: string = 'it'): Promise<string> {
  if (!text || text.length < 3) return text;
  try {
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text.slice(0, 500))}&langpair=${from}|${to}`;
    const res = await fetch(url, { next: { revalidate: 3600 } });
    if (!res.ok) return text;
    const data = await res.json();
    const translated = data?.responseData?.translatedText;
    if (!translated || translated.includes('MYMEMORY WARNING')) return text;
    return translated;
  } catch {
    return text;
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { texts, from = 'en', to = 'it' } = body as { texts: string[]; from?: string; to?: string };

    if (!texts || !Array.isArray(texts) || texts.length === 0) {
      return NextResponse.json({ translations: [] });
    }

    // Translate in parallel (max 10 at a time to be respectful)
    const batch = texts.slice(0, 10);
    const translations = await Promise.all(
      batch.map((t) => translateText(t, from, to))
    );

    return NextResponse.json({ translations });
  } catch (e) {
    console.error('Translation error:', e);
    return NextResponse.json({ translations: [], error: true }, { status: 502 });
  }
}
