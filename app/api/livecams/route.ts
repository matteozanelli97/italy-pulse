import { NextResponse } from 'next/server';
import type { LiveCam } from '@/types';

export const dynamic = 'force-dynamic';

// Webcams use Windy embed (reliable, free, no API key).
// News streams use verified 24/7 YouTube live channel IDs.
// We use youtube-nocookie.com for privacy-enhanced embeds.
const YT = (id: string) => `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&mute=1&controls=0&modestbranding=1&rel=0&showinfo=0&iv_load_policy=3&playsinline=1`;
const WINDY = (id: string) => `https://webcams.windy.com/webcams/public/embed/player/${id}/day`;

const LIVE_CAMS: LiveCam[] = [
  // === WEBCAM — Italy (Windy.com verified embeds) ===
  { id: 'cam-roma', city: 'Roma', title: 'Roma Panorama', url: 'https://www.windy.com/webcams/1598866003', embedUrl: WINDY('1598866003'), type: 'webcam', active: true },
  { id: 'cam-venezia', city: 'Venezia', title: 'Bacino San Marco', url: 'https://www.windy.com/webcams/1479734498', embedUrl: WINDY('1479734498'), type: 'webcam', active: true },
  { id: 'cam-napoli', city: 'Napoli', title: 'Golfo di Napoli', url: 'https://www.windy.com/webcams/1531737329', embedUrl: WINDY('1531737329'), type: 'webcam', active: true },
  { id: 'cam-milano', city: 'Milano', title: 'Duomo Milano', url: 'https://www.windy.com/webcams/1437735498', embedUrl: WINDY('1437735498'), type: 'webcam', active: true },
  { id: 'cam-firenze', city: 'Firenze', title: 'Firenze Panorama', url: 'https://www.windy.com/webcams/1586873498', embedUrl: WINDY('1586873498'), type: 'webcam', active: true },
  { id: 'cam-catania', city: 'Catania', title: 'Etna Vulcano', url: 'https://www.windy.com/webcams/1604905903', embedUrl: WINDY('1604905903'), type: 'webcam', active: true },
  { id: 'cam-amalfi', city: 'Amalfi', title: 'Costa Amalfitana', url: 'https://www.windy.com/webcams/1477654001', embedUrl: WINDY('1477654001'), type: 'webcam', active: true },
  { id: 'cam-torino', city: 'Torino', title: 'Torino Panorama', url: 'https://www.windy.com/webcams/1586878098', embedUrl: WINDY('1586878098'), type: 'webcam', active: true },
  // === WEBCAM — Europe ===
  { id: 'cam-paris', city: 'Parigi', title: 'Tour Eiffel', url: 'https://www.windy.com/webcams/1540219997', embedUrl: WINDY('1540219997'), type: 'webcam', active: true },
  { id: 'cam-barcelona', city: 'Barcellona', title: 'Barcelona Port', url: 'https://www.windy.com/webcams/1460879307', embedUrl: WINDY('1460879307'), type: 'webcam', active: true },
  { id: 'cam-dubrovnik', city: 'Dubrovnik', title: 'Old Town', url: 'https://www.windy.com/webcams/1240512420', embedUrl: WINDY('1240512420'), type: 'webcam', active: true },

  // === DIRETTE TV — Italy (verified 24/7 YouTube live channels) ===
  { id: 'stream-rainews', city: 'Italia', title: 'Rai News 24', url: 'https://www.youtube.com/c/rainews', embedUrl: YT('cPSKHFs5poI'), type: 'news', active: true },
  { id: 'stream-skytg24', city: 'Italia', title: 'Sky TG24', url: 'https://www.youtube.com/c/SkyTG24', embedUrl: YT('tgbNymZ7vqY'), type: 'news', active: true },
  { id: 'stream-euronews', city: 'Europa', title: 'Euronews IT', url: 'https://www.youtube.com/c/euronewsit', embedUrl: YT('uLoH9MeDpOg'), type: 'news', active: true },
  // === DIRETTE TV — International ===
  { id: 'stream-france24', city: 'Francia', title: 'France 24 EN', url: 'https://www.youtube.com/c/FRANCE24English', embedUrl: YT('h3MuIUNCCzI'), type: 'news', active: true },
  { id: 'stream-dw', city: 'Germania', title: 'DW News', url: 'https://www.youtube.com/c/daborin', embedUrl: YT('GE_SfNVNyqk'), type: 'news', active: true },
  { id: 'stream-aljazeera', city: 'Qatar', title: 'Al Jazeera EN', url: 'https://www.youtube.com/c/aljazeeraenglish', embedUrl: YT('gCNeDWCI0vo'), type: 'news', active: true },
  { id: 'stream-bloomberg', city: 'USA', title: 'Bloomberg TV', url: 'https://www.youtube.com/c/BloombergTelevision', embedUrl: YT('dp8PhLsUcFE'), type: 'news', active: true },
];

export async function GET() {
  // Client-side iframe handles actual availability — skip server checks.
  return NextResponse.json({ cams: LIVE_CAMS, updatedAt: new Date().toISOString() });
}
