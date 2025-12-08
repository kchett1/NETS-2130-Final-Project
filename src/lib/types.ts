import type { Truck } from "@/data/trucks";

export type PresenceLabel = "present" | "absent";
export type LineLengthLabel = "none" | "short" | "medium" | "long";

export type CheckinRecord = {
  id: string;
  truckId: string;
  presence: PresenceLabel;
  lineLength: LineLengthLabel;
  comment?: string;
  rating?: number;
  enteredRaffle?: boolean;
  workerId: string;
  createdAt: string;
};

export type CheckinInput = {
  truckId: string;
  presence: PresenceLabel;
  lineLength: LineLengthLabel;
  comment?: string;
  workerId?: string;
  rating?: number;
  enteredRaffle?: boolean;
};

export type TruckStatus = Truck & {
  status: PresenceLabel | "unknown";
  statusConfidence: number;
  lineLength: LineLengthLabel | "unknown";
  lineConfidence: number;
  lastVerifiedAt?: string;
  submissionsInWindow: number;
  freshnessMinutes: number | null;
};

export type RecentCheckin = CheckinRecord & {
  relativeMinutes: number;
};

