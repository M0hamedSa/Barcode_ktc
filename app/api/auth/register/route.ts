import { NextResponse } from "next/server";
import { hashPassword } from "@/lib/auth";
import { createUser, findUserByUsername, findUserByEmail } from "@/lib/users";
import { sendVerificationEmail } from "@/lib/mail";
import { randomBytes } from "crypto";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { username, email, password } = body;

    if (!username || !email || !password) {
      return NextResponse.json(
        { error: "Username, email and password are required" },
        { status: 400 },
      );
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 },
      );
    }

    if (username.length < 3) {
      return NextResponse.json(
        { error: "Username must be at least 3 characters" },
        { status: 400 },
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 },
      );
    }

    // Check if username exists
    const existingUser = await findUserByUsername(username);
    if (existingUser) {
      return NextResponse.json(
        { error: "Username already exists" },
        { status: 409 },
      );
    }

    // Check if email exists
    const existingEmail = await findUserByEmail(email);
    if (existingEmail) {
      return NextResponse.json(
        { error: "Email already exists" },
        { status: 409 },
      );
    }

    // Hash password and create user
    const passwordHash = await hashPassword(password);
    const verificationToken = randomBytes(32).toString("hex");

    const user = await createUser(
      username,
      email,
      passwordHash,
      verificationToken,
      "user",
    );

    // Send verification email (don't await to avoid registration delay, or await for reliability)
    try {
      await sendVerificationEmail(email, verificationToken);
    } catch (mailError) {
      console.error("Failed to send verification email:", mailError);
      // We still created the user, they can try to resend or reset later
    }

    return NextResponse.json(
      {
        message:
          "User created successfully. Please check your email to verify your account.",
        user: { id: user.id, username: user.username, role: user.role },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Register error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
