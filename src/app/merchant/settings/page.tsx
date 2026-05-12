"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Settings } from "lucide-react";
import { MerchantShell } from "@/components/merchant/MerchantShell";
import { supabase } from "@/lib/supabaseClient";

type Merchant = {
  business_name: string;
  owner_name: string;
  email: string;
  phone: string | null;
};

export default function MerchantSettingsPage() {
  const router = useRouter();
  const [merchant, setMerchant] = useState<Merchant | null>(null);
  const [authChecked, setAuthChecked] = useState(false);

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
      if (data) setMerchant(data);
    })();
  }, [router]);

  if (!authChecked) return null;

  return (
    <MerchantShell businessName={merchant?.business_name}>
      <div className="mb-6">
        <p className="text-[10px] font-black uppercase tracking-[0.22em] text-cocoa-700 mb-1">
          Settings
        </p>
        <h1 className="font-display text-4xl sm:text-5xl font-black text-cocoa-900 tracking-tight leading-[0.95]">
          Business profile
        </h1>
      </div>

      {merchant && (
        <div className="max-w-2xl rounded-3xl bg-cream-50 border border-cream-200 p-6 sm:p-8">
          <dl className="text-sm divide-y divide-cream-200">
            <Row label="Business name" value={merchant.business_name} />
            <Row label="Owner" value={merchant.owner_name} />
            <Row label="Email" value={merchant.email} />
            <Row label="Phone" value={merchant.phone ?? "—"} />
          </dl>
          <button
            type="button"
            className="mt-6 inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-cream-100 hover:bg-cream-200 text-cocoa-900 text-sm font-bold transition-colors"
          >
            <Settings size={14} /> Edit profile (coming soon)
          </button>
        </div>
      )}
    </MerchantShell>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 py-3">
      <dt className="text-xs text-cocoa-700 font-semibold uppercase tracking-wider">
        {label}
      </dt>
      <dd className="text-sm text-cocoa-900 font-bold">{value}</dd>
    </div>
  );
}
