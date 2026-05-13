"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, LogOut, Users } from "lucide-react";
import { BrandMark } from "@/components/ui/BrandMark";
import { supabase } from "@/lib/supabaseClient";

const navItems = [
  { href: "/admin", label: "Overview", Icon: LayoutDashboard },
  { href: "/admin/merchants", label: "Merchants", Icon: Users },
];

export function AdminShell({
  children,
  adminEmail,
}: {
  children: React.ReactNode;
  adminEmail?: string;
}) {
  const pathname = usePathname();
  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = "/admin/login";
  };

  return (
    <div className="min-h-screen bg-cream-50 flex">
      <aside className="hidden lg:flex w-[260px] shrink-0 flex-col border-r border-cream-200 bg-cream-50">
        <Link
          href="/admin"
          className="px-6 py-6 border-b border-cream-200 block"
        >
          <BrandMark size="sm" tagline="Admin Console" />
        </Link>
        <nav className="flex-1 p-3">
          <ul className="space-y-1">
            {navItems.map(({ href, label, Icon }) => {
              const isActive =
                pathname === href ||
                (href !== "/admin" && pathname?.startsWith(href));
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

      <div className="flex-1 flex flex-col min-w-0">
        <header className="lg:hidden sticky top-0 z-30 bg-cream-50/90 backdrop-blur-xl border-b border-cream-200 px-4 py-3 flex items-center justify-between">
          <Link href="/admin">
            <BrandMark size="sm" tagline="Admin Console" />
          </Link>
          <button
            type="button"
            onClick={handleSignOut}
            className="text-xs font-bold text-cocoa-700"
          >
            Sign out
          </button>
        </header>

        <header className="hidden lg:flex items-center justify-between px-8 py-5 border-b border-cream-200 bg-cream-50">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-cocoa-700">
              Platform Admin
            </p>
            <p className="font-display text-xl font-black text-cocoa-900 leading-tight">
              {adminEmail ?? "Lickin' Good"}
            </p>
          </div>
        </header>

        <nav className="lg:hidden fixed bottom-0 inset-x-0 z-30 bg-cream-50 border-t border-cream-200 px-2 py-2 grid grid-cols-2 gap-1">
          {navItems.map(({ href, label, Icon }) => {
            const isActive =
              pathname === href ||
              (href !== "/admin" && pathname?.startsWith(href));
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
                <span>{label}</span>
              </Link>
            );
          })}
        </nav>

        <main className="flex-1 p-5 sm:p-8 lg:p-10 pb-24 lg:pb-10 overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}
