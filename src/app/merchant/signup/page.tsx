import Link from "next/link";
import { Lock, Mail } from "lucide-react";
import { BrandMark } from "@/components/ui/BrandMark";

/**
 * Public signup is closed. Merchants must be invited by a platform admin.
 * This page replaces the old wizard so any stale links land somewhere friendly.
 */
export default function MerchantSignupClosedPage() {
  return (
    <div className="min-h-screen bg-cream-50 flex items-center justify-center px-5 py-12">
      <div className="w-full max-w-md">
        <Link href="/merchant" className="flex items-center justify-center mb-8">
          <BrandMark tagline="Merchant Portal" />
        </Link>

        <div className="bg-cream-50 rounded-3xl shadow-lg border border-cream-200 p-8 sm:p-9">
          <div className="w-12 h-12 rounded-full bg-amber-100 border border-amber-200 text-cocoa-900 flex items-center justify-center mb-5">
            <Lock size={18} />
          </div>
          <p className="text-[10px] font-black uppercase tracking-[0.22em] text-cocoa-700 mb-2">
            Invite-only
          </p>
          <h1 className="font-display text-3xl sm:text-4xl font-black text-cocoa-900 leading-[1.05]">
            Merchant signup is by invitation.
          </h1>
          <p className="mt-3 text-sm text-cocoa-700 leading-relaxed">
            We onboard shop owners one at a time to make sure every store gets
            real, hands-on setup. If we&apos;ve invited you, check your inbox
            for an email from us with a link to set up your account.
          </p>

          <div className="mt-6 rounded-2xl bg-cream-100 border border-cream-200 p-4">
            <p className="flex items-center gap-2 text-xs font-bold text-cocoa-900">
              <Mail size={14} /> Already invited?
            </p>
            <p className="mt-1 text-xs text-cocoa-700">
              Use the link in your invite email to create your password, then
              sign in below.
            </p>
          </div>

          <div className="mt-7 space-y-2">
            <Link
              href="/merchant/login"
              className="w-full inline-flex items-center justify-center px-5 py-3.5 rounded-full bg-cocoa-900 hover:bg-cocoa-800 text-cream-50 font-bold text-sm transition-colors"
            >
              Sign in
            </Link>
            <a
              href="mailto:hello@lickingooddonuts.com?subject=Merchant%20Portal%20Access"
              className="w-full inline-flex items-center justify-center px-5 py-3 text-cocoa-700 hover:text-cocoa-900 font-semibold text-sm transition-colors"
            >
              Request access
            </a>
          </div>
        </div>

        <p className="text-center text-xs text-cocoa-700 mt-6 max-w-sm mx-auto">
          We&apos;re a small team. Each merchant gets a real conversation
          before they go live.
        </p>
      </div>
    </div>
  );
}
