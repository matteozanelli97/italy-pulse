import { NextResponse } from "next/server";
import { getRegioni } from "@/lib/regions";
import {
  calcolaMoodNazionale,
  calcolaFattoriNazionali,
} from "@/lib/sentiment/algorithm";
import type { SentimentResponse } from "@/types";

export async function GET() {
  const regioni = getRegioni();
  const fattoriNazionali = calcolaFattoriNazionali(
    regioni.map((r) => r.fattori)
  );
  const moodNazionale = calcolaMoodNazionale(fattoriNazionali);

  const response: SentimentResponse = {
    moodNazionale,
    regioni,
  };

  return NextResponse.json(response);
}
