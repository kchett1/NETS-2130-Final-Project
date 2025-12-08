import { NextResponse } from "next/server";

import { getTruckStatuses } from "@/lib/truck-service";

export async function GET() {
  try {
    const trucks = await getTruckStatuses();
    return NextResponse.json({ trucks });
  } catch (error) {
    console.error("Failed to load trucks", error);
    return NextResponse.json(
      { error: "Failed to load truck statuses" },
      { status: 500 },
    );
  }
}

