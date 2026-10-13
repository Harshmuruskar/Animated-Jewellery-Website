import { useState } from "react";
import { Check, CheckCircle2, Gift, Minus, Plus, ShoppingBag, Trash2, Truck } from "lucide-react";
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { formatPrice } from "@/lib/jewelry-data";
import { useCartStore, type CartItem } from "@/hooks/use-cart-store";
import { ProductVisual } from "./ProductVisual";

type Receipt = {
  reference: string;
  total: number;
  items: CartItem[];
  giftWrap: boolean;
  giftMessage: string;
  engraving: string;
};
export function CartDrawer({ night }: { night: boolean }) {
  const cart = useCartStore();
  const [checkout, setCheckout] = useState(false);
  const [receipt, setReceipt] = useState<Receipt | null>(null);
  return (
    <>
      <Sheet open={cart.cartOpen} onOpenChange={cart.setCartOpen}>
        <SheetContent className="luxury-dialog cart-drawer" data-night={night} data-lenis-prevent>
          <span className="eyebrow">A little extraordinary, to keep</span>
          <SheetTitle>
            Your shopping bag <span>({cart.count})</span>
          </SheetTitle>
          <SheetDescription>Your chosen pieces, beautifully considered.</SheetDescription>
          {cart.items.length === 0 ? (
            <div className="empty-bag">
              <ShoppingBag size={46} strokeWidth={0.7} />
              <h3>Your story starts here.</h3>
              <p>Find a piece that feels like you, or design a ring entirely your own.</p>
              <button className="luxury-button" onClick={() => cart.setCartOpen(false)}>
                Continue exploring
              </button>
            </div>
          ) : (
            <>
              <div className="delivery-note">
                <Truck size={18} strokeWidth={1} />
                <p>
                  {cart.deliveryRemaining === 0
                    ? "Complimentary insured delivery unlocked"
                    : `${formatPrice(cart.deliveryRemaining)} away from complimentary insured delivery`}
                </p>
              </div>
              <div
                className="delivery-track"
                role="progressbar"
                aria-label="Complimentary delivery progress"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={Math.round(cart.deliveryProgress)}
              >
                <span style={{ width: `${cart.deliveryProgress}%` }} />
              </div>
              <div className="bag-items">
                {cart.items.map((item) => (
                  <article className="bag-item" key={item.key}>
                    <div className="bag-item-image">
                      <ProductVisual
                        kind={item.image}
                        gemColor={item.gemColor}
                        metal={item.metal}
                        label={`${item.name} illustration`}
                        halo={item.custom?.design === "Halo"}
                      />
                    </div>
                    <div className="bag-item-copy">
                      <span className="eyebrow">
                        {item.custom ? "Your bespoke creation" : "The collection"}
                      </span>
                      <h3>{item.name}</h3>
                      <p>
                        {item.custom && (
                          <>
                            <span className="gem-dot" style={{ background: item.gemColor }} />
                            {item.custom.gem} ·{" "}
                          </>
                        )}
                        {item.metal}
                      </p>
                      <p>
                        {item.size === "One size" ? item.size : `Ring size US ${item.size}`}
                        {item.custom ? ` · ${item.custom.design} design` : ""}
                      </p>
                      {item.custom?.engraving && (
                        <p className="bag-inscription">
                          “{item.custom.engraving}” · {item.custom.engravingStyle ?? "Serif"}{" "}
                          engraving
                        </p>
                      )}
                      {item.custom && (
                        <div
                          className="custom-metal-swatches"
                          aria-label={`Metal colors ${item.custom.metalColors.join(" and ")}`}
                        >
                          {item.custom.metalColors.map((color, index) => (
                            <i key={index} style={{ background: color }} />
                          ))}
                        </div>
                      )}
                      <div className="item-bottom">
                        <div className="quantity-control">
                          <button
                            aria-label={`Decrease quantity of ${item.name}`}
                            onClick={() => cart.updateQuantity(item.key, item.quantity - 1)}
                          >
                            <Minus size={13} />
                          </button>
                          <span aria-label="Quantity">{item.quantity}</span>
                          <button
                            aria-label={`Increase quantity of ${item.name}`}
                            disabled={item.quantity >= 10}
                            onClick={() => cart.updateQuantity(item.key, item.quantity + 1)}
                          >
                            <Plus size={13} />
                          </button>
                        </div>
                        <span>{formatPrice(item.price * item.quantity)}</span>
                        <button
                          className="remove-item"
                          aria-label={`Remove ${item.name}`}
                          onClick={() => cart.removeItem(item.key)}
                        >
                          <Trash2 size={15} strokeWidth={1} />
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
              <div className="bag-personalization">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={cart.giftWrap}
                    onChange={(event) => cart.setPreferences({ giftWrap: event.target.checked })}
                  />
                  <Gift size={18} strokeWidth={1} />
                  Complimentary signature gift wrapping
                </label>
                {cart.giftWrap && (
                  <label className="field-label">
                    A note to treasure
                    <textarea
                      rows={2}
                      maxLength={240}
                      value={cart.giftMessage}
                      placeholder="Your personal gift message…"
                      onChange={(event) => cart.setPreferences({ giftMessage: event.target.value })}
                    />
                  </label>
                )}
                <label className="field-label">
                  Catalog ring engraving · optional
                  <input
                    value={cart.engraving}
                    maxLength={30}
                    placeholder="Up to 30 characters"
                    onChange={(event) => cart.setPreferences({ engraving: event.target.value })}
                  />
                </label>
                <p className="fine-print">Engraving suitability is reviewed for each design.</p>
              </div>
              <div className="bag-summary">
                <div>
                  <span>Subtotal</span>
                  <strong>{formatPrice(cart.subtotal)}</strong>
                </div>
                <p>USD · taxes and delivery would be confirmed at checkout.</p>
                <button
                  className="luxury-button solid"
                  onClick={() => {
                    cart.setCartOpen(false);
                    setCheckout(true);
                  }}
                >
                  Preview checkout <ShoppingBag size={17} />
                </button>
                <span className="small-assurance">
                  <Check size={14} /> Signature packaging · Insured delivery
                </span>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
      <Dialog open={checkout} onOpenChange={setCheckout}>
        <DialogContent
          className="luxury-dialog checkout-dialog"
          data-night={night}
          data-lenis-prevent
        >
          <span className="eyebrow">Your collection, reserved in imagination</span>
          <DialogTitle>Complete your preview.</DialogTitle>
          <DialogDescription>
            This is a simulated checkout. No payment will be taken and no order will be placed.
          </DialogDescription>
          <div className="checkout-review">
            {cart.items.map((item) => (
              <div key={item.key}>
                <span>
                  {item.name} × {item.quantity}
                </span>
                <strong>{formatPrice(item.price * item.quantity)}</strong>
              </div>
            ))}
            <div className="checkout-total">
              <span>Preview subtotal</span>
              <strong>{formatPrice(cart.subtotal)}</strong>
            </div>
          </div>
          <button
            disabled={cart.items.length === 0}
            className="luxury-button solid"
            onClick={() => {
              setReceipt({
                reference: `MC-${crypto.randomUUID().slice(0, 8).toUpperCase()}`,
                total: cart.subtotal,
                items: cart.items.map((item) => ({ ...item })),
                giftWrap: cart.giftWrap,
                giftMessage: cart.giftWrap ? cart.giftMessage : "",
                engraving: cart.engraving,
              });
              cart.clearCart();
              setCheckout(false);
            }}
          >
            Confirm simulated order
          </button>
          <button
            className="text-link"
            onClick={() => {
              setCheckout(false);
              cart.setCartOpen(true);
            }}
          >
            Return to your bag
          </button>
        </DialogContent>
      </Dialog>
      <Dialog
        open={Boolean(receipt)}
        onOpenChange={(open) => {
          if (!open) setReceipt(null);
        }}
      >
        <DialogContent
          className="luxury-dialog confirmation-dialog"
          data-night={night}
          data-lenis-prevent
        >
          <CheckCircle2 size={42} strokeWidth={1} />
          <span className="eyebrow">A beautiful beginning</span>
          <DialogTitle>Preview complete.</DialogTitle>
          <DialogDescription>
            No purchase was made. Your simulated order details are below.
          </DialogDescription>
          {receipt && (
            <>
              <span className="booking-reference">{receipt.reference}</span>
              <p>
                {receipt.items.reduce((count, item) => count + item.quantity, 0)} pieces ·{" "}
                {formatPrice(receipt.total)}
              </p>
              <ul className="receipt-items">
                {receipt.items.map((item) => (
                  <li key={item.key}>
                    {item.name} × {item.quantity}
                    {item.custom && (
                      <small>
                        {item.custom.gem} · {item.metal} · {item.custom.design} · US {item.size}
                        {item.custom.engraving && (
                          <>
                            {" "}
                            · “{item.custom.engraving}” ({item.custom.engravingStyle ?? "Serif"})
                          </>
                        )}
                      </small>
                    )}
                  </li>
                ))}
              </ul>
              {receipt.giftWrap && (
                <p className="fine-print">
                  Signature gift wrapping{receipt.giftMessage && ` · “${receipt.giftMessage}”`}
                </p>
              )}
              {receipt.engraving && (
                <p className="fine-print">Engraving requested: {receipt.engraving}</p>
              )}
            </>
          )}
          <button className="luxury-button" onClick={() => setReceipt(null)}>
            Continue the story
          </button>
        </DialogContent>
      </Dialog>
    </>
  );
}
