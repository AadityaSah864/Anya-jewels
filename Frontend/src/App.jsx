
import { useEffect, useState } from "react";
import { Routes, Route, Link } from "react-router-dom";
import { getProducts } from "./api/product";
import ProductDetails from "./pages/ProductDetails";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import { useCart } from "./context/CartContext";
import AdminOrders from "./pages/AdminOrders";
import heroImage from "./assets/hero.png";
import "./App.css";

function App() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { cartCount } = useCart();

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

  const categories = [
    "All",
    ...new Set(
      products.map((product) => product.category?.trim()).filter(Boolean)
    ),
  ];

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
      product.category?.toLowerCase() === selectedCategory.toLowerCase();

    return matchesSearch && matchesCategory;
  });

  return (
    <Routes>
      <Route path="/cart" element={<Cart />} />
      <Route path="/checkout" element={<Checkout />} />
      <Route path="/admin/orders" element={<AdminOrders />} />
      <Route path="/products/:id" element={<ProductDetails />} />

      <Route
        path="/"
        element={
          <div className="site-wrapper">
            {/* Announcement */}
            <div className="announcement">
              <span>✦</span>
              A LITTLE SPARKLE GOES A LONG WAY
              <span>✦</span>
            </div>

            {/* Navigation */}
            <header className="navbar">
              <Link className="brand" to="/">
                ANYA
                <span>JEWELLS</span>
              </Link>

              <nav className="nav-links">
                <a href="#home">Home</a>
                <a href="#collections">Collections</a>
                <a href="#about">Our Story</a>
              </nav>

              <div className="nav-actions">
                <a className="shop-link explore-link" href="#collections">
                  Explore ↗
                </a>

                <Link to="/cart" className="shop-link bag-link">
                  Bag ({cartCount})
                </Link>

                <Link to="/admin/orders" className="shop-link admin-link">
                  Admin
                </Link>
              </div>
            </header>

            <main>
              {/* Hero */}
              <section className="hero" id="home">
                <div className="hero-background">
                  <img
                    src={heroImage}
                    alt="Gold jewellery styled with soft blush fabric and flowers"
                    fetchPriority="high"
                  />
                </div>

                <div className="hero-overlay"></div>

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

                <div className="hero-image-label">
                  <span>THE ANYA EDIT</span>
                  <span>01 / TIMELESS</span>
                </div>
              </section>

              {/* Collections */}
              <section className="collections-section" id="collections">
                <div className="section-heading">
                  <div>
                    <p className="eyebrow">THE ANYA COLLECTION</p>
                    <h2>
                      Little things, <em>lovingly chosen.</em>
                    </h2>
                  </div>

                  <p className="section-description">
                    Discover jewellery for your everyday moments and
                    special occasions.
                  </p>
                </div>

                {loading && (
                  <p className="products-message" role="status">
                    Preparing something beautiful for you...
                  </p>
                )}

                {!loading && error && (
                  <div className="products-message error-message" role="alert">
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
                    Our collection is getting ready. Please check back soon.
                  </p>
                )}

                {!loading && !error && products.length > 0 && (
                  <>
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
                              selectedCategory === category ? "active" : ""
                            }`}
                            aria-pressed={selectedCategory === category}
                            onClick={() => setSelectedCategory(category)}
                          >
                            {category}
                          </button>
                        ))}
                      </div>
                    </div>

                    <p className="results-count" aria-live="polite">
                      {filteredProducts.length}{" "}
                      {filteredProducts.length === 1
                        ? "piece"
                        : "pieces"}{" "}
                      found
                    </p>

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

                              {product.stock === 0 && (
                                <span className="sold-out-badge">
                                  SOLD OUT
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
                                        Rs. {product.price.toLocaleString()}
                                      </span>
                                    </>
                                  ) : (
                                    <span className="discount-price">
                                      Rs. {product.price.toLocaleString()}
                                    </span>
                                  )}
                                </div>
                              </div>

                              <span className="product-arrow">↗</span>
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
                <div className="story-decoration">✧</div>

                <p className="eyebrow">A LITTLE ABOUT US</p>

                <h2>
                  Some things are
                  <br />
                  small, but mean
                  <br />
                  <em>everything.</em>
                </h2>

                <p>
                  We believe jewellery is more than something you wear.
                  It's the little reminder of who you are, the moments
                  you cherish, and the memories you carry.
                </p>

                <a className="story-link" href="#collections">
                  Find a piece to call yours <span>↗</span>
                </a>
              </section>

              {/* Footer */}
              <footer className="footer">
                <div className="footer-main">
                  <div className="footer-brand">
                    <Link className="brand" to="/">
                      ANYA
                      <span>JEWELLS</span>
                    </Link>

                    <p>Little treasures. Beautiful memories.</p>
                  </div>

                  <div className="footer-links">
                    <a href="#home">Home</a>
                    <a href="#collections">Collections</a>
                    <a href="#about">Our Story</a>
                    <Link to="/cart">Your Bag ({cartCount})</Link>
                  </div>
                </div>

                <div className="footer-bottom">
                  <span>© {new Date().getFullYear()} Anya Jewells</span>
                  <span>MADE WITH LOVE ✧</span>
                </div>
              </footer>
            </main>
          </div>
        }
      />

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
