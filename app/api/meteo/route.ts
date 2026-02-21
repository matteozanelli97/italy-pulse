import { NextResponse } from "next/server";
import { fetchMeteo } from "@/lib/fetchers/meteo";
import type { MeteoResponse } from "@/types";

export async function GET() {
  const citta = fetchMeteo();

  const response: MeteoResponse = {
    citta,
    aggiornamento: new Date().toISOString(),
  };

  return NextResponse.json(response);
}
