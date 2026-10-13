import { useState, type FormEvent } from "react";
import { ArrowUpRight, CalendarDays, CheckCircle2 } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { useCartStore } from "@/hooks/use-cart-store";

const locations = ["New York", "Paris", "Milan", "London"];
const timezones: Record<string, string> = {
  "New York": "America/New_York",
  Paris: "Europe/Paris",
  Milan: "Europe/Rome",
  London: "Europe/London",
};
const today = () => {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
};
const earliestAppointment = () => {
  const date = new Date();
  date.setDate(date.getDate() + 1);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
};
export function ConciergeModal({ night }: { night: boolean }) {
  const cart = useCartStore();
  const [type, setType] = useState("virtual");
  const [location, setLocation] = useState("New York");
  const [confirmation, setConfirmation] = useState<{
    reference: string;
    date: string;
    time: string;
    name: string;
    zone: string;
    location: string;
  } | null>(null);
  const [error, setError] = useState("");
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const date = String(data.get("date"));
    const time = String(data.get("time"));
    const name = String(data.get("name")).trim();
    if (!name) {
      setError("Please enter your name.");
      return;
    }
    if (!date || date <= today()) {
      setError("Please select a date from tomorrow onward.");
      return;
    }
    const zone =
      type === "virtual" ? Intl.DateTimeFormat().resolvedOptions().timeZone : timezones[location]!;
    setError("");
    setConfirmation({
      reference: `SALON-${crypto.randomUUID().slice(0, 8).toUpperCase()}`,
      date,
      time,
      name,
      zone,
      location: type === "virtual" ? "Virtual 3D consultation" : `${location} private boutique`,
    });
  }
  return (
    <Dialog
      open={cart.conciergeOpen}
      onOpenChange={(open) => {
        cart.setConciergeOpen(open);
        if (!open) {
          setConfirmation(null);
          setError("");
        }
      }}
    >
      <DialogContent
        className="luxury-dialog concierge-dialog"
        data-night={night}
        data-lenis-prevent
      >
        {confirmation ? (
          <div className="salon-confirmation">
            <CheckCircle2 size={42} strokeWidth={1} />
            <span className="eyebrow">A moment, just for you</span>
            <DialogTitle>Your salon preview.</DialogTitle>
            <DialogDescription>
              {confirmation.name}, your appointment preview is ready. No appointment has been
              submitted or reserved.
            </DialogDescription>
            <span className="booking-reference">{confirmation.reference}</span>
            <p>
              {confirmation.location}
              <br />
              {new Intl.DateTimeFormat("en-US", { dateStyle: "long" }).format(
                new Date(`${confirmation.date}T12:00:00`),
              )}{" "}
              · {confirmation.time}
              <br />
              <small>{confirmation.zone}</small>
            </p>
            <button className="luxury-button" onClick={() => cart.setConciergeOpen(false)}>
              Return to the collection
            </button>
          </div>
        ) : (
          <>
            <span className="eyebrow">The private salon</span>
            <DialogTitle>Let’s make it personal.</DialogTitle>
            <DialogDescription>
              Explore a private consultation with a Mancini jeweler. This booking preview does not
              submit your details.
            </DialogDescription>
            <form onSubmit={submit} className="concierge-form">
              <fieldset>
                <legend className="field-label">Your preferred experience</legend>
                <div className="appointment-options">
                  <label>
                    <input
                      type="radio"
                      name="type"
                      value="virtual"
                      checked={type === "virtual"}
                      onChange={() => setType("virtual")}
                    />
                    <span>
                      Virtual 3D salon<small>From wherever you are</small>
                    </span>
                  </label>
                  <label>
                    <input
                      type="radio"
                      name="type"
                      value="boutique"
                      checked={type === "boutique"}
                      onChange={() => setType("boutique")}
                    />
                    <span>
                      Private boutique<small>An intimate appointment</small>
                    </span>
                  </label>
                </div>
              </fieldset>
              {type === "boutique" && (
                <label className="field-label">
                  Boutique
                  <select value={location} onChange={(event) => setLocation(event.target.value)}>
                    {locations.map((city) => (
                      <option key={city}>{city}</option>
                    ))}
                  </select>
                </label>
              )}
              <div className="form-pair">
                <label className="field-label">
                  Preferred date
                  <input name="date" type="date" min={earliestAppointment()} required />
                </label>
                <label className="field-label">
                  Preferred time
                  <select name="time" aria-label="Preferred time" required>
                    <option value="">Select a time</option>
                    {["10:00", "11:00", "12:00", "14:00", "15:00", "16:00"].map((time) => (
                      <option key={time}>{time}</option>
                    ))}
                  </select>
                </label>
              </div>
              <p className="fine-print">
                Times are in {type === "virtual" ? "your local timezone" : timezones[location]}.
              </p>
              <label className="field-label">
                Full name
                <input
                  name="name"
                  autoComplete="name"
                  maxLength={100}
                  required
                  placeholder="Your name"
                />
              </label>
              <div className="form-pair">
                <label className="field-label">
                  Email address
                  <input
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    maxLength={254}
                    placeholder="you@example.com"
                  />
                </label>
                <label className="field-label">
                  Telephone · optional
                  <input
                    name="phone"
                    type="tel"
                    autoComplete="tel"
                    maxLength={30}
                    placeholder="With country code"
                  />
                </label>
              </div>
              <label className="field-label">
                What brings you to the salon?
                <select name="interest">
                  <option>Designing a bespoke ring</option>
                  <option>Engagement &amp; bridal</option>
                  <option>High joaillerie</option>
                  <option>A personal gift</option>
                  <option>Exploring the collection</option>
                </select>
              </label>
              {error && (
                <p role="alert" className="form-error">
                  {error}
                </p>
              )}
              <button className="luxury-button solid" type="submit">
                <CalendarDays size={17} /> Preview my appointment <ArrowUpRight size={17} />
              </button>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

export function ConciergeSection() {
  const cart = useCartStore();
  return (
    <section
      id="concierge"
      className="flagship-section concierge-section"
      aria-labelledby="concierge-title"
    >
      <span className="eyebrow">05 / At your service</span>
      <span className="salon-script" aria-hidden="true">
        Just for you
      </span>
      <h2 id="concierge-title">
        Your story.
        <br />
        <em>Our undivided attention.</em>
      </h2>
      <p>
        A significant moment. An extraordinary gift. A jewel only you could imagine.
        <br />
        Let’s begin with a conversation.
      </p>
      <button className="luxury-button" onClick={() => cart.setConciergeOpen(true)}>
        Enter the private salon <ArrowUpRight size={18} />
      </button>
      <span className="salon-locations">New York · Paris · Milan · London · Anywhere</span>
    </section>
  );
}
