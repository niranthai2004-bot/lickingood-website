import type { Category, MenuItem } from "./menu";

const u = (tags: string, lock: number, w = 900, h = 720) =>
  `https://loremflickr.com/${w}/${h}/${tags}?lock=${lock}`;

/** Subtle availability indicators — sample data for UI; real values come from Square inventory later. */
export type Availability = "fresh" | "limited" | "almost-gone" | "sold-out";

/** Pickup-flow shape: every browse item, plus price, availability, and dozen-eligibility. */
export type PickupItem = MenuItem & {
  price: number;
  /** Approximate calories — placeholder until nutrition data is sourced. */
  calories?: number;
  /** Whether this item counts toward the Build-A-Dozen box. */
  dozenEligible: boolean;
  availability: Availability;
  /** How many box slots this item consumes when added to a bundle (default 1). */
  slotSize?: number;
};

/**
 * Full menu — derived from in-store menu boards.
 * Pricing and availability are placeholders until each shop's Square POS is wired up.
 */
export const fullMenu: PickupItem[] = [
  // ───── Doughnuts ─────
  { id: "glazed", category: "doughnuts", name: "Glazed", description: "Hot-fresh, melt-in-your-mouth classic.", tone: "bg-amber-50", image: u("donut,glazed", 1101), bestSeller: true, price: 1.19, calories: 190, dozenEligible: true, availability: "fresh" },
  { id: "chocolate-glazed", category: "doughnuts", name: "Chocolate Glazed", description: "Signature yeast ring, smooth chocolate glaze.", tone: "bg-stone-100", image: u("donut,chocolate", 1102), price: 1.29, calories: 220, dozenEligible: true, availability: "fresh" },
  { id: "maple-glazed", category: "doughnuts", name: "Maple Glazed", description: "Real maple glaze on a soft yeast ring.", tone: "bg-orange-50", image: u("donut,maple", 1103), price: 1.29, calories: 220, dozenEligible: true, availability: "fresh" },
  { id: "fancy-covered", category: "doughnuts", name: "Fancy Covered", description: "Glazed yeast ring with rotating sprinkle and topping varieties.", tone: "bg-rose-50", image: u("donut,sprinkles", 1104), price: 1.29, calories: 240, dozenEligible: true, availability: "limited" },
  { id: "cake-blueberry", category: "doughnuts", name: "Blueberry Cake", description: "Buttery cake donut studded with blueberries.", tone: "bg-violet-50", image: u("donut,blueberry,cake", 1105), price: 1.39, calories: 260, dozenEligible: true, availability: "fresh" },
  { id: "cake-sour-cream", category: "doughnuts", name: "Sour Cream Cake", description: "Tangy, tender cake donut. Old-fashioned crackle finish.", tone: "bg-stone-100", image: u("donut,cake", 1106), price: 1.39, calories: 270, dozenEligible: true, availability: "fresh" },
  { id: "cake-powder-sugar", category: "doughnuts", name: "Powdered Sugar", description: "Cake donut tumbled in fresh powdered sugar.", tone: "bg-cream-100", image: u("donut,powder,sugar", 1107), price: 1.39, calories: 250, dozenEligible: true, availability: "fresh" },
  { id: "cake-cinnamon-sugar", category: "doughnuts", name: "Cinnamon Sugar", description: "Warm cake donut rolled in cinnamon sugar.", tone: "bg-amber-50", image: u("donut,cinnamon", 1108), price: 1.39, calories: 260, dozenEligible: true, availability: "fresh" },
  { id: "donut-holes", category: "doughnuts", name: "Donut Holes (Dozen)", description: "Glazed bite-size holes, sold by the dozen.", tone: "bg-amber-50", image: u("donut,holes", 1109), price: 4.99, calories: 600, dozenEligible: false, availability: "fresh" },

  // ───── Specialty ─────
  { id: "maple-bacon", category: "specialty", name: "Maple w/ Bacon", description: "Maple glaze, candied bacon, on our classic ring.", tone: "bg-orange-50", image: u("donut,bacon,maple", 1201), bestSeller: true, price: 1.39, calories: 290, dozenEligible: true, availability: "almost-gone" },
  { id: "apple-fritter", category: "specialty", name: "Apple Fritter", description: "Hand-formed, tender apple-cinnamon, glazed warm.", tone: "bg-amber-50", image: u("apple,fritter", 1202), price: 2.19, calories: 380, dozenEligible: true, availability: "fresh", slotSize: 2 },
  { id: "cinnamon-roll", category: "specialty", name: "Cinnamon Roll", description: "Pillowy spiral, brown sugar swirl, vanilla icing.", tone: "bg-amber-50", image: u("cinnamon,roll,bakery", 1203), price: 2.19, calories: 360, dozenEligible: true, availability: "fresh", slotSize: 2 },
  { id: "cinnamon-twist-glazed", category: "specialty", name: "Cinnamon Twist — Glazed", description: "Folded twist, signature glaze.", tone: "bg-amber-50", image: u("cinnamon,twist,donut", 1204), price: 1.79, calories: 310, dozenEligible: true, availability: "fresh" },
  { id: "cinnamon-twist-chocolate", category: "specialty", name: "Cinnamon Twist — Chocolate", description: "Same twist, dipped in chocolate.", tone: "bg-stone-100", image: u("twist,chocolate", 1205), price: 1.79, calories: 320, dozenEligible: true, availability: "fresh" },
  { id: "cinnamon-twist-maple", category: "specialty", name: "Cinnamon Twist — Maple", description: "Maple-glazed cinnamon twist.", tone: "bg-orange-50", image: u("twist,maple", 1206), price: 1.79, calories: 320, dozenEligible: true, availability: "fresh" },
  { id: "mochi-chocolate", category: "specialty", name: "Mochi — Chocolate", description: "Chewy mochi donut, chocolate glaze.", tone: "bg-stone-100", image: u("mochi,donut,chocolate", 1207), limitedTime: true, price: 2.49, calories: 250, dozenEligible: true, availability: "fresh" },
  { id: "mochi-matcha", category: "specialty", name: "Mochi — Green Matcha", description: "Earthy matcha glaze on chewy mochi.", tone: "bg-emerald-50", image: u("mochi,matcha,donut", 1208), limitedTime: true, price: 2.49, calories: 250, dozenEligible: true, availability: "limited" },
  { id: "mochi-strawberry", category: "specialty", name: "Mochi — Strawberry", description: "Bright strawberry glaze, mochi texture.", tone: "bg-rose-50", image: u("mochi,strawberry", 1209), limitedTime: true, price: 2.49, calories: 250, dozenEligible: true, availability: "fresh" },
  { id: "mochi-cream-cheese", category: "specialty", name: "Mochi — Cream Cheese", description: "Sweet cream cheese glaze.", tone: "bg-cream-100", image: u("mochi,donut,cream", 1210), limitedTime: true, price: 2.49, calories: 260, dozenEligible: true, availability: "almost-gone" },
  { id: "mochi-cinnamon", category: "specialty", name: "Mochi — Cinnamon Sugar", description: "Warm cinnamon sugar on chewy mochi.", tone: "bg-amber-50", image: u("mochi,cinnamon,donut", 1211), limitedTime: true, price: 2.49, calories: 250, dozenEligible: true, availability: "fresh" },

  // ───── Filled ─────
  { id: "filled-bavarian", category: "filled", name: "Bavarian Cream", description: "Vanilla cream filling, dark chocolate top.", tone: "bg-stone-100", image: u("donut,filled,cream", 1301), bestSeller: true, price: 1.49, calories: 280, dozenEligible: true, availability: "fresh" },
  { id: "filled-lemon", category: "filled", name: "Lemon", description: "Bright lemon curd, dusted with powdered sugar.", tone: "bg-yellow-50", image: u("donut,lemon", 1302), price: 1.49, calories: 270, dozenEligible: true, availability: "fresh" },
  { id: "filled-raspberry", category: "filled", name: "Raspberry", description: "Tart raspberry jam in a soft yeast pillow.", tone: "bg-rose-50", image: u("donut,raspberry", 1303), price: 1.49, calories: 270, dozenEligible: true, availability: "fresh" },
  { id: "filled-blueberry", category: "filled", name: "Blueberry", description: "Sweet blueberry compote, light yeast pocket.", tone: "bg-violet-50", image: u("donut,blueberry", 1304), price: 1.49, calories: 280, dozenEligible: true, availability: "fresh" },
  { id: "filled-apple", category: "filled", name: "Apple", description: "Cinnamon apple filling, glaze top.", tone: "bg-orange-50", image: u("donut,apple,filled", 1305), price: 1.49, calories: 290, dozenEligible: true, availability: "fresh" },
  { id: "filled-chocolate", category: "filled", name: "Chocolate", description: "Rich chocolate cream, glazed top.", tone: "bg-stone-100", image: u("donut,filled,chocolate", 1306), price: 1.49, calories: 300, dozenEligible: true, availability: "fresh" },
  { id: "filled-cream-cheese", category: "filled", name: "Cream Cheese", description: "Tangy cream cheese filling, vanilla glaze.", tone: "bg-cream-100", image: u("donut,cream,cheese", 1307), price: 1.49, calories: 290, dozenEligible: true, availability: "fresh" },
  { id: "filled-eclair", category: "filled", name: "Eclair", description: "Long pastry, cream filling, chocolate top.", tone: "bg-stone-100", image: u("eclair,pastry", 1308), price: 1.49, calories: 320, dozenEligible: true, availability: "limited" },
  { id: "filled-cream-cheese-eclair", category: "filled", name: "Cream Cheese Eclair", description: "Eclair shell with cream cheese filling.", tone: "bg-cream-100", image: u("eclair,cream", 1309), price: 1.49, calories: 320, dozenEligible: true, availability: "fresh" },

  // ───── Kolaches ─────
  { id: "kolache-conecuh", category: "kolaches", name: "Conecuh Sausage", description: "Smoky Conecuh sausage in pillowy sweet dough.", tone: "bg-yellow-50", image: u("sausage,roll,pastry", 1401), bestSeller: true, price: 2.59, calories: 310, dozenEligible: false, availability: "fresh" },
  { id: "kolache-conecuh-jal", category: "kolaches", name: "Conecuh Sausage w/ Jalapeño", description: "Conecuh sausage with fresh jalapeño kick.", tone: "bg-orange-50", image: u("sausage,jalapeno,pastry", 1402), price: 2.59, calories: 320, dozenEligible: false, availability: "fresh" },
  { id: "kolache-eckrich-cheese", category: "kolaches", name: "Eckrich Sausage w/ Cheese", description: "Eckrich sausage and sharp cheddar.", tone: "bg-amber-50", image: u("sausage,cheese,pastry", 1403), price: 2.59, calories: 340, dozenEligible: false, availability: "fresh" },
  { id: "kolache-eckrich-cheese-jal", category: "kolaches", name: "Eckrich Sausage, Cheese & Jalapeño", description: "Eckrich, cheddar, and jalapeño. Three-way heat.", tone: "bg-rose-50", image: u("sausage,cheese,jalapeno", 1404), price: 2.59, calories: 350, dozenEligible: false, availability: "almost-gone" },
  { id: "kolache-boudin", category: "kolaches", name: "Boudin", description: "Cajun boudin sausage, slow-baked in dough.", tone: "bg-orange-50", image: u("boudin,cajun,sausage", 1405), price: 3.19, calories: 380, dozenEligible: false, availability: "limited" },
  { id: "kolache-ham-cheese", category: "kolaches", name: "Ham & Cheese", description: "Pit-baked ham, melted cheese, soft dough.", tone: "bg-rose-50", image: u("ham,cheese,roll", 1406), price: 3.19, calories: 360, dozenEligible: false, availability: "fresh" },

  // ───── Breakfast ─────
  { id: "biscuit-sausage", category: "breakfast", name: "Sausage, Egg & Cheese Biscuit", description: "Buttermilk biscuit, sausage patty, egg, cheese.", tone: "bg-amber-50", image: u("biscuit,sausage,egg", 1501), bestSeller: true, price: 2.99, calories: 480, dozenEligible: false, availability: "fresh" },
  { id: "biscuit-bacon", category: "breakfast", name: "Bacon, Egg & Cheese Biscuit", description: "Buttermilk biscuit, crispy bacon, egg, cheese.", tone: "bg-orange-50", image: u("biscuit,bacon,egg", 1502), price: 2.99, calories: 460, dozenEligible: false, availability: "fresh" },
  { id: "croissant-sausage", category: "breakfast", name: "Sausage, Egg & Cheese Croissant", description: "Buttery croissant, made-to-order.", tone: "bg-amber-50", image: u("croissant,sausage,egg", 1503), price: 3.99, calories: 520, dozenEligible: false, availability: "fresh" },
  { id: "croissant-ham", category: "breakfast", name: "Ham, Egg & Cheese Croissant", description: "Buttery croissant, ham, egg, melted cheese.", tone: "bg-rose-50", image: u("croissant,ham,egg", 1504), price: 3.99, calories: 510, dozenEligible: false, availability: "fresh" },
  { id: "croissant-bacon", category: "breakfast", name: "Bacon, Egg & Cheese Croissant", description: "Buttery croissant, crispy bacon, egg, cheese.", tone: "bg-orange-50", image: u("croissant,bacon,egg", 1505), price: 3.99, calories: 500, dozenEligible: false, availability: "fresh" },

  // ───── Coffee & Drinks ─────
  { id: "coffee", category: "drinks", name: "Brewed Coffee", description: "Community Coffee, fresh-pulled all day.", tone: "bg-stone-100", image: u("coffee,cup,brewed", 1601), price: 1.89, calories: 5, dozenEligible: false, availability: "fresh" },
  { id: "starbucks-mocha", category: "drinks", name: "Mocha Frappuccino", description: "Bottled Starbucks. Cold and ready.", tone: "bg-stone-100", image: u("frappuccino,coffee", 1602), price: 3.19, calories: 290, dozenEligible: false, availability: "fresh" },
  { id: "starbucks-vanilla", category: "drinks", name: "Vanilla Frappuccino", description: "Bottled Starbucks. Vanilla bean, sweet.", tone: "bg-cream-100", image: u("vanilla,frappuccino", 1603), price: 3.19, calories: 290, dozenEligible: false, availability: "fresh" },
  { id: "sweet-tea", category: "drinks", name: "Sweet Tea", description: "Real sweet, real cold. Southern style.", tone: "bg-amber-50", image: u("sweet,tea,southern", 1604), price: 2.29, calories: 180, dozenEligible: false, availability: "fresh" },
  { id: "milk", category: "drinks", name: "Milk", description: "Whole milk, in pint or half-gallon.", tone: "bg-cream-100", image: u("milk,carton,glass", 1605), price: 2.29, calories: 150, dozenEligible: false, availability: "fresh" },
  { id: "juice", category: "drinks", name: "Juice", description: "Orange or apple, chilled bottle.", tone: "bg-orange-50", image: u("juice,bottle,orange", 1606), price: 2.29, calories: 140, dozenEligible: false, availability: "fresh" },
  { id: "yoohoo", category: "drinks", name: "YooHoo", description: "Classic chocolate drink. Kid favorite.", tone: "bg-stone-100", image: u("chocolate,drink,bottle", 1607), price: 2.29, calories: 130, dozenEligible: false, availability: "fresh" },
  { id: "energy-drinks", category: "drinks", name: "Energy Drinks", description: "Red Bull and Monster, kept ice-cold.", tone: "bg-rose-50", image: u("energy,drink,can", 1608), price: 3.39, calories: 110, dozenEligible: false, availability: "fresh" },
];

export const fullMenuCategories: { id: Category; label: string; sub: string }[] = [
  { id: "doughnuts", label: "Donuts", sub: "Glazed, cake, and classics" },
  { id: "specialty", label: "Specialty", sub: "Mochi, fritters, twists" },
  { id: "filled", label: "Filled", sub: "Cream, fruit, chocolate" },
  { id: "kolaches", label: "Kolaches", sub: "Conecuh, Eckrich, boudin" },
  { id: "breakfast", label: "Breakfast", sub: "Biscuits and croissants" },
  { id: "drinks", label: "Coffee & Drinks", sub: "Hot, cold, bottled" },
];

/** Customer-friendly wording for availability — never the raw key. */
export const availabilityLabel: Record<Availability, string> = {
  fresh: "Fresh now",
  limited: "Limited today",
  "almost-gone": "Almost gone",
  "sold-out": "Sold out for now",
};

/** Tailwind classes for each availability state. Warm bakery palette — no neon/teal. */
export const availabilityChip: Record<Availability, string> = {
  fresh: "bg-amber-50 text-amber-900 border-amber-200",
  limited: "bg-amber-100 text-amber-900 border-amber-300",
  "almost-gone": "bg-orange-100 text-orange-900 border-orange-300",
  "sold-out": "bg-stone-200 text-stone-700 border-stone-300",
};

/** Bundle pricing tiers. Each donut item maps to one of these. */
export type BundleTier = "basic" | "standard" | "premium";

export const bundlePricing: Record<
  BundleTier,
  { half: number; dozen: number; label: string }
> = {
  basic: { half: 6.99, dozen: 11.99, label: "Glazed" },
  standard: { half: 7.49, dozen: 12.99, label: "Chocolate / Maple / Fancy" },
  premium: { half: 7.99, dozen: 13.99, label: "Cake / Specialty" },
};

const tierOrder: BundleTier[] = ["basic", "standard", "premium"];

/** Map item id → bundle pricing tier. Highest tier in a mixed box wins. */
export const itemBundleTier: Record<string, BundleTier> = {
  glazed: "basic",
  "chocolate-glazed": "standard",
  "maple-glazed": "standard",
  "fancy-covered": "standard",
  "cake-blueberry": "premium",
  "cake-sour-cream": "premium",
  "cake-powder-sugar": "premium",
  "cake-cinnamon-sugar": "premium",
  // Specialty + filled default to premium
  "maple-bacon": "premium",
  "apple-fritter": "premium",
  "cinnamon-roll": "premium",
  "cinnamon-twist-glazed": "premium",
  "cinnamon-twist-chocolate": "premium",
  "cinnamon-twist-maple": "premium",
  "mochi-chocolate": "premium",
  "mochi-matcha": "premium",
  "mochi-strawberry": "premium",
  "mochi-cream-cheese": "premium",
  "mochi-cinnamon": "premium",
  "filled-bavarian": "standard",
  "filled-lemon": "standard",
  "filled-raspberry": "standard",
  "filled-blueberry": "standard",
  "filled-apple": "standard",
  "filled-chocolate": "standard",
  "filled-cream-cheese": "standard",
  "filled-eclair": "standard",
  "filled-cream-cheese-eclair": "standard",
};

/**
 * Compute bundle box price.
 * size: 6 → half dozen pricing, 12 → dozen pricing.
 * Mixed boxes are charged at the highest tier present.
 */
export function calculateBundlePrice(
  contents: { item: PickupItem; qty: number }[],
  size: 6 | 12,
): number {
  if (contents.length === 0) {
    return size === 6 ? bundlePricing.basic.half : bundlePricing.basic.dozen;
  }
  let maxTier: BundleTier = "basic";
  for (const c of contents) {
    const tier = itemBundleTier[c.item.id] ?? "premium";
    if (tierOrder.indexOf(tier) > tierOrder.indexOf(maxTier)) maxTier = tier;
  }
  return size === 6 ? bundlePricing[maxTier].half : bundlePricing[maxTier].dozen;
}
