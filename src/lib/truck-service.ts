import { trucks } from "@/data/trucks";
import { aggregateTruckState } from "@/lib/aggregation";
import { addCheckinRecord, getCheckins, getRecentCheckins } from "@/lib/store";
import type {
  CheckinInput,
  CheckinRecord,
  RecentCheckin,
  TruckStatus,
} from "@/lib/types";

const DEFAULT_WINDOW_MINUTES = 30;

export async function getTruckStatuses(
  windowMinutes: number = DEFAULT_WINDOW_MINUTES,
): Promise<TruckStatus[]> {
  const relevantCheckins = await getCheckins({ minutes: windowMinutes });
  const grouped = new Map<string, CheckinRecord[]>();

  for (const entry of relevantCheckins) {
    const bucket = grouped.get(entry.truckId) ?? [];
    bucket.push(entry);
    grouped.set(entry.truckId, bucket);
  }

  return trucks.map((truck) =>
    aggregateTruckState(truck, grouped.get(truck.id) ?? []),
  );
}

export async function createCheckin(input: CheckinInput) {
  return addCheckinRecord(input);
}

export async function listRecentCheckins(
  limit = 50,
): Promise<RecentCheckin[]> {
  const entries = await getRecentCheckins(limit);
  return entries.map((entry) => ({
    ...entry,
    relativeMinutes: Math.round(
      (Date.now() - new Date(entry.createdAt).getTime()) / (60 * 1000),
    ),
  }));
}

