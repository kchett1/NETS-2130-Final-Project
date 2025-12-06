import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

import { createCheckin } from "@/lib/truck-service";

export async function POST(request: Request) {
  try {
    const payload = await request.json();

    if (!payload?.truckId || !payload?.presence || !payload?.lineLength) {
      return NextResponse.json(
        { error: "truckId, presence, and lineLength are required." },
        { status: 400 },
      );
    }

    const workerId =
      payload.workerId || request.headers.get("x-forwarded-for") || undefined;

    const record = await createCheckin({
      truckId: payload.truckId,
      presence: payload.presence,
      lineLength: payload.lineLength,
      comment: payload.comment,
      rating: payload.rating,
      enteredRaffle: payload.enteredRaffle,
      workerId,
    });

    revalidatePath("/");
    revalidatePath("/admin");

    return NextResponse.json({ ok: true, record }, { status: 201 });
  } catch (error) {
    console.error("Failed to create check-in", error);
    const message =
      error instanceof Error ? error.message : "Unknown error occurred";

    const status = message.includes("Rate limit") ? 429 : 500;

    return NextResponse.json(
      { error: message || "Failed to save check-in" },
      { status },
    );
  }
}

