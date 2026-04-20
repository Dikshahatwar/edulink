export const dynamic = "force-dynamic";


import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const fileName = url.searchParams.get("file");
  
  if (!fileName) return new Response("Missing file", { status: 400 });

  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) return new Response("Unauthorized", { status: 401 });
  
  const payload = await verifyToken(token);
  if (!payload || payload.role !== "FACULTY") return new Response("Forbidden", { status: 403 });

  try {
    const filePath = path.join(process.cwd(), "uploads", fileName);
    const fileBuffer = await fs.readFile(filePath);
    
    return new Response(fileBuffer, {
      headers: {
        "Content-Disposition": `attachment; filename="${fileName}"`,
        "Content-Type": "application/octet-stream",
      }
    });
  } catch (error) {
    return new Response("File not found", { status: 404 });
  }
}
