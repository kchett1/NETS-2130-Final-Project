import { NextResponse } from "next/server";

import { listRecentCheckins } from "@/lib/truck-service";

export async function GET() {
  try {
    const submissions = await listRecentCheckins(100);
    return NextResponse.json({ submissions });
  } catch (error) {
    console.error("Failed to load submissions", error);
    return NextResponse.json(
      { error: "Unable to load submission log" },
      { status: 500 },
    );
  }
}

