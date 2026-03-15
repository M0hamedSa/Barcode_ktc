import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { approveUser, deleteUser } from "@/lib/users";

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { userId, action } = await request.json();

    if (!userId || !action) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    if (action === "approve") {
      const success = await approveUser(userId);
      if (success) {
        return NextResponse.json({ message: "User approved successfully" });
      }
    } else if (action === "reject") {
      const success = await deleteUser(userId);
      if (success) {
        return NextResponse.json({
          message: "User registration rejected/deleted",
        });
      }
    }

    return NextResponse.json({ error: "Action failed" }, { status: 400 });
  } catch (error) {
    console.error("Admin action error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
