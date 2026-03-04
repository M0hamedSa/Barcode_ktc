import { NextRequest, NextResponse } from "next/server";
import { saveLayNoForRollBarcodes } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const layNo = String(body?.layNo ?? "").trim();
    const barcodes = Array.isArray(body?.barcodes) ? body.barcodes : [];

    if (!layNo) {
      return NextResponse.json(
        { error: "Lay No is required" },
        { status: 400 },
      );
    }

    const cleaned = barcodes
      .map((b: unknown) => String(b ?? "").trim())
      .filter(Boolean);

    if (cleaned.length === 0) {
      return NextResponse.json(
        { error: "No selected barcodes to update" },
        { status: 400 },
      );
    }

    const updated = await saveLayNoForRollBarcodes(layNo, cleaned);

    return NextResponse.json({ success: true, updated });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
