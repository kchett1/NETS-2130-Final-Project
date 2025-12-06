import Link from "next/link";

import { getTruckStatuses } from "@/lib/truck-service";
import { deals } from "@/data/deals";
import { trucks } from "@/data/trucks";
import { buildGoogleMapsUrl } from "@/lib/truck-utils";

const truckLookup = new Map(trucks.map((truck) => [truck.id, truck]));

export const dynamic = "force-dynamic";

export default async function DealsPage() {
  const statuses = await getTruckStatuses();
  const statusMap = new Map(statuses.map((truck) => [truck.id, truck.status]));

  return (
    <div className="min-h-screen bg-slate-50">
      <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <header className="rounded-3xl border border-slate-200 bg-gradient-to-br from-white to-slate-100 p-8 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-wide text-emerald-600">
            Deals & Rewards
          </p>
          <h1 className="mt-2 text-3xl font-semibold text-slate-900 sm:text-4xl">
            Exclusive promos from Penn&apos;s favorite trucks
          </h1>
          <p className="mt-3 max-w-2xl text-lg text-slate-600">
            We&apos;re actively partnering with truck owners. Show this page at the
            window to redeem, and opt into the weekly raffle for a free meal at
            your favorite spot.
          </p>
        </header>

        <section className="mt-8 grid gap-6">
          {deals.map((deal) => {
            const truck = truckLookup.get(deal.truckId);
            if (!truck) return null;
            const status = statusMap.get(deal.truckId);

            return (
              <article
                key={deal.id}
                className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      {truck.name}
                    </p>
                    <h2 className="text-2xl font-semibold text-slate-900">
                      {deal.title}
                    </h2>
                    <p className="text-sm text-slate-500">{deal.description}</p>
                  </div>
                  <div className="text-right text-sm">
                    <p className="text-xs uppercase tracking-wide text-slate-500">
                      Reward
                    </p>
                    <p className="text-lg font-semibold text-slate-900">
                      {deal.reward}
                    </p>
                    <p className="text-xs text-slate-500">
                      Expires {new Date(deal.expiresOn).toLocaleDateString()}
                    </p>
                    {deal.promoCode && (
                      <p className="mt-2 rounded-full border border-dashed border-slate-300 px-3 py-1 text-xs font-semibold text-slate-700">
                        Code: {deal.promoCode}
                      </p>
                    )}
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-3 text-sm">
                  <span
                    className={`rounded-full px-3 py-1 font-semibold ${
                      status === "present"
                        ? "bg-emerald-100 text-emerald-700"
                        : status === "absent"
                          ? "bg-rose-100 text-rose-700"
                          : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {status === "present"
                      ? "Verified on campus"
                      : status === "absent"
                        ? "Likely away"
                        : "Status unknown"}
                  </span>
                  <Link
                    href={buildGoogleMapsUrl(truck)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-full border border-slate-300 px-3 py-1 font-semibold text-slate-800 transition hover:border-slate-900 hover:text-slate-900"
                  >
                    Directions
                  </Link>
                </div>
              </article>
            );
          })}
        </section>

        <section className="mt-10 rounded-3xl border border-dashed border-amber-200 bg-amber-50 p-6 text-sm text-amber-900">
          <h2 className="text-lg font-semibold">Weekly raffle</h2>
          <p className="mt-2">
            Submit at least one verified review this week and we&apos;ll drop
            you into the raffle for a free meal (up to $15) at the truck you
            visited most. Winners are announced every Friday inside our admin
            dashboard.
          </p>
        </section>
      </main>
    </div>
  );
}

