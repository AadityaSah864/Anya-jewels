
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useCart } from "../context/CartContext";
import "./ProductDetails.css";


const API_URL = "http://localhost:5000/api/products";

function ProductDetails() {
  const { id } = useParams();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { addToCart, cartCount } = useCart();
  const [cartMessage, setCartMessage] = useState("");

  useEffect(() => {
    async function loadProduct() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(`${API_URL}/${id}`);

        if (!response.ok) {
          throw new Error(
            response.status === 404
              ? "Product not found."
              : "Failed to load product.",
          );
        }

        const data = await response.json();
        setProduct(data);
      } catch (err) {
        setError(err.message || "Something went wrong.");
      } finally {
        setLoading(false);
      }
    }

    loadProduct();
  }, [id]);

  if (loading) {
    return (
      <main className="details-message" role="status">
        Loading product details...
      </main>
    );
  }

  if (error || !product) {
    return (
      <main className="details-message" role="alert">
        <h2>Oops!</h2>
        <p>{error || "Product not found."}</p>
        <Link to="/" className="details-back-link">
          Back to shop
        </Link>
      </main>
    );
  }

  const hasDiscount =
    product.discountPrice != null && product.discountPrice < product.price;

  const displayPrice = hasDiscount ? product.discountPrice : product.price;

  return (
    <main className="product-details-page">
      <Link to="/" className="details-back-link">
        ← Back to shop
      </Link>

      <div className="product-details-layout">
        <div className="details-image">
          {product.images?.[0] ? (
            <img src={product.images[0]} alt={product.name} />
          ) : (
            <div className="product-image-placeholder">
              <span>ANYA JEWELLS</span>
            </div>
          )}
        </div>

        <section className="details-info">
          <p className="product-category">{product.category}</p>

          <h1>{product.name}</h1>

          <div className="details-prices">
            <span className="discount-price">
              Rs. {displayPrice.toLocaleString()}
            </span>

            {hasDiscount && (
              <span className="original-price">
                Rs. {product.price.toLocaleString()}
              </span>
            )}
          </div>

          {product.stock === 0 ? (
            <p className="details-stock out-of-stock">Currently out of stock</p>
          ) : (
            <p className="details-stock">In stock</p>
          )}

          <button
            type="button"
            className="cart-checkout-button"
            disabled={!product || product.stock <= 0}
            onClick={() => {
              const added = addToCart(product);

              setCartMessage(
                added
                  ? `${product.name} added to your bag.`
                  : "This item cannot be added in the requested quantity.",
              );
            }}
          >
            {product.stock <= 0 ? "Out of Stock" : "Add to Bag"}
          </button>

          {cartMessage && <p role="status">{cartMessage}</p>}

          <p>
            <Link to="/cart">View Bag ({cartCount})</Link>
          </p>

          <div className="details-divider" />

          <h2>About this piece</h2>

          <p className="details-description">
            {product.description || "A beautiful piece from Anya Jewells."}
          </p>

          <p className="details-note">
            Thoughtfully chosen for your everyday moments and special occasions.
          </p>
        </section>
      </div>
    </main>
  );
}

export default ProductDetails;
