import { NextResponse } from 'next/server';
import type { NewsItem } from '@/types';

export const dynamic = 'force-dynamic';

// Multiple Italian news feeds
const FEEDS = [
  { url: 'https://www.ansa.it/sito/ansait_rss.xml', source: 'ANSA' },
  { url: 'https://www.repubblica.it/rss/homepage/rss2.0.xml', source: 'Repubblica' },
  { url: 'https://xml2.corrieredellasera.it/rss/homepage.xml', source: 'Corriere' },
  { url: 'https://www.ilsole24ore.com/rss/italia.xml', source: 'Sole24Ore' },
  { url: 'https://www.adnkronos.com/rss/ultimora', source: 'Adnkronos' },
];

// Breaking news detection keywords (high urgency)
const BREAKING_KEYWORDS = /(?:ultim.ora|breaking|urgente|allerta|terremoto.*forte|tsunami|attentato|esplosione|emergenza|strage|morti|evacuazion)/i;

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
      } catch {
        return [];
      }
    });

    const results = await Promise.allSettled(feedPromises);
    for (const r of results) {
      if (r.status === 'fulfilled') {
        allItems.push(...r.value);
      }
    }

    // Detect breaking news
    allItems.forEach((item) => {
      const text = `${item.title} ${item.description}`;
      if (BREAKING_KEYWORDS.test(text)) {
        item.isBreaking = true;
      }
      // Also mark very recent items from multiple sources with similar titles as breaking
      const publishedMs = new Date(item.publishedAt).getTime();
      const ageMinutes = (Date.now() - publishedMs) / 60000;
      if (ageMinutes < 15) {
        const similar = allItems.filter(
          (other) => other.id !== item.id &&
            other.source !== item.source &&
            Math.abs(new Date(other.publishedAt).getTime() - publishedMs) < 1800000 &&
            titleSimilarity(item.title, other.title) > 0.4
        );
        if (similar.length >= 1) {
          item.isBreaking = true;
          similar.forEach((s) => { s.isBreaking = true; });
        }
      }
    });

    // Sort by date, breaking first, then most recent
    allItems.sort((a, b) => {
      if (a.isBreaking && !b.isBreaking) return -1;
      if (!a.isBreaking && b.isBreaking) return 1;
      return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
    });

    // Deduplicate by similar titles
    const seen = new Set<string>();
    const deduped = allItems.filter((item) => {
      const key = item.title.toLowerCase().slice(0, 50);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    return NextResponse.json({
      items: deduped.slice(0, 50),
      updatedAt: new Date().toISOString(),
    });
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
  for (const w of wordsA) {
    if (wordsB.has(w)) common++;
  }
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
      items.push({
        id: `${source}-${idx}-${Date.now()}`,
        title: cleanHtml(title),
        description: cleanHtml(description).slice(0, 200),
        source,
        url: link,
        publishedAt: pubDate ? new Date(pubDate).toISOString() : new Date().toISOString(),
        category,
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
  return str
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .trim();
}
