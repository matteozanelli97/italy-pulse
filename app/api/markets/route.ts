import { NextResponse } from 'next/server';
import type { MarketTick } from '@/types';

export const dynamic = 'force-dynamic';

// We use free CoinGecko API for crypto + a simple approach for commodity proxies
const ASSETS = [
  { id: 'bitcoin', symbol: 'BTC', name: 'Bitcoin', currency: 'EUR' },
  { id: 'ethereum', symbol: 'ETH', name: 'Ethereum', currency: 'EUR' },
  { id: 'tether-gold', symbol: 'XAUt', name: 'Oro (token)', currency: 'EUR' },
] as const;

export async function GET() {
  try {
    const ids = ASSETS.map((a) => a.id).join(',');
    const url = `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=eur&include_24hr_change=true`;

    const res = await fetch(url, { next: { revalidate: 60 } });
    if (!res.ok) throw new Error(`CoinGecko ${res.status}`);

    const data = await res.json();

    const ticks: MarketTick[] = ASSETS.map((asset) => {
      const d = data[asset.id];
      const price = d?.eur ?? 0;
      const change = d?.eur_24h_change ?? 0;
      return {
        symbol: asset.symbol,
        name: asset.name,
        price,
        change24h: (price * change) / 100,
        changePercent24h: change,
        lastUpdate: new Date().toISOString(),
        currency: asset.currency,
      };
    });

    return NextResponse.json({ ticks, updatedAt: new Date().toISOString() });
  } catch (e) {
    console.error('Markets API error:', e);
    return NextResponse.json({ ticks: [], updatedAt: new Date().toISOString(), error: true }, { status: 502 });
  }
}
