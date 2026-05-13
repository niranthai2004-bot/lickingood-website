"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowUpRight,
  ExternalLink,
  Loader2,
  MapPin,
  Power,
  RefreshCw,
} from "lucide-react";
import { MerchantShell } from "@/components/merchant/MerchantShell";
import { supabase } from "@/lib/supabaseClient";

type MerchantLocation = {
  id: string;
  location_name: string;
  address: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  phone: string | null;
  slug: string | null;
  square_location_id: string | null;
  is_active: boolean;
};

export default function MerchantLocationsPage() {
  const router = useRouter();
  const [locations, setLocations] = useState<MerchantLocation[]>([]);
  const [businessName, setBusinessName] = useState<string | null>(null);
  const [merchantId, setMerchantId] = useState<string | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [syncStatus, setSyncStatus] = useState<string | null>(null);

  const loadLocations = async (mId: string) => {
    const { data: locs } = await supabase
      .from("merchant_locations")
      .select(
        "id, location_name, address, city, state, zip, phone, slug, square_location_id, is_active",
      )
      .eq("merchant_id", mId)
      .order("created_at", { ascending: true });
    setLocations(locs ?? []);
  };

  useEffect(() => {
    (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push("/merchant/login");
        return;
      }
      setAuthChecked(true);
      const { data: merchant } = await supabase
        .from("merchants")
        .select("id, business_name")
        .eq("user_id", user.id)
        .maybeSingle();
      if (!merchant) return;
      setBusinessName(merchant.business_name);
      setMerchantId(merchant.id);
      await loadLocations(merchant.id);
    })();
  }, [router]);

  const handleSync = async () => {
    setSyncing(true);
    setSyncStatus(null);
    try {
      const res = await fetch("/api/square/sync-locations", { method: "POST" });
      const json = await res.json();
      if (!res.ok) {
        setSyncStatus(json.message ?? json.error ?? "Sync failed.");
      } else {
        setSyncStatus(
          `Synced ${json.synced} location${json.synced === 1 ? "" : "s"} from Square.`,
        );
        if (merchantId) await loadLocations(merchantId);
      }
    } catch (e) {
      setSyncStatus(String(e));
    }
    setSyncing(false);
  };

  const handleToggleActive = async (loc: MerchantLocation) => {
    if (!merchantId) return;
    setTogglingId(loc.id);
    const { error } = await supabase
      .from("merchant_locations")
      .update({ is_active: !loc.is_active })
      .eq("id", loc.id);
    if (!error) await loadLocations(merchantId);
    setTogglingId(null);
  };

  if (!authChecked) return null;

  const activeCount = locations.filter((l) => l.is_active).length;

  return (
    <MerchantShell businessName={businessName ?? undefined}>
      <div className="flex items-end justify-between gap-3 mb-6 flex-wrap">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.22em] text-cocoa-700 mb-1">
            Locations
          </p>
          <h1 className="font-display text-4xl sm:text-5xl font-black text-cocoa-900 tracking-tight leading-[0.95]">
            Your shops
          </h1>
          {locations.length > 0 && (
            <p className="mt-2 text-sm text-cocoa-700">
              {activeCount} active · {locations.length} total
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={handleSync}
          disabled={syncing}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-cocoa-900 hover:bg-cocoa-800 disabled:opacity-60 disabled:cursor-progress text-cream-50 text-sm font-bold transition-colors"
        >
          {syncing ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            <RefreshCw size={14} />
          )}
          {syncing ? "Syncing…" : "Pull from Square"}
        </button>
      </div>

      {syncStatus && (
        <p
          className={`mb-4 text-sm px-3 py-2 rounded-lg border ${
            syncStatus.startsWith("Synced")
              ? "bg-emerald-50 text-emerald-900 border-emerald-200"
              : "bg-rose-50 text-rose-900 border-rose-200"
          }`}
        >
          {syncStatus}
        </p>
      )}

      <p className="text-sm text-cocoa-700 mb-6 max-w-2xl">
        Each shop maps to a Square Location ID. Connect Square once — every
        location on your account syncs automatically and appears on the
        customer site. Toggle a shop off to hide it from customer ordering
        without unlinking it.
      </p>

      {locations.length === 0 ? (
        <div className="rounded-3xl bg-cream-100 border border-cream-200 p-10 text-center">
          <MapPin size={20} className="text-cocoa-700 mx-auto mb-2" />
          <p className="font-display font-black text-cocoa-900">
            No locations yet
          </p>
          <p className="mt-1 text-sm text-cocoa-700">
            Connect your Square account from the dashboard, then pull your
            locations.
          </p>
        </div>
      ) : (
        <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {locations.map((loc) => (
            <li
              key={loc.id}
              className={`rounded-2xl bg-cream-50 border p-5 transition-opacity ${
                loc.is_active
                  ? "border-cream-200"
                  : "border-cream-200 opacity-70"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-display text-lg font-black text-cocoa-900 leading-tight truncate">
                    {loc.location_name}
                  </p>
                  <p className="text-xs text-cocoa-700 mt-1">
                    {[loc.city, loc.state].filter(Boolean).join(", ") || "—"}
                  </p>
                </div>
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border shrink-0 ${
                    loc.is_active
                      ? "bg-emerald-50 text-emerald-900 border-emerald-200"
                      : "bg-cream-100 text-cocoa-700 border-cream-200"
                  }`}
                >
                  {loc.is_active ? "Active" : "Off"}
                </span>
              </div>

              {loc.address && (
                <p className="mt-3 text-xs text-cocoa-700 leading-snug">
                  {loc.address}
                </p>
              )}
              {loc.phone && (
                <p className="mt-1 text-xs text-cocoa-700">{loc.phone}</p>
              )}

              <dl className="mt-3 text-[11px] divide-y divide-cream-200">
                <Row label="URL slug" value={loc.slug ?? "not generated"} mono />
                <Row
                  label="Square ID"
                  value={loc.square_location_id ?? "not mapped"}
                  mono
                />
              </dl>

              <div className="mt-4 flex items-center gap-2 flex-wrap">
                {loc.slug && loc.is_active && (
                  <Link
                    href={`/order/pickup/${loc.slug}`}
                    target="_blank"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-cream-100 hover:bg-cream-200 text-cocoa-900 text-[11px] font-bold transition-colors"
                  >
                    <ExternalLink size={11} /> View on site
                  </Link>
                )}
                <button
                  type="button"
                  onClick={() => handleToggleActive(loc)}
                  disabled={togglingId === loc.id}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold transition-colors disabled:opacity-60 ${
                    loc.is_active
                      ? "bg-cream-100 hover:bg-cream-200 text-cocoa-900"
                      : "bg-cocoa-900 hover:bg-cocoa-800 text-cream-50"
                  }`}
                >
                  {togglingId === loc.id ? (
                    <Loader2 size={11} className="animate-spin" />
                  ) : (
                    <Power size={11} />
                  )}
                  {loc.is_active ? "Disable" : "Enable"}
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {locations.length > 0 && (
        <p className="mt-8 text-xs text-cocoa-700 max-w-2xl">
          Need to add a new store? Add it inside your Square Dashboard
          (Square handles all location creation), then click{" "}
          <span className="font-bold">&ldquo;Pull from Square&rdquo;</span>{" "}
          above. The new location will sync automatically with its own slug.
          <ArrowUpRight size={11} className="inline ml-0.5" />
        </p>
      )}
    </MerchantShell>
  );
}

function Row({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-3 py-2">
      <dt className="text-cocoa-700 uppercase tracking-wider font-bold">
        {label}
      </dt>
      <dd
        className={`text-cocoa-900 font-bold truncate ${
          mono ? "font-mono text-[10px]" : ""
        }`}
      >
        {value}
      </dd>
    </div>
  );
}
