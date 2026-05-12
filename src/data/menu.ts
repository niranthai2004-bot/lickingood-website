export type Category =
  | "doughnuts"
  | "specialty"
  | "filled"
  | "kolaches"
  | "breakfast"
  | "drinks";

export type MenuItem = {
  id: string;
  name: string;
  description: string;
  category: Category;
  /** Soft pastel surface shown if the photo fails to load (Tailwind class) */
  tone: string;
  /** Stock photo URL — swap when real photography is delivered */
  image: string;
  bestSeller?: boolean;
  seasonal?: boolean;
  limitedTime?: boolean;
};

const u = (tags: string, lock: number, w = 900, h = 720) =>
  `https://loremflickr.com/${w}/${h}/${tags}?lock=${lock}`;

// Real Lickin' Good menu — derived from in-store menu boards.
// Order matters — the first 6 are featured on the homepage.
export const featuredMenu: MenuItem[] = [
  {
    id: "glazed",
    name: "Glazed",
    description: "Hot-fresh, melt-in-your-mouth classic. Made every 4 hours.",
    category: "doughnuts",
    tone: "bg-amber-50",
    image: u("donut,glazed", 101),
    bestSeller: true,
  },
  {
    id: "chocolate-glazed",
    name: "Chocolate Glazed",
    description: "Signature yeast ring under a smooth chocolate glaze.",
    category: "doughnuts",
    tone: "bg-stone-100",
    image: u("donut,chocolate", 102),
  },
  {
    id: "maple-bacon",
    name: "Maple w/ Bacon",
    description: "Maple glaze, candied bacon, on our classic ring.",
    category: "specialty",
    tone: "bg-orange-50",
    image: u("donut,bacon,maple", 103),
    bestSeller: true,
  },
  {
    id: "apple-fritter",
    name: "Apple Fritter",
    description: "Hand-formed, tender apple-cinnamon, glazed warm.",
    category: "specialty",
    tone: "bg-amber-50",
    image: u("apple,fritter,donut", 104),
  },
  {
    id: "croissant-sausage-egg",
    name: "Sausage, Egg & Cheese Croissant",
    description: "Buttery croissant, made-to-order. Pure comfort food.",
    category: "breakfast",
    tone: "bg-amber-50",
    image: u("breakfast,sandwich,croissant", 106),
  },
  {
    id: "coffee",
    name: "Brewed Coffee",
    description: "Community Coffee, fresh-pulled all day.",
    category: "drinks",
    tone: "bg-stone-100",
    image: u("coffee,cup,brewed", 105),
  },
];

export const categories: { id: Category; label: string }[] = [
  { id: "doughnuts", label: "Donuts" },
  { id: "specialty", label: "Specialty" },
  { id: "filled", label: "Filled" },
  { id: "kolaches", label: "Kolaches" },
  { id: "breakfast", label: "Breakfast" },
  { id: "drinks", label: "Coffee & Drinks" },
];
