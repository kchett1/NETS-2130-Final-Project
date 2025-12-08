import type { Truck } from "@/data/trucks";
import type {
  CheckinRecord,
  LineLengthLabel,
  PresenceLabel,
  TruckStatus,
} from "@/lib/types";

type CountMap<T extends string> = Record<T, number>;

const LINE_OPTIONS: LineLengthLabel[] = ["none", "short", "medium", "long"];

export function aggregateTruckState(
  truck: Truck,
  checkins: CheckinRecord[],
): TruckStatus {
  const presenceCounts: CountMap<PresenceLabel> = {
    present: 0,
    absent: 0,
  };
  const lineCounts: CountMap<LineLengthLabel> = {
    none: 0,
    short: 0,
    medium: 0,
    long: 0,
  };

  let latestTimestamp: number | null = null;
  let latestVerified: number | undefined;

  for (const entry of checkins) {
    presenceCounts[entry.presence] += 1;
    lineCounts[entry.lineLength] += 1;

    const ts = new Date(entry.createdAt).getTime();
    if (!latestTimestamp || ts > latestTimestamp) {
      latestTimestamp = ts;
    }
    if (entry.presence === "present") {
      if (!latestVerified || ts > latestVerified) {
        latestVerified = ts;
      }
    }
  }

  const totalPresence = presenceCounts.present + presenceCounts.absent;
  let status: TruckStatus["status"] = "unknown";
  let statusConfidence = 0;

  if (totalPresence > 0) {
    status =
      presenceCounts.present >= presenceCounts.absent ? "present" : "absent";
    statusConfidence = presenceCounts[status] / totalPresence;
  }

  const totalLine = LINE_OPTIONS.reduce(
    (sum, key) => sum + lineCounts[key],
    0,
  );

  let lineLength: TruckStatus["lineLength"] = "unknown";
  let lineConfidence = 0;
  if (totalLine > 0) {
    lineLength = LINE_OPTIONS.reduce((best, option) => {
      if (lineCounts[option] > lineCounts[best]) {
        return option;
      }
      return best;
    }, LINE_OPTIONS[0]);

    lineConfidence = lineCounts[lineLength as LineLengthLabel] / totalLine;
  }

  const freshnessMinutes =
    latestTimestamp !== null
      ? Math.round((Date.now() - latestTimestamp) / (60 * 1000))
      : null;

  return {
    ...truck,
    status,
    statusConfidence: Number(statusConfidence.toFixed(2)),
    lineLength,
    lineConfidence: Number(lineConfidence.toFixed(2)),
    lastVerifiedAt: latestVerified
      ? new Date(latestVerified).toISOString()
      : undefined,
    submissionsInWindow: checkins.length,
    freshnessMinutes,
  };
}

export function formatFreshness(minutes: number | null): string {
  if (minutes === null) return "No recent reports";
  if (minutes < 5) return "Fresh (<5 min)";
  if (minutes < 15) return "Recent (5–15 min)";
  if (minutes < 30) return "Stale (15–30 min)";
  return "Stale (>30 min)";
}

