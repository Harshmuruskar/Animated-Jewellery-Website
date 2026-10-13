import { useState } from "react";
import { ArrowUpRight, Gem, Hammer, Leaf, Sparkles } from "lucide-react";
import { useCartStore } from "@/hooks/use-cart-store";

const pillars = [
  {
    title: "From the earth",
    subtitle: "Responsible sourcing",
    Icon: Leaf,
    description:
      "Beauty begins long before a stone reaches the atelier. Our vision is a transparent journey from origin to finished jewel, with responsible sourcing at every step.",
    detail: "Origin, considered",
    image: "/images/verde.jpg",
    alt: "Precious jewelry and gemstones in warm light",
  },
  {
    title: "Into the light",
    subtitle: "Precision lapidary",
    Icon: Gem,
    description:
      "A conversation between nature and light. Every facet is considered for balance, brilliance and the character that makes a stone entirely its own.",
    detail: "Every facet, intentional",
    image: "/images/aurora.jpg",
    alt: "A detailed jewelry composition",
  },
  {
    title: "A precious future",
    subtitle: "Recycled precious metals",
    Icon: Sparkles,
    description:
      "18-karat precious metal gives each creation its warmth and strength. Our atelier concept places recycled gold and thoughtful material choices at its heart.",
    detail: "Crafted to be cherished",
    image: "/images/serena.jpg",
    alt: "Gold jewelry with sculptural details",
  },
  {
    title: "The human touch",
    subtitle: "Bespoke hand-setting",
    Icon: Hammer,
    description:
      "Steady hands. Patient eyes. The final setting brings every element together, honoring the shape of the stone and the person who will wear it.",
    detail: "Made personal, by hand",
    image: "/images/atelier.jpg",
    alt: "Artisan hands carefully setting a diamond ring at a jewelry workbench",
  },
];
export function CraftsmanshipSection() {
  const [active, setActive] = useState(3);
  const pillar = pillars[active]!;
  const cart = useCartStore();
  return (
    <section
      id="atelier"
      className="flagship-section atelier-section"
      aria-labelledby="atelier-title"
    >
      <div className="atelier-visual">
        <img key={pillar.image} src={pillar.image} alt={pillar.alt} loading="lazy" />
        <div className="atelier-caption">
          <span className="eyebrow">The Mancini atelier</span>
          <span>{pillar.detail}</span>
        </div>
        <span className="atelier-monogram" aria-hidden="true">
          M.
        </span>
      </div>
      <div className="atelier-copy">
        <span className="eyebrow">02 / The art of making</span>
        <h2 id="atelier-title">
          A thousand details.
          <br />
          <em>One of a kind.</em>
        </h2>
        <p className="section-intro">Behind every jewel, a world of care.</p>
        <div className="atelier-tabs" role="group" aria-label="Explore atelier craftsmanship">
          {pillars.map(({ title, subtitle, Icon }, index) => (
            <button key={title} aria-pressed={active === index} onClick={() => setActive(index)}>
              <Icon size={19} strokeWidth={1} />
              <span>{subtitle}</span>
              <span>0{index + 1}</span>
            </button>
          ))}
        </div>
        <div className="atelier-story" aria-live="polite">
          <h3>{pillar.title}</h3>
          <p>{pillar.description}</p>
        </div>
        <button className="text-link" onClick={() => cart.setConciergeOpen(true)}>
          Meet your personal jeweler <ArrowUpRight size={16} />
        </button>
      </div>
    </section>
  );
}
