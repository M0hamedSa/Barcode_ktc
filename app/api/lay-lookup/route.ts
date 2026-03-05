import { NextRequest, NextResponse } from "next/server";
import { getRollsByLayNo } from "@/lib/db";

export async function POST(req: NextRequest) {
    try {
        const { layNo } = await req.json();

        if (!layNo) {
            return NextResponse.json(
                { error: "Lay No is required" },
                { status: 400 }
            );
        }

        const rows = await getRollsByLayNo(layNo);

        return NextResponse.json({
            success: true,
            rows,
        });
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Unknown error";

        return NextResponse.json(
            { error: message },
            { status: 500 }
        );
    }
}