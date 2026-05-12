"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ChefHat, RefreshCw } from "lucide-react";
import { MerchantShell } from "@/components/merchant/MerchantShell";
import { supabase } from "@/lib/supabaseClient";

export default function MerchantMenuSyncPage() {
  const router = useRouter();
  const [businessName, setBusinessName] = useState<string | null>(null);
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
      const { data: merchant } = await supabase
        .from("merchants")
        .select("business_name")
        .eq("user_id", user.id)
        .maybeSingle();
      if (merchant) setBusinessName(merchant.business_name);
    })();
  }, [router]);

  if (!authChecked) return null;

  return (
    <MerchantShell businessName={businessName ?? undefined}>
      <div className="mb-6 flex items-end justify-between gap-3">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.22em] text-cocoa-700 mb-1">
            Menu Sync
          </p>
          <h1 className="font-display text-4xl sm:text-5xl font-black text-cocoa-900 tracking-tight leading-[0.95]">
            Catalog & inventory
          </h1>
        </div>
        <button
          type="button"
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-cocoa-900 hover:bg-cocoa-800 text-cream-50 text-sm font-bold transition-colors"
        >
          <RefreshCw size={14} /> Sync now
        </button>
      </div>

      <div className="rounded-3xl bg-cream-100 border border-cream-200 p-10 text-center">
        <ChefHat size={20} className="text-cocoa-700 mx-auto mb-2" />
        <p className="font-display font-black text-cocoa-900">
          Square is your source of truth
        </p>
        <p className="mt-1 text-sm text-cocoa-700 max-w-md mx-auto">
          Once connected, we pull your catalog, modifiers, pricing, and
          inventory directly from Square&apos;s Catalog and Inventory APIs.
          Changes made in your Square dashboard appear here automatically.
        </p>
      </div>
    </MerchantShell>
  );
}
