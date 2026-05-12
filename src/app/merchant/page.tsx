import Link from "next/link";
import { ArrowUpRight, Plug, Receipt, ShieldCheck } from "lucide-react";
import { BrandMark } from "@/components/ui/BrandMark";

/**
 * Public marketing/landing page for the merchant portal.
 * Visited at /merchant before signing in.
 */
export default function MerchantLandingPage() {
  return (
    <div className="min-h-screen bg-cream-50 flex flex-col">
      {/* Top bar */}
      <header className="px-5 sm:px-8 py-5 flex items-center justify-between border-b border-cream-200">
        <Link href="/merchant">
          <BrandMark size="sm" tagline="Merchant Portal" />
        </Link>
        <Link
          href="/"
          className="text-sm font-bold text-cocoa-700 hover:text-cocoa-900 transition-colors"
        >
          ← Customer site
        </Link>
      </header>

      <main className="flex-1 px-5 sm:px-8 py-16 sm:py-20 lg:py-24 max-w-6xl mx-auto w-full">
        <p className="text-sm font-bold uppercase tracking-[0.22em] text-cocoa-700 mb-4">
          For shop owners
        </p>
        <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-black text-cocoa-900 leading-[0.95] tracking-tight max-w-3xl">
          Run your shop. We&apos;ll handle the rest.
        </h1>
        <p className="mt-6 text-xl text-cocoa-700 font-medium leading-snug max-w-2xl">
          Connect your Square account, sync your menu, and start taking online
          orders that route straight to your POS. No new payment system, no new
          banking, no new logins.
        </p>

        <div className="mt-9 flex flex-col sm:flex-row gap-3">
          <Link
            href="/merchant/login"
            className="inline-flex items-center justify-center gap-2 px-7 py-4 rounded-full bg-cocoa-900 hover:bg-cocoa-800 text-cream-50 font-bold text-base transition-all duration-500 hover:scale-[1.02]"
          >
            Sign in
            <ArrowUpRight size={18} />
          </Link>
          <a
            href="mailto:hello@lickingooddonuts.com?subject=Merchant%20Portal%20Access"
            className="inline-flex items-center justify-center px-7 py-4 rounded-full bg-cream-100 hover:bg-cream-200 text-cocoa-900 font-bold text-base border border-cream-300 transition-all duration-500 hover:scale-[1.02]"
          >
            Request access
          </a>
        </div>
        <p className="mt-3 text-xs text-cocoa-700">
          Merchant portal is invite-only.
        </p>

        <div className="mt-20 grid sm:grid-cols-3 gap-5">
          {[
            {
              Icon: Plug,
              title: "Connect Square in seconds",
              body: "OAuth sign-in to your existing Square account. We never see your password or banking info.",
            },
            {
              Icon: Receipt,
              title: "Orders route to your POS",
              body: "Customer pickup and delivery orders land directly on your store's Square tablet, with your inventory and pricing.",
            },
            {
              Icon: ShieldCheck,
              title: "Square handles the money",
              body: "Payments, taxes, and payouts go through your Square account — exactly the way you already get paid today.",
            },
          ].map(({ Icon, title, body }) => (
            <div
              key={title}
              className="rounded-3xl bg-cream-50 border border-cream-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="w-11 h-11 rounded-full bg-amber-100 border border-amber-200 text-cocoa-900 flex items-center justify-center mb-4">
                <Icon size={18} />
              </div>
              <p className="font-display font-black text-cocoa-900 text-lg leading-tight">
                {title}
              </p>
              <p className="mt-2 text-sm text-cocoa-700 leading-snug">{body}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
