export type Location = {
  /** URL-safe slug — also doubles as the React key. */
  id: string;
  city: string;
  /** Short label ("Cottage Hill #1", "Government Blvd", etc.) */
  neighborhood?: string;
  state: "AL" | "FL";
  address: string;
  phone: string;
  /** Google Maps URL */
  mapUrl: string;
  pickup: boolean;
  delivery: boolean;
  /** Storefront photo URL */
  image: string;
};

const u = (tags: string, lock: number, w = 900, h = 1100) =>
  `https://loremflickr.com/${w}/${h}/${tags}?lock=${lock}`;

// Real Lickin' Good Donuts locations across the Gulf Coast.
export const locations: Location[] = [
  {
    id: "cottage-hill-1",
    city: "Mobile",
    neighborhood: "Cottage Hill #1",
    state: "AL",
    address: "8600 Cottage Hill Rd #101, Mobile, AL 36695",
    phone: "(251) 751-7556",
    mapUrl: "https://maps.google.com/?q=8600+Cottage+Hill+Rd+101+Mobile+AL+36695",
    pickup: true,
    delivery: true,
    image: u("donut,shop,bakery,storefront", 2001),
  },
  {
    id: "cottage-hill-2",
    city: "Mobile",
    neighborhood: "Cottage Hill #2",
    state: "AL",
    address: "6305 Cottage Hill Rd, Mobile, AL 36609",
    phone: "(251) 599-6037",
    mapUrl: "https://maps.google.com/?q=6305+Cottage+Hill+Rd+Mobile+AL+36609",
    pickup: true,
    delivery: true,
    image: u("bakery,cafe,storefront", 2002),
  },
  {
    id: "airport-cody",
    city: "Mobile",
    neighborhood: "Airport Blvd & Cody",
    state: "AL",
    address: "7080 Airport Blvd Suite C, Mobile, AL 36608",
    phone: "(251) 300-9298",
    mapUrl: "https://maps.google.com/?q=7080+Airport+Blvd+Suite+C+Mobile+AL+36608",
    pickup: true,
    delivery: true,
    image: u("donuts,bakery,interior", 2003),
  },
  {
    id: "service-road",
    city: "Mobile",
    neighborhood: "Service Road",
    state: "AL",
    address: "5371 Service Rd, Mobile, AL 36619",
    phone: "(251) 408-9466",
    mapUrl: "https://maps.google.com/?q=5371+Service+Rd+Mobile+AL+36619",
    pickup: true,
    delivery: true,
    image: u("donut,store,morning", 2004),
  },
  {
    id: "government-blvd",
    city: "Mobile",
    neighborhood: "Government Blvd",
    state: "AL",
    address: "3915 Government Blvd, Mobile, AL 36693",
    phone: "(251) 219-7922",
    mapUrl: "https://maps.google.com/?q=3915+Government+Blvd+Mobile+AL+36693",
    pickup: true,
    delivery: true,
    image: u("coffee,shop,bakery", 2005),
  },
  {
    id: "old-shell",
    city: "Mobile",
    neighborhood: "Old Shell Rd",
    state: "AL",
    address: "4415 Old Shell Rd A, Mobile, AL 36608",
    phone: "(251) 327-2899",
    mapUrl: "https://maps.google.com/?q=4415+Old+Shell+Rd+A+Mobile+AL+36608",
    pickup: true,
    delivery: true,
    image: u("bakery,morning,southern", 2006),
  },
  {
    id: "midtown-dauphin",
    city: "Mobile",
    neighborhood: "Midtown / Dauphin St",
    state: "AL",
    address: "3242 Dauphin St, Mobile, AL 36606",
    phone: "(251) 471-2590",
    mapUrl: "https://maps.google.com/?q=3242+Dauphin+St+Mobile+AL+36606",
    pickup: true,
    delivery: true,
    image: u("bakery,morning,cafe", 2007),
  },
  {
    id: "saraland",
    city: "Saraland",
    state: "AL",
    address: "602 Saraland Blvd S, Saraland, AL 36571",
    phone: "(251) 287-2497",
    mapUrl: "https://maps.google.com/?q=602+Saraland+Blvd+S+Saraland+AL+36571",
    pickup: true,
    delivery: true,
    image: u("donut,store,small,town", 2008),
  },
  {
    id: "bay-minette",
    city: "Bay Minette",
    state: "AL",
    address: "702 D'Olive St, Bay Minette, AL 36507",
    phone: "(251) 239-8152",
    mapUrl: "https://maps.google.com/?q=702+D'Olive+St+Bay+Minette+AL+36507",
    pickup: true,
    delivery: false,
    image: u("donut,shop,exterior", 2009),
  },
  {
    id: "fairhope",
    city: "Fairhope",
    state: "AL",
    address: "110 Eastern Shore Shopping Center, Fairhope, AL 36532",
    phone: "(251) 270-8990",
    mapUrl: "https://maps.google.com/?q=110+Eastern+Shore+Shopping+Center+Fairhope+AL+36532",
    pickup: true,
    delivery: true,
    image: u("coastal,bakery,charming", 2010),
  },
  {
    id: "robertsdale",
    city: "Robertsdale",
    state: "AL",
    address: "18480 Bargineer Dr, Robertsdale, AL 36567",
    phone: "(251) 947-2673",
    mapUrl: "https://maps.google.com/?q=18480+Bargineer+Dr+Robertsdale+AL+36567",
    pickup: true,
    delivery: false,
    image: u("donut,box,morning", 2011),
  },
  {
    id: "foley",
    city: "Foley",
    state: "AL",
    address: "201 E Michigan Ave, Foley, AL 36535",
    phone: "(251) 970-0020",
    mapUrl: "https://maps.google.com/?q=201+E+Michigan+Ave+Foley+AL+36535",
    pickup: true,
    delivery: true,
    image: u("bakery,coastal,morning", 2012),
  },
  {
    id: "gulf-shores",
    city: "Gulf Shores",
    state: "AL",
    address: "229 E 20th Ave #14, Gulf Shores, AL 36542",
    phone: "(251) 233-3968",
    mapUrl: "https://maps.google.com/?q=229+E+20th+Ave+14+Gulf+Shores+AL+36542",
    pickup: true,
    delivery: true,
    image: u("coastal,beach,bakery", 2013),
  },
  {
    id: "pine-forest-bellview",
    city: "Bellview",
    neighborhood: "Pine Forest / Bellview",
    state: "FL",
    address: "6675 Pine Forest Rd, Bellview, FL 32526",
    phone: "(850) 287-4446",
    mapUrl: "https://maps.google.com/?q=6675+Pine+Forest+Rd+Bellview+FL+32526",
    pickup: true,
    delivery: true,
    image: u("bakery,florida,coffee", 2014),
  },
  {
    id: "pensacola-blvd",
    city: "Pensacola",
    neighborhood: "Pensacola Blvd",
    state: "FL",
    address: "8645 Pensacola Blvd Unit B, Pensacola, FL 32534",
    phone: "(850) 261-0064",
    mapUrl: "https://maps.google.com/?q=8645+Pensacola+Blvd+Unit+B+Pensacola+FL+32534",
    pickup: true,
    delivery: true,
    image: u("donut,bakery,modern", 2015),
  },
  {
    id: "creighton-eastgate",
    city: "Pensacola",
    neighborhood: "Creighton Rd / Eastgate Plaza",
    state: "FL",
    address: "2740 Creighton Rd, Pensacola, FL 32504",
    phone: "(850) 390-8280",
    mapUrl: "https://maps.google.com/?q=2740+Creighton+Rd+Pensacola+FL+32504",
    pickup: true,
    delivery: true,
    image: u("bakery,plaza,small", 2016),
  },
];

/** Find a location by its slug (id). */
export function getLocation(slug: string): Location | undefined {
  return locations.find((l) => l.id === slug);
}
