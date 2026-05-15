"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArchiveRestore,
  ArrowUpRight,
  Bike,
  Clock,
  ExternalLink,
  Loader2,
  MapPin,
  Power,
  RefreshCw,
  ShoppingBag,
  Trash2,
} from "lucide-react";
import { MerchantShell } from "@/components/merchant/MerchantShell";
import { supabase } from "@/lib/supabaseClient";
import {
  getTodayHours,
  getWeeklySchedule,
  type BusinessHoursPeriod,
} from "@/lib/hours";

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
  archived_at: string | null;
  timezone: string | null;
  business_hours: BusinessHoursPeriod[] | null;
  pickup_enabled: boolean;
  delivery_enabled: boolean;
};

export default function MerchantLocationsPage() {
  const router = useRouter();
  const [locations, setLocations] = useState<MerchantLocation[]>([]);
  const [businessName, setBusinessName] = useState<string | null>(null);
  const [merchantId, setMerchantId] = useState<string | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [syncStatus, setSyncStatus] = useState<string | null>(null);
  const [showArchived, setShowArchived] = useState(false);

  const loadLocations = async (mId: string) => {
    const { data: locs } = await supabase
      .from("merchant_locations")
      .select(
        "id, location_name, address, city, state, zip, phone, slug, square_location_id, is_active, archived_at, timezone, business_hours, pickup_enabled, delivery_enabled",
      )
      .eq("merchant_id", mId)
      .order("created_at", { ascending: true });
    setLocations(locs ?? []);
  };

  const handleToggleFulfillment = async (
    loc: MerchantLocation,
    channel: "pickup" | "delivery",
  ) => {
    if (!merchantId) return;
    setBusyId(loc.id);
    const column = channel === "pickup" ? "pickup_enabled" : "delivery_enabled";
    const next =
      channel === "pickup" ? !loc.pickup_enabled : !loc.delivery_enabled;
    const { error } = await supabase
      .from("merchant_locations")
      .update({ [column]: next })
      .eq("id", loc.id);
    if (!error) await loadLocations(merchantId);
    setBusyId(null);
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
    setBusyId(loc.id);
    const { error } = await supabase
      .from("merchant_locations")
      .update({ is_active: !loc.is_active })
      .eq("id", loc.id);
    if (!error) await loadLocations(merchantId);
    setBusyId(null);
  };

  const handleArchive = async (loc: MerchantLocation) => {
    if (!merchantId) return;
    const confirmText = loc.archived_at
      ? `Restore "${loc.location_name}"? It will reappear on the customer site.`
      : `Archive "${loc.location_name}"? It will be hidden from the customer site and from future Square syncs (re-pulling won't bring it back unless you restore it).`;
    if (!window.confirm(confirmText)) return;

    setBusyId(loc.id);
    const { error } = await supabase
      .from("merchant_locations")
      .update({ archived_at: loc.archived_at ? null : new Date().toISOString() })
      .eq("id", loc.id);
    if (!error) await loadLocations(merchantId);
    setBusyId(null);
  };

  if (!authChecked) return null;

  const visibleLocations = showArchived
    ? locations
    : locations.filter((l) => !l.archived_at);
  const activeCount = locations.filter(
    (l) => l.is_active && !l.archived_at,
  ).length;
  const archivedCount = locations.filter((l) => l.archived_at).length;

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
              {archivedCount > 0 && ` · ${archivedCount} archived`}
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

      <p className="text-sm text-cocoa-700 mb-4 max-w-2xl">
        Each shop maps to a Square Location ID. Connect Square once — every
        location on your account syncs automatically. Disable to temporarily
        hide a shop from customers. Archive to remove it from the customer
        site AND from future Square syncs (re-pulling won&apos;t resurrect
        it until you restore).
      </p>

      {archivedCount > 0 && (
        <label className="inline-flex items-center gap-2 mb-6 text-xs font-bold text-cocoa-700 cursor-pointer">
          <input
            type="checkbox"
            checked={showArchived}
            onChange={(e) => setShowArchived(e.target.checked)}
            className="rounded border-cream-300 text-cocoa-900 focus:ring-cocoa-900"
          />
          Show archived ({archivedCount})
        </label>
      )}

      {visibleLocations.length === 0 ? (
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
          {visibleLocations.map((loc) => {
            const archived = !!loc.archived_at;
            const live = loc.is_active && !archived;
            return (
              <li
                key={loc.id}
                className={`rounded-2xl bg-cream-50 border p-5 transition-opacity ${
                  live ? "border-cream-200" : "border-cream-200 opacity-70"
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
                      archived
                        ? "bg-stone-100 text-stone-700 border-stone-200"
                        : live
                          ? "bg-emerald-50 text-emerald-900 border-emerald-200"
                          : "bg-amber-50 text-amber-900 border-amber-200"
                    }`}
                  >
                    {archived ? "Archived" : live ? "Active" : "Off"}
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

                {/* Today's open status + Today's hours summary */}
                {!archived && (
                  <TodaySummary
                    periods={loc.business_hours ?? null}
                    timezone={loc.timezone ?? undefined}
                  />
                )}

                {/* Fulfillment channel toggles (pickup / delivery per location) */}
                {!archived && (
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <ChannelToggle
                      label="Pickup"
                      Icon={ShoppingBag}
                      enabled={loc.pickup_enabled}
                      busy={busyId === loc.id}
                      onToggle={() => handleToggleFulfillment(loc, "pickup")}
                    />
                    <ChannelToggle
                      label="Delivery"
                      Icon={Bike}
                      enabled={loc.delivery_enabled}
                      busy={busyId === loc.id}
                      onToggle={() => handleToggleFulfillment(loc, "delivery")}
                    />
                  </div>
                )}

                {/* Weekly schedule (collapsed by default) */}
                {!archived &&
                  Array.isArray(loc.business_hours) &&
                  loc.business_hours.length > 0 && (
                    <WeeklyDisclosure periods={loc.business_hours} />
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
                  {!archived && loc.slug && live && (
                    <Link
                      href={`/order/pickup/${loc.slug}`}
                      target="_blank"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-cream-100 hover:bg-cream-200 text-cocoa-900 text-[11px] font-bold transition-colors"
                    >
                      <ExternalLink size={11} /> View on site
                    </Link>
                  )}
                  {!archived && (
                    <button
                      type="button"
                      onClick={() => handleToggleActive(loc)}
                      disabled={busyId === loc.id}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold transition-colors disabled:opacity-60 ${
                        loc.is_active
                          ? "bg-cream-100 hover:bg-cream-200 text-cocoa-900"
                          : "bg-cocoa-900 hover:bg-cocoa-800 text-cream-50"
                      }`}
                    >
                      {busyId === loc.id ? (
                        <Loader2 size={11} className="animate-spin" />
                      ) : (
                        <Power size={11} />
                      )}
                      {loc.is_active ? "Disable" : "Enable"}
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => handleArchive(loc)}
                    disabled={busyId === loc.id}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold transition-colors disabled:opacity-60 ${
                      archived
                        ? "bg-cocoa-900 hover:bg-cocoa-800 text-cream-50"
                        : "bg-rose-50 hover:bg-rose-100 text-rose-900 border border-rose-200"
                    }`}
                  >
                    {busyId === loc.id ? (
                      <Loader2 size={11} className="animate-spin" />
                    ) : archived ? (
                      <ArchiveRestore size={11} />
                    ) : (
                      <Trash2 size={11} />
                    )}
                    {archived ? "Restore" : "Archive"}
                  </button>
                </div>
              </li>
            );
          })}
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

function TodaySummary({
  periods,
  timezone,
}: {
  periods: BusinessHoursPeriod[] | null;
  timezone?: string;
}) {
  const today = getTodayHours(periods ?? undefined, timezone);
  if (today.label === "Hours not available") return null;
  return (
    <div className="mt-3 flex items-center gap-2 text-xs">
      <Clock size={12} className="text-cocoa-900 shrink-0" />
      <span className="font-semibold text-cocoa-900 truncate">
        {today.label}
      </span>
      <span
        className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border shrink-0 ${
          today.isOpenNow
            ? "bg-emerald-50 text-emerald-900 border-emerald-200"
            : "bg-stone-100 text-stone-700 border-stone-200"
        }`}
      >
        {today.isOpenNow ? "Open" : "Closed"}
      </span>
    </div>
  );
}

function ChannelToggle({
  label,
  Icon,
  enabled,
  busy,
  onToggle,
}: {
  label: string;
  Icon: React.ComponentType<{ size?: number; className?: string }>;
  enabled: boolean;
  busy: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      disabled={busy}
      className={`inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-[11px] font-bold transition-colors disabled:opacity-60 border ${
        enabled
          ? "bg-emerald-50 text-emerald-900 border-emerald-200 hover:bg-emerald-100"
          : "bg-cream-100 text-cocoa-700 border-cream-200 hover:bg-cream-200"
      }`}
      aria-pressed={enabled}
    >
      {busy ? (
        <Loader2 size={12} className="animate-spin" />
      ) : (
        <Icon size={12} />
      )}
      {label}
      <span
        className={`ml-auto w-1.5 h-1.5 rounded-full ${
          enabled ? "bg-emerald-500" : "bg-stone-400"
        }`}
      />
    </button>
  );
}

function WeeklyDisclosure({
  periods,
}: {
  periods: BusinessHoursPeriod[];
}) {
  const [open, setOpen] = useState(false);
  const schedule = getWeeklySchedule(periods);
  return (
    <details
      className="mt-3 rounded-xl bg-cream-100 border border-cream-200 px-3 py-2 text-[11px]"
      open={open}
      onToggle={(e) => setOpen((e.target as HTMLDetailsElement).open)}
    >
      <summary className="cursor-pointer font-bold text-cocoa-900 list-none flex items-center justify-between">
        Full weekly hours
        <span className="text-cocoa-700">{open ? "Hide" : "Show"}</span>
      </summary>
      <ul className="mt-2 divide-y divide-cream-200">
        {schedule.map((row) => (
          <li
            key={row.day}
            className="flex items-center justify-between gap-3 py-1.5"
          >
            <span className="text-cocoa-700">{row.shortDay}</span>
            <span
              className={`font-bold ${
                row.hours ? "text-cocoa-900" : "text-cocoa-700/60"
              }`}
            >
              {row.hours ?? "Closed"}
            </span>
          </li>
        ))}
      </ul>
    </details>
  );
}
