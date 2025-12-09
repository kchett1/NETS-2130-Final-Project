import { trucks } from "@/data/trucks";
import { getCheckins } from "@/lib/store";
import { buildGoogleMapsUrl } from "@/lib/truck-utils";

const LOOKBACK_MINUTES = 60 * 24 * 7; // past week
const MAX_VOLUNTEERS = 8;
const MAX_TRUCKS = 6;

type VolunteerStat = {
  workerId: string;
  count: number;
  uniqueTrucks: number;
  avgRating: number | null;
  lastCheckinMs: number;
};

type TruckStat = {
  truckId: string;
  name: string;
  cuisine: string;
  count: number;
  supporters: number;
  presentShare: number | null;
  lastCheckinMs: number;
};

export const dynamic = "force-dynamic";

export default async function LeaderboardPage() {
  const checkins = await getCheckins({ minutes: LOOKBACK_MINUTES });

  const { topVolunteers, totalVolunteers, freshestCheckinMs } =
    buildVolunteerStats(checkins);
  const { topTrucks, activeTrucks } = buildTruckStats(checkins);

  const summaryCards = [
    {
      label: "Verified check-ins (7d)",
      value: checkins.length,
      helper: "Quality gated + rate limited",
    },
    {
      label: "Active volunteers",
      value: totalVolunteers,
      helper: "Unique worker IDs submitting",
    },
    {
      label: "Trucks seen this week",
      value: activeTrucks,
      helper: "Received at least one report",
    },
    {
      label: "Freshest update",
      value: freshestCheckinMs
        ? formatRelativeTime(freshestCheckinMs)
        : "Awaiting",
      helper: freshestCheckinMs ? "Latest ping" : "No submissions yet",
    },
  ];

  const insights = buildInsights(topVolunteers, topTrucks, freshestCheckinMs);

  return (
    <div className="min-h-screen bg-slate-50">
      <main className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-10 sm:px-6 lg:px-8">
        <header className="rounded-[36px] border border-slate-200/70 bg-white/90 p-8 shadow-lg shadow-slate-900/5">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-500">
            Engagement leaderboard · Last 7 days
          </p>
          <h1 className="mt-3 text-4xl font-semibold text-slate-900 sm:text-5xl">
            Who keeps LocustGrub fresh?
          </h1>
          <p className="mt-4 max-w-3xl text-lg text-slate-600">
            Every check-in unlocks better intel for hungry students. Track the
            volunteers logging the most verified updates and the trucks drawing
            the biggest crowds this week.
          </p>
        </header>

        <section className="grid gap-4 rounded-3xl border border-slate-200/80 bg-white/95 p-6 text-slate-900 shadow-lg shadow-slate-900/5 sm:grid-cols-2 lg:grid-cols-4">
          {summaryCards.map((card) => (
            <article key={card.label}>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
                {card.label}
              </p>
              <p className="mt-3 text-3xl font-semibold">
                {typeof card.value === "number"
                  ? card.value.toLocaleString()
                  : card.value}
              </p>
              <p className="text-sm text-slate-500">{card.helper}</p>
            </article>
          ))}
        </section>

        <section className="grid gap-8 lg:grid-cols-2">
          <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-md shadow-slate-900/5">
            <header className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
                  Top volunteers
                </p>
                <h2 className="text-2xl font-semibold text-slate-900">
                  Most verified check-ins
                </h2>
                <p className="text-sm text-slate-500">
                  Based on contributions in the last 7 days.
                </p>
              </div>
              <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                {totalVolunteers.toLocaleString()} active
              </span>
            </header>
            <div className="mt-5 divide-y divide-slate-100 border-y border-slate-100">
              {topVolunteers.length ? (
                topVolunteers.map((volunteer, index) => (
                  <div
                    key={volunteer.workerId}
                    className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-4 py-4 text-sm text-slate-700"
                  >
                    <span className="text-lg font-semibold text-slate-400">
                      #{index + 1}
                    </span>
                    <div>
                      <p className="text-base font-semibold text-slate-900">
                        {formatWorkerLabel(volunteer.workerId)}
                      </p>
                      <p className="text-xs text-slate-500">
                        {volunteer.uniqueTrucks} trucks ·{" "}
                        {volunteer.avgRating
                          ? `${volunteer.avgRating.toFixed(1)}★ avg`
                          : "no ratings"}{" "}
                        · {formatRelativeTime(volunteer.lastCheckinMs)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-semibold text-slate-900">
                        {volunteer.count}
                      </p>
                      <p className="text-xs uppercase tracking-wide text-slate-400">
                        Check-ins
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="py-6 text-center text-sm text-slate-500">
                  No verified submissions yet this week. Be the first to check
                  in from Locust Walk!
                </p>
              )}
            </div>
          </article>

          <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-md shadow-slate-900/5">
            <header className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
                  Most-checked trucks
                </p>
                <h2 className="text-2xl font-semibold text-slate-900">
                  Crowd energy board
                </h2>
                <p className="text-sm text-slate-500">
                  Aggregates presence votes + comments from the last 7 days.
                </p>
              </div>
              <span className="rounded-full bg-sky-100 px-3 py-1 text-xs font-semibold text-sky-700">
                {activeTrucks.toLocaleString()} trucks
              </span>
            </header>
            <div className="mt-5 space-y-4">
              {topTrucks.length ? (
                topTrucks.map((truck, index) => {
                  const meta = trucks.find((t) => t.id === truck.truckId);
                  return (
                    <div
                      key={truck.truckId}
                      className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
                            #{index + 1} · {truck.cuisine}
                          </p>
                          <h3 className="text-lg font-semibold text-slate-900">
                            {truck.name}
                          </h3>
                          <p className="text-xs text-slate-500">
                            {truck.supporters} volunteers ·{" "}
                            {truck.presentShare != null
                              ? `${truck.presentShare}% present votes`
                              : "No presence votes yet"}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-semibold text-slate-900">
                            {truck.count}
                          </p>
                          <p className="text-xs uppercase tracking-wide text-slate-400">
                            Reports
                          </p>
                          <p className="text-xs text-slate-500">
                            {formatRelativeTime(truck.lastCheckinMs)}
                          </p>
                        </div>
                      </div>
                      {meta && (
                        <a
                          href={buildGoogleMapsUrl(meta)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-slate-600 underline decoration-dotted hover:text-slate-900"
                        >
                          Directions <span aria-hidden="true">↗</span>
                        </a>
                      )}
                    </div>
                  );
                })
              ) : (
                <p className="py-6 text-center text-sm text-slate-500">
                  Once check-ins resume we&apos;ll highlight the busiest trucks
                  here.
                </p>
              )}
            </div>
          </article>
        </section>

        <section className="grid gap-6 rounded-3xl border border-slate-200/80 bg-white/95 p-6 text-sm text-slate-600 shadow-lg shadow-slate-900/5 md:grid-cols-3">
          {insights.map((insight) => (
            <article key={insight.title} className="space-y-2">
              <h3 className="text-base font-semibold text-slate-900">
                {insight.title}
              </h3>
              <p>{insight.body}</p>
            </article>
          ))}
        </section>
      </main>
    </div>
  );
}

function buildVolunteerStats(checkins: Awaited<ReturnType<typeof getCheckins>>) {
  const map = new Map<
    string,
    {
      count: number;
      uniqueTrucks: Set<string>;
      ratingSum: number;
      ratingCount: number;
      lastCheckinMs: number;
    }
  >();

  let freshestCheckinMs = 0;

  for (const checkin of checkins) {
    const timestamp = toTimestamp(checkin.createdAt);
    freshestCheckinMs = Math.max(freshestCheckinMs, timestamp);
    const current = map.get(checkin.workerId) ?? {
      count: 0,
      uniqueTrucks: new Set<string>(),
      ratingSum: 0,
      ratingCount: 0,
      lastCheckinMs: 0,
    };
    current.count += 1;
    current.uniqueTrucks.add(checkin.truckId);
    if (typeof checkin.rating === "number") {
      current.ratingSum += checkin.rating;
      current.ratingCount += 1;
    }
    current.lastCheckinMs = Math.max(current.lastCheckinMs, timestamp);
    map.set(checkin.workerId, current);
  }

  const topVolunteers: VolunteerStat[] = Array.from(map.entries())
    .map(([workerId, data]) => ({
      workerId,
      count: data.count,
      uniqueTrucks: data.uniqueTrucks.size,
      avgRating:
        data.ratingCount > 0 ? data.ratingSum / data.ratingCount : null,
      lastCheckinMs: data.lastCheckinMs,
    }))
    .sort((a, b) => {
      if (b.count !== a.count) return b.count - a.count;
      if (b.uniqueTrucks !== a.uniqueTrucks) {
        return b.uniqueTrucks - a.uniqueTrucks;
      }
      return b.lastCheckinMs - a.lastCheckinMs;
    })
    .slice(0, MAX_VOLUNTEERS);

  return {
    topVolunteers,
    totalVolunteers: map.size,
    freshestCheckinMs,
  };
}

function buildTruckStats(checkins: Awaited<ReturnType<typeof getCheckins>>) {
  const truckLookup = new Map(trucks.map((truck) => [truck.id, truck]));

  const map = new Map<
    string,
    {
      count: number;
      supporters: Set<string>;
      presentVotes: number;
      totalPresenceVotes: number;
      lastCheckinMs: number;
    }
  >();

  for (const checkin of checkins) {
    const timestamp = toTimestamp(checkin.createdAt);
    const current = map.get(checkin.truckId) ?? {
      count: 0,
      supporters: new Set<string>(),
      presentVotes: 0,
      totalPresenceVotes: 0,
      lastCheckinMs: 0,
    };
    current.count += 1;
    current.supporters.add(checkin.workerId);
    if (checkin.presence === "present" || checkin.presence === "absent") {
      current.totalPresenceVotes += 1;
      if (checkin.presence === "present") {
        current.presentVotes += 1;
      }
    }
    current.lastCheckinMs = Math.max(current.lastCheckinMs, timestamp);
    map.set(checkin.truckId, current);
  }

  const topTrucks: TruckStat[] = Array.from(map.entries())
    .map(([truckId, data]) => {
      const truck = truckLookup.get(truckId);
      return {
        truckId,
        name: truck?.name ?? truckId,
        cuisine: truck?.cuisine ?? "Food truck",
        count: data.count,
        supporters: data.supporters.size,
        presentShare:
          data.totalPresenceVotes > 0
            ? Math.round((data.presentVotes / data.totalPresenceVotes) * 100)
            : null,
        lastCheckinMs: data.lastCheckinMs,
      };
    })
    .sort((a, b) => {
      if (b.count !== a.count) return b.count - a.count;
      return b.lastCheckinMs - a.lastCheckinMs;
    })
    .slice(0, MAX_TRUCKS);

  return {
    topTrucks,
    activeTrucks: map.size,
  };
}

function buildInsights(
  volunteers: VolunteerStat[],
  trucksStats: TruckStat[],
  freshestCheckinMs: number,
) {
  const topVolunteer = volunteers[0];
  const topTruck = trucksStats[0];

  return [
    {
      title: "Most active reviewer",
      body: topVolunteer
        ? `${formatWorkerLabel(topVolunteer.workerId)} logged ${
            topVolunteer.count
          } verified check-ins across ${topVolunteer.uniqueTrucks} trucks.`
        : "No verified reviewers yet this week—share LocustGrub to kickstart submissions.",
    },
    {
      title: "Busiest truck",
      body: topTruck
        ? `${topTruck.name} attracted ${topTruck.count} reports from ${topTruck.supporters} volunteers, with ${
            topTruck.presentShare ?? "no"
          } present-vote signal.`
        : "Once we see fresh check-ins, the hottest truck of the week will surface here.",
    },
    {
      title: "Data freshness",
      body: freshestCheckinMs
        ? `Latest submission landed ${formatRelativeTime(
            freshestCheckinMs,
          )}. Keep the streak alive by checking in whenever you grab lunch.`
        : "We haven't received a check-in in the last 7 days. Open the home page and tap “Check in” to change that.",
    },
  ];
}

function formatWorkerLabel(workerId: string) {
  if (workerId.includes("@")) {
    const [netId, domain] = workerId.split("@");
    const school =
      domain && domain.includes(".") ? domain.split(".")[0] : domain ?? "penn";
    return `${netId}@${school}`;
  }
  if (workerId.startsWith("anon-")) {
    return workerId.replace("anon-", "anon·");
  }
  return workerId.slice(0, 12);
}

function formatRelativeTime(timestampMs: number) {
  if (!timestampMs) return "—";
  const diffMinutes = Math.max(
    0,
    Math.round((Date.now() - timestampMs) / 60_000),
  );
  if (diffMinutes < 60) {
    return `${diffMinutes}m ago`;
  }
  const diffHours = Math.round(diffMinutes / 60);
  if (diffHours < 24) {
    return `${diffHours}h ago`;
  }
  const diffDays = Math.round(diffHours / 24);
  return `${diffDays}d ago`;
}

function toTimestamp(dateString: string) {
  const ms = new Date(dateString).getTime();
  return Number.isNaN(ms) ? 0 : ms;
}

