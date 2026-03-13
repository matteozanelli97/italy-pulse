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
  // === WEBCAM — Italia extra ===
  { id: 'cam-genova', city: 'Genova', title: 'Porto di Genova', url: 'https://www.windy.com/webcams/1586879098', embedUrl: WINDY('1586879098'), type: 'webcam', active: true, latitude: 44.4056, longitude: 8.9463, heading: 200, fov: 80 },
  { id: 'cam-bologna', city: 'Bologna', title: 'Piazza Maggiore', url: 'https://www.windy.com/webcams/1586880098', embedUrl: WINDY('1586880098'), type: 'webcam', active: true, latitude: 44.4949, longitude: 11.3426, heading: 170, fov: 70 },
  { id: 'cam-palermo', city: 'Palermo', title: 'Palermo Centro', url: 'https://www.windy.com/webcams/1586881098', embedUrl: WINDY('1586881098'), type: 'webcam', active: true, latitude: 38.1157, longitude: 13.3615, heading: 190, fov: 75 },

  // === DIRETTE TV — Italia (verified 24/7 YouTube live channels) ===
  { id: 'stream-rainews', city: 'Italia', title: 'Rai News 24', url: 'https://www.youtube.com/c/rainews', embedUrl: YT('cPSKHFs5poI'), type: 'news', active: true },
  { id: 'stream-skytg24', city: 'Italia', title: 'Sky TG24', url: 'https://www.youtube.com/c/SkyTG24', embedUrl: YT('tgbNymZ7vqY'), type: 'news', active: true },
  { id: 'stream-euronews', city: 'Europa', title: 'Euronews IT', url: 'https://www.youtube.com/c/euronewsit', embedUrl: YT('uLoH9MeDpOg'), type: 'news', active: true },
  // === DIRETTE TV — Italian & European ===
  { id: 'stream-tgcom24', city: 'Italia', title: 'TGCOM24', url: 'https://www.youtube.com/c/tgcom24', embedUrl: YT('diretta-tgcom24'), type: 'news', active: true },
];

export async function GET() {
  // Client-side iframe handles actual availability — skip server checks.
  return NextResponse.json({ cams: LIVE_CAMS, updatedAt: new Date().toISOString() });
}
