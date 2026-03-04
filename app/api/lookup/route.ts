import { NextRequest, NextResponse } from "next/server";
import { queryByBarcode } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { barcode } = body;

    if (!barcode || typeof barcode !== "string") {
      return NextResponse.json(
        { error: "Invalid or missing barcode" },
        { status: 400 },
      );
    }

    const trimmed = barcode.trim();
    if (!trimmed) {
      return NextResponse.json(
        { error: "Barcode cannot be empty" },
        { status: 400 },
      );
    }

    const result = await queryByBarcode(trimmed);

    if (!result) {
      return NextResponse.json(
        { error: "No record found for this barcode", barcode: trimmed },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      barcode: trimmed,
      data: result.data,
      qty: result.qty,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[/api/lookup] Error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
