"use client";

import {
  useEffect,
  useState,
  type FormEvent,
} from "react";
import { useRouter } from "next/navigation";
import {
  Check,
  Lock,
  Mail,
  User as UserIcon,
} from "lucide-react";
import { MerchantShell } from "@/components/merchant/MerchantShell";
import { supabase } from "@/lib/supabaseClient";

type MerchantProfile = {
  business_name: string;
  owner_name: string;
  email: string;
  phone: string | null;
};

export default function MerchantSettingsPage() {
  const router = useRouter();
  const [merchant, setMerchant] = useState<MerchantProfile | null>(null);
  const [authChecked, setAuthChecked] = useState(false);

  // Edit profile form state
  const [businessName, setBusinessName] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [phone, setPhone] = useState("");
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMessage, setProfileMessage] = useState<{
    tone: "ok" | "err";
    text: string;
  } | null>(null);

  // Change password form state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pwSaving, setPwSaving] = useState(false);
  const [pwMessage, setPwMessage] = useState<{
    tone: "ok" | "err";
    text: string;
  } | null>(null);

  // Forgot password reset state
  const [resetSending, setResetSending] = useState(false);
  const [resetMessage, setResetMessage] = useState<{
    tone: "ok" | "err";
    text: string;
  } | null>(null);

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
      const { data } = await supabase
        .from("merchants")
        .select("business_name, owner_name, email, phone")
        .eq("user_id", user.id)
        .maybeSingle();
      if (data) {
        setMerchant(data);
        setBusinessName(data.business_name);
        setOwnerName(data.owner_name);
        setPhone(data.phone ?? "");
      }
    })();
  }, [router]);

  if (!authChecked) return null;

  async function handleProfileSubmit(e: FormEvent) {
    e.preventDefault();
    if (!merchant) return;
    setProfileMessage(null);
    setProfileSaving(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setProfileSaving(false);
      setProfileMessage({ tone: "err", text: "You're signed out — please sign back in." });
      return;
    }

    const { error } = await supabase
      .from("merchants")
      .update({
        business_name: businessName.trim(),
        owner_name: ownerName.trim(),
        phone: phone.trim() || null,
      })
      .eq("user_id", user.id);

    setProfileSaving(false);
    if (error) {
      setProfileMessage({ tone: "err", text: error.message });
      return;
    }
    setMerchant({
      ...merchant,
      business_name: businessName.trim(),
      owner_name: ownerName.trim(),
      phone: phone.trim() || null,
    });
    setProfileMessage({ tone: "ok", text: "Profile updated." });
  }

  async function handlePasswordSubmit(e: FormEvent) {
    e.preventDefault();
    if (!merchant) return;
    setPwMessage(null);

    if (newPassword.length < 8) {
      setPwMessage({ tone: "err", text: "New password must be at least 8 characters." });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPwMessage({ tone: "err", text: "New passwords don't match." });
      return;
    }

    setPwSaving(true);

    // Verify the current password by attempting to re-authenticate.
    // Supabase doesn't expose a "verify password" primitive, but signInWithPassword
    // with the same user is a safe no-op when it succeeds (just refreshes tokens).
    const { error: verifyErr } = await supabase.auth.signInWithPassword({
      email: merchant.email,
      password: currentPassword,
    });
    if (verifyErr) {
      setPwSaving(false);
      setPwMessage({ tone: "err", text: "Current password is incorrect." });
      return;
    }

    const { error: updateErr } = await supabase.auth.updateUser({
      password: newPassword,
    });
    setPwSaving(false);
    if (updateErr) {
      setPwMessage({ tone: "err", text: updateErr.message });
      return;
    }
    setPwMessage({ tone: "ok", text: "Password updated." });
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  }

  async function handleSendResetEmail() {
    if (!merchant) return;
    setResetMessage(null);
    setResetSending(true);
    const appUrl =
      process.env.NEXT_PUBLIC_APP_URL ??
      (typeof window !== "undefined" ? window.location.origin : "");
    const { error } = await supabase.auth.resetPasswordForEmail(
      merchant.email,
      { redirectTo: `${appUrl}/merchant/accept-invite` },
    );
    setResetSending(false);
    if (error) {
      setResetMessage({ tone: "err", text: error.message });
      return;
    }
    setResetMessage({
      tone: "ok",
      text: `Reset link sent to ${merchant.email}.`,
    });
  }

  return (
    <MerchantShell businessName={merchant?.business_name}>
      <div className="mb-8">
        <p className="text-[10px] font-black uppercase tracking-[0.22em] text-cocoa-700 mb-1">
          Settings
        </p>
        <h1 className="font-display text-4xl sm:text-5xl font-black text-cocoa-900 tracking-tight leading-[0.95]">
          Account & profile
        </h1>
        <p className="mt-3 text-base text-cocoa-700 max-w-xl">
          Update your business information and manage your sign-in
          credentials. Changes save instantly to your merchant record.
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6 max-w-5xl">
        {/* ── Profile ─────────────────────────────────────────── */}
        <Card
          eyebrow="Business profile"
          title="Update your shop details"
          Icon={UserIcon}
        >
          {merchant ? (
            <form onSubmit={handleProfileSubmit} className="space-y-4">
              <Field
                label="Business name"
                value={businessName}
                onChange={setBusinessName}
                required
              />
              <Field
                label="Owner name"
                value={ownerName}
                onChange={setOwnerName}
                required
              />
              <Field
                label="Phone"
                type="tel"
                value={phone}
                onChange={setPhone}
                placeholder="(555) 555-5555"
              />
              <div className="pt-1">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-cocoa-700 mb-1.5">
                  Sign-in email
                </p>
                <div className="rounded-xl border border-cream-200 bg-cream-100/60 px-4 py-3 text-sm text-cocoa-900 font-bold">
                  {merchant.email}
                </div>
                <p className="mt-1.5 text-[11px] text-cocoa-700/80">
                  Changing your sign-in email requires support — contact us.
                </p>
              </div>

              {profileMessage && (
                <Message tone={profileMessage.tone} text={profileMessage.text} />
              )}

              <button
                type="submit"
                disabled={profileSaving}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-cocoa-900 hover:bg-cocoa-800 disabled:opacity-60 text-cream-50 text-sm font-bold transition-all hover:scale-[1.01]"
              >
                <Check size={14} />
                {profileSaving ? "Saving…" : "Save profile"}
              </button>
            </form>
          ) : (
            <p className="text-sm text-cocoa-700">Loading…</p>
          )}
        </Card>

        {/* ── Change password ─────────────────────────────────── */}
        <Card
          eyebrow="Security"
          title="Change your password"
          Icon={Lock}
        >
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <Field
              label="Current password"
              type="password"
              value={currentPassword}
              onChange={setCurrentPassword}
              autoComplete="current-password"
              required
            />
            <Field
              label="New password"
              type="password"
              value={newPassword}
              onChange={setNewPassword}
              autoComplete="new-password"
              minLength={8}
              required
            />
            <Field
              label="Confirm new password"
              type="password"
              value={confirmPassword}
              onChange={setConfirmPassword}
              autoComplete="new-password"
              minLength={8}
              required
            />

            {pwMessage && <Message tone={pwMessage.tone} text={pwMessage.text} />}

            <button
              type="submit"
              disabled={pwSaving}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-cocoa-900 hover:bg-cocoa-800 disabled:opacity-60 text-cream-50 text-sm font-bold transition-all hover:scale-[1.01]"
            >
              <Lock size={14} />
              {pwSaving ? "Updating…" : "Update password"}
            </button>
          </form>

          {/* Forgot password reset divider */}
          <div className="mt-6 pt-6 border-t border-cream-200">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-cocoa-700 mb-1.5">
              Forgot it?
            </p>
            <p className="text-sm text-cocoa-700 mb-3">
              We&apos;ll email a one-time reset link to your sign-in address.
            </p>
            <button
              type="button"
              onClick={handleSendResetEmail}
              disabled={resetSending || !merchant}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-cream-100 hover:bg-cream-200 disabled:opacity-60 text-cocoa-900 text-xs font-bold transition-colors"
            >
              <Mail size={13} />
              {resetSending ? "Sending…" : "Send password reset email"}
            </button>
            {resetMessage && (
              <div className="mt-3">
                <Message tone={resetMessage.tone} text={resetMessage.text} />
              </div>
            )}
          </div>
        </Card>
      </div>
    </MerchantShell>
  );
}

// ─── Subcomponents ───

function Card({
  eyebrow,
  title,
  Icon,
  children,
}: {
  eyebrow: string;
  title: string;
  Icon: React.ComponentType<{ size?: number; className?: string }>;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-3xl bg-cream-50 border border-cream-200 p-6 sm:p-7">
      <div className="flex items-center gap-2 mb-1">
        <Icon size={16} className="text-cocoa-900" />
        <p className="text-[10px] font-black uppercase tracking-[0.22em] text-cocoa-700">
          {eyebrow}
        </p>
      </div>
      <h2 className="font-display text-xl font-black text-cocoa-900 leading-tight mb-5">
        {title}
      </h2>
      {children}
    </div>
  );
}

function Field({
  label,
  ...inputProps
}: {
  label: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
  minLength?: number;
  autoComplete?: string;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="block text-xs font-bold uppercase tracking-[0.18em] text-cocoa-700 mb-1.5">
        {label}
      </span>
      <input
        {...inputProps}
        onChange={(e) => inputProps.onChange(e.target.value)}
        className="w-full rounded-xl border border-cream-300 bg-cream-50 px-4 py-3 text-cocoa-900 text-sm focus:outline-none focus:border-cocoa-900 transition-colors"
      />
    </label>
  );
}

function Message({ tone, text }: { tone: "ok" | "err"; text: string }) {
  return tone === "ok" ? (
    <p className="text-sm text-emerald-900 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">
      {text}
    </p>
  ) : (
    <p className="text-sm text-rose-900 bg-rose-50 border border-rose-200 rounded-lg px-3 py-2">
      {text}
    </p>
  );
}
