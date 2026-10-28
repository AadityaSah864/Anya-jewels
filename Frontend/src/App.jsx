
import { useEffect, useState } from "react";
import { Routes, Route, Link } from "react-router-dom";
import { getProducts } from "./api/product";
import ProductDetails from "./pages/ProductDetails";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import { useCart } from "./context/CartContext";
import "./App.css";

function App() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { cartCount } = useCart();

  // Search and category filter state
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  useEffect(() => {
    async function loadProducts() {
      try {
        const data = await getProducts();

        if (!Array.isArray(data)) {
          throw new Error("Invalid product data received from the server");
        }

        setProducts(data);
      } catch (err) {
        setError(err.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    }

    loadProducts();
  }, []);

  // Get unique categories from the products
  const categories = [
    "All",
    ...new Set(
      products
        .map((product) => product.category?.trim())
        .filter(Boolean)
    ),
  ];

  // Filter products by search text and selected category
  const filteredProducts = products.filter((product) => {
    const search = searchTerm.trim().toLowerCase();

    const matchesSearch = [
      product.name,
      product.category,
      product.description,
    ].some((value) =>
      String(value || "").toLowerCase().includes(search)
    );

    const matchesCategory =
      selectedCategory === "All" ||
      product.category?.toLowerCase() ===
        selectedCategory.toLowerCase();

    return matchesSearch && matchesCategory;
  });

 return (
  <Routes>
    <Route path="/cart" element={<Cart />} />

    {/* Add this new checkout route */}
    <Route path="/checkout" element={<Checkout />} />

    <Route
      path="/products/:id"
      element={<ProductDetails />}
    />

    {/* Main storefront */}
    <Route
      path="/"
      element={
        <div className="site-wrapper">
          <div className="announcement">
            A LITTLE SPARKLE GOES A LONG WAY ✨
          </div>
            <header className="navbar">
              <a className="brand" href="#home">
                ANYA <span>JEWELLS</span>
              </a>

              <nav className="nav-links">
                <a href="#home">Home</a>
                <a href="#collections">Collections</a>
                <a href="#about">Our Story</a>
              </nav>

              <a className="shop-link" href="#collections">
                Explore <span>↗</span>
                <Link to="/cart" className="shop-link">
                Bag ({cartCount})
                </Link>
              </a>
            </header>

            <main>
              {/* Hero section */}
              <section className="hero" id="home">
                <div className="hero-content">
                  <p className="eyebrow">
                    JEWELLERY THAT FEELS LIKE YOU
                  </p>

                  <h1>
                    Your story.
                    <br />
                    Your <em>sparkle.</em>
                  </h1>

                  <p className="hero-description">
                    Thoughtful little treasures for your everyday moments
                    and the memories you'll keep forever.
                  </p>

                  <a className="primary-button" href="#collections">
                    Discover the collection <span>→</span>
                  </a>

                  <p className="hero-note">
                    Made for your moments, chosen by you.
                  </p>
                </div>

                <div className="hero-image">
                  <img
                    src="/src/assets/hero.png"
                    alt="Anya Jewells jewellery collection"
                  />

                  <div className="image-caption">
                    <span>THE ANYA EDIT</span>
                    <span>01 / TIMELESS</span>
                  </div>
                </div>
              </section>

              {/* Products from MongoDB */}
              <section
                className="collections-section"
                id="collections"
              >
                <div className="section-heading">
                  <div>
                    <p className="eyebrow">
                      THE ANYA COLLECTION
                    </p>

                    <h2>
                      Little things, <em>lovingly chosen.</em>
                    </h2>
                  </div>

                  <p className="section-description">
                    Discover jewellery for your everyday moments
                    and special occasions.
                  </p>
                </div>

                {loading && (
                  <p className="products-message" role="status">
                    Loading our jewellery collection...
                  </p>
                )}

                {!loading && error && (
                  <div
                    className="products-message error-message"
                    role="alert"
                  >
                    <p>We couldn't load our jewellery collection.</p>
                    <p>{error}</p>

                    <button
                      className="retry-button"
                      onClick={() => window.location.reload()}
                    >
                      Try again
                    </button>
                  </div>
                )}

                {!loading && !error && products.length === 0 && (
                  <p className="products-message">
                    No products yet. Check back soon for our jewellery
                    collection.
                  </p>
                )}

                {!loading && !error && products.length > 0 && (
                  <>
                    {/* Search and category filters */}
                    <div className="product-controls">
                      <label className="search-box">
                        <span aria-hidden="true">⌕</span>

                        <input
                          type="search"
                          placeholder="Search jewellery..."
                          aria-label="Search jewellery"
                          value={searchTerm}
                          onChange={(event) =>
                            setSearchTerm(event.target.value)
                          }
                        />
                      </label>

                      <div
                        className="category-filters"
                        aria-label="Filter by category"
                      >
                        {categories.map((category) => (
                          <button
                            key={category}
                            type="button"
                            className={`category-button ${
                              selectedCategory === category
                                ? "active"
                                : ""
                            }`}
                            aria-pressed={
                              selectedCategory === category
                            }
                            onClick={() =>
                              setSelectedCategory(category)
                            }
                          >
                            {category}
                          </button>
                        ))}
                      </div>
                    </div>

                    <p className="results-count" aria-live="polite">
                      {filteredProducts.length}{" "}
                      {filteredProducts.length === 1
                        ? "product"
                        : "products"}{" "}
                      found
                    </p>

                    {/* Clickable product cards */}
                    {filteredProducts.length > 0 ? (
                      <div className="collection-grid">
                        {filteredProducts.map((product) => (
                          <Link
                            to={`/products/${product._id}`}
                            className="collection-card product-card-link"
                            key={product._id}
                          >
                            <div className="collection-image">
                              {product.images?.[0] ? (
                                <img
                                  src={product.images[0]}
                                  alt={product.name}
                                  loading="lazy"
                                />
                              ) : (
                                <div className="product-image-placeholder">
                                  <span>ANYA JEWELLS</span>
                                </div>
                              )}

                              {product.discountPrice != null &&
                                product.discountPrice < product.price && (
                                  <span className="discount-badge">
                                    SALE
                                  </span>
                                )}
                            </div>

                            <div className="collection-info">
                              <div className="product-details">
                                <p className="product-category">
                                  {product.category}
                                </p>

                                <h3>{product.name}</h3>

                                <div className="product-prices">
                                  {product.discountPrice != null &&
                                  product.discountPrice < product.price ? (
                                    <>
                                      <span className="discount-price">
                                        Rs.{" "}
                                        {product.discountPrice.toLocaleString()}
                                      </span>

                                      <span className="original-price">
                                        Rs.{" "}
                                        {product.price.toLocaleString()}
                                      </span>
                                    </>
                                  ) : (
                                    <span className="discount-price">
                                      Rs. {product.price.toLocaleString()}
                                    </span>
                                  )}
                                </div>

                                {product.stock === 0 && (
                                  <p className="stock-message">
                                    Currently out of stock
                                  </p>
                                )}
                              </div>
                            </div>
                          </Link>
                        ))}
                      </div>
                    ) : (
                      <div className="products-message empty-search">
                        <p>No jewellery matches your search.</p>
                        <p>
                          Try another name or choose a different category.
                        </p>

                        <button
                          type="button"
                          className="retry-button"
                          onClick={() => {
                            setSearchTerm("");
                            setSelectedCategory("All");
                          }}
                        >
                          Clear filters
                        </button>
                      </div>
                    )}
                  </>
                )}
              </section>

              {/* Brand story */}
              <section className="story-section" id="about">
                <p className="eyebrow">
                  A LITTLE SOMETHING ABOUT US
                </p>

                <h2>
                  Not just jewellery.
                  <br />
                  <em>A feeling.</em>
                </h2>

                <p>
                  At Anya Jewells, we believe the smallest details
                  can make the most beautiful memories.
                </p>

                <a className="story-link" href="#collections">
                  Find your piece <span>→</span>
                </a>
              </section>
            </main>

            {/* Footer */}
            <footer className="footer">
              <a className="brand" href="#home">
                ANYA <span>JEWELLS</span>
              </a>

              <p>Little treasures, lasting memories.</p>

              <span>
                © {new Date().getFullYear()} Anya Jewells
              </span>
            </footer>
          </div>
        }
      />

      {/* Unknown URLs */}
      <Route
        path="*"
        element={
          <main className="details-message">
            <h2>Page not found</h2>
            <p>The page you're looking for doesn't exist.</p>
            <Link to="/" className="details-back-link">
              Back to shop
            </Link>
          </main>
        }
      />
    </Routes>
  );
}

export default App;
