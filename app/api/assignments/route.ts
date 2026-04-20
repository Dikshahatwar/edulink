import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import fs from "fs/promises";
import path from "path";

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = await verifyToken(token);

    if (!payload || payload.role !== "FACULTY") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const formData = await req.formData();

    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const assignedDate = formData.get("assignedDate") as string;
    const submissionDate = formData.get("submissionDate") as string;
    const file = formData.get("file") as File;

    if (!title || !description || !assignedDate || !submissionDate) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    let filePath: string | null = null;

    if (file && file.size > 0) {
      const buffer = Buffer.from(await file.arrayBuffer());

      const uploadDir = path.join(process.cwd(), "public/uploads");
      await fs.mkdir(uploadDir, { recursive: true });

      const fileName = `${Date.now()}-${file.name}`;
      const fullPath = path.join(uploadDir, fileName);

      await fs.writeFile(fullPath, buffer);

      filePath = `/uploads/${fileName}`;
    }

    const assignment = await prisma.createdAssignment.create({
      data: {
        title,
        description,
        assignedDate: new Date(assignedDate), // ✅ new
        dueDate: new Date(submissionDate),   // ✅ reuse dueDate
        filePath,
        facultyId: payload.id as string,
      },
    });

    return NextResponse.json(assignment);

  } catch (error) {
    console.error("Create assignment error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}