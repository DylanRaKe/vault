import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json();

    if (!password) {
      return NextResponse.json(
        { error: "Password is required" },
        { status: 400 }
      );
    }

    const masterpass = process.env.MASTERPASS;
    if (!masterpass) {
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }

    // Simple comparison for now (can be enhanced with bcrypt if needed)
    const isValid = password === masterpass;

    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid password" },
        { status: 401 }
      );
    }

    // Generate a simple session token
    const token = Buffer.from(`${Date.now()}-${password}`).toString("base64");

    return NextResponse.json({ success: true, token });
  } catch (error) {
    console.error("Auth error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

