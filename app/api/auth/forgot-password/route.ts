import { NextResponse } from "next/server";
import { findUserByEmail, setResetToken } from "@/lib/users";
import { sendPasswordResetEmail } from "@/lib/mail";
import { randomBytes } from "crypto";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const user = await findUserByEmail(email);

    // For security, don't reveal if user exists. Just say email sent.
    if (user) {
      const resetToken = randomBytes(32).toString("hex");
      const expires = new Date(Date.now() + 3600000); // 1 hour

      await setResetToken(email, resetToken, expires);
      await sendPasswordResetEmail(email, resetToken);
    }

    return NextResponse.json({
      message:
        "If an account exists with this email, a reset link has been sent.",
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
