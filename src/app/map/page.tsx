import Link from "next/link";

import { TruckMap } from "@/components/truck-map";
import { getTruckStatuses } from "@/lib/truck-service";

export const dynamic = "force-dynamic";

export default async function MapPage() {
  const trucks = await getTruckStatuses();

  return (
    <div className="min-h-screen bg-slate-50">
      <main className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-10 sm:px-6 lg:px-8">
        <section className="rounded-3xl border border-slate-200 bg-gradient-to-br from-white to-slate-100 p-8 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-wide text-emerald-600">
            Live Map
          </p>
          <h1 className="mt-2 text-3xl font-semibold text-slate-900 sm:text-4xl">
            Tap any pin to see the latest crowd-sourced status.
          </h1>
          <p className="mt-3 max-w-2xl text-lg text-slate-600">
            Pins auto-refresh every 30 seconds. If the map ever fails to load,
            jump to the Google Maps fallback below.
          </p>
          <div className="mt-6 flex flex-wrap gap-3 text-sm text-slate-600">
            <span className="rounded-full bg-white/80 px-4 py-1">
              Trucks monitored: {trucks.length}
            </span>
            <span className="rounded-full bg-white/80 px-4 py-1">
              Window: last 30 minutes
            </span>
            <Link
              href="https://www.google.com/maps/search/?api=1&query=UPenn%20food%20trucks"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full border border-slate-300 px-4 py-1 font-semibold text-slate-800 transition hover:border-slate-900 hover:text-slate-900"
            >
              Open fallback map
            </Link>
          </div>
        </section>

        <TruckMap trucks={trucks} />
      </main>
    </div>
  );
}

