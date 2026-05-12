"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Receipt } from "lucide-react";
import { MerchantShell } from "@/components/merchant/MerchantShell";
import { supabase } from "@/lib/supabaseClient";

export default function MerchantOrdersPage() {
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
      <div className="mb-6">
        <p className="text-[10px] font-black uppercase tracking-[0.22em] text-cocoa-700 mb-1">
          Orders
        </p>
        <h1 className="font-display text-4xl sm:text-5xl font-black text-cocoa-900 tracking-tight leading-[0.95]">
          Recent orders
        </h1>
      </div>
      <div className="rounded-3xl bg-cream-100 border border-cream-200 p-10 text-center">
        <Receipt size={20} className="text-cocoa-700 mx-auto mb-2" />
        <p className="font-display font-black text-cocoa-900">
          Orders sync from Square
        </p>
        <p className="mt-1 text-sm text-cocoa-700 max-w-md mx-auto">
          Once you connect Square and start receiving orders through this
          platform, they&apos;ll appear here in real time. Each order also
          lands on your Square POS tablet at the matching location.
        </p>
      </div>
    </MerchantShell>
  );
}
