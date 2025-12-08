"use client";

import { useMemo, useState } from "react";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import L, { type LatLngExpression } from "leaflet";
import Link from "next/link";

import type { TruckStatus } from "@/lib/types";
import { buildGoogleMapsUrl, CAMPUS_CENTER } from "@/lib/truck-utils";

const ICON_RETINA =
  "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png";
const ICON_DEFAULT =
  "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png";
const ICON_SHADOW =
  "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png";

const defaultIcon = L.icon({
  iconRetinaUrl: ICON_RETINA,
  iconUrl: ICON_DEFAULT,
  shadowUrl: ICON_SHADOW,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

type TruckMapProps = {
  trucks: TruckStatus[];
};

export function TruckMap({ trucks }: TruckMapProps) {
  const [activeId, setActiveId] = useState<string | null>(null);

  const center = useMemo<LatLngExpression>(() => {
    if (!trucks.length) return [CAMPUS_CENTER.lat, CAMPUS_CENTER.lng];
    const avgLat =
      trucks.reduce((sum, truck) => sum + truck.lat, 0) / trucks.length;
    const avgLng =
      trucks.reduce((sum, truck) => sum + truck.lng, 0) / trucks.length;
    return [avgLat, avgLng];
  }, [trucks]);

  return (
    <div className="space-y-4">
      <MapContainer
        center={center}
        zoom={15}
        scrollWheelZoom={false}
        className="h-[70vh] w-full rounded-3xl"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {trucks.map((truck) => (
          <Marker
            key={truck.id}
            position={[truck.lat, truck.lng]}
            icon={defaultIcon}
            eventHandlers={{
              click: () => setActiveId(truck.id),
            }}
          >
            <Popup>
              <div className="space-y-1 text-sm">
                <p className="font-semibold text-slate-900">{truck.name}</p>
                <p className="text-xs text-slate-500">{truck.cuisine}</p>
                <StatusRow label="Status" value={formatStatus(truck.status)} />
                <StatusRow
                  label="Line"
                  value={formatLine(truck.lineLength)}
                />
                <Link
                  href={buildGoogleMapsUrl(truck)}
                  className="mt-2 inline-flex rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold text-white"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Open in Google Maps
                </Link>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {activeId && (
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          {trucks
            .filter((truck) => truck.id === activeId)
            .map((truck) => (
              <div key={truck.id}>
                <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                  Selected truck
                </p>
                <h3 className="text-2xl font-semibold text-slate-900">
                  {truck.name}
                </h3>
                <p className="text-sm text-slate-500">{truck.cuisine}</p>
                <p className="mt-2 text-sm text-slate-600">
                  {truck.shortDescription}
                </p>
                <dl className="mt-4 grid grid-cols-2 gap-4 text-sm">
                  <StatusRow
                    label="Status"
                    value={`${formatStatus(truck.status)} (${(
                      truck.statusConfidence * 100
                    ).toFixed(0)}%)`}
                  />
                  <StatusRow
                    label="Line"
                    value={`${formatLine(truck.lineLength)} (${(
                      truck.lineConfidence * 100
                    ).toFixed(0)}%)`}
                  />
                  <StatusRow
                    label="Last verified"
                    value={
                      truck.lastVerifiedAt
                        ? new Date(truck.lastVerifiedAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "Not yet"
                    }
                  />
                  <StatusRow
                    label="Reports (30m)"
                    value={truck.submissionsInWindow.toString()}
                  />
                </dl>
                <div className="mt-4 flex flex-wrap gap-3">
                  <Link
                    href={buildGoogleMapsUrl(truck)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-full border border-slate-300 px-4 py-1.5 text-sm font-semibold text-slate-800 transition hover:border-slate-900 hover:text-slate-900"
                  >
                    Directions
                  </Link>
                  <Link
                    href="/"
                    className="rounded-full bg-slate-900 px-4 py-1.5 text-sm font-semibold text-white transition hover:bg-slate-800"
                  >
                    Back to list
                  </Link>
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}

function StatusRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col">
      <dt className="text-xs uppercase tracking-wide text-slate-500">
        {label}
      </dt>
      <dd className="text-sm font-medium text-slate-900">{value}</dd>
    </div>
  );
}

function formatStatus(status: TruckStatus["status"]) {
  switch (status) {
    case "present":
      return "Verified here";
    case "absent":
      return "Likely away";
    default:
      return "Unknown";
  }
}

function formatLine(line: TruckStatus["lineLength"]) {
  if (line === "unknown") return "Unknown";
  if (line === "none") return "No line";
  if (line === "short") return "Short";
  if (line === "medium") return "Medium";
  if (line === "long") return "Long";
  return line;
}

