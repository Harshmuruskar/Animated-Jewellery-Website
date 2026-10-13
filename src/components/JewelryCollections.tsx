import { useState } from "react";
import { ArrowUpRight, Plus, Heart, Columns3 } from "lucide-react";
import { toast } from "sonner";
import {
  categories,
  formatPrice,
  selectProducts,
  type Category,
  type Product,
  type ProductSort,
} from "@/lib/jewelry-data";
import { useCartStore } from "@/hooks/use-cart-store";
import { MAX_COMPARISON, useJewelrySelections } from "@/hooks/use-jewelry-selections";
import { ProductVisual } from "./ProductVisual";

export function JewelryCollections({ onQuickView }: { onQuickView: (product: Product) => void }) {
  const [category, setCategory] = useState<Category>("All");
  const [sort, setSort] = useState<ProductSort>("featured");
  const cart = useCartStore();
  const selections = useJewelrySelections();
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const selected = selectProducts(category, sort).filter(
    (product) => !favoritesOnly || selections.wishlist.includes(product.id),
  );
  return (
    <section
      id="collections"
      className="flagship-section collections-section"
      aria-labelledby="collections-title"
    >
      <div className="section-heading">
        <div>
          <span className="eyebrow">01 / The collections</span>
          <h2 id="collections-title">
            Extraordinary, <em>every day.</em>
          </h2>
        </div>
        <p>
          Objects of affection. Expressions of you.
          <br />
          Discover a new generation of heirlooms.
        </p>
      </div>
      <div className="collection-toolbar">
        <div className="collection-filters" role="group" aria-label="Filter jewelry by category">
          {categories.map((label) => (
            <button
              key={label}
              aria-pressed={category === label}
              onClick={() => setCategory(label)}
            >
              {label}
            </button>
          ))}
        </div>
        <label className="sort-label">
          Sort by
          <select value={sort} onChange={(event) => setSort(event.target.value as ProductSort)}>
            <option value="featured">Featured</option>
            <option value="price-asc">Price: low to high</option>
            <option value="price-desc">Price: high to low</option>
          </select>
        </label>
      </div>
      <div className="collection-selection-toolbar">
        <button
          className="text-link"
          aria-pressed={favoritesOnly}
          onClick={() => setFavoritesOnly(!favoritesOnly)}
        >
          <Heart size={15} fill={favoritesOnly ? "currentColor" : "none"} /> Favorites{" "}
          {selections.wishlist.length > 0 && `(${selections.wishlist.length})`}
        </button>
        <button className="text-link" onClick={() => selections.setComparisonOpen(true)}>
          <Columns3 size={16} /> Compare pieces ({selections.comparison.length}/{MAX_COMPARISON})
        </button>
      </div>
      <p className="sr-only" role="status">
        {selected.length} pieces in {category}
      </p>
      <div className="product-grid">
        {selected.map((product, index) => (
          <article className="product-card" key={product.id}>
            <div className="product-image">
              <span className="product-badge">{product.badge}</span>
              <button
                className="wishlist-button"
                aria-label={`${selections.wishlist.includes(product.id) ? "Remove" : "Save"} ${product.name} ${selections.wishlist.includes(product.id) ? "from" : "to"} wishlist`}
                aria-pressed={selections.wishlist.includes(product.id)}
                onClick={() => selections.toggleWishlist(product.id)}
              >
                <Heart
                  size={19}
                  strokeWidth={1}
                  fill={selections.wishlist.includes(product.id) ? "currentColor" : "none"}
                />
              </button>
              <button
                className="product-image-link"
                onClick={() => onQuickView(product)}
                aria-label={`View ${product.name}`}
              >
                <ProductVisual
                  kind={product.image}
                  gemColor={product.gemColor}
                  metal={product.metalType}
                  halo={product.category === "High Joaillerie" || product.id === "verde"}
                  label={`${product.name} illustration`}
                />
              </button>
              <button className="quick-view" onClick={() => onQuickView(product)}>
                Discover the piece <ArrowUpRight size={16} />
              </button>
            </div>
            <div className="product-details">
              <div>
                <span className="eyebrow">{product.category}</span>
                <h3>{product.name}</h3>
                <p>
                  {product.metalType} · {product.caratWeight.toFixed(2)} ct
                </p>
                <span className="product-price">{formatPrice(product.price)}</span>
              </div>
              <button
                className="add-piece"
                aria-label={`Add ${product.name} to bag`}
                onClick={() => {
                  if (product.category === "Rings") {
                    onQuickView(product);
                    return;
                  }
                  cart.addProduct(product);
                  toast.success(`${product.name} added to your bag`);
                }}
              >
                <Plus size={20} strokeWidth={1} />
              </button>
            </div>
            <button
              className="product-compare"
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
              <Columns3 size={14} />{" "}
              {selections.comparison.includes(product.id) ? "Added to comparison" : "Compare"}
              <span>0{index + 1}</span>
            </button>
          </article>
        ))}
      </div>
      {selected.length === 0 && (
        <div className="collection-empty">
          <Heart size={30} strokeWidth={1} />
          <h3>No saved pieces in this collection yet.</h3>
          <p>Explore the collection and tap a heart to keep a favorite.</p>
          <button
            className="luxury-button"
            onClick={() => {
              setFavoritesOnly(false);
              setCategory("All");
            }}
          >
            Show all pieces
          </button>
        </div>
      )}
      <div className="collection-note">
        <span>Each piece begins with a conversation.</span>
        <button className="text-link" onClick={() => cart.setConciergeOpen(true)}>
          Find your extraordinary <ArrowUpRight size={16} />
        </button>
      </div>
    </section>
  );
}
