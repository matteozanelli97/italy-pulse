import { NextResponse } from 'next/server';
import type { LiveCam } from '@/types';

export const dynamic = 'force-dynamic';

// Curated live camera feeds and news streams from major Italian cities
const LIVE_CAMS: LiveCam[] = [
  // Webcams
  { id: 'cam-roma-colosseo', city: 'Roma', title: 'Colosseo Live', url: 'https://www.skylinewebcams.com/en/webcam/italia/lazio/roma/colosseo.html', type: 'webcam' },
  { id: 'cam-roma-pantheon', city: 'Roma', title: 'Pantheon', url: 'https://www.skylinewebcams.com/en/webcam/italia/lazio/roma/pantheon.html', type: 'webcam' },
  { id: 'cam-venezia', city: 'Venezia', title: 'Piazza San Marco', url: 'https://www.skylinewebcams.com/en/webcam/italia/veneto/venezia/piazza-san-marco.html', type: 'webcam' },
  { id: 'cam-venezia-rialto', city: 'Venezia', title: 'Ponte di Rialto', url: 'https://www.skylinewebcams.com/en/webcam/italia/veneto/venezia/rialto.html', type: 'webcam' },
  { id: 'cam-napoli', city: 'Napoli', title: 'Vesuvio Panorama', url: 'https://www.skylinewebcams.com/en/webcam/italia/campania/napoli/napoli-vesuvio.html', type: 'webcam' },
  { id: 'cam-milano', city: 'Milano', title: 'Duomo di Milano', url: 'https://www.skylinewebcams.com/en/webcam/italia/lombardia/milano/duomo-milano.html', type: 'webcam' },
  { id: 'cam-firenze', city: 'Firenze', title: 'Ponte Vecchio', url: 'https://www.skylinewebcams.com/en/webcam/italia/toscana/firenze/ponte-vecchio.html', type: 'webcam' },
  { id: 'cam-etna', city: 'Catania', title: 'Etna Vulcano', url: 'https://www.skylinewebcams.com/en/webcam/italia/sicilia/catania/etna.html', type: 'webcam' },
  { id: 'cam-amalfi', city: 'Amalfi', title: 'Costiera Amalfitana', url: 'https://www.skylinewebcams.com/en/webcam/italia/campania/amalfi/amalfi.html', type: 'webcam' },
  { id: 'cam-stromboli', city: 'Stromboli', title: 'Stromboli Vulcano', url: 'https://www.skylinewebcams.com/en/webcam/italia/sicilia/messina/stromboli.html', type: 'webcam' },
  // Live news streams (YouTube)
  { id: 'stream-rainews', city: 'Italia', title: 'Rai News 24', url: 'https://www.youtube.com/watch?v=fDskBkYR0jk', type: 'news' },
  { id: 'stream-skytg24', city: 'Italia', title: 'Sky TG24', url: 'https://www.youtube.com/watch?v=z1R7GBgIjKk', type: 'news' },
  { id: 'stream-tgcom24', city: 'Italia', title: 'TGCOM24', url: 'https://www.youtube.com/watch?v=acF1scO3W08', type: 'news' },
  { id: 'stream-euronews', city: 'Europa', title: 'Euronews IT', url: 'https://www.youtube.com/watch?v=Yxv20VTsHKA', type: 'news' },
];

export async function GET() {
  return NextResponse.json({ cams: LIVE_CAMS, updatedAt: new Date().toISOString() });
}
