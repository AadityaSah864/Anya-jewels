
import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

const CartContext = createContext(null);

function getSavedCart() {
  try {
    const savedCart = localStorage.getItem("anya-cart");
    const parsedCart = savedCart ? JSON.parse(savedCart) : [];

    return Array.isArray(parsedCart) ? parsedCart : [];
  } catch {
    return [];
  }
}

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState(getSavedCart);

  // Save cart whenever it changes
  useEffect(() => {
    localStorage.setItem("anya-cart", JSON.stringify(cartItems));
  }, [cartItems]);

  // Add a product, or increase its quantity
  function addToCart(product) {
    if (!product || product.stock <= 0) {
      return false;
    }

    let added = false;

    setCartItems((currentItems) => {
      const existingItem = currentItems.find(
        (item) => item._id === product._id
      );

      if (existingItem) {
        if (existingItem.quantity >= product.stock) {
          return currentItems;
        }

        added = true;

        return currentItems.map((item) =>
          item._id === product._id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }

      added = true;

      return [
        ...currentItems,
        { ...product, quantity: 1 },
      ];
    });

    return added;
  }

  // Update quantity, without exceeding the stock recorded in the cart
  function updateQuantity(productId, quantity) {
    const nextQuantity = Number(quantity);

    if (!Number.isInteger(nextQuantity) || nextQuantity < 1) {
      return;
    }

    setCartItems((currentItems) =>
      currentItems.map((item) =>
        item._id === productId
          ? {
              ...item,
              quantity: Math.min(nextQuantity, item.stock),
            }
          : item
      )
    );
  }

  function removeFromCart(productId) {
    setCartItems((currentItems) =>
      currentItems.filter((item) => item._id !== productId)
    );
  }

  function clearCart() {
    setCartItems([]);
  }

  const cartCount = cartItems.reduce(
    (total, item) => total + item.quantity,
    0
  );

  const cartSubtotal = cartItems.reduce((total, item) => {
    const price =
      item.discountPrice != null &&
      item.discountPrice < item.price
        ? item.discountPrice
        : item.price;

    return total + price * item.quantity;
  }, 0);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        cartCount,
        cartSubtotal,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart must be used inside CartProvider");
  }

  return context;
}
