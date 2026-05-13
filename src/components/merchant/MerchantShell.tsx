"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  LogOut,
  MapPin,
  Plug,
  Receipt,
  Settings,
} from "lucide-react";
import { BrandMark } from "@/components/ui/BrandMark";
import { supabase } from "@/lib/supabaseClient";

// Menu syncing is automatic on OAuth connect + manually re-triggerable
// from the dashboard — no dedicated sidebar entry needed.
const navItems = [
  { href: "/merchant/dashboard", label: "Dashboard", Icon: BarChart3 },
  { href: "/merchant/orders", label: "Orders", Icon: Receipt },
  { href: "/merchant/locations", label: "Locations", Icon: MapPin },
  { href: "/merchant/connect-square", label: "Square Connection", Icon: Plug },
  { href: "/merchant/settings", label: "Settings", Icon: Settings },
];

/**
 * Sidebar + top-nav shell for the merchant portal.
 * Used on every /merchant/* page EXCEPT the marketing landing + auth pages.
 */
export function MerchantShell({
  children,
  businessName,
}: {
  children: React.ReactNode;
  businessName?: string;
}) {
  const pathname = usePathname();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = "/merchant/login";
  };

  return (
    <div className="min-h-screen bg-cream-50 flex">
      {/* Sidebar */}
      <aside className="hidden lg:flex w-[260px] shrink-0 flex-col border-r border-cream-200 bg-cream-50">
        <Link
          href="/merchant/dashboard"
          className="px-6 py-6 border-b border-cream-200 block"
        >
          <BrandMark size="sm" tagline="Merchant Portal" />
        </Link>
        <nav className="flex-1 p-3">
          <ul className="space-y-1">
            {navItems.map(({ href, label, Icon }) => {
              const isActive = pathname === href;
              return (
                <li key={href}>
                  <Link
                    href={href}
                    className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-bold transition-colors ${
                      isActive
                        ? "bg-cocoa-900 text-cream-50"
                        : "text-cocoa-800 hover:bg-cream-100"
                    }`}
                  >
                    <Icon size={16} />
                    {label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
        <div className="p-3 border-t border-cream-200">
          <button
            type="button"
            onClick={handleSignOut}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-bold text-cocoa-800 hover:bg-cream-100 transition-colors"
          >
            <LogOut size={16} />
            Sign out
          </button>
        </div>
      </aside>

      {/* Main column */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile top bar */}
        <header className="lg:hidden sticky top-0 z-30 bg-cream-50/90 backdrop-blur-xl border-b border-cream-200 px-4 py-3 flex items-center justify-between">
          <Link href="/merchant/dashboard">
            <BrandMark size="sm" tagline="Merchant Portal" />
          </Link>
          <button
            type="button"
            onClick={handleSignOut}
            className="text-xs font-bold text-cocoa-700"
          >
            Sign out
          </button>
        </header>

        {/* Desktop top bar */}
        <header className="hidden lg:flex items-center justify-between px-8 py-5 border-b border-cream-200 bg-cream-50">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-cocoa-700">
              Merchant
            </p>
            <p className="font-display text-xl font-black text-cocoa-900 leading-tight">
              {businessName ?? "Welcome"}
            </p>
          </div>
        </header>

        {/* Mobile bottom nav */}
        <nav className="lg:hidden fixed bottom-0 inset-x-0 z-30 bg-cream-50 border-t border-cream-200 px-2 py-2 grid grid-cols-5 gap-1">
          {navItems.slice(0, 5).map(({ href, label, Icon }) => {
            const isActive = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`flex flex-col items-center justify-center gap-0.5 py-1.5 rounded-lg text-[10px] font-bold ${
                  isActive
                    ? "text-cocoa-900 bg-cream-100"
                    : "text-cocoa-700 hover:bg-cream-100"
                }`}
              >
                <Icon size={16} />
                <span className="truncate w-full text-center">{label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Page content */}
        <main className="flex-1 p-5 sm:p-8 lg:p-10 pb-24 lg:pb-10 overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}
