import { X } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { useJewelrySelections } from "@/hooks/use-jewelry-selections";
import { formatPrice, products, type Product } from "@/lib/jewelry-data";
import { ProductVisual } from "./ProductVisual";

export function ProductComparisonModal({
  night,
  onQuickView,
}: {
  night: boolean;
  onQuickView: (product: Product) => void;
}) {
  const selections = useJewelrySelections();
  const selected = selections.comparison.flatMap((id) => {
    const product = products.find((piece) => piece.id === id);
    return product ? [product] : [];
  });
  return (
    <Dialog open={selections.comparisonOpen} onOpenChange={selections.setComparisonOpen}>
      <DialogContent
        className="luxury-dialog comparison-dialog"
        data-night={night}
        data-lenis-prevent
      >
        <span className="eyebrow">Consider every detail</span>
        <DialogTitle>Side by side.</DialogTitle>
        <DialogDescription>
          Compare up to three pieces to find the one that feels like you.
        </DialogDescription>
        {selected.length === 0 ? (
          <div className="comparison-empty">
            <p>Select Compare on a piece in the collection.</p>
            <button className="luxury-button" onClick={() => selections.setComparisonOpen(false)}>
              Explore the collection
            </button>
          </div>
        ) : (
          <>
            <div className="comparison-scroll" tabIndex={0} aria-label="Jewelry comparison table">
              <table className="comparison-table">
                <thead>
                  <tr>
                    <th scope="col">
                      <span className="sr-only">Details</span>
                    </th>
                    {selected.map((piece) => (
                      <th scope="col" key={piece.id}>
                        <button
                          className="comparison-remove"
                          aria-label={`Remove ${piece.name} from comparison`}
                          onClick={() => selections.toggleComparison(piece.id)}
                        >
                          <X size={16} />
                        </button>
                        <ProductVisual
                          kind={piece.image}
                          gemColor={piece.gemColor}
                          metal={piece.metalType}
                          label={piece.name}
                        />
                        <h3>{piece.name}</h3>
                        <span>{piece.category}</span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {(
                    [
                      ["Price", (piece: Product) => formatPrice(piece.price)],
                      ["Precious stone", (piece: Product) => piece.gemType],
                      ["Carat weight", (piece: Product) => `${piece.caratWeight.toFixed(2)} ct`],
                      ["Metal", (piece: Product) => piece.metalType],
                      ["Dimensions", (piece: Product) => piece.dimensions],
                      ["Availability", (piece: Product) => piece.stockStatus],
                    ] as const
                  ).map(([label, value]) => (
                    <tr key={label}>
                      <th scope="row">{label}</th>
                      {selected.map((piece) => (
                        <td key={piece.id}>{value(piece)}</td>
                      ))}
                    </tr>
                  ))}
                  <tr>
                    <th scope="row">
                      <span className="sr-only">View piece</span>
                    </th>
                    {selected.map((piece) => (
                      <td key={piece.id}>
                        <button
                          className="luxury-button"
                          onClick={() => {
                            selections.setComparisonOpen(false);
                            onQuickView(piece);
                          }}
                        >
                          Discover
                        </button>
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
            <button className="text-link" onClick={selections.clearComparison}>
              Clear comparison
            </button>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
