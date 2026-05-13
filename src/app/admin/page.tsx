"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowUpRight, Plug, ShieldCheck, Users } from "lucide-react";
import { AdminShell } from "@/components/admin/AdminShell";
import { supabase } from "@/lib/supabaseClient";

type Summary = {
  merchantCount: number;
  connectedCount: number;
};

export default function AdminOverviewPage() {
  const router = useRouter();
  const [adminEmail, setAdminEmail] = useState<string | undefined>();
  const [summary, setSummary] = useState<Summary | null>(null);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      // Verify admin via server check by hitting a guarded endpoint
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (cancelled) return;
      if (!user) {
        router.push("/admin/login");
        return;
      }
      // Quick client-side hint — server-side enforcement still happens in API routes
      const res = await fetch("/api/admin/whoami", { cache: "no-store" });
      if (res.status === 403) {
        // Signed in but not admin — wipe the session so the admin login page
        // shows the form cleanly instead of auto-redirecting back here.
        await supabase.auth.signOut({ scope: "local" });
        router.push("/admin/login?error=not_admin");
        return;
      }
      setAdminEmail(user.email);
      setChecked(true);

      const [{ count: merchantCount }, { count: connectedCount }] =
        await Promise.all([
          supabase
            .from("merchants")
            .select("id", { count: "exact", head: true }),
          supabase
            .from("square_connections")
            .select("id", { count: "exact", head: true }),
        ]);

      if (cancelled) return;
      setSummary({
        merchantCount: merchantCount ?? 0,
        connectedCount: connectedCount ?? 0,
      });
    })();
    return () => {
      cancelled = true;
    };
  }, [router]);

  if (!checked) return null;

  return (
    <AdminShell adminEmail={adminEmail}>
      <div className="mb-8">
        <p className="text-[10px] font-black uppercase tracking-[0.22em] text-cocoa-700 mb-1">
          Overview
        </p>
        <h1 className="font-display text-4xl sm:text-5xl font-black text-cocoa-900 tracking-tight leading-[0.95]">
          Platform Admin
        </h1>
        <p className="mt-3 text-base text-cocoa-700 max-w-xl">
          Invite merchants, monitor Square connections, and manage the
          platform&apos;s onboarding from one place.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 gap-5">
        <StatCard
          eyebrow="Merchants"
          value={summary ? String(summary.merchantCount) : "—"}
          sub="Invited shop owners"
          Icon={Users}
        />
        <StatCard
          eyebrow="Square connected"
          value={summary ? String(summary.connectedCount) : "—"}
          sub="Live OAuth sessions"
          Icon={Plug}
        />
      </div>

      <div className="mt-8 grid md:grid-cols-2 gap-5">
        <Link
          href="/admin/merchants"
          className="group rounded-3xl bg-cream-50 border border-cream-200 p-6 hover:shadow-md transition-shadow"
        >
          <Users size={20} className="text-cocoa-900 mb-3" />
          <p className="font-display text-xl font-black text-cocoa-900">
            Manage merchants
          </p>
          <p className="mt-1 text-sm text-cocoa-700">
            View the list of invited merchants, send new invites, and track
            onboarding progress.
          </p>
          <span className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-cocoa-700 group-hover:text-cocoa-900">
            Open merchant list <ArrowUpRight size={13} />
          </span>
        </Link>

        <div className="rounded-3xl bg-cream-50 border border-cream-200 p-6">
          <ShieldCheck size={20} className="text-cocoa-900 mb-3" />
          <p className="font-display text-xl font-black text-cocoa-900">
            Invite-only onboarding
          </p>
          <p className="mt-1 text-sm text-cocoa-700">
            Public merchant signup is closed. New shop owners can only join
            through an admin invitation.
          </p>
        </div>
      </div>
    </AdminShell>
  );
}

function StatCard({
  eyebrow,
  value,
  sub,
  Icon,
}: {
  eyebrow: string;
  value: string;
  sub: string;
  Icon: typeof Users;
}) {
  return (
    <div className="rounded-2xl bg-cream-50 border border-cream-200 p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.22em] text-cocoa-700">
            {eyebrow}
          </p>
          <p className="font-display text-3xl font-black mt-1 text-cocoa-900 tabular-nums">
            {value}
          </p>
          <p className="mt-1 text-xs text-cocoa-700">{sub}</p>
        </div>
        <Icon size={18} className="text-cocoa-700/60 mt-0.5 shrink-0" />
      </div>
    </div>
  );
}
