export type Promotion = {
  id: string;
  badge: string;
  title: string;
  blurb: string;
  cta: string;
  ctaHref: string;
  image: string;
  /** Soft pastel card surface */
  bg: string;
  /** Border tone matching the card surface */
  border: string;
};

const u = (tags: string, lock: number, w = 1200, h = 960) =>
  `https://loremflickr.com/${w}/${h}/${tags}?lock=${lock}`;

// Neutral badge style — matches the Menu page "Bestseller" pill.
// Same class on every card for editorial consistency; the card surface is
// where the color story lives, not the badge.
export const promotions: Promotion[] = [
  {
    id: "strawberry-summer",
    badge: "Limited Time",
    title: "Strawberry Sunrise",
    blurb:
      "A pink strawberry glaze with hand-picked Alabama berries. Only through the season.",
    cta: "Order now",
    ctaHref: "/menu#strawberry-frosted",
    image: u("donut,strawberry,pink", 201),
    bg: "bg-rose-50",
    border: "border-rose-100",
  },
  {
    id: "purple-cosmic",
    badge: "New Drop",
    title: "Cosmic Ube",
    blurb:
      "Purple yam glaze, white chocolate drizzle, soft cardamom finish. Made for the gram.",
    cta: "Try them today",
    ctaHref: "/menu",
    image: u("donut,purple,glazed", 202),
    bg: "bg-violet-50",
    border: "border-violet-100",
  },
  {
    id: "dozen-deal",
    badge: "Combo Deal",
    title: "Dozen + 2 Coffees",
    blurb:
      "Mix any dozen. Add two large craft coffees. Save four bucks. Easy math.",
    cta: "View specials",
    ctaHref: "/menu",
    image: u("donuts,box,dozen", 203),
    bg: "bg-amber-50",
    border: "border-amber-100",
  },
];

export const ticker: string[] = [
  "Strawberry Sunrise — limited time",
  "Cosmic Ube just dropped",
  "Dozen + two coffees · save $4",
  "Cold brew season is here",
  "Jalapeño Cheese kolache — back by demand",
];
