import { NextResponse } from "next/server";
import { findUserByVerificationToken, verifyUserEmail } from "@/lib/users";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");

  if (!token) {
    return NextResponse.redirect(
      new URL("/verify-status?status=error&message=Missing+token", request.url),
    );
  }

  try {
    const user = await findUserByVerificationToken(token);

    if (!user) {
      return NextResponse.redirect(
        new URL(
          "/verify-status?status=error&message=Invalid+or+expired+token",
          request.url,
        ),
      );
    }

    await verifyUserEmail(user.id);

    return NextResponse.redirect(
      new URL("/verify-status?status=success", request.url),
    );
  } catch (error) {
    console.error("Verification error:", error);
    return NextResponse.redirect(
      new URL(
        "/verify-status?status=error&message=Internal+server+error",
        request.url,
      ),
    );
  }
}
