import { useEffect, useState } from "react";
import { Check, ShieldCheck, ShoppingBag, Star, Heart, Columns3 } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { formatPrice, ringSizes, type Product } from "@/lib/jewelry-data";
import { useCartStore } from "@/hooks/use-cart-store";
import { MAX_COMPARISON, useJewelrySelections } from "@/hooks/use-jewelry-selections";
import { ProductVisual } from "./ProductVisual";

export function ProductQuickViewModal({
  product,
  onClose,
  night,
}: {
  product: Product | null;
  onClose: () => void;
  night: boolean;
}) {
  const [size, setSize] = useState("7");
  const cart = useCartStore();
  const selections = useJewelrySelections();
  useEffect(() => {
    setSize("7");
  }, [product?.id]);
  return (
    <Dialog
      open={Boolean(product)}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent className="luxury-dialog product-dialog" data-night={night} data-lenis-prevent>
        {product && (
          <>
            <div className="quick-product-image">
              <span className="eyebrow">Mancini &amp; Co / Collection study</span>
              <ProductVisual
                kind={product.image}
                gemColor={product.gemColor}
                metal={product.metalType}
                label={`${product.name} illustration`}
                halo={product.id === "verde" || product.category === "High Joaillerie"}
              />
            </div>
            <div className="quick-product-copy">
              <span className="eyebrow">
                {product.category} / {product.stockStatus}
              </span>
              <DialogTitle>{product.name}</DialogTitle>
              <DialogDescription>{product.description}</DialogDescription>
              <p className="quick-price">
                {formatPrice(product.price)} <small>USD</small>
              </p>
              <dl className="product-specs">
                <div>
                  <dt>Precious stone</dt>
                  <dd>{product.gemType}</dd>
                </div>
                <div>
                  <dt>Total carat weight</dt>
                  <dd>{product.caratWeight.toFixed(2)} ct</dd>
                </div>
                <div>
                  <dt>Setting</dt>
                  <dd>{product.metalType}</dd>
                </div>
                <div>
                  <dt>Dimensions</dt>
                  <dd>{product.dimensions}</dd>
                </div>
              </dl>
              <p className="certificate-note">
                <ShieldCheck size={16} /> Diamond grading report on request
              </p>
              <p className="rating-note">
                <Star size={14} fill="currentColor" /> {product.rating.toFixed(1)} ·{" "}
                {product.reviewCount} illustrative collector ratings
              </p>
              {product.category === "Rings" && (
                <label className="field-label">
                  Ring size · US
                  <select
                    aria-label="Ring size · US"
                    value={size}
                    onChange={(event) => setSize(event.target.value)}
                  >
                    {ringSizes.map((ring) => (
                      <option key={ring.us} value={ring.us}>
                        {ring.us} — EU {ring.eu} / UK {ring.uk}
                      </option>
                    ))}
                  </select>
                </label>
              )}
              <button
                className="luxury-button solid"
                onClick={() => {
                  cart.addProduct(product, size);
                  onClose();
                  cart.setCartOpen(true);
                  toast.success(`${product.name} added to your bag`);
                }}
              >
                <ShoppingBag size={17} /> Add to shopping bag
              </button>
              <span className="small-assurance">
                <Check size={14} /> Signature packaging included
              </span>
              <div className="quick-selection-actions">
                <button
                  className="text-link"
                  aria-pressed={selections.wishlist.includes(product.id)}
                  onClick={() => selections.toggleWishlist(product.id)}
                >
                  <Heart
                    size={15}
                    fill={selections.wishlist.includes(product.id) ? "currentColor" : "none"}
                  />{" "}
                  {selections.wishlist.includes(product.id)
                    ? "Saved to wishlist"
                    : "Save to wishlist"}
                </button>
                <button
                  className="text-link"
                  aria-pressed={selections.comparison.includes(product.id)}
                  onClick={() => {
                    if (
                      !selections.comparison.includes(product.id) &&
                      selections.comparison.length >= MAX_COMPARISON
                    ) {
                      toast.info("Compare up to three pieces. Remove one to choose another.");
                      return;
                    }
                    selections.toggleComparison(product.id);
                  }}
                >
                  <Columns3 size={15} />{" "}
                  {selections.comparison.includes(product.id) ? "In comparison" : "Compare"}
                </button>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
