
import { useState } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import "./Checkout.css";

function Checkout() {
  const { cartItems, cartSubtotal } = useCart();
  const [message, setMessage] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();
    setMessage(
      "Your details are valid. Order submission will be connected next."
    );
  };

  if (cartItems.length === 0) {
    return (
      <main className="checkout-page">
        <h1>Your bag is empty</h1>
        <p>Add some jewellery before checking out.</p>
        <Link to="/" className="checkout-button">
          Explore the collection
        </Link>
      </main>
    );
  }

  return (
    <main className="checkout-page">
      <Link to="/cart" className="checkout-back-link">
        ← Back to bag
      </Link>

      <h1>Checkout</h1>
      <p className="checkout-intro">
        A few details, then your next favourite piece is almost yours.
      </p>

      <div className="checkout-layout">
        <form className="checkout-form" onSubmit={handleSubmit}>
          <h2>Contact information</h2>

          <label>
            Full name
            <input
              type="text"
              name="fullName"
              autoComplete="name"
              required
              minLength={2}
              placeholder="Your full name"
            />
          </label>

          <label>
            Email address
            <input
              type="email"
              name="email"
              autoComplete="email"
              required
              placeholder="you@example.com"
            />
          </label>

          <label>
            Phone number
            <input
              type="tel"
              name="phone"
              autoComplete="tel"
              required
              minLength={7}
              placeholder="Your contact number"
            />
          </label>

          <h2>Delivery address</h2>

          <label>
            Street address
            <textarea
              name="address"
              autoComplete="street-address"
              required
              minLength={5}
              rows={3}
              placeholder="House number, street, or locality"
            />
          </label>

          <label>
            City
            <input
              type="text"
              name="city"
              autoComplete="address-level2"
              required
              placeholder="Your city"
            />
          </label>

          <label>
            Province / State
            <input
              type="text"
              name="province"
              autoComplete="address-level1"
              required
              placeholder="Your province or state"
            />
          </label>

          <button type="submit" className="checkout-button">
            Continue
          </button>

          {message && (
            <p className="checkout-notice" role="status">
              {message}
            </p>
          )}
        </form>

        <aside className="checkout-summary">
          <h2>Order summary</h2>

          {cartItems.map((item) => {
            const price =
              item.discountPrice != null &&
              item.discountPrice < item.price
                ? item.discountPrice
                : item.price;

            return (
              <div className="checkout-summary-item" key={item._id}>
                <div>
                  <p>{item.name}</p>
                  <span>Quantity: {item.quantity}</span>
                </div>
                <strong>
                  Rs. {(price * item.quantity).toLocaleString()}
                </strong>
              </div>
            );
          })}

          <div className="checkout-total">
            <span>Subtotal</span>
            <strong>Rs. {cartSubtotal.toLocaleString()}</strong>
          </div>

          <p className="checkout-shipping-note">
            Shipping charges will be confirmed when order processing is
            implemented.
          </p>
        </aside>
      </div>
    </main>
  );
}

export default Checkout;
