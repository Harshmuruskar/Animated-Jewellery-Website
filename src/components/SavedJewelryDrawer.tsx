import { Heart, Pencil, Trash2 } from "lucide-react";
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet";
import { useJewelrySelections } from "@/hooks/use-jewelry-selections";
import {
  customRingPrice,
  formatPrice,
  products,
  type CustomRing,
  type Product,
} from "@/lib/jewelry-data";
import { ProductVisual } from "./ProductVisual";

export function SavedJewelryDrawer({
  night,
  sceneReady,
  onRestore,
  onQuickView,
}: {
  night: boolean;
  sceneReady: boolean;
  onRestore: (specs: CustomRing) => void;
  onQuickView: (product: Product) => void;
}) {
  const selections = useJewelrySelections();
  const favorites = products.filter((product) => selections.wishlist.includes(product.id));
  return (
    <Sheet open={selections.savedOpen} onOpenChange={selections.setSavedOpen}>
      <SheetContent
        className="luxury-dialog cart-drawer saved-drawer"
        data-night={night}
        data-lenis-prevent
      >
        <span className="eyebrow">Pieces of your story</span>
        <SheetTitle>Your collection.</SheetTitle>
        <SheetDescription>
          Your favorite pieces and personal ring designs, saved in this browser.
        </SheetDescription>
        {favorites.length === 0 && selections.designs.length === 0 ? (
          <div className="empty-bag">
            <Heart size={44} strokeWidth={0.8} />
            <h3>Keep what speaks to you.</h3>
            <p>Tap a heart in the collection, or save a ring from the customizer.</p>
            <button className="luxury-button" onClick={() => selections.setSavedOpen(false)}>
              Continue exploring
            </button>
          </div>
        ) : (
          <>
            {selections.designs.length > 0 && (
              <>
                <h3 className="saved-group-title">
                  Your ring designs <span>({selections.designs.length})</span>
                </h3>
                {selections.designs.map((saved) => (
                  <article className="saved-piece" key={saved.id}>
                    <div className="saved-piece-image">
                      <ProductVisual
                        kind="ring"
                        gemColor={saved.specs.gemColor}
                        metal={saved.specs.metal}
                        halo={saved.specs.design === "Halo"}
                        label={saved.name}
                      />
                    </div>
                    <div>
                      <h4>{saved.name}</h4>
                      <p>
                        {saved.specs.gem} · {saved.specs.metal}
                      </p>
                      <p>
                        {saved.specs.design} · US {saved.specs.size} ·{" "}
                        {formatPrice(customRingPrice(saved.specs))}
                      </p>
                      {saved.specs.engraving && (
                        <p className="saved-inscription">“{saved.specs.engraving}”</p>
                      )}
                      <div className="saved-piece-actions">
                        <button
                          className="text-link"
                          onClick={() => {
                            selections.setSavedOpen(false);
                            onRestore(saved.specs);
                          }}
                        >
                          <Pencil size={14} />{" "}
                          {sceneReady ? "Edit design" : "Open when 3D is ready"}
                        </button>
                        <button
                          aria-label={`Delete ${saved.name}`}
                          onClick={() => selections.deleteDesign(saved.id)}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </>
            )}
            {favorites.length > 0 && (
              <>
                <h3 className="saved-group-title">
                  Favorite pieces <span>({favorites.length})</span>
                </h3>
                {favorites.map((product) => (
                  <article className="saved-piece" key={product.id}>
                    <button
                      className="saved-piece-image"
                      aria-label={`View saved ${product.name}`}
                      onClick={() => {
                        selections.setSavedOpen(false);
                        onQuickView(product);
                      }}
                    >
                      <ProductVisual
                        kind={product.image}
                        gemColor={product.gemColor}
                        metal={product.metalType}
                        label={product.name}
                      />
                    </button>
                    <div>
                      <h4>{product.name}</h4>
                      <p>{product.metalType}</p>
                      <p>{formatPrice(product.price)}</p>
                      <div className="saved-piece-actions">
                        <button
                          className="text-link"
                          onClick={() => {
                            selections.setSavedOpen(false);
                            onQuickView(product);
                          }}
                        >
                          Discover the piece
                        </button>
                        <button
                          aria-label={`Remove ${product.name} from wishlist`}
                          onClick={() => selections.toggleWishlist(product.id)}
                        >
                          <Heart size={16} fill="currentColor" />
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </>
            )}
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
