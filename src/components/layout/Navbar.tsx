"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, ShoppingBag, Sparkles, User, X } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { BrandMark } from "@/components/ui/BrandMark";

const navLinks = [
  { href: "/menu", label: "Menu" },
  { href: "/locations", label: "Locations" },
  { href: "/rewards", label: "Rewards" },
  { href: "/about", label: "About" },
];

export function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [signedIn, setSignedIn] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // Track Supabase auth state for the customer Sign In ↔ My Account swap
  useEffect(() => {
    let mounted = true;
    supabase.auth.getSession().then(({ data }) => {
      if (mounted) setSignedIn(!!data.session);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_evt, session) => {
      setSignedIn(!!session);
    });
    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  // Merchant + admin portals have their own chrome — hide the customer Navbar.
  // (Placed AFTER hooks so the hook count stays consistent across renders.)
  if (
    pathname?.startsWith("/merchant") ||
    pathname?.startsWith("/admin") ||
    pathname?.startsWith("/auth")
  )
    return null;

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-cream-50/85 backdrop-blur-xl border-b border-cream-200/70 shadow-[0_4px_24px_-12px_rgba(95,58,30,0.10)]"
          : "bg-transparent"
      }`}
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between">
        {/* Logo + wordmark */}
        <Link href="/" className="group">
          <BrandMark className="transition-transform duration-300 [&_svg]:transition-transform [&_svg]:duration-300 group-hover:[&_svg]:rotate-12" />
        </Link>

        {/* Desktop nav */}
        <ul className="hidden lg:flex items-center gap-1">
          {navLinks.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="px-4 py-2 rounded-full text-sm font-bold text-cocoa-800 hover:text-cocoa-900 hover:bg-cream-100 transition-colors"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        {/* Right actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            href="/order/pickup"
            className="hidden md:inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-bold text-cocoa-900 bg-cream-200 hover:bg-cream-300 transition-colors"
          >
            <ShoppingBag size={16} />
            Pickup
          </Link>
          <Link
            href="/order/delivery"
            className="hidden md:inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-bold text-cream-50 bg-cocoa-900 hover:bg-cocoa-800 transition-colors shadow-md"
          >
            Delivery
          </Link>
          <Link
            href="/auth"
            aria-label={signedIn ? "My account" : "Sign in"}
            className="inline-flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-full bg-cream-100 hover:bg-cream-200 text-cocoa-900 text-sm font-bold transition-colors"
          >
            {signedIn ? (
              <User size={16} />
            ) : (
              <Sparkles size={14} className="text-amber-500 fill-amber-400" />
            )}
            <span className="hidden sm:inline">
              {signedIn ? "My Account" : "Sign In"}
            </span>
          </Link>
          <button
            type="button"
            aria-label="Open menu"
            onClick={() => setOpen(true)}
            className="lg:hidden w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-cream-100 hover:bg-cream-200 flex items-center justify-center text-cocoa-800 transition-colors"
          >
            <Menu size={20} />
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="lg:hidden fixed inset-0 z-50 bg-cocoa-900/40 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          >
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 260 }}
              onClick={(e) => e.stopPropagation()}
              className="absolute right-0 top-0 bottom-0 w-[85%] max-w-sm bg-cream-50 shadow-2xl flex flex-col"
            >
              <div className="flex items-center justify-between p-5 border-b border-cream-200">
                <span className="font-display text-xl font-black text-cocoa-900">
                  Menu
                </span>
                <button
                  type="button"
                  aria-label="Close menu"
                  onClick={() => setOpen(false)}
                  className="w-9 h-9 rounded-full bg-cream-100 flex items-center justify-center text-cocoa-800 hover:bg-cream-200"
                >
                  <X size={18} />
                </button>
              </div>
              <ul className="flex-1 px-3 py-4 space-y-1">
                {navLinks.map((link, i) => (
                  <motion.li
                    key={link.href}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.06 * i }}
                  >
                    <Link
                      href={link.href}
                      onClick={() => setOpen(false)}
                      className="block px-4 py-3 rounded-xl text-lg font-bold text-cocoa-900 hover:bg-cream-100"
                    >
                      {link.label}
                    </Link>
                  </motion.li>
                ))}
              </ul>
              <div className="p-5 border-t border-cream-200 space-y-3">
                <Link
                  href="/order/pickup"
                  onClick={() => setOpen(false)}
                  className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-full text-sm font-bold text-cocoa-900 bg-cream-200 hover:bg-cream-300"
                >
                  <ShoppingBag size={16} /> Order Pickup
                </Link>
                <Link
                  href="/order/delivery"
                  onClick={() => setOpen(false)}
                  className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-full text-sm font-bold text-cream-50 bg-cocoa-900 hover:bg-cocoa-800"
                >
                  Order Delivery
                </Link>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
