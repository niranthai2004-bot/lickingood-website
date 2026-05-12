"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SocialIcon, type SocialIconName } from "@/components/ui/SocialIcon";

const columns = [
  {
    title: "Order",
    links: [
      { label: "Order Pickup", href: "/order/pickup" },
      { label: "Order Delivery", href: "/order/delivery" },
      { label: "Gift Cards", href: "/gift-cards" },
    ],
  },
  {
    title: "Menu",
    links: [
      { label: "Donuts", href: "/menu#donuts" },
      { label: "Kolaches", href: "/menu#kolaches" },
      { label: "Breakfast", href: "/menu#sandwiches" },
      { label: "Coffee", href: "/menu#coffee" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "/about" },
      { label: "Locations", href: "/locations" },
      { label: "Rewards", href: "/rewards" },
    ],
  },
  {
    title: "Help",
    links: [
      { label: "Contact", href: "/contact" },
      { label: "FAQ", href: "/faq" },
      { label: "Allergens", href: "/allergens" },
      { label: "Accessibility", href: "/accessibility" },
    ],
  },
  {
    title: "Merchant",
    links: [
      { label: "Login", href: "/merchant/login" },
      { label: "Dashboard", href: "/merchant/dashboard" },
      { label: "Merchant Portal", href: "/merchant" },
    ],
  },
];

const socials: { id: SocialIconName; href: string; label: string }[] = [
  { id: "instagram", href: "https://instagram.com", label: "Instagram" },
  { id: "facebook", href: "https://facebook.com", label: "Facebook" },
  { id: "tiktok", href: "https://tiktok.com", label: "TikTok" },
  { id: "youtube", href: "https://youtube.com", label: "YouTube" },
];

export function Footer() {
  const pathname = usePathname();
  if (
    pathname?.startsWith("/merchant") ||
    pathname?.startsWith("/admin") ||
    pathname?.startsWith("/auth")
  )
    return null;
  return (
    <footer className="relative bg-cocoa-900 text-cream-100 mt-24">
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
        {/* Top: brand + newsletter */}
        <div className="grid lg:grid-cols-2 gap-12 pb-12 border-b border-cocoa-800">
          <div>
            <span className="font-display text-3xl font-black text-cream-50 block mb-5">
              Lickin&apos; Good Donuts
            </span>
            <p className="text-cream-200/80 max-w-md text-base leading-relaxed">
              A family-owned donut shop made fresh daily across the Gulf
              Coast. Donuts, kolaches, breakfast sandwiches, and craft coffee —
              serving Alabama and the Florida Panhandle since day one.
            </p>
          </div>
          <div>
            <h3 className="font-display text-2xl font-black text-cream-50 mb-3">
              Get the inside scoop
            </h3>
            <p className="text-cream-200/80 mb-4">
              New flavors, location openings, and rewards drops — straight to
              your inbox.
            </p>
            <form
              className="flex flex-col sm:flex-row gap-3"
              onSubmit={(e) => e.preventDefault()}
            >
              <input
                type="email"
                placeholder="you@example.com"
                aria-label="Email"
                className="flex-1 rounded-full px-5 py-3 bg-cocoa-800 border border-cocoa-700 placeholder:text-cream-200/40 text-cream-50 focus:outline-none focus:border-cream-100"
              />
              <button
                type="submit"
                className="rounded-full px-6 py-3 bg-cream-50 hover:bg-cream-100 text-cocoa-900 font-bold transition-all duration-300 hover:scale-[1.02]"
              >
                Sign up
              </button>
            </form>
          </div>
        </div>

        {/* Link columns — 5 columns on desktop, 2 on small */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-8 py-12">
          {columns.map((col) => (
            <div key={col.title}>
              <h4 className="font-display font-black text-cream-50 mb-4">
                {col.title}
              </h4>
              <ul className="space-y-2.5">
                {col.links.map((l) => (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      className="text-cream-200/70 hover:text-cream-50 text-sm transition-colors"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom */}
        <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-6 pt-8 border-t border-cocoa-800">
          <p className="text-sm text-cream-200/60">
            © {new Date().getFullYear()} Lickin&apos; Good Donuts. Made fresh
            in Alabama.
          </p>
          <div className="flex items-center gap-3">
            {socials.map(({ id, href, label }) => (
              <a
                key={label}
                href={href}
                aria-label={label}
                target="_blank"
                rel="noreferrer"
                className="w-10 h-10 rounded-full bg-cocoa-800 hover:bg-cream-50 hover:text-cocoa-900 flex items-center justify-center text-cream-100 transition-all duration-300 hover:-translate-y-0.5"
              >
                <SocialIcon name={id} size={18} />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
