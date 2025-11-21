import { NextRequest, NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import { join } from "path";

function checkAuth(request: NextRequest): boolean {
  const authHeader = request.headers.get("authorization");
  return !!authHeader;
}

export async function POST(request: NextRequest) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const files = formData.getAll("file") as File[];

    if (files.length === 0) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const uploadResults = await Promise.all(
      files.map(async (file) => {
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        const filename = `${Date.now()}-${Math.random().toString(36).substring(7)}-${file.name}`;
        const path = join(process.cwd(), "public", "uploads", filename);

        await writeFile(path, buffer);

        return {
          filename,
          path: `/uploads/${filename}`,
        };
      })
    );

    return NextResponse.json({
      success: true,
      files: uploadResults,
      paths: uploadResults.map((r) => r.path),
    });
  } catch (error) {
    console.error("Error uploading file:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

