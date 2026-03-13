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
  { id: 'cam-roma', city: 'Roma', title: 'Roma Panorama', url: 'https://www.windy.com/webcams/1598866003', embedUrl: WINDY('1598866003'), type: 'webcam', active: true, latitude: 41.9028, longitude: 12.4964, heading: 180, fov: 70 },
  { id: 'cam-venezia', city: 'Venezia', title: 'Bacino San Marco', url: 'https://www.windy.com/webcams/1479734498', embedUrl: WINDY('1479734498'), type: 'webcam', active: true, latitude: 45.4343, longitude: 12.3388, heading: 220, fov: 80 },
  { id: 'cam-napoli', city: 'Napoli', title: 'Golfo di Napoli', url: 'https://www.windy.com/webcams/1531737329', embedUrl: WINDY('1531737329'), type: 'webcam', active: true, latitude: 40.8518, longitude: 14.2681, heading: 200, fov: 90 },
  { id: 'cam-milano', city: 'Milano', title: 'Duomo Milano', url: 'https://www.windy.com/webcams/1437735498', embedUrl: WINDY('1437735498'), type: 'webcam', active: true, latitude: 45.4642, longitude: 9.1900, heading: 160, fov: 65 },
  { id: 'cam-firenze', city: 'Firenze', title: 'Firenze Panorama', url: 'https://www.windy.com/webcams/1586873498', embedUrl: WINDY('1586873498'), type: 'webcam', active: true, latitude: 43.7696, longitude: 11.2558, heading: 190, fov: 75 },
  { id: 'cam-catania', city: 'Catania', title: 'Etna Vulcano', url: 'https://www.windy.com/webcams/1604905903', embedUrl: WINDY('1604905903'), type: 'webcam', active: true, latitude: 37.5079, longitude: 15.0830, heading: 340, fov: 60 },
  { id: 'cam-amalfi', city: 'Amalfi', title: 'Costa Amalfitana', url: 'https://www.windy.com/webcams/1477654001', embedUrl: WINDY('1477654001'), type: 'webcam', active: true, latitude: 40.6340, longitude: 14.6027, heading: 210, fov: 85 },
  { id: 'cam-torino', city: 'Torino', title: 'Torino Panorama', url: 'https://www.windy.com/webcams/1586878098', embedUrl: WINDY('1586878098'), type: 'webcam', active: true, latitude: 45.0703, longitude: 7.6869, heading: 170, fov: 70 },
  // === WEBCAM — Europe ===
  { id: 'cam-paris', city: 'Parigi', title: 'Tour Eiffel', url: 'https://www.windy.com/webcams/1540219997', embedUrl: WINDY('1540219997'), type: 'webcam', active: true, latitude: 48.8584, longitude: 2.2945, heading: 0, fov: 80 },
  { id: 'cam-barcelona', city: 'Barcellona', title: 'Barcelona Port', url: 'https://www.windy.com/webcams/1460879307', embedUrl: WINDY('1460879307'), type: 'webcam', active: true, latitude: 41.3851, longitude: 2.1734, heading: 150, fov: 75 },
  { id: 'cam-dubrovnik', city: 'Dubrovnik', title: 'Old Town', url: 'https://www.windy.com/webcams/1240512420', embedUrl: WINDY('1240512420'), type: 'webcam', active: true, latitude: 42.6507, longitude: 18.0944, heading: 230, fov: 70 },

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
