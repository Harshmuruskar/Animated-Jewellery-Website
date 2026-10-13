import { useState } from "react";
import { ArrowLeft, ArrowRight, Star } from "lucide-react";
import { editorialQuotes, testimonials } from "@/lib/jewelry-data";

export function PressReviewsSection() {
  const [active, setActive] = useState(0);
  return (
    <section className="flagship-section reviews-section" aria-labelledby="reviews-title">
      <span className="eyebrow">04 / A world of affection</span>
      <h2 id="reviews-title">
        Treasured pieces.
        <br />
        <em>Personal stories.</em>
      </h2>
      <div className="press-wordmarks" role="group" aria-label="Illustrative editorial quotes">
        {editorialQuotes.map((item, index) => (
          <button
            key={item.publication}
            aria-pressed={active === index}
            onClick={() => setActive(index)}
          >
            {item.publication}
          </button>
        ))}
      </div>
      <blockquote className="press-quote" aria-live="polite">
        “{editorialQuotes[active]!.quote}”
      </blockquote>
      <div className="editorial-caption">
        <span>Illustrative editorial copy · not published endorsements</span>
        <div>
          <button
            aria-label="Previous editorial quote"
            onClick={() =>
              setActive((active + editorialQuotes.length - 1) % editorialQuotes.length)
            }
          >
            <ArrowLeft size={18} />
          </button>
          <button
            aria-label="Next editorial quote"
            onClick={() => setActive((active + 1) % editorialQuotes.length)}
          >
            <ArrowRight size={18} />
          </button>
        </div>
      </div>
      <div className="collector-grid">
        {testimonials.map((item) => (
          <figure key={item.name}>
            <div className="collector-stars" aria-label={`${item.rating} out of 5 stars`}>
              {Array.from({ length: item.rating }, (_, index) => (
                <Star key={index} size={12} fill="currentColor" strokeWidth={0} />
              ))}
            </div>
            <blockquote>“{item.quote}”</blockquote>
            <figcaption>
              <span>{item.name}</span>
              <small>{item.location} / Collector story</small>
            </figcaption>
          </figure>
        ))}
      </div>
      <p className="sample-caption">
        Collector stories are illustrative examples for this collection preview.
      </p>
    </section>
  );
}
