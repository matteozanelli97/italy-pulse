import { NextResponse } from 'next/server';
import type { NewsItem } from '@/types';

export const dynamic = 'force-dynamic';

// Parse RSS feed from ANSA
export async function GET() {
  try {
    const feeds = [
      { url: 'https://www.ansa.it/sito/ansait_rss.xml', source: 'ANSA' },
    ];

    const allItems: NewsItem[] = [];

    for (const feed of feeds) {
      try {
        const res = await fetch(feed.url, { next: { revalidate: 120 } });
        if (!res.ok) continue;

        const xml = await res.text();
        const items = parseRssItems(xml, feed.source);
        allItems.push(...items);
      } catch {
        // Skip failed feeds
      }
    }

    // Sort by date, most recent first
    allItems.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

    return NextResponse.json({
      items: allItems.slice(0, 30),
      updatedAt: new Date().toISOString(),
    });
  } catch (e) {
    console.error('News API error:', e);
    return NextResponse.json({ items: [], updatedAt: new Date().toISOString(), error: true }, { status: 502 });
  }
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
        id: `${source}-${idx}`,
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
  return str.replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").trim();
}
