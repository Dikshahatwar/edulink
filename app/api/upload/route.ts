export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import fs from "fs/promises";
import path from "path";
// import pdfParse from "pdf-parse";
import { calculatePlagiarismScore } from "@/lib/plagiarism";

export async function POST(req: Request) {
  try {
    // 🔐 AUTH CHECK
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = await verifyToken(token);

    if (!payload || payload.role !== "STUDENT") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // 📦 FORM DATA
    const formData = await req.formData();
    const files = formData.getAll("file") as File[];
    const assignmentId = formData.get("assignmentId") as string;

    if (!files || files.length === 0 || !assignmentId) {
      return NextResponse.json(
        { error: "Missing files or assignmentId" },
        { status: 400 }
      );
    }

    // 📁 Upload directory
    const uploadDir = path.join(process.cwd(), "uploads");

    try {
      await fs.access(uploadDir);
    } catch {
      await fs.mkdir(uploadDir, { recursive: true });
    }

    let combinedContent = "";
    let lastFileName = "";

    // 📂 PROCESS EACH FILE
    for (const file of files) {
      const buffer = Buffer.from(await file.arrayBuffer());

      const fileName = `${Date.now()}-${file.name}`;
      const filePath = path.join(uploadDir, fileName);

      await fs.writeFile(filePath, buffer);

      lastFileName = fileName;

      // 📄 Extract text
      
combinedContent += buffer.toString("utf-8") + "\n";
    }

    // 🔍 GET OTHER SUBMISSIONS
    const otherSubmissions = await prisma.submission.findMany({
      where: {
        assignmentId,
        studentId: { not: payload.id as string },
      },
      select: { content: true },
    });

    const otherTexts = otherSubmissions.map((s) => s.content);

    // 📊 CALCULATE PLAGIARISM
    const score = calculatePlagiarismScore(combinedContent, otherTexts);

    // 💾 SAVE TO DB
    const submission = await prisma.submission.create({
      data: {
        filePath: files.map(f => f.name).join(", "), 
        content: combinedContent,
        plagiarismScore: score,
        studentId: payload.id as string,
        assignmentId,
      },
    });

    return NextResponse.json({
      message: "Uploaded successfully",
      submission,
    });

  } catch (error) {
   console.error("Upload error FULL:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}