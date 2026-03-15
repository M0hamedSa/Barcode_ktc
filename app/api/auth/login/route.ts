import { NextResponse } from "next/server";
import { verifyPassword, createSession } from "@/lib/auth";
import { findUserByUsername } from "@/lib/users";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json(
        { error: "Username and password are required" },
        { status: 400 },
      );
    }

    // Find user
    const user = await findUserByUsername(username);
    if (!user) {
      return NextResponse.json(
        { error: "Invalid username or password" },
        { status: 401 },
      );
    }

    // Verify password
    const valid = await verifyPassword(password, user.password_hash);
    if (!valid) {
      return NextResponse.json(
        { error: "Invalid username or password" },
        { status: 401 },
      );
    }

    // Check approval (admins are exempt)
    if (!user.is_approved && user.role !== "admin") {
      return NextResponse.json(
        {
          error:
            "Your account is pending admin approval. Please wait for an administrator to approve your access.",
        },
        { status: 403 },
      );
    }

    // Create session
    await createSession(user.id, user.username, user.role);

    return NextResponse.json({
      message: "Login successful",
      user: { id: user.id, username: user.username, role: user.role },
    });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
