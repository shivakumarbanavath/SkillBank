import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const categories = await prisma.skillCategory.findMany({
      orderBy: { sortOrder: "asc" },
      select: { id: true, name: true, slug: true, icon: true },
    });
    return NextResponse.json(categories);
  } catch {
    return NextResponse.json([], { status: 500 });
  }
}
