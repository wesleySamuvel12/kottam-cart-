import { NextRequest, NextResponse } from "next/server";
import { getLiveDemandAnalysis } from "@/lib/koottam/demand-analysis";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  try {
    const analysis = await getLiveDemandAnalysis();
    return NextResponse.json(analysis);
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to calculate demand analysis" },
      { status: 500 }
    );
  }
}
