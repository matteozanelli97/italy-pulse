import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

interface Match {
  id: string;
  homeTeam: string;
  awayTeam: string;
  homeScore: number | null;
  awayScore: number | null;
  status: 'scheduled' | 'live' | 'finished';
  minute: string | null;
  date: string;
  venue: string;
}

interface Standing {
  position: number;
  team: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  points: number;
}

const RAPIDAPI_KEY = process.env.NEXT_PUBLIC_RAPIDAPI_KEY || '';

// API-Football via RapidAPI — Serie A (league id: 135, season: 2025)
async function fetchFromAPI(): Promise<{ matches: Match[]; standings: Standing[] }> {
  if (!RAPIDAPI_KEY) throw new Error('No RapidAPI key');

  const headers = {
    'x-rapidapi-key': RAPIDAPI_KEY,
    'x-rapidapi-host': 'api-football-v1.p.rapidapi.com',
  };

  // Fetch current round matches
  const matchRes = await fetch(
    'https://api-football-v1.p.rapidapi.com/v3/fixtures?league=135&season=2025&last=10',
    { headers, next: { revalidate: 300 } }
  );

  // Fetch standings
  const standRes = await fetch(
    'https://api-football-v1.p.rapidapi.com/v3/standings?league=135&season=2025',
    { headers, next: { revalidate: 600 } }
  );

  const matches: Match[] = [];
  const standings: Standing[] = [];

  if (matchRes.ok) {
    const data = await matchRes.json();
    const fixtures = data?.response || [];
    for (const f of fixtures) {
      const status = f.fixture?.status?.short;
      let matchStatus: Match['status'] = 'scheduled';
      if (['1H', '2H', 'HT', 'ET', 'P', 'BT'].includes(status)) matchStatus = 'live';
      else if (['FT', 'AET', 'PEN'].includes(status)) matchStatus = 'finished';

      matches.push({
        id: `sa-${f.fixture?.id || Math.random()}`,
        homeTeam: f.teams?.home?.name || 'TBD',
        awayTeam: f.teams?.away?.name || 'TBD',
        homeScore: f.goals?.home ?? null,
        awayScore: f.goals?.away ?? null,
        status: matchStatus,
        minute: f.fixture?.status?.elapsed?.toString() || null,
        date: f.fixture?.date || new Date().toISOString(),
        venue: f.fixture?.venue?.name || '',
      });
    }
  }

  if (standRes.ok) {
    const data = await standRes.json();
    const league = data?.response?.[0]?.league?.standings?.[0] || [];
    for (const s of league) {
      standings.push({
        position: s.rank || 0,
        team: s.team?.name || '',
        played: s.all?.played || 0,
        won: s.all?.win || 0,
        drawn: s.all?.draw || 0,
        lost: s.all?.lose || 0,
        goalsFor: s.all?.goals?.for || 0,
        goalsAgainst: s.all?.goals?.against || 0,
        points: s.points || 0,
      });
    }
  }

  return { matches, standings };
}

// Fallback synthetic data when API is unavailable
function generateFallback(): { matches: Match[]; standings: Standing[] } {
  const teams = [
    'Inter', 'Napoli', 'Juventus', 'Milan', 'Atalanta',
    'Roma', 'Lazio', 'Fiorentina', 'Bologna', 'Torino',
    'Monza', 'Udinese', 'Genoa', 'Cagliari', 'Empoli',
    'Parma', 'Verona', 'Lecce', 'Como', 'Venezia',
  ];

  const matches: Match[] = [];
  for (let i = 0; i < 5; i++) {
    const home = teams[i * 2];
    const away = teams[i * 2 + 1];
    const hScore = Math.floor(Math.random() * 4);
    const aScore = Math.floor(Math.random() * 3);
    matches.push({
      id: `sa-fallback-${i}`,
      homeTeam: home,
      awayTeam: away,
      homeScore: hScore,
      awayScore: aScore,
      status: 'finished',
      minute: null,
      date: new Date(Date.now() - i * 86400000).toISOString(),
      venue: `Stadio ${home}`,
    });
  }

  const standings: Standing[] = teams.map((team, i) => ({
    position: i + 1,
    team,
    played: 30 + Math.floor(Math.random() * 3),
    won: 20 - i + Math.floor(Math.random() * 3),
    drawn: 5 + Math.floor(Math.random() * 4),
    lost: i + Math.floor(Math.random() * 3),
    goalsFor: 60 - i * 2 + Math.floor(Math.random() * 10),
    goalsAgainst: 20 + i * 2 + Math.floor(Math.random() * 8),
    points: Math.max(10, 70 - i * 3 + Math.floor(Math.random() * 5)),
  }));
  standings.sort((a, b) => b.points - a.points);
  standings.forEach((s, i) => { s.position = i + 1; });

  return { matches, standings };
}

export async function GET() {
  try {
    const data = await fetchFromAPI();
    if (data.matches.length === 0 && data.standings.length === 0) {
      // API returned empty — use fallback
      const fallback = generateFallback();
      return NextResponse.json({ ...fallback, source: 'fallback', updatedAt: new Date().toISOString() });
    }
    return NextResponse.json({ ...data, source: 'api-football', updatedAt: new Date().toISOString() });
  } catch {
    const fallback = generateFallback();
    return NextResponse.json({ ...fallback, source: 'fallback', updatedAt: new Date().toISOString() });
  }
}
