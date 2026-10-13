export const categories = [
  "All",
  "Rings",
  "High Joaillerie",
  "Necklaces",
  "Earrings",
  "Bracelets",
] as const;
export type Category = (typeof categories)[number];
export type Product = {
  id: string;
  name: string;
  category: Exclude<Category, "All">;
  price: number;
  caratWeight: number;
  metalType: string;
  gemType: string;
  gemColor: string;
  image: string;
  description: string;
  rating: number;
  reviewCount: number;
  dimensions: string;
  stockStatus: "Available" | "Made to order";
  badge: string;
};

// Illustrative collection for this storefront prototype; prices are in USD.
export const products: Product[] = [
  {
    id: "aurora",
    name: "Aurora Solitaire",
    category: "Rings",
    price: 18500,
    caratWeight: 2,
    metalType: "18K yellow gold",
    gemType: "Round brilliant diamond",
    gemColor: "#e1f3f7",
    image: "/images/aurora.jpg",
    description:
      "A luminous round brilliant, suspended in a delicate six-prong setting. A quiet expression of a love that lasts.",
    rating: 4.9,
    reviewCount: 28,
    dimensions: "2 mm band · 8.1 mm center stone",
    stockStatus: "Available",
    badge: "The signature",
  },
  {
    id: "verde",
    name: "Verde Eternity",
    category: "Rings",
    price: 24800,
    caratWeight: 2.8,
    metalType: "18K rose gold",
    gemType: "Emerald & diamond",
    gemColor: "#28765a",
    image: "/images/verde.jpg",
    description:
      "An emerald-cut green heart framed by a constellation of diamonds. Warm rose gold lends the setting a soft, modern elegance.",
    rating: 4.9,
    reviewCount: 19,
    dimensions: "2.4 mm band · 9 × 7 mm center stone",
    stockStatus: "Available",
    badge: "Rare color",
  },
  {
    id: "luna",
    name: "Luna Pendant",
    category: "Necklaces",
    price: 9200,
    caratWeight: 0.9,
    metalType: "18K white gold",
    gemType: "Pear-cut diamond",
    gemColor: "#dce9f8",
    image: "/images/luna.jpg",
    description:
      "A single pear-cut diamond follows the rhythm of a fine white-gold chain. Designed to rest close to the heart.",
    rating: 4.8,
    reviewCount: 34,
    dimensions: "42 cm chain · adjustable to 38 cm",
    stockStatus: "Available",
    badge: "Everyday extraordinary",
  },
  {
    id: "celeste",
    name: "Celeste Drops",
    category: "Earrings",
    price: 14200,
    caratWeight: 1.6,
    metalType: "18K white gold",
    gemType: "Aquamarine & diamond",
    gemColor: "#74bcd7",
    image: "/images/celeste.jpg",
    description:
      "Two pale-blue aquamarines catch the light beneath pavé diamond arcs. Fluid movement, effortless presence.",
    rating: 4.9,
    reviewCount: 16,
    dimensions: "28 mm drop · pierced ears",
    stockStatus: "Available",
    badge: "Light in motion",
  },
  {
    id: "serena",
    name: "Serena Tennis",
    category: "Bracelets",
    price: 21800,
    caratWeight: 3.2,
    metalType: "18K yellow gold",
    gemType: "Round brilliant diamonds",
    gemColor: "#e5f4f7",
    image: "/images/serena.jpg",
    description:
      "An uninterrupted line of brilliant diamonds, each set by hand. A graceful clasp completes this enduring classic.",
    rating: 5,
    reviewCount: 22,
    dimensions: "17 cm · double safety clasp",
    stockStatus: "Available",
    badge: "An enduring icon",
  },
  {
    id: "notte",
    name: "Notte Royale",
    category: "High Joaillerie",
    price: 68500,
    caratWeight: 5,
    metalType: "Platinum & 18K gold",
    gemType: "Sapphire & diamond",
    gemColor: "#344e92",
    image: "/images/notte.jpg",
    description:
      "A midnight-blue sapphire at the center of an articulated diamond collar. An exceptional composition, made individually for its collector.",
    rating: 5,
    reviewCount: 7,
    dimensions: "40 cm collar · bespoke fitting",
    stockStatus: "Made to order",
    badge: "By the atelier",
  },
];

export type ProductSort = "featured" | "price-asc" | "price-desc";
export function selectProducts(category: Category, sort: ProductSort) {
  const selected = products.filter(
    (product) => category === "All" || product.category === category,
  );
  if (sort !== "featured")
    selected.sort((a, b) => (sort === "price-asc" ? a.price - b.price : b.price - a.price));
  return selected;
}
export const formatPrice = (amount: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);

export type CustomRing = {
  gem: string;
  gemColor: string;
  metal: string;
  metalColors: [string, string];
  design: "Signature" | "Halo";
  size: string;
  engraving?: string;
  engravingStyle?: "Serif" | "Sans";
};
export function customRingPrice(specs: Pick<CustomRing, "gem" | "metal" | "design">) {
  const gemstone =
    ({ Emerald: 2800, Ruby: 1800, Aquamarine: 900, Violet: 700 } as Record<string, number>)[
      specs.gem
    ] ?? 0;
  const finish = specs.metal.toLowerCase().includes("rose")
    ? 600
    : specs.metal === "Gold"
      ? 400
      : 0;
  return 18500 + gemstone + finish + (specs.design === "Halo" ? 3200 : 0);
}

// Round brilliant face-up diameters are approximate; carat measures weight.
export const caratBenchmarks = [
  { carat: 0.75, diameter: 5.8 },
  { carat: 1, diameter: 6.5 },
  { carat: 1.5, diameter: 7.4 },
  { carat: 2, diameter: 8.1 },
  { carat: 3, diameter: 9.3 },
  { carat: 4, diameter: 10.2 },
  { carat: 5, diameter: 11.1 },
];
export function caratDiameter(carat: number) {
  const bounded = Math.min(5, Math.max(0.75, carat));
  const upperIndex = caratBenchmarks.findIndex((benchmark) => benchmark.carat >= bounded);
  const upper = caratBenchmarks[upperIndex]!;
  const lower = caratBenchmarks[Math.max(0, upperIndex - 1)]!;
  if (upper.carat === lower.carat) return upper.diameter;
  return (
    lower.diameter +
    ((upper.diameter - lower.diameter) * (bounded - lower.carat)) / (upper.carat - lower.carat)
  );
}
export const colorGrades = [
  { grade: "D", label: "Colorless", color: "#f2f8ff" },
  { grade: "E", label: "Colorless", color: "#f5f8fa" },
  { grade: "F", label: "Colorless", color: "#f6f6ec" },
  { grade: "G", label: "Near colorless", color: "#f7f2d9" },
  { grade: "H", label: "Near colorless", color: "#f2e7bf" },
  { grade: "I", label: "Near colorless", color: "#eee0ab" },
  { grade: "J", label: "Near colorless", color: "#e7d399" },
];
export const clarityGrades = [
  {
    grade: "FL",
    label: "Flawless",
    detail: "No inclusions or blemishes visible to a skilled grader at 10× magnification.",
  },
  {
    grade: "IF",
    label: "Internally flawless",
    detail: "No inclusions visible at 10×; only surface blemishes.",
  },
  {
    grade: "VVS1",
    label: "Very, very slightly included",
    detail: "Inclusions are extremely difficult for a skilled grader to see at 10×.",
  },
  {
    grade: "VVS2",
    label: "Very, very slightly included",
    detail: "Minute inclusions are very difficult to see at 10× magnification.",
  },
  {
    grade: "VS1",
    label: "Very slightly included",
    detail: "Minor inclusions are difficult to see at 10× magnification.",
  },
  {
    grade: "VS2",
    label: "Very slightly included",
    detail: "Minor inclusions are somewhat easy to see at 10× magnification.",
  },
  {
    grade: "SI1",
    label: "Slightly included",
    detail: "Noticeable inclusions at 10×; visibility without magnification depends on the stone.",
  },
];
export const cutGrades = [
  {
    grade: "Excellent",
    detail: "A balanced pattern of brightness, fire and scintillation.",
    brilliance: 1,
  },
  {
    grade: "Very good",
    detail: "Strong light return with small differences in proportions.",
    brilliance: 0.85,
  },
  {
    grade: "Good",
    detail: "More light escapes through the pavilion; brightness is reduced.",
    brilliance: 0.65,
  },
  {
    grade: "Fair",
    detail: "Less balanced proportions noticeably reduce light return.",
    brilliance: 0.45,
  },
  { grade: "Poor", detail: "Significant light leakage and diminished sparkle.", brilliance: 0.25 },
];

// Whole US sizes, with approximate international equivalents. EU is inner circumference.
export const ringSizes = [
  { us: "4", uk: "H", eu: "47", jp: "7", diameter: 14.9 },
  { us: "5", uk: "J", eu: "49", jp: "9", diameter: 15.7 },
  { us: "6", uk: "L", eu: "52", jp: "11", diameter: 16.5 },
  { us: "7", uk: "N", eu: "54", jp: "14", diameter: 17.3 },
  { us: "8", uk: "P", eu: "57", jp: "16", diameter: 18.1 },
  { us: "9", uk: "R", eu: "60", jp: "18", diameter: 19 },
  { us: "10", uk: "T", eu: "62", jp: "20", diameter: 19.8 },
  { us: "11", uk: "V", eu: "65", jp: "23", diameter: 20.6 },
  { us: "12", uk: "X", eu: "67", jp: "25", diameter: 21.4 },
];
export const editorialQuotes = [
  {
    publication: "VOGUE",
    quote: "A study in quiet elegance. Jewelry that becomes part of your story.",
  },
  {
    publication: "Harper’s BAZAAR",
    quote: "Precious color, sculptural lines, and an unmistakably personal point of view.",
  },
  { publication: "ELLE", quote: "The modern heirloom: effortless today, treasured forever." },
  { publication: "FORBES", quote: "A new expression of the private jewelry salon." },
];
export const testimonials = [
  {
    name: "Camille R.",
    location: "Paris",
    quote: "Choosing every detail made the ring feel like it was always meant to be mine.",
    rating: 5,
  },
  {
    name: "Alexander M.",
    location: "New York",
    quote: "From the first conversation to the final setting, every moment felt considered.",
    rating: 5,
  },
  {
    name: "Sofia L.",
    location: "Milan",
    quote: "Something I wear every day, and will one day pass on. That is the real beauty of it.",
    rating: 5,
  },
  {
    name: "Elena V.",
    location: "Geneva",
    quote: "The color, the balance, the way it catches the light. A little piece of wonder.",
    rating: 5,
  },
];
export const boutiques = [
  { city: "Paris", district: "Place Vendôme" },
  { city: "New York", district: "Madison Avenue" },
  { city: "Milan", district: "Via Montenapoleone" },
  { city: "Tokyo", district: "Ginza" },
];
