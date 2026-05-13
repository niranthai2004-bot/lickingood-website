"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  AlertCircle,
  ArrowUpRight,
  CheckCircle2,
  Plug,
  Receipt,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import { MerchantShell } from "@/components/merchant/MerchantShell";
import { supabase } from "@/lib/supabaseClient";

type MerchantSummary = {
  businessName: string;
  ownerName: string;
  email: string;
  locationCount: number;
  hasSquareConnection: boolean;
  squareMerchantId: string | null;
  lastSyncAt: string | null;
};

export default function MerchantDashboardPage() {
  return (
    <Suspense fallback={null}>
      <MerchantDashboardInner />
    </Suspense>
  );
}

function MerchantDashboardInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const justConnected = searchParams?.get("connected") === "1";

  const [summary, setSummary] = useState<MerchantSummary | null>(null);
  const [loading, setLoading] = useState(true);
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
        .select("id, business_name, owner_name, email")
        .eq("user_id", user.id)
        .maybeSingle();

      if (!merchant) {
        // No merchant row. Before sending to the (invite-only closed) signup
        // page, check whether this is an admin who landed here by accident —
        // admins should never be in merchant onboarding.
        const adminRes = await fetch("/api/admin/whoami", { cache: "no-store" });
        if (cancelled) return;
        if (adminRes.ok) {
          router.replace("/admin");
          return;
        }
        router.push("/merchant/signup");
        return;
      }

      const [{ count: locCount }, { data: conn }] = await Promise.all([
        supabase
          .from("merchant_locations")
          .select("id", { count: "exact", head: true })
          .eq("merchant_id", merchant.id),
        supabase
          .from("square_connections")
          .select("merchant_square_id, updated_at")
          .eq("merchant_id", merchant.id)
          .maybeSingle(),
      ]);

      if (cancelled) return;
      setSummary({
        businessName: merchant.business_name,
        ownerName: merchant.owner_name,
        email: merchant.email,
        locationCount: locCount ?? 0,
        hasSquareConnection: !!conn,
        squareMerchantId: conn?.merchant_square_id ?? null,
        lastSyncAt: conn?.updated_at ?? null,
      });
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [router]);

  if (!authChecked) return null;

  return (
    <MerchantShell businessName={summary?.businessName}>
      {/* Just-connected banner */}
      {justConnected && summary?.hasSquareConnection && (
        <div className="mb-6 flex items-start gap-3 rounded-2xl bg-amber-100 border border-amber-300 px-5 py-4">
          <CheckCircle2 size={18} className="text-amber-900 mt-0.5 shrink-0" />
          <div>
            <p className="font-display font-black text-cocoa-900">
              Square connected.
            </p>
            <p className="text-sm text-cocoa-700">
              We&apos;ll sync your menu and inventory in the background.
            </p>
          </div>
        </div>
      )}

      <div className="mb-8">
        <p className="text-[10px] font-black uppercase tracking-[0.22em] text-cocoa-700 mb-1">
          Dashboard
        </p>
        <h1 className="font-display text-4xl sm:text-5xl font-black text-cocoa-900 tracking-tight leading-[0.95]">
          {summary?.businessName ?? "Welcome"}
        </h1>
      </div>

      {/* Stat cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          eyebrow="Today's orders"
          value={loading ? "—" : "0"}
          sub="Live from Square POS"
        />
        <StatCard
          eyebrow="Connected locations"
          value={loading ? "—" : String(summary?.locationCount ?? 0)}
          sub="Pull more from Square Locations API"
        />
        <StatCard
          eyebrow="Square sync"
          value={
            loading
              ? "—"
              : summary?.hasSquareConnection
                ? "Connected"
                : "Not connected"
          }
          sub={
            summary?.lastSyncAt
              ? `Updated ${new Date(summary.lastSyncAt).toLocaleString()}`
              : "Connect to sync menu & inventory"
          }
          tone={summary?.hasSquareConnection ? "good" : "warn"}
        />
        <StatCard
          eyebrow="Inventory status"
          value={loading ? "—" : summary?.hasSquareConnection ? "Live" : "Idle"}
          sub="Square is the source of truth"
        />
      </div>

      {/* Connect Square primary CTA (shown if not connected) */}
      {!loading && !summary?.hasSquareConnection && (
        <div className="mt-8 rounded-3xl bg-gradient-to-br from-cream-50 via-cream-50 to-cream-100 border border-cream-200 p-6 sm:p-8 lg:p-10">
          <div className="grid lg:grid-cols-[1fr_auto] gap-6 items-center">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.22em] text-cocoa-700 mb-2">
                Required to start taking orders
              </p>
              <h2 className="font-display text-2xl sm:text-3xl font-black text-cocoa-900 leading-tight">
                Connect your Square account
              </h2>
              <p className="mt-2 text-sm text-cocoa-700 max-w-md">
                Sign in with Square and grant access. We&apos;ll sync your menu,
                inventory, and route orders directly to your POS.
              </p>
            </div>
            <Link
              href="/api/square/connect"
              className="inline-flex items-center justify-center gap-2 px-7 py-4 rounded-full bg-cocoa-900 hover:bg-cocoa-800 text-cream-50 font-bold text-base transition-all hover:scale-[1.02]"
            >
              <Plug size={17} /> Continue with Square
            </Link>
          </div>
        </div>
      )}

      {/* Square connection panel (shown if connected) */}
      {!loading && summary?.hasSquareConnection && (
        <div className="mt-8 grid lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2 rounded-3xl bg-cream-50 border border-cream-200 p-6">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.22em] text-cocoa-700 mb-1">
                  Square Connection
                </p>
                <p className="font-display text-xl font-black text-cocoa-900">
                  Connected to Square
                </p>
                <p className="mt-1 text-sm text-cocoa-700">
                  Your menu, inventory, and orders are syncing in real time.
                </p>
              </div>
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-50 text-emerald-900 text-[11px] font-black border border-emerald-200 shrink-0">
                <CheckCircle2 size={12} /> Active
              </span>
            </div>
            <dl className="mt-4 text-sm divide-y divide-cream-200">
              <Row label="Locations synced" value={String(summary.locationCount)} />
              <Row
                label="Last sync"
                value={
                  summary.lastSyncAt
                    ? new Date(summary.lastSyncAt).toLocaleString()
                    : "Just now"
                }
              />
            </dl>
            <div className="mt-5 flex flex-wrap gap-2">
              <Link
                href="/api/square/connect"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-cream-100 hover:bg-cream-200 text-cocoa-900 text-xs font-bold transition-colors"
              >
                <RefreshCw size={13} /> Reconnect Square
              </Link>
              <Link
                href="/merchant/menu"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-cocoa-900 hover:bg-cocoa-800 text-cream-50 text-xs font-bold transition-colors"
              >
                <RefreshCw size={13} /> Sync inventory
              </Link>
              <Link
                href="/merchant/connect-square"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-cream-100 hover:bg-cream-200 text-cocoa-900 text-xs font-bold transition-colors"
              >
                Manage permissions
              </Link>
            </div>
          </div>

          <div className="rounded-3xl bg-cream-50 border border-cream-200 p-6">
            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-cocoa-700 mb-1">
              Popular this week
            </p>
            <p className="font-display text-xl font-black text-cocoa-900">
              Coming soon
            </p>
            <p className="mt-2 text-sm text-cocoa-700">
              Once Square Catalog + Orders sync, top sellers per location appear
              here.
            </p>
            <Link
              href="/merchant/orders"
              className="mt-5 inline-flex items-center gap-1.5 text-xs font-bold text-cocoa-700 hover:text-cocoa-900"
            >
              <Receipt size={13} /> See orders <ArrowUpRight size={13} />
            </Link>
          </div>
        </div>
      )}
    </MerchantShell>
  );
}

function StatCard({
  eyebrow,
  value,
  sub,
  tone = "neutral",
}: {
  eyebrow: string;
  value: string;
  sub: string;
  tone?: "neutral" | "good" | "warn";
}) {
  const valueColor =
    tone === "good"
      ? "text-emerald-800"
      : tone === "warn"
        ? "text-amber-900"
        : "text-cocoa-900";
  return (
    <div className="rounded-2xl bg-cream-50 border border-cream-200 p-5">
      <p className="text-[10px] font-black uppercase tracking-[0.22em] text-cocoa-700">
        {eyebrow}
      </p>
      <p
        className={`font-display text-3xl font-black mt-1 leading-tight tabular-nums ${valueColor}`}
      >
        {value}
      </p>
      <p className="mt-1 text-xs text-cocoa-700 leading-snug">{sub}</p>
    </div>
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
      <dt className="text-xs text-cocoa-700 font-semibold">{label}</dt>
      <dd
        className={`text-sm text-cocoa-900 font-bold ${mono ? "font-mono text-xs" : ""}`}
      >
        {value}
      </dd>
    </div>
  );
}
