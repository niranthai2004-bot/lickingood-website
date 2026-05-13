/**
 * Core marketing menu — the "universal" Lickin' Good lineup shown on /menu.
 *
 * Structure follows the real shop menu (Donuts → Specialty → Breakfast → Drinks).
 * Variant flavors live UNDER a single parent card; the page renders one card
 * per parent and an inline picker / modal for the variants.
 *
 * This is purely marketing data — the actual per-location ordering menu on
 * /order/pickup/[slug] is driven by each merchant's synced Square catalog.
 * Don't confuse the two: this file describes "what every shop typically
 * carries"; the synced catalog describes "what THIS shop actually sells today."
 */

export type CoreCategory = "donuts" | "specialty" | "breakfast" | "drinks";

export type MenuVariant = {
  id: string;
  name: string;
  /** Optional sub-label — e.g., "with crispy bacon" */
  hint?: string;
};

export type CoreMenuItem = {
  id: string;
  category: CoreCategory;
  name: string;
  description: string;
  image: string;
  /** Soft pastel surface shown if the photo fails. */
  tone: string;
  bestSeller?: boolean;
  seasonal?: boolean;
  /** If present, this card opens a variant picker. */
  variants?: MenuVariant[];
};

const img = (tags: string, lock: number, w = 900, h = 720) =>
  `https://loremflickr.com/${w}/${h}/${tags}?lock=${lock}`;

// ──────────────────────────────────────────────────────────────────────────────
// DONUTS
// Glazed, Chocolate Glazed, Maple/Maple Bacon, Fancy Covered, Cake, Donut Holes
// ──────────────────────────────────────────────────────────────────────────────
const donuts: CoreMenuItem[] = [
  {
    id: "glazed",
    category: "donuts",
    name: "Glazed",
    description:
      "Hot-fresh, melt-in-your-mouth original. Pulled every four hours.",
    tone: "bg-amber-50",
    image: img("donut,glazed", 7101),
    bestSeller: true,
  },
  {
    id: "chocolate-glazed",
    category: "donuts",
    name: "Chocolate Glazed",
    description: "Signature yeast ring under a smooth chocolate glaze.",
    tone: "bg-stone-100",
    image: img("donut,chocolate", 7102),
  },
  {
    id: "maple",
    category: "donuts",
    name: "Maple",
    description: "Real maple glaze on a soft yeast ring. Bacon optional.",
    tone: "bg-orange-50",
    image: img("donut,maple,bacon", 7103),
    bestSeller: true,
    variants: [
      { id: "regular", name: "Regular Maple" },
      { id: "maple-bacon", name: "Maple Bacon", hint: "with candied bacon" },
    ],
  },
  {
    id: "fancy-covered",
    category: "donuts",
    name: "Fancy Covered",
    description:
      "Glazed yeast ring topped with sprinkles. Pick your icing color.",
    tone: "bg-rose-50",
    image: img("donut,sprinkles,fancy", 7104),
    variants: [
      { id: "chocolate", name: "Chocolate icing" },
      { id: "pink", name: "Pink icing" },
      { id: "blue", name: "Blue icing" },
      { id: "white", name: "White icing" },
    ],
  },
  {
    id: "cake-donut",
    category: "donuts",
    name: "Cake Donut",
    description:
      "Buttery old-fashioned cake. Seven flavors, rotated through the case.",
    tone: "bg-violet-50",
    image: img("donut,cake,blueberry", 7105),
    variants: [
      { id: "blueberry", name: "Blueberry" },
      { id: "sour-cream", name: "Sour Cream" },
      { id: "chocolate-covered", name: "Chocolate Covered" },
      { id: "maple-covered", name: "Maple Covered" },
      { id: "powdered-sugar", name: "Powdered Sugar" },
      { id: "cinnamon-sugar", name: "Cinnamon Sugar" },
      { id: "plain", name: "Plain" },
    ],
  },
  {
    id: "donut-holes",
    category: "donuts",
    name: "Donut Holes",
    description:
      "Bite-size glazed holes. Sold by the dozen — perfect for sharing.",
    tone: "bg-amber-50",
    image: img("donut,holes,bite", 7106),
  },
];

// ──────────────────────────────────────────────────────────────────────────────
// SPECIALTY
// Apple Fritter, Cinnamon Roll, Cinnamon Twist (variants), Filled (variants)
// ──────────────────────────────────────────────────────────────────────────────
const specialty: CoreMenuItem[] = [
  {
    id: "apple-fritter",
    category: "specialty",
    name: "Apple Fritter",
    description:
      "Hand-formed, tender apple-cinnamon dough. Glazed while still warm.",
    tone: "bg-amber-50",
    image: img("apple,fritter,donut", 7201),
    bestSeller: true,
  },
  {
    id: "cinnamon-roll",
    category: "specialty",
    name: "Cinnamon Roll",
    description: "Pillowy spiral, brown sugar swirl, vanilla icing on top.",
    tone: "bg-amber-50",
    image: img("cinnamon,roll,bakery", 7202),
  },
  {
    id: "cinnamon-twist",
    category: "specialty",
    name: "Cinnamon Twist",
    description:
      "Folded ribbon of cinnamon dough. Choose your finish.",
    tone: "bg-orange-50",
    image: img("cinnamon,twist,donut", 7203),
    variants: [
      { id: "glazed", name: "Glazed" },
      { id: "cinnamon-sugar", name: "Cinnamon Sugar" },
      { id: "chocolate", name: "Chocolate" },
    ],
  },
  {
    id: "filled-donut",
    category: "specialty",
    name: "Filled Donut",
    description:
      "Glazed yeast pillow filled to order. Seven fillings on the regular.",
    tone: "bg-rose-50",
    image: img("donut,filled,bavarian", 7204),
    bestSeller: true,
    variants: [
      { id: "blueberry", name: "Blueberry" },
      { id: "lemon", name: "Lemon" },
      { id: "raspberry", name: "Raspberry" },
      { id: "bavarian-cream", name: "Bavarian Cream", hint: "eclair-style available" },
      { id: "cream-cheese", name: "Cream Cheese", hint: "eclair-style available" },
      { id: "apple", name: "Apple", hint: "cinnamon-sugar coated" },
      { id: "chocolate", name: "Chocolate", hint: "powder-sugar coated" },
    ],
  },
];

// ──────────────────────────────────────────────────────────────────────────────
// BREAKFAST
// Biscuits, Croissants, Kolaches, Boudin — all with meat variants
// ──────────────────────────────────────────────────────────────────────────────
const breakfast: CoreMenuItem[] = [
  {
    id: "biscuit",
    category: "breakfast",
    name: "Breakfast Biscuit",
    description: "Buttermilk biscuit with egg and cheese. Pick your meat.",
    tone: "bg-amber-50",
    image: img("biscuit,sausage,egg", 7301),
    variants: [
      { id: "sausage", name: "Sausage" },
      { id: "bacon", name: "Bacon" },
    ],
  },
  {
    id: "croissant",
    category: "breakfast",
    name: "Breakfast Croissant",
    description: "Buttery croissant with egg and cheese. Made to order.",
    tone: "bg-orange-50",
    image: img("croissant,breakfast,egg", 7302),
    variants: [
      { id: "sausage", name: "Sausage" },
      { id: "bacon", name: "Bacon" },
      { id: "ham", name: "Ham" },
    ],
  },
  {
    id: "kolache",
    category: "breakfast",
    name: "Kolache",
    description: "Southern-style sausage wrapped in soft sweet dough.",
    tone: "bg-yellow-50",
    image: img("kolache,sausage,pastry", 7303),
    bestSeller: true,
    variants: [
      { id: "conecuh", name: "Conecuh Sausage" },
      { id: "conecuh-jalapeno", name: "Conecuh + Jalapeño" },
      { id: "eckrich-cheese", name: "Eckrich + Cheese" },
      { id: "eckrich-cheese-jalapeno", name: "Eckrich + Cheese + Jalapeño" },
    ],
  },
  {
    id: "boudin",
    category: "breakfast",
    name: "Boudin",
    description: "Cajun boudin sausage, slow-baked into pillowy dough.",
    tone: "bg-orange-50",
    image: img("boudin,cajun,sausage", 7304),
    variants: [
      { id: "regular", name: "Regular" },
      { id: "spicy", name: "Spicy" },
    ],
  },
];

// ──────────────────────────────────────────────────────────────────────────────
// DRINKS
// Hot Coffee, Milk, Juice, Sodas, Water, Sweet Tea, Starbucks, Energy Drinks
// ──────────────────────────────────────────────────────────────────────────────
const drinks: CoreMenuItem[] = [
  {
    id: "hot-coffee",
    category: "drinks",
    name: "Hot Coffee",
    description: "Community Coffee, fresh-pulled all morning.",
    tone: "bg-stone-100",
    image: img("coffee,cup,brewed", 7401),
  },
  {
    id: "milk",
    category: "drinks",
    name: "Milk",
    description: "Borden milk and Yoohoo. Cold from the cooler.",
    tone: "bg-cream-100",
    image: img("milk,carton,glass", 7402),
    variants: [
      { id: "borden", name: "Borden Milk" },
      { id: "yoohoo", name: "Yoohoo" },
    ],
  },
  {
    id: "juice",
    category: "drinks",
    name: "Juice",
    description: "Juicies — bright, kid-friendly, ice-cold.",
    tone: "bg-orange-50",
    image: img("juice,bottle,orange", 7403),
  },
  {
    id: "soda",
    category: "drinks",
    name: "Soda",
    description: "Coke products. Bottle or can.",
    tone: "bg-rose-50",
    image: img("soda,bottle,can", 7404),
    variants: [
      { id: "bottle", name: "Bottle" },
      { id: "can", name: "Can" },
    ],
  },
  {
    id: "water",
    category: "drinks",
    name: "Water",
    description: "Bottled water. Sometimes simple is best.",
    tone: "bg-sky-50",
    image: img("water,bottle", 7405),
  },
  {
    id: "sweet-tea",
    category: "drinks",
    name: "Sweet Tea",
    description: "Real sweet, real cold. Southern style.",
    tone: "bg-amber-50",
    image: img("sweet,tea,southern", 7406),
  },
  {
    id: "starbucks",
    category: "drinks",
    name: "Starbucks Frappuccino",
    description: "Bottled and ready. Cold, sweet, dessert-grade caffeine.",
    tone: "bg-stone-100",
    image: img("frappuccino,coffee", 7407),
    variants: [
      { id: "mocha", name: "Mocha" },
      { id: "vanilla", name: "Vanilla" },
    ],
  },
  {
    id: "energy-drinks",
    category: "drinks",
    name: "Energy Drinks",
    description: "Monster and Red Bull. Kept ice-cold for sunrise shifts.",
    tone: "bg-rose-50",
    image: img("energy,drink,can", 7408),
    variants: [
      { id: "monster", name: "Monster" },
      { id: "redbull", name: "Red Bull" },
    ],
  },
];

export const coreMenu: CoreMenuItem[] = [
  ...donuts,
  ...specialty,
  ...breakfast,
  ...drinks,
];

export const coreMenuCategories: {
  id: CoreCategory;
  label: string;
  sub: string;
}[] = [
  { id: "donuts", label: "Donuts", sub: "Glazed, cake, and classics" },
  { id: "specialty", label: "Specialty", sub: "Fritters, twists, filled" },
  { id: "breakfast", label: "Breakfast", sub: "Biscuits, croissants, kolaches" },
  { id: "drinks", label: "Drinks", sub: "Hot, cold, bottled" },
];
