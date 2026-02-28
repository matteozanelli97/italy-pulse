import { NextResponse } from 'next/server';
import type { NewsItem } from '@/types';

export const dynamic = 'force-dynamic';

// Massively expanded Italian news feeds
const FEEDS = [
  // Main Italian sources
  { url: 'https://www.ansa.it/sito/ansait_rss.xml', source: 'ANSA' },
  { url: 'https://www.repubblica.it/rss/homepage/rss2.0.xml', source: 'Repubblica' },
  { url: 'https://xml2.corrieredellasera.it/rss/homepage.xml', source: 'Corriere' },
  { url: 'https://www.ilsole24ore.com/rss/italia.xml', source: 'Sole24Ore' },
  { url: 'https://www.adnkronos.com/rss/ultimora', source: 'Adnkronos' },
  { url: 'https://tg24.sky.it/rss/tg24_rss.xml', source: 'SkyTG24' },
  { url: 'https://www.agi.it/rss', source: 'AGI' },
  // Category feeds
  { url: 'https://www.ansa.it/sito/notizie/politica/politica_rss.xml', source: 'ANSA' },
  { url: 'https://www.ansa.it/sito/notizie/economia/economia_rss.xml', source: 'ANSA' },
  { url: 'https://www.ansa.it/sito/notizie/mondo/mondo_rss.xml', source: 'ANSA' },
  { url: 'https://www.ansa.it/sito/notizie/cronaca/cronaca_rss.xml', source: 'ANSA' },
  { url: 'https://www.repubblica.it/rss/esteri/rss2.0.xml', source: 'Repubblica' },
  { url: 'https://www.repubblica.it/rss/economia/rss2.0.xml', source: 'Repubblica' },
  { url: 'https://www.repubblica.it/rss/politica/rss2.0.xml', source: 'Repubblica' },
  { url: 'https://www.repubblica.it/rss/cronaca/rss2.0.xml', source: 'Repubblica' },
  // Additional sources
  { url: 'https://www.ilfattoquotidiano.it/feed/', source: 'Il Fatto' },
  { url: 'https://www.open.online/feed/', source: 'Open' },
  { url: 'https://www.fanpage.it/feed/', source: 'Fanpage' },
  { url: 'https://www.ilpost.it/feed/', source: 'Il Post' },
  { url: 'https://www.huffingtonpost.it/feeds/index.xml', source: 'HuffPost IT' },
  { url: 'https://www.ilgiornale.it/feed.xml', source: 'Il Giornale' },
  { url: 'https://www.rainews.it/rss/tutti', source: 'Rai News' },
  { url: 'https://www.lastampa.it/rss', source: 'La Stampa' },
  { url: 'https://www.ilmessaggero.it/rss/homepage.xml', source: 'Il Messaggero' },
];

const BREAKING_KEYWORDS = /(?:ultim.ora|breaking|urgente|allerta|terremoto.*forte|tsunami|attentato|esplosione|emergenza|strage|morti|evacuazion)/i;

// Category classification — only 4 categories: Politics, Economy, World, Cronaca
function classifyCategory(title: string, description: string, feedCategory: string): string {
  const t = (title + ' ' + description + ' ' + feedCategory).toLowerCase();
  if (/politic|governo|parlamento|ministro|elezioni|decreto|senato|camera|premier|presidente.*repubblica/i.test(t)) return 'Politics';
  if (/econom|finanz|borsa|mercati|pil|inflaz|banca|spread|euro|lavoro|occupaz|debito|tass[ae]/i.test(t)) return 'Economy';
  if (/mond|internazional|usa|cina|russia|europa|trump|onu|medio.?orient|africa|asia|foreign|estero|kiev|ucraina|difesa|militar|nato|guerra/i.test(t)) return 'World';
  if (/cronaca|incidente|morto|omicidio|arresto|indagine|rapina|droga|mafia|camorra|ndrangheta|femminicidio/i.test(t)) return 'Cronaca';
  // Default based on feed URL hints
  if (/politica/.test(feedCategory)) return 'Politics';
  if (/economia|finanz/.test(feedCategory)) return 'Economy';
  if (/mondo|esteri|difesa/.test(feedCategory)) return 'World';
  if (/cronaca/.test(feedCategory)) return 'Cronaca';
  return 'Cronaca'; // default — general Italian news
}

export async function GET() {
  try {
    const allItems: NewsItem[] = [];

    const feedPromises = FEEDS.map(async (feed) => {
      try {
        const res = await fetch(feed.url, {
          next: { revalidate: 120 },
          headers: { 'User-Agent': 'ItalyPulse/1.0' },
        });
        if (!res.ok) return [];
        const xml = await res.text();
        return parseRssItems(xml, feed.source);
      } catch { return []; }
    });

    const results = await Promise.allSettled(feedPromises);
    for (const r of results) {
      if (r.status === 'fulfilled') allItems.push(...r.value);
    }

    // Apply categorization
    allItems.forEach((item) => {
      item.category = classifyCategory(item.title, item.description, item.category);
    });

    // Detect breaking news
    allItems.forEach((item) => {
      const text = `${item.title} ${item.description}`;
      if (BREAKING_KEYWORDS.test(text)) item.isBreaking = true;
      const publishedMs = new Date(item.publishedAt).getTime();
      const ageMinutes = (Date.now() - publishedMs) / 60000;
      if (ageMinutes < 15) {
        const similar = allItems.filter(
          (other) => other.id !== item.id && other.source !== item.source &&
            Math.abs(new Date(other.publishedAt).getTime() - publishedMs) < 1800000 &&
            titleSimilarity(item.title, other.title) > 0.4
        );
        if (similar.length >= 1) {
          item.isBreaking = true;
          similar.forEach((s) => { s.isBreaking = true; });
        }
      }
    });

    // Sort strictly chronological (newest first)
    allItems.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

    // Deduplicate by similar titles
    const seen = new Set<string>();
    const deduped = allItems.filter((item) => {
      const key = item.title.toLowerCase().slice(0, 50);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    return NextResponse.json({ items: deduped.slice(0, 80), updatedAt: new Date().toISOString() });
  } catch (e) {
    console.error('News API error:', e);
    return NextResponse.json({ items: [], updatedAt: new Date().toISOString(), error: true }, { status: 502 });
  }
}

function titleSimilarity(a: string, b: string): number {
  const wordsA = new Set(a.toLowerCase().split(/\s+/).filter((w) => w.length > 3));
  const wordsB = new Set(b.toLowerCase().split(/\s+/).filter((w) => w.length > 3));
  if (wordsA.size === 0 || wordsB.size === 0) return 0;
  let common = 0;
  for (const w of wordsA) { if (wordsB.has(w)) common++; }
  return common / Math.max(wordsA.size, wordsB.size);
}

function parseRssItems(xml: string, source: string): NewsItem[] {
  const items: NewsItem[] = [];
  const itemRegex = /<item>([\s\S]*?)<\/item>/g;
  let match;
  let idx = 0;
  while ((match = itemRegex.exec(xml)) !== null && idx < 30) {
    const block = match[1];
    const title = extractTag(block, 'title');
    const description = extractTag(block, 'description');
    const link = extractTag(block, 'link');
    const pubDate = extractTag(block, 'pubDate');
    const category = extractTag(block, 'category') || 'Generale';
    if (title) {
      // Extract image from enclosure, media:content, or description img tags
      let imageUrl: string | undefined;
      const enclosure = /url="([^"]+\.(jpg|jpeg|png|webp)[^"]*)"/i.exec(block);
      if (enclosure) imageUrl = enclosure[1];
      if (!imageUrl) { const media = /<media:content[^>]+url="([^"]+)"/i.exec(block); if (media) imageUrl = media[1]; }
      if (!imageUrl) { const imgTag = /<img[^>]+src="([^"]+)"/i.exec(description || ''); if (imgTag) imageUrl = imgTag[1]; }

      items.push({
        id: `${source}-${idx}-${Date.now()}`,
        title: cleanHtml(title),
        description: cleanHtml(description).slice(0, 500),
        source, url: link,
        publishedAt: pubDate ? new Date(pubDate).toISOString() : new Date().toISOString(),
        category,
        imageUrl,
      });
      idx++;
    }
  }
  return items;
}

function extractTag(block: string, tag: string): string {
  const cdataRegex = new RegExp(`<${tag}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]><\\/${tag}>`);
  const cdataMatch = cdataRegex.exec(block);
  if (cdataMatch) return cdataMatch[1].trim();
  const simpleRegex = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`);
  const simpleMatch = simpleRegex.exec(block);
  return simpleMatch ? simpleMatch[1].trim() : '';
}

function cleanHtml(str: string): string {
  return str.replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ').trim();
}
