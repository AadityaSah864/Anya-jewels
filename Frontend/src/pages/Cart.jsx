
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import "./Cart.css";

function Cart() {
  const {
    cartItems,
    cartCount,
    cartSubtotal,
    updateQuantity,
    removeFromCart,
  } = useCart();

  return (
    <main className="cart-page">
      <Link to="/" className="details-back-link">
        ← Continue shopping
      </Link>

      <h1>Your Shopping Bag</h1>
      <p className="cart-count">
        {cartCount} {cartCount === 1 ? "item" : "items"}
      </p>

      {cartItems.length === 0 ? (
        <div className="cart-empty">
          <h2>Your bag is waiting for a little sparkle.</h2>
          <p>You haven't added any jewellery yet.</p>
          <Link to="/" className="cart-shop-button">
            Explore the collection
          </Link>
        </div>
      ) : (
        <div className="cart-layout">
          <div className="cart-items">
            {cartItems.map((item) => {
              const price =
                item.discountPrice != null &&
                item.discountPrice < item.price
                  ? item.discountPrice
                  : item.price;

              return (
                <article className="cart-item" key={item._id}>
                  <div className="cart-item-image">
                    {item.images?.[0] ? (
                      <img src={item.images[0]} alt={item.name} />
                    ) : (
                      <div className="product-image-placeholder">
                        <span>ANYA JEWELLS</span>
                      </div>
                    )}
                  </div>

                  <div className="cart-item-info">
                    <p className="product-category">{item.category}</p>
                    <h2>{item.name}</h2>

                    <p className="cart-item-price">
                      Rs. {price.toLocaleString()}
                    </p>

                    <label className="quantity-label">
                      Quantity
                      <select
                        value={item.quantity}
                        onChange={(event) =>
                          updateQuantity(
                            item._id,
                            Number(event.target.value)
                          )
                        }
                      >
                        {Array.from(
                          { length: Math.max(0, item.stock) },
                          (_, index) => index + 1
                        ).map((quantity) => (
                          <option key={quantity} value={quantity}>
                            {quantity}
                          </option>
                        ))}
                      </select>
                    </label>

                    <button
                      type="button"
                      className="cart-remove-button"
                      onClick={() => removeFromCart(item._id)}
                    >
                      Remove
                    </button>
                  </div>

                  <p className="cart-line-total">
                    Rs. {(price * item.quantity).toLocaleString()}
                  </p>
                </article>
              );
            })}
          </div>

          <aside className="cart-summary">
            <h2>Order Summary</h2>

            <div className="cart-summary-row">
              <span>Subtotal</span>
              <span>Rs. {cartSubtotal.toLocaleString()}</span>
            </div>

            <p className="cart-shipping-note">
              Shipping and any applicable fees are calculated later.
            </p>

            <button
              type="button"
              className="cart-checkout-button"
              disabled
              title="Checkout will be added in a future step"
            >
              Checkout — Coming soon
            </button>
          </aside>
        </div>
      )}
    </main>
  );
}

export default Cart;
