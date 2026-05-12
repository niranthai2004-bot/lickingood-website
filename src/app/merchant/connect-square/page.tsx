"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  AlertCircle,
  CheckCircle2,
  ChefHat,
  MapPin,
  Receipt,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";
import { MerchantShell } from "@/components/merchant/MerchantShell";
import { supabase } from "@/lib/supabaseClient";

/**
 * Friendly error copy — never exposes Square error codes, raw API responses,
 * or developer terminology.
 */
const errorMessages: Record<string, string> = {
  invalid_state:
    "Your connection took too long to finish. Please try again.",
  missing_params:
    "We didn't receive everything we needed from Square. Please try again.",
  token_exchange_failed:
    "We weren't able to finish connecting to Square. Please try again.",
  persistence_failed:
    "We connected to Square but couldn't save your shop's setup. Please try again.",
  not_signed_in:
    "Please sign back into your merchant account before connecting Square.",
  no_merchant_record:
    "We couldn't find your shop yet. Please complete merchant signup first.",
  access_denied: "You declined Square's authorization request.",
};

const features = [
  {
    Icon: ChefHat,
    title: "Automatic menu updates",
    body: "Your Square catalog flows straight into the customer site.",
  },
  {
    Icon: MapPin,
    title: "Location-based ordering",
    body: "Each shop loads its own menu, hours, and availability.",
  },
  {
    Icon: RefreshCw,
    title: "Live inventory syncing",
    body: "Sold-out items disappear from the menu automatically.",
  },
  {
    Icon: Receipt,
    title: "Orders to your POS",
    body: "Online orders land on your tablet, ready to make.",
  },
];

export default function ConnectSquarePage() {
  // useSearchParams must be inside a Suspense boundary in Next.js 16.
  return (
    <Suspense fallback={null}>
      <ConnectSquareInner />
    </Suspense>
  );
}

function ConnectSquareInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const error = searchParams?.get("error");

  const [businessName, setBusinessName] = useState<string | null>(null);
  const [connected, setConnected] = useState(false);
  const [locationCount, setLocationCount] = useState(0);
  const [lastSyncAt, setLastSyncAt] = useState<string | null>(null);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (cancelled) return;
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
      const [{ data: conn }, { count }] = await Promise.all([
        supabase
          .from("square_connections")
          .select("updated_at")
          .eq("merchant_id", merchant.id)
          .maybeSingle(),
        supabase
          .from("merchant_locations")
          .select("id", { count: "exact", head: true })
          .eq("merchant_id", merchant.id),
      ]);
      if (conn) {
        setConnected(true);
        setLastSyncAt(conn.updated_at ?? null);
      }
      setLocationCount(count ?? 0);
    })();
    return () => {
      cancelled = true;
    };
  }, [router]);

  if (!authChecked) return null;

  return (
    <MerchantShell businessName={businessName ?? undefined}>
      <div className="max-w-3xl">
        {/* Error banner — friendly copy only */}
        {error && (
          <div className="mb-7 flex items-start gap-3 rounded-2xl bg-rose-50 border border-rose-200 px-5 py-4">
            <AlertCircle size={18} className="text-rose-900 mt-0.5 shrink-0" />
            <div>
              <p className="font-bold text-cocoa-900 text-sm">
                We couldn&apos;t finish connecting Square.
              </p>
              <p className="text-sm text-cocoa-700">
                {errorMessages[error] ??
                  "Something didn't go through. Please try again."}
              </p>
            </div>
          </div>
        )}

        {connected ? (
          <ConnectedPanel
            locationCount={locationCount}
            lastSyncAt={lastSyncAt}
          />
        ) : (
          <ConnectCard />
        )}
      </div>
    </MerchantShell>
  );
}

function ConnectCard() {
  return (
    <div className="relative rounded-card overflow-hidden bg-gradient-to-br from-cream-50 via-cream-50 to-cream-100 border border-cream-200 shadow-sm">
      <div
        aria-hidden
        className="absolute -top-20 -right-20 w-[420px] h-[420px] rounded-full opacity-50 blur-3xl pointer-events-none"
        style={{
          background:
            "radial-gradient(closest-side, rgba(253,222,180,0.7), transparent 70%)",
        }}
      />
      <div className="relative p-7 sm:p-9 lg:p-10">
        <p className="text-[10px] font-black uppercase tracking-[0.22em] text-cocoa-700 mb-2">
          Integration · Required to start taking orders
        </p>
        <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-black text-cocoa-900 leading-[1.02] tracking-tight">
          Connect your Square account.
        </h1>
        <p className="mt-3 text-base text-cocoa-700 max-w-xl">
          Securely sync your menu, inventory, and locations straight from
          Square POS. Setup takes less than a minute.
        </p>

        <ul className="mt-7 grid sm:grid-cols-2 gap-3">
          {features.map(({ Icon, title, body }) => (
            <li
              key={title}
              className="flex items-start gap-3 rounded-2xl bg-cream-50 border border-cream-200 p-4"
            >
              <div className="w-9 h-9 rounded-full bg-amber-100 border border-amber-200 text-cocoa-900 flex items-center justify-center shrink-0">
                <Icon size={16} />
              </div>
              <div>
                <p className="font-display font-black text-cocoa-900 text-sm">
                  {title}
                </p>
                <p className="text-xs text-cocoa-700 leading-snug mt-0.5">
                  {body}
                </p>
              </div>
            </li>
          ))}
        </ul>

        <div className="mt-8">
          <Link
            href="/api/square/connect"
            className="group inline-flex items-center justify-center gap-2 px-7 py-4 rounded-full bg-cocoa-900 hover:bg-cocoa-800 text-cream-50 font-bold text-base transition-all duration-300 hover:scale-[1.02]"
          >
            Continue with Square
          </Link>
          <p className="mt-3 inline-flex items-center gap-1.5 text-xs text-cocoa-700">
            <ShieldCheck size={13} className="text-cocoa-900" />
            We never see your passwords or banking information.
          </p>
        </div>
      </div>
    </div>
  );
}

function ConnectedPanel({
  locationCount,
  lastSyncAt,
}: {
  locationCount: number;
  lastSyncAt: string | null;
}) {
  return (
    <div className="rounded-card overflow-hidden bg-cream-50 border border-cream-200 shadow-sm">
      <div className="px-7 py-6 border-b border-cream-200 flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.22em] text-cocoa-700 mb-1">
            Status
          </p>
          <p className="font-display text-2xl sm:text-3xl font-black text-cocoa-900 leading-tight">
            Connected to Square
          </p>
          <p className="mt-1 text-sm text-cocoa-700">
            Your menu, inventory, and orders are syncing in real time.
          </p>
        </div>
        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-50 text-emerald-900 text-[11px] font-black border border-emerald-200">
          <CheckCircle2 size={12} /> Active
        </span>
      </div>

      <div className="px-7 py-6 grid sm:grid-cols-2 gap-4">
        <div className="rounded-2xl bg-cream-100 border border-cream-200 p-4">
          <p className="text-[10px] font-black uppercase tracking-[0.22em] text-cocoa-700">
            Locations synced
          </p>
          <p className="font-display text-3xl font-black text-cocoa-900 mt-1 tabular-nums">
            {locationCount}
          </p>
          <p className="mt-1 text-xs text-cocoa-700">
            Manage them on the Locations page.
          </p>
        </div>
        <div className="rounded-2xl bg-cream-100 border border-cream-200 p-4">
          <p className="text-[10px] font-black uppercase tracking-[0.22em] text-cocoa-700">
            Last sync
          </p>
          <p className="font-display text-xl font-black text-cocoa-900 mt-1">
            {lastSyncAt ? friendlyTime(lastSyncAt) : "Just now"}
          </p>
          <p className="mt-1 text-xs text-cocoa-700">
            We refresh automatically as things change.
          </p>
        </div>
      </div>

      <div className="px-7 py-5 border-t border-cream-200 flex flex-wrap gap-2">
        <Link
          href="/merchant/locations"
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-cocoa-900 hover:bg-cocoa-800 text-cream-50 text-sm font-bold transition-colors"
        >
          <MapPin size={14} /> Manage locations
        </Link>
        <Link
          href="/api/square/connect"
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-cream-100 hover:bg-cream-200 text-cocoa-900 text-sm font-bold transition-colors"
        >
          Reconnect Square
        </Link>
      </div>
    </div>
  );
}

function friendlyTime(iso: string) {
  const then = new Date(iso).getTime();
  const diffMin = Math.max(1, Math.round((Date.now() - then) / 60000));
  if (diffMin < 2) return "Just now";
  if (diffMin < 60) return `${diffMin} minutes ago`;
  const diffH = Math.round(diffMin / 60);
  if (diffH < 24) return `${diffH} hour${diffH === 1 ? "" : "s"} ago`;
  return new Date(iso).toLocaleDateString();
}
