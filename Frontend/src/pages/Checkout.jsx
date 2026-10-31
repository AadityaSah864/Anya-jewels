
import { useState } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { createOrder } from "../api/order";
import "./Checkout.css";

function Checkout() {
  const {
    cartItems,
    cartSubtotal,
    clearCart,
  } = useCart();

  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [orderPlaced, setOrderPlaced] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    setMessage("");
    setError("");

    if (isSubmitting) return;

    setIsSubmitting(true);

    try {
      const formData = new FormData(event.currentTarget);

      const orderData = {
        customer: {
          fullName: formData.get("fullName").trim(),
          email: formData.get("email").trim(),
          phone: formData.get("phone").trim(),
        },

        shippingAddress: {
          address: formData.get("address").trim(),
          city: formData.get("city").trim(),
          province: formData.get("province").trim(),
        },

        items: cartItems.map((item) => ({
          product: item._id,
          quantity: item.quantity,
        })),
      };

      // Send order to backend
      const result = await createOrder(orderData);

      // Clear cart only after successful order creation
      clearCart();

      setMessage(
        result.message || "Your order was placed successfully!"
      );

      // Display order success screen
      setOrderPlaced(true);

    } catch (error) {
      setError(
        error.message || "Something went wrong. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show success screen after successful order creation
  if (orderPlaced) {
    return (
      <main className="checkout-page">
        <div className="order-success">
          <h1>Order placed successfully!</h1>

          <p>
            Thank you for shopping with Anya Jewells.
            Your order has been received.
          </p>

          <Link to="/" className="checkout-button">
            Continue shopping
          </Link>
        </div>
      </main>
    );
  }

  // Show empty cart if there are no products
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
        <form
          className="checkout-form"
          onSubmit={handleSubmit}
        >
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

          <button
            type="submit"
            className="checkout-button"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Placing order..." : "Place order"}
          </button>

          {error && (
            <p className="checkout-notice" role="alert">
              {error}
            </p>
          )}

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
              <div
                className="checkout-summary-item"
                key={item._id}
              >
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

            <strong>
              Rs. {cartSubtotal.toLocaleString()}
            </strong>
          </div>

          <p className="checkout-shipping-note">
            Shipping charges will be confirmed when order
            processing is implemented.
          </p>
        </aside>
      </div>
    </main>
  );
}

export default Checkout;
