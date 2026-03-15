import { NextResponse } from "next/server";
import { hashPassword } from "@/lib/auth";
import { createUser, findUserByUsername } from "@/lib/users";

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
    const existing = await findUserByUsername(username);
    if (existing) {
      return NextResponse.json(
        { error: "Username already exists" },
        { status: 409 },
      );
    }

    // Hash password and create user
    const passwordHash = await hashPassword(password);
    const user = await createUser(username, passwordHash, "user");

    return NextResponse.json(
      {
        message: "User created successfully",
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
