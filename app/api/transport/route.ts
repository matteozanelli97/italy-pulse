import { NextResponse } from 'next/server';
import type { TransportAlert } from '@/types';

export const dynamic = 'force-dynamic';

// Global major airports for status simulation
const GLOBAL_AIRPORTS = [
  { code: 'JFK', name: 'John F. Kennedy Intl', city: 'New York' },
  { code: 'LHR', name: 'Heathrow', city: 'London' },
  { code: 'NRT', name: 'Narita Intl', city: 'Tokyo' },
  { code: 'DXB', name: 'Dubai Intl', city: 'Dubai' },
  { code: 'SIN', name: 'Changi', city: 'Singapore' },
  { code: 'CDG', name: 'Charles de Gaulle', city: 'Paris' },
  { code: 'FRA', name: 'Frankfurt', city: 'Frankfurt' },
  { code: 'PEK', name: 'Beijing Capital', city: 'Beijing' },
  { code: 'SYD', name: 'Kingsford Smith', city: 'Sydney' },
  { code: 'GRU', name: 'Guarulhos', city: 'Sao Paulo' },
];

// Global major seaports
const GLOBAL_PORTS = [
  { name: 'Shanghai', type: 'Container terminal' },
  { name: 'Singapore', type: 'Container terminal' },
  { name: 'Rotterdam', type: 'Container & bulk' },
  { name: 'Los Angeles', type: 'Container terminal' },
  { name: 'Dubai (Jebel Ali)', type: 'Container terminal' },
  { name: 'Busan', type: 'Container terminal' },
];

export async function GET() {
  try {
    const alerts: TransportAlert[] = [];
    const now = new Date();
    const hour = now.getHours();
    const minute = now.getMinutes();
    const iso = now.toISOString();

    // ── Airport status (deterministic simulation) ──
    GLOBAL_AIRPORTS.forEach((apt) => {
      const hash = (hour + apt.code.charCodeAt(0)) % 50;
      let status: TransportAlert['status'] = 'regolare';
      let severity: TransportAlert['severity'] = 'low';
      let desc = 'Normal operations — departures and arrivals on schedule';
      if (hash < 2) {
        status = 'critico';
        severity = 'high';
        desc = `Flights delayed 45-90 min. Cancellations on some routes due to weather. Check flight status before departure`;
      } else if (hash < 6) {
        status = 'rallentato';
        severity = 'medium';
        const delay = 15 + (hash % 15);
        desc = `Departures delayed ${delay}-${delay + 10} min. Cause: ${hash % 2 === 0 ? 'reduced ATC slots due to weather' : 'air traffic congestion'}. Arrivals normal`;
      }
      alerts.push({
        id: `apt-${apt.code}`, type: 'flight', title: `${apt.code} — ${apt.name}`,
        description: desc, severity, timestamp: iso,
        route: apt.city, status,
      });
    });

    // ── Port status ──
    GLOBAL_PORTS.forEach((port) => {
      const hash = (hour + port.name.charCodeAt(0)) % 40;
      let status: TransportAlert['status'] = 'regolare';
      let severity: TransportAlert['severity'] = 'low';
      let desc = `${port.type} — normal operations`;
      if (hash < 3) {
        status = 'rallentato';
        severity = 'medium';
        desc = `${port.type} — delays due to sea conditions`;
      }
      alerts.push({
        id: `port-${port.name}`, type: 'port', title: `Port of ${port.name}`,
        description: desc, severity, timestamp: iso,
        route: port.type, status,
      });
    });

    // ── Rail network status (global high-speed routes) ──
    if (hour >= 5 && hour <= 23) {
      const railLines = [
        { name: 'Eurostar London-Paris', route: 'Channel Tunnel' },
        { name: 'Shinkansen Tokyo-Osaka', route: 'Tokaido Line' },
        { name: 'TGV Paris-Lyon', route: 'LGV Sud-Est' },
        { name: 'ICE Frankfurt-Berlin', route: 'Deutsche Bahn' },
        { name: 'Amtrak Northeast Corridor', route: 'Washington-Boston' },
        { name: 'KTX Seoul-Busan', route: 'Gyeongbu Line' },
      ];
      railLines.forEach((line, i) => {
        const hash = (hour * 60 + minute + i * 17) % 100;
        let status: TransportAlert['status'] = 'regolare';
        let severity: TransportAlert['severity'] = 'low';
        let desc = 'Normal service, no delays reported';
        if (hash < 4) {
          status = 'sospeso';
          severity = 'high';
          const causes = ['power line fault', 'police investigation', 'trespasser on tracks', 'technical failure'];
          const cause = causes[hash % causes.length];
          desc = `Service SUSPENDED due to ${cause}. Trains cancelled or rerouted. Bus replacement active. Estimated resumption at ${((hour + 1) % 24).toString().padStart(2, '0')}:${(minute + 30) % 60 < 10 ? '0' : ''}${(minute + 30) % 60}`;
        } else if (hash < 12) {
          status = 'rallentato';
          severity = 'medium';
          const delay = 10 + (hash % 25);
          const causes = ['technical issue', 'adverse weather', 'signaling problem', 'overcrowding', 'unscheduled maintenance'];
          const cause = causes[hash % causes.length];
          desc = `Average delays of ${delay} min due to ${cause}. ${delay > 20 ? 'Some stops skipped.' : 'Further delays possible.'} Last update: ${hour}:${minute.toString().padStart(2, '0')}`;
        }
        alerts.push({
          id: `rail-${i}`, type: 'train', title: line.name,
          description: desc, severity, timestamp: iso,
          route: line.route, status,
        });
      });
    }

    return NextResponse.json({ alerts, updatedAt: iso });
  } catch (e) {
    console.error('Transport API error:', e);
    return NextResponse.json({ alerts: [], updatedAt: new Date().toISOString(), error: true }, { status: 502 });
  }
}
