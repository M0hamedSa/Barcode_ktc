import { NextRequest, NextResponse } from "next/server";
import { getErpRolls } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const { barcode } = await req.json();
    const barcodeArray = Array.isArray(barcode) ? barcode : [barcode]; // normalize
    const rows = await getErpRolls(barcodeArray);

    return NextResponse.json({
      success: true,
      rows,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
