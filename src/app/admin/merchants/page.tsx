"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  CheckCircle2,
  Mail,
  Plug,
  Plus,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { AdminShell } from "@/components/admin/AdminShell";
import { supabase } from "@/lib/supabaseClient";

type Merchant = {
  id: string;
  business_name: string;
  owner_name: string;
  email: string;
  phone: string | null;
  created_at: string;
  has_connection: boolean;
  location_count: number;
  item_count: number;
};

export default function AdminMerchantsPage() {
  const router = useRouter();
  const [adminEmail, setAdminEmail] = useState<string | undefined>();
  const [merchants, setMerchants] = useState<Merchant[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteOpen, setInviteOpen] = useState(false);

  const refresh = async () => {
    setLoading(true);
    // Server-side endpoint (service role) — RLS blocks admins from reading
    // the merchants table directly via the client supabase client because
    // admins have no row of their own to satisfy auth.uid() = user_id.
    const res = await fetch("/api/admin/merchants", { cache: "no-store" });
    if (!res.ok) {
      setMerchants([]);
      setLoading(false);
      return;
    }
    const json = (await res.json()) as { merchants: Merchant[] };
    setMerchants(json.merchants ?? []);
    setLoading(false);
  };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (cancelled) return;
      if (!user) {
        router.push("/admin/login");
        return;
      }
      const res = await fetch("/api/admin/whoami", { cache: "no-store" });
      if (res.status === 403) {
        await supabase.auth.signOut({ scope: "local" });
        router.push("/admin/login?error=not_admin");
        return;
      }
      setAdminEmail(user.email);
      await refresh();
    })();
    return () => {
      cancelled = true;
    };
  }, [router]);

  return (
    <AdminShell adminEmail={adminEmail}>
      <div className="flex items-end justify-between gap-3 mb-8">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.22em] text-cocoa-700 mb-1">
            Merchants
          </p>
          <h1 className="font-display text-4xl sm:text-5xl font-black text-cocoa-900 tracking-tight leading-[0.95]">
            Invited shops
          </h1>
        </div>
        <button
          type="button"
          onClick={() => setInviteOpen(true)}
          className="inline-flex items-center gap-1.5 px-5 py-3 rounded-full bg-cocoa-900 hover:bg-cocoa-800 text-cream-50 text-sm font-bold transition-all hover:scale-[1.02]"
        >
          <Plus size={14} /> Invite merchant
        </button>
      </div>

      {loading ? (
        <p className="text-sm text-cocoa-700">Loading merchants…</p>
      ) : merchants.length === 0 ? (
        <div className="rounded-3xl bg-cream-100 border border-cream-200 p-10 text-center">
          <Mail size={20} className="text-cocoa-700 mx-auto mb-2" />
          <p className="font-display font-black text-cocoa-900">
            No merchants invited yet
          </p>
          <p className="mt-1 text-sm text-cocoa-700">
            Send your first invite to onboard a shop owner.
          </p>
          <button
            type="button"
            onClick={() => setInviteOpen(true)}
            className="mt-6 inline-flex items-center gap-1.5 px-5 py-3 rounded-full bg-cocoa-900 hover:bg-cocoa-800 text-cream-50 text-sm font-bold"
          >
            <Plus size={14} /> Send an invite
          </button>
        </div>
      ) : (
        <div className="rounded-3xl bg-cream-50 border border-cream-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-cream-100 text-left text-[10px] font-black uppercase tracking-[0.18em] text-cocoa-700">
                <th className="px-5 py-3">Business</th>
                <th className="px-5 py-3 hidden sm:table-cell">Owner</th>
                <th className="px-5 py-3 hidden md:table-cell">Email</th>
                <th className="px-5 py-3 text-right">Locations</th>
                <th className="px-5 py-3 text-right">Square</th>
              </tr>
            </thead>
            <tbody>
              {merchants.map((m) => (
                <tr
                  key={m.id}
                  className="border-t border-cream-200 hover:bg-cream-100/40 transition-colors"
                >
                  <td className="px-5 py-4">
                    <p className="font-display font-black text-cocoa-900 leading-tight">
                      {m.business_name}
                    </p>
                    <p className="text-[11px] text-cocoa-700 sm:hidden">
                      {m.owner_name}
                    </p>
                  </td>
                  <td className="px-5 py-4 hidden sm:table-cell text-cocoa-800 font-semibold">
                    {m.owner_name}
                  </td>
                  <td className="px-5 py-4 hidden md:table-cell text-cocoa-700 text-xs">
                    {m.email}
                  </td>
                  <td className="px-5 py-4 text-right font-bold text-cocoa-900 tabular-nums">
                    {m.location_count}
                  </td>
                  <td className="px-5 py-4 text-right">
                    {m.has_connection ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-900 text-[10px] font-black border border-emerald-200">
                        <CheckCircle2 size={11} /> Connected
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 text-amber-900 text-[10px] font-black border border-amber-200">
                        <Plug size={11} /> Pending
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <AnimatePresence>
        {inviteOpen && (
          <InviteModal
            onClose={() => setInviteOpen(false)}
            onSuccess={() => {
              setInviteOpen(false);
              refresh();
            }}
          />
        )}
      </AnimatePresence>
    </AdminShell>
  );
}

function InviteModal({
  onClose,
  onSuccess,
}: {
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [form, setForm] = useState({
    email: "",
    business_name: "",
    owner_name: "",
    phone: "",
    store_name: "",
    city: "",
    state: "",
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const set = (k: keyof typeof form, v: string) =>
    setForm((p) => ({ ...p, [k]: v }));

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    const res = await fetch("/api/admin/invite-merchant", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const json = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) {
      setError(
        json.message ??
          (json.error === "not_authorized"
            ? "You don't have permission to invite merchants."
            : "Couldn't send the invite. Please try again."),
      );
      return;
    }
    setSuccess(true);
    setTimeout(onSuccess, 1200);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      onClick={onClose}
      className="fixed inset-0 z-[60] bg-cocoa-900/40 backdrop-blur-sm flex items-center justify-center px-4 py-8"
    >
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 16 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg rounded-3xl bg-cream-50 border border-cream-200 shadow-2xl overflow-hidden"
      >
        <div className="flex items-center justify-between px-7 py-5 border-b border-cream-200">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-cocoa-700">
              New merchant
            </p>
            <p className="font-display text-2xl font-black text-cocoa-900 leading-tight">
              Send an invite
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="w-9 h-9 rounded-full bg-cream-100 hover:bg-cream-200 flex items-center justify-center text-cocoa-800 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={submit} className="px-7 py-6 space-y-4">
          <Field
            label="Owner email"
            type="email"
            value={form.email}
            onChange={(v) => set("email", v)}
            required
            placeholder="owner@example.com"
          />
          <div className="grid sm:grid-cols-2 gap-3">
            <Field
              label="Business name"
              value={form.business_name}
              onChange={(v) => set("business_name", v)}
              required
              placeholder="Gulf Shores Donuts"
            />
            <Field
              label="Owner name"
              value={form.owner_name}
              onChange={(v) => set("owner_name", v)}
              required
            />
          </div>
          <Field
            label="Phone"
            type="tel"
            value={form.phone}
            onChange={(v) => set("phone", v)}
            optional
          />

          <div className="pt-3 border-t border-cream-200">
            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-cocoa-700 mb-3">
              First shop (optional)
            </p>
            <Field
              label="Store name"
              value={form.store_name}
              onChange={(v) => set("store_name", v)}
              optional
              placeholder="Gulf Shores"
            />
            <div className="grid grid-cols-2 gap-3 mt-3">
              <Field
                label="City"
                value={form.city}
                onChange={(v) => set("city", v)}
                optional
              />
              <Field
                label="State"
                value={form.state}
                onChange={(v) => set("state", v)}
                optional
                maxLength={2}
              />
            </div>
          </div>

          {error && (
            <p className="flex items-start gap-2 text-sm text-rose-900 bg-rose-50 border border-rose-200 rounded-lg px-3 py-2">
              <AlertCircle size={14} className="mt-0.5 shrink-0" />
              {error}
            </p>
          )}
          {success && (
            <p className="flex items-start gap-2 text-sm text-emerald-900 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">
              <CheckCircle2 size={14} className="mt-0.5 shrink-0" />
              Invite sent. The merchant will receive an email to set their
              password.
            </p>
          )}

          <div className="flex items-center justify-end gap-2 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-full bg-cream-100 hover:bg-cream-200 text-cocoa-900 text-sm font-bold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={busy || success}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-cocoa-900 hover:bg-cocoa-800 disabled:opacity-50 text-cream-50 text-sm font-bold transition-all hover:scale-[1.02]"
            >
              <Mail size={14} />
              {busy ? "Sending…" : "Send invite"}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}

function Field({
  label,
  optional,
  ...inputProps
}: {
  label: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
  placeholder?: string;
  maxLength?: number;
  optional?: boolean;
}) {
  return (
    <label className="block">
      <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-cocoa-700 mb-1.5">
        {label}
        {optional && (
          <span className="text-[9px] text-cocoa-700/60 normal-case tracking-normal font-medium">
            (optional)
          </span>
        )}
      </span>
      <input
        {...inputProps}
        onChange={(e) => inputProps.onChange(e.target.value)}
        className="w-full rounded-xl border border-cream-300 bg-cream-50 px-4 py-3 text-cocoa-900 text-sm focus:outline-none focus:border-cocoa-900 transition-colors"
      />
    </label>
  );
}
