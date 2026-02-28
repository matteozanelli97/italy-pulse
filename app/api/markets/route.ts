import { NextRequest, NextResponse } from 'next/server';
import type { MarketTick } from '@/types';

export const dynamic = 'force-dynamic';

// ---------------------------------------------------------------------------
// Helpers: time-based sine variation for synthetic prices
// ---------------------------------------------------------------------------
function syntheticPrice(base: number, amplitude: number, periodMs: number, phaseOffset = 0): number {
  const t = (Date.now() + phaseOffset) / periodMs;
  return base + Math.sin(t * 2 * Math.PI) * amplitude;
}

function syntheticChange(periodMs: number, maxPercent: number, phaseOffset = 0): number {
  const t = (Date.now() + phaseOffset) / periodMs;
  return Math.sin(t * 2 * Math.PI) * maxPercent;
}

function round(n: number, decimals = 2): number {
  const f = Math.pow(10, decimals);
  return Math.round(n * f) / f;
}

// ---------------------------------------------------------------------------
// Italian region (IT) — crypto ids fetched from CoinGecko in EUR
// ---------------------------------------------------------------------------
const IT_CRYPTO_IDS = [
  { id: 'bitcoin', symbol: 'BTC', name: 'Bitcoin' },
  { id: 'ethereum', symbol: 'ETH', name: 'Ethereum' },
] as const;

// Italian synthetic stocks / indices / forex / bonds / energy
function buildItalianSynthetics(now: Date): MarketTick[] {
  const iso = now.toISOString();
  const hour = now.getHours();
  const _isMarketOpen = hour >= 9 && hour <= 17;

  // Each synthetic has: symbol, name, base, amplitude, periodMs, phaseOffset, currency, category
  const defs: Array<{
    symbol: string; name: string; base: number; amplitude: number;
    periodMs: number; phase: number; currency: string;
    category: MarketTick['category']; decimals?: number;
  }> = [
    // FTSE MIB index ~34000-35000
    { symbol: 'FTSEMIB', name: 'FTSE MIB', base: 34500, amplitude: 500, periodMs: 3_600_000, phase: 0, currency: 'EUR', category: 'index' },
    // ENI ~14-15
    { symbol: 'ENI', name: 'ENI', base: 14.5, amplitude: 0.5, periodMs: 5_400_000, phase: 1_000_000, currency: 'EUR', category: 'stock' },
    // Intesa Sanpaolo ~3.2-3.5
    { symbol: 'ISP', name: 'Intesa Sanpaolo', base: 3.35, amplitude: 0.15, periodMs: 4_800_000, phase: 2_000_000, currency: 'EUR', category: 'stock' },
    // ENEL ~6.5-7
    { symbol: 'ENEL', name: 'ENEL', base: 6.75, amplitude: 0.25, periodMs: 6_000_000, phase: 3_000_000, currency: 'EUR', category: 'stock' },
    // Ferrari ~380-420
    { symbol: 'RACE', name: 'Ferrari', base: 400, amplitude: 20, periodMs: 7_200_000, phase: 4_000_000, currency: 'EUR', category: 'stock' },
    // EUR/USD ~1.08-1.09
    { symbol: 'EUR/USD', name: 'Euro / Dollaro', base: 1.085, amplitude: 0.005, periodMs: 7_200_000, phase: 500_000, currency: 'USD', category: 'forex', decimals: 4 },
    // BTP-Bund Spread ~120-140 bps
    { symbol: 'SPREAD', name: 'BTP-Bund Spread', base: 130, amplitude: 10, periodMs: 14_400_000, phase: 1_500_000, currency: 'bps', category: 'bond', decimals: 1 },
    // PUN electricity ~85-110 EUR/MWh
    { symbol: 'PUN', name: 'Prezzo Unico Nazionale', base: 97.5, amplitude: 12.5, periodMs: 10_800_000, phase: 2_500_000, currency: 'EUR/MWh', category: 'energy' },
    // Gas TTF ~28-35 EUR/MWh
    { symbol: 'TTF', name: 'Gas TTF', base: 31.5, amplitude: 3.5, periodMs: 12_600_000, phase: 3_500_000, currency: 'EUR/MWh', category: 'energy' },
  ];

  return defs.map((d) => {
    const price = syntheticPrice(d.base, d.amplitude, d.periodMs, d.phase);
    const changePct = syntheticChange(d.periodMs * 0.7, 0.8, d.phase + 500_000);
    const change24h = price * changePct / 100;
    const dec = d.decimals ?? 2;
    return {
      symbol: d.symbol,
      name: d.name,
      price: round(price, dec),
      change24h: round(change24h, dec),
      changePercent24h: round(changePct, 2),
      lastUpdate: iso,
      currency: d.currency,
      category: d.category,
      region: 'IT' as const,
    };
  });
}

// ---------------------------------------------------------------------------
// US region — crypto ids fetched from CoinGecko in USD
// ---------------------------------------------------------------------------
const US_CRYPTO_IDS = [
  { id: 'bitcoin', symbol: 'BTC', name: 'Bitcoin' },
  { id: 'ethereum', symbol: 'ETH', name: 'Ethereum' },
] as const;

function buildUSSynthetics(now: Date): MarketTick[] {
  const iso = now.toISOString();

  const defs: Array<{
    symbol: string; name: string; base: number; amplitude: number;
    periodMs: number; phase: number; currency: string;
    category: MarketTick['category']; decimals?: number;
  }> = [
    // S&P 500 ~5400-5600
    { symbol: 'SPX', name: 'S&P 500', base: 5500, amplitude: 100, periodMs: 3_600_000, phase: 100_000, currency: 'USD', category: 'index' },
    // NASDAQ ~17000-17500
    { symbol: 'NDX', name: 'NASDAQ Composite', base: 17250, amplitude: 250, periodMs: 4_200_000, phase: 200_000, currency: 'USD', category: 'index' },
    // Dow Jones ~39000-40000
    { symbol: 'DJI', name: 'Dow Jones', base: 39500, amplitude: 500, periodMs: 3_900_000, phase: 300_000, currency: 'USD', category: 'index' },
    // AAPL ~185-195
    { symbol: 'AAPL', name: 'Apple', base: 190, amplitude: 5, periodMs: 5_400_000, phase: 400_000, currency: 'USD', category: 'stock' },
    // MSFT ~410-430
    { symbol: 'MSFT', name: 'Microsoft', base: 420, amplitude: 10, periodMs: 6_000_000, phase: 500_000, currency: 'USD', category: 'stock' },
    // TSLA ~250-280
    { symbol: 'TSLA', name: 'Tesla', base: 265, amplitude: 15, periodMs: 4_800_000, phase: 600_000, currency: 'USD', category: 'stock' },
    // GOOG ~155-165
    { symbol: 'GOOG', name: 'Alphabet', base: 160, amplitude: 5, periodMs: 5_100_000, phase: 700_000, currency: 'USD', category: 'stock' },
    // Gold ~2300-2400 USD/oz
    { symbol: 'XAU', name: 'Oro (Gold)', base: 2350, amplitude: 50, periodMs: 10_800_000, phase: 800_000, currency: 'USD/oz', category: 'commodity' },
    // Oil WTI ~75-82 USD/bbl
    { symbol: 'WTI', name: 'Petrolio WTI', base: 78.5, amplitude: 3.5, periodMs: 9_000_000, phase: 900_000, currency: 'USD/bbl', category: 'commodity' },
  ];

  return defs.map((d) => {
    const price = syntheticPrice(d.base, d.amplitude, d.periodMs, d.phase);
    const changePct = syntheticChange(d.periodMs * 0.7, 1.2, d.phase + 500_000);
    const change24h = price * changePct / 100;
    const dec = d.decimals ?? 2;
    return {
      symbol: d.symbol,
      name: d.name,
      price: round(price, dec),
      change24h: round(change24h, dec),
      changePercent24h: round(changePct, 2),
      lastUpdate: iso,
      currency: d.currency,
      category: d.category,
      region: 'US' as const,
    };
  });
}

// ---------------------------------------------------------------------------
// CoinGecko fetch helper
// ---------------------------------------------------------------------------
async function fetchCrypto(
  ids: ReadonlyArray<{ id: string; symbol: string; name: string }>,
  vsCurrency: 'eur' | 'usd',
  region: 'IT' | 'US',
): Promise<MarketTick[]> {
  const idStr = ids.map((a) => a.id).join(',');
  const url = `https://api.coingecko.com/api/v3/simple/price?ids=${idStr}&vs_currencies=${vsCurrency}&include_24hr_change=true`;

  const res = await fetch(url, { next: { revalidate: 10 } });
  if (!res.ok) throw new Error(`CoinGecko ${res.status}`);

  const data = await res.json();

  return ids.map((asset) => {
    const d = data[asset.id];
    const price = d?.[vsCurrency] ?? 0;
    const changePct = d?.[`${vsCurrency}_24h_change`] ?? 0;
    return {
      symbol: asset.symbol,
      name: asset.name,
      price,
      change24h: round(price * changePct / 100, 2),
      changePercent24h: round(changePct, 2),
      lastUpdate: new Date().toISOString(),
      currency: vsCurrency.toUpperCase(),
      category: 'crypto' as const,
      region,
    };
  }).filter((t) => t.price > 0);
}

// ---------------------------------------------------------------------------
// Main GET handler
// ---------------------------------------------------------------------------
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const region = (searchParams.get('region') || 'IT').toUpperCase() as 'IT' | 'US';
  const now = new Date();

  try {
    let ticks: MarketTick[];

    if (region === 'US') {
      // US region: crypto in USD + US synthetics
      let cryptoTicks: MarketTick[] = [];
      try {
        cryptoTicks = await fetchCrypto(US_CRYPTO_IDS, 'usd', 'US');
      } catch {
        // Fallback synthetic crypto for US
        cryptoTicks = [
          {
            symbol: 'BTC', name: 'Bitcoin',
            price: round(syntheticPrice(97000, 2000, 3_600_000, 0), 2),
            change24h: round(syntheticChange(3_000_000, 2500, 100_000), 2),
            changePercent24h: round(syntheticChange(3_000_000, 2.5, 100_000), 2),
            lastUpdate: now.toISOString(), currency: 'USD', category: 'crypto', region: 'US',
          },
          {
            symbol: 'ETH', name: 'Ethereum',
            price: round(syntheticPrice(3400, 150, 4_200_000, 500_000), 2),
            change24h: round(syntheticChange(3_500_000, 80, 600_000), 2),
            changePercent24h: round(syntheticChange(3_500_000, 2.2, 600_000), 2),
            lastUpdate: now.toISOString(), currency: 'USD', category: 'crypto', region: 'US',
          },
        ];
      }
      const syntheticTicks = buildUSSynthetics(now);
      ticks = [...cryptoTicks, ...syntheticTicks];
    } else {
      // IT region: crypto in EUR + Italian synthetics
      let cryptoTicks: MarketTick[] = [];
      try {
        cryptoTicks = await fetchCrypto(IT_CRYPTO_IDS, 'eur', 'IT');
      } catch {
        // Fallback synthetic crypto for IT
        cryptoTicks = [
          {
            symbol: 'BTC', name: 'Bitcoin',
            price: round(syntheticPrice(89000, 1500, 3_600_000, 0), 2),
            change24h: round(syntheticChange(3_000_000, 2000, 100_000), 2),
            changePercent24h: round(syntheticChange(3_000_000, 2.2, 100_000), 2),
            lastUpdate: now.toISOString(), currency: 'EUR', category: 'crypto', region: 'IT',
          },
          {
            symbol: 'ETH', name: 'Ethereum',
            price: round(syntheticPrice(3100, 120, 4_200_000, 500_000), 2),
            change24h: round(syntheticChange(3_500_000, 60, 600_000), 2),
            changePercent24h: round(syntheticChange(3_500_000, 1.9, 600_000), 2),
            lastUpdate: now.toISOString(), currency: 'EUR', category: 'crypto', region: 'IT',
          },
        ];
      }
      const syntheticTicks = buildItalianSynthetics(now);
      ticks = [...cryptoTicks, ...syntheticTicks];
    }

    return NextResponse.json({
      ticks,
      region,
      updatedAt: now.toISOString(),
    });
  } catch (e) {
    console.error('Markets API error:', e);
    return NextResponse.json(
      { ticks: [], region, updatedAt: now.toISOString(), error: true },
      { status: 502 },
    );
  }
}
