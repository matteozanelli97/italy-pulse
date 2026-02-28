import { NextResponse } from 'next/server';
import type { LiveCam } from '@/types';

export const dynamic = 'force-dynamic';

const LIVE_CAMS: LiveCam[] = [
  // Webcams — skylinewebcams
  { id: 'cam-roma-colosseo', city: 'Roma', title: 'Colosseo Live', url: 'https://www.skylinewebcams.com/en/webcam/italia/lazio/roma/colosseo.html', type: 'webcam', active: true },
  { id: 'cam-roma-pantheon', city: 'Roma', title: 'Pantheon', url: 'https://www.skylinewebcams.com/en/webcam/italia/lazio/roma/pantheon.html', type: 'webcam', active: true },
  { id: 'cam-venezia', city: 'Venezia', title: 'Piazza San Marco', url: 'https://www.skylinewebcams.com/en/webcam/italia/veneto/venezia/piazza-san-marco.html', type: 'webcam', active: true },
  { id: 'cam-venezia-rialto', city: 'Venezia', title: 'Ponte di Rialto', url: 'https://www.skylinewebcams.com/en/webcam/italia/veneto/venezia/rialto.html', type: 'webcam', active: true },
  { id: 'cam-napoli', city: 'Napoli', title: 'Vesuvio Panorama', url: 'https://www.skylinewebcams.com/en/webcam/italia/campania/napoli/napoli-vesuvio.html', type: 'webcam', active: true },
  { id: 'cam-milano', city: 'Milano', title: 'Duomo di Milano', url: 'https://www.skylinewebcams.com/en/webcam/italia/lombardia/milano/duomo-milano.html', type: 'webcam', active: true },
  { id: 'cam-firenze', city: 'Firenze', title: 'Ponte Vecchio', url: 'https://www.skylinewebcams.com/en/webcam/italia/toscana/firenze/ponte-vecchio.html', type: 'webcam', active: true },
  { id: 'cam-etna', city: 'Catania', title: 'Etna Vulcano', url: 'https://www.skylinewebcams.com/en/webcam/italia/sicilia/catania/etna.html', type: 'webcam', active: true },
  { id: 'cam-amalfi', city: 'Amalfi', title: 'Costiera Amalfitana', url: 'https://www.skylinewebcams.com/en/webcam/italia/campania/amalfi/amalfi.html', type: 'webcam', active: true },
  { id: 'cam-stromboli', city: 'Stromboli', title: 'Stromboli Vulcano', url: 'https://www.skylinewebcams.com/en/webcam/italia/sicilia/messina/stromboli.html', type: 'webcam', active: true },

  // Live news streams — direct site URLs (not YouTube which may change IDs)
  { id: 'stream-rainews', city: 'Italia', title: 'Rai News 24', url: 'https://www.rainews.it/notiziari/rainews24', type: 'news', active: true },
  { id: 'stream-skytg24', city: 'Italia', title: 'Sky TG24', url: 'https://video.sky.it/diretta/tg24', type: 'news', active: true },
  { id: 'stream-tgcom24', city: 'Italia', title: 'TGCOM24', url: 'https://www.tgcom24.mediaset.it/tgcom24-live/', type: 'news', active: true },
  { id: 'stream-euronews', city: 'Europa', title: 'Euronews IT', url: 'https://it.euronews.com/live', type: 'news', active: true },
];

export async function GET() {
  // HEAD-check each source for availability (with timeout)
  const camsWithStatus: LiveCam[] = await Promise.all(
    LIVE_CAMS.map(async (cam) => {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 3000);
        const res = await fetch(cam.url, {
          method: 'HEAD', signal: controller.signal, redirect: 'follow',
        });
        clearTimeout(timeout);
        return { ...cam, active: res.ok || res.status === 405 || res.status === 403 };
      } catch {
        return { ...cam, active: false };
      }
    })
  );

  return NextResponse.json({ cams: camsWithStatus, updatedAt: new Date().toISOString() });
}
