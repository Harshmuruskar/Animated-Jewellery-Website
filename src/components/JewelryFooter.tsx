import { useState, type FormEvent } from "react";
import { ArrowRight, Diamond, Gift, RotateCcw, ShieldCheck } from "lucide-react";
import { boutiques } from "@/lib/jewelry-data";
import { useCartStore } from "@/hooks/use-cart-store";

export function JewelryFooter({ onStory }: { onStory: () => void }) {
  const [subscribed, setSubscribed] = useState(false);
  const [email, setEmail] = useState("");
  const cart = useCartStore();
  function subscribe(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubscribed(true);
  }
  return (
    <footer className="jewelry-footer">
      <div className="assurance-strip">
        {[
          { Icon: ShieldCheck, title: "Lifetime care", text: "An enduring relationship" },
          { Icon: Diamond, title: "Diamond expertise", text: "Grading reports on request" },
          { Icon: RotateCcw, title: "Personal fitting", text: "Resizing by consultation" },
          { Icon: Gift, title: "White-glove delivery", text: "Insured, with care" },
        ].map(({ Icon, title, text }) => (
          <div key={title}>
            <Icon size={25} strokeWidth={1} />
            <span>
              {title}
              <small>{text}</small>
            </span>
          </div>
        ))}
      </div>
      <div className="footer-top">
        <div className="newsletter">
          <span className="eyebrow">The Mancini inner circle</span>
          <h2>
            A closer look at <em>the extraordinary.</em>
          </h2>
          <p>New collections, atelier stories and private invitations.</p>
          {subscribed ? (
            <p className="newsletter-success" role="status">
              Your signup preview is complete for {email}. No subscription has been submitted.
            </p>
          ) : (
            <form onSubmit={subscribe}>
              <label className="sr-only" htmlFor="newsletter-email">
                Email address
              </label>
              <input
                id="newsletter-email"
                type="email"
                required
                maxLength={254}
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="Your email address"
                autoComplete="email"
              />
              <button type="submit" aria-label="Preview Inner Circle signup">
                <ArrowRight size={22} strokeWidth={1} />
              </button>
            </form>
          )}
          <small>Collection preview · signup is simulated.</small>
        </div>
        <div className="boutique-directory">
          <span className="eyebrow">Find your salon</span>
          {boutiques.map((boutique) => (
            <button key={boutique.city} onClick={() => cart.setConciergeOpen(true)}>
              <span>{boutique.city}</span>
              <small>{boutique.district}</small>
              <ArrowRight size={14} />
            </button>
          ))}
          <small className="fine-print">Illustrative boutique directory</small>
        </div>
      </div>
      <button
        className="footer-wordmark"
        onClick={onStory}
        aria-label="Return to the Mancini 3D story"
      >
        MANCINI <span>&amp;</span> CO
      </button>
      <div className="footer-bottom">
        <p>© {new Date().getFullYear()} Mancini &amp; Co. Collection concept.</p>
        <p>
          3D experience:{" "}
          <a href="https://www.neotix.com.br/lab" target="_blank" rel="noreferrer">
            Neotix
          </a>{" "}
          &amp;{" "}
          <a href="https://pixotronics.com" target="_blank" rel="noreferrer">
            Pixotronics / WebGi
          </a>
        </p>
        <span>USD / English</span>
      </div>
    </footer>
  );
}
