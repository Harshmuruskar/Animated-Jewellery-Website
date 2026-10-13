import { Check, Copy, Heart, Link2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { useJewelrySelections } from "@/hooks/use-jewelry-selections";
import { ENGRAVING_LIMIT, normalizeEngraving, ringShareUrl } from "@/lib/ring-designs";
import { customRingPrice, formatPrice, type CustomRing } from "@/lib/jewelry-data";
import { EngravingPreview } from "./EngravingPreview";

export type PersonalizationMode = "save" | "share" | "engrave" | null;
export function RingPersonalizationModal({
  mode,
  onClose,
  specs,
  night,
  onEngraving,
}: {
  mode: PersonalizationMode;
  onClose: () => void;
  specs: CustomRing;
  night: boolean;
  onEngraving: (text: string, style: "Serif" | "Sans") => void;
}) {
  const selections = useJewelrySelections();
  const [name, setName] = useState("");
  const [text, setText] = useState("");
  const [style, setStyle] = useState<"Serif" | "Sans">("Serif");
  const [url, setUrl] = useState("");
  const [copied, setCopied] = useState(false);
  useEffect(() => {
    if (!mode) return;
    setName(`${specs.gem} ${specs.design}`);
    setText(specs.engraving ?? "");
    setStyle(specs.engravingStyle ?? "Serif");
    setCopied(false);
    if (mode === "share") setUrl(ringShareUrl(window.location.href, specs));
  }, [mode, specs]);
  return (
    <Dialog
      open={Boolean(mode)}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent
        className="luxury-dialog personalization-dialog"
        data-night={night}
        data-lenis-prevent
      >
        <span className="eyebrow">Your signature, to keep</span>
        <DialogTitle>
          {mode === "engrave"
            ? "Words to treasure."
            : mode === "share"
              ? "A ring worth sharing."
              : "Keep your creation."}
        </DialogTitle>
        <DialogDescription>
          {mode === "engrave"
            ? "Preview a personal inscription inside the band. The illustration shows lettering and finish; final placement is reviewed by the atelier."
            : mode === "share"
              ? "This link reopens your exact design, size and engraving. Share it with someone who should see your creation."
              : "Give your ring a name and revisit it whenever inspiration calls. Saved designs stay in this browser."}
        </DialogDescription>
        {mode === "engrave" ? (
          <>
            <EngravingPreview text={text} style={style} metal={specs.metal} />
            <label className="field-label">
              Your inscription
              <input
                aria-label="Your inscription"
                value={text}
                onChange={(event) => setText(normalizeEngraving(event.target.value))}
                placeholder="A date, initials, a little promise…"
              />
            </label>
            <div className="engraving-options">
              <span className="fine-print">
                {Array.from(text).length}/{ENGRAVING_LIMIT} characters
              </span>
              <div role="group" aria-label="Engraving typeface">
                {(["Serif", "Sans"] as const).map((font) => (
                  <button key={font} aria-pressed={style === font} onClick={() => setStyle(font)}>
                    {font === "Serif" ? "Classic serif" : "Modern sans"}
                  </button>
                ))}
              </div>
            </div>
            <button
              className="luxury-button solid"
              onClick={() => {
                onEngraving(text.trim(), style);
                onClose();
                toast.success(text.trim() ? "Engraving added to your design" : "Engraving removed");
              }}
            >
              <Check size={16} /> Keep this inscription
            </button>
          </>
        ) : (
          <>
            <div className="design-recap">
              <span>
                {specs.gem} · {specs.metal} · {specs.design}
              </span>
              <span>
                US {specs.size} · {formatPrice(customRingPrice(specs))}
              </span>
              {specs.engraving && (
                <p>
                  “{specs.engraving}” · {specs.engravingStyle ?? "Serif"}
                </p>
              )}
            </div>
            {mode === "save" ? (
              <>
                <label className="field-label">
                  Design name
                  <input
                    aria-label="Design name"
                    maxLength={60}
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                  />
                </label>
                <button
                  className="luxury-button solid"
                  onClick={() => {
                    selections.saveDesign(specs, name);
                    onClose();
                    toast.success("Your ring is saved in your collection");
                  }}
                >
                  <Heart size={16} /> Save my ring
                </button>
              </>
            ) : (
              <>
                <label className="field-label">
                  Your ring link
                  <input
                    aria-label="Your ring link"
                    value={url}
                    readOnly
                    onFocus={(event) => event.target.select()}
                  />
                </label>
                <button
                  className="luxury-button solid"
                  onClick={async () => {
                    try {
                      await navigator.clipboard.writeText(url);
                      setCopied(true);
                      toast.success("Your ring link is copied");
                    } catch {
                      toast.info("Select the link above and copy it to share your ring.");
                    }
                  }}
                >
                  {copied ? <Check size={16} /> : <Copy size={16} />}
                  {copied ? "Link copied" : "Copy ring link"}
                </button>
                {typeof navigator !== "undefined" && typeof navigator.share === "function" && (
                  <button
                    className="text-link"
                    onClick={async () => {
                      try {
                        await navigator.share({ title: "My Mancini ring", url });
                      } catch {
                        /* Dismissed native share sheet. */
                      }
                    }}
                  >
                    <Link2 size={15} /> Share with someone
                  </button>
                )}
              </>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
