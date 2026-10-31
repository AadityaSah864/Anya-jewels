
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { getOrders } from "../api/order";
import "./AdminOrders.css";

function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    async function loadOrders() {
      try {
        const data = await getOrders();
        setOrders(data.orders || []);
      } catch (err) {
        setError(err.message || "Failed to load orders.");
      } finally {
        setLoading(false);
      }
    }

    loadOrders();
  }, []);

  const totalRevenue = orders.reduce(
    (total, order) => total + Number(order.totalAmount || 0),
    0
  );

  const pendingOrders = orders.filter(
    (order) => order.status === "pending"
  ).length;

  const formatCurrency = (amount) =>
    `Rs. ${Number(amount || 0).toLocaleString("en-IN")}`;

  const formatDate = (date) =>
    new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

  const filteredOrders = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();

    return orders.filter((order) => {
      const customer = order.customer || {};

      const matchesSearch = [
        customer.fullName,
        customer.email,
        order._id,
      ].some((value) =>
        String(value || "").toLowerCase().includes(search)
      );

      const matchesStatus =
        statusFilter === "all" || order.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [orders, searchTerm, statusFilter]);

  if (loading) {
    return (
      <div className="admin-state">
        <div className="admin-loader" />
        <p>Preparing your dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-state">
        <div className="admin-error-card">
          <span className="admin-error-icon">!</span>
          <h2>Couldn't load orders</h2>
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <Link to="/" className="admin-brand">
          <span className="admin-brand-name">ANYA</span>
          <span className="admin-brand-subtitle">JEWELLS</span>
        </Link>

        <div className="sidebar-divider" />

        <p className="sidebar-label">MAIN MENU</p>

        <nav className="admin-navigation">
          <Link to="/admin/orders" className="sidebar-link active">
            <span className="sidebar-icon">▦</span>
            Dashboard
          </Link>

          <Link to="/admin/orders" className="sidebar-link active">
            <span className="sidebar-icon">◇</span>
            Orders
          </Link>
        </nav>

        <div className="sidebar-bottom">
          <div className="sidebar-divider" />

          <Link to="/" className="sidebar-store-link">
            <span>↗</span>
            Back to Store
          </Link>

          <div className="admin-profile">
            <div className="profile-avatar">A</div>
            <div>
              <strong>Store Admin</strong>
              <span>Administrator</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Dashboard */}
      <main className="admin-main">
        <header className="admin-topbar">
          <div className="breadcrumb">
            <span>Workspace</span>
            <span>/</span>
            <strong>Orders</strong>
          </div>

          <div className="topbar-right">
            <span className="admin-online-dot" />
            <span>Store is online</span>
          </div>
        </header>

        <div className="admin-content">
          {/* Page Heading */}
          <section className="admin-welcome">
            <div>
              <p className="admin-eyebrow">YOUR STORE AT A GLANCE</p>
              <h1>Good to see you.</h1>
              <p className="admin-welcome-text">
                Here's what's happening with Anya Jewells today.
              </p>
            </div>

            <Link to="/" className="view-store-button">
              View storefront <span>↗</span>
            </Link>
          </section>

          {/* Statistics */}
          <section className="admin-stats">
            <article className="admin-stat-card">
              <div className="stat-top">
                <span className="stat-label">TOTAL ORDERS</span>
                <span className="stat-icon">▤</span>
              </div>
              <h2>{orders.length}</h2>
              <p>All orders received</p>
            </article>

            <article className="admin-stat-card">
              <div className="stat-top">
                <span className="stat-label">PENDING ORDERS</span>
                <span className="stat-icon">◷</span>
              </div>
              <h2>{pendingOrders}</h2>
              <p>Awaiting processing</p>
            </article>

            <article className="admin-stat-card">
              <div className="stat-top">
                <span className="stat-label">TOTAL ORDER VALUE</span>
                <span className="stat-icon">₹</span>
              </div>
              <h2 className="revenue-value">
                {formatCurrency(totalRevenue)}
              </h2>
              <p>Combined order value</p>
            </article>
          </section>

          {/* Orders Section */}
          <section className="admin-orders-section">
            <div className="orders-heading">
              <div>
                <p className="admin-eyebrow">ORDER MANAGEMENT</p>
                <h2>Recent Orders</h2>
                <p>Keep track of your customer purchases.</p>
              </div>

              <span className="orders-count">
                {orders.length} TOTAL
              </span>
            </div>

            {/* Search and Filters */}
            <div className="orders-toolbar">
              <label className="admin-search">
                <span>⌕</span>
                <input
                  type="search"
                  placeholder="Search customer or order ID..."
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                />
              </label>

              <select
                className="admin-filter"
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
                aria-label="Filter orders by status"
              >
                <option value="all">All statuses</option>
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            {/* Orders Table */}
            {filteredOrders.length === 0 ? (
              <div className="admin-empty">
                <span className="empty-icon">◇</span>
                <h3>
                  {orders.length === 0
                    ? "No orders yet"
                    : "No matching orders"}
                </h3>
                <p>
                  {orders.length === 0
                    ? "Customer orders will appear here."
                    : "Try changing your search or status filter."}
                </p>
                {orders.length > 0 && (
                  <button
                    className="clear-filter-button"
                    onClick={() => {
                      setSearchTerm("");
                      setStatusFilter("all");
                    }}
                  >
                    Clear filters
                  </button>
                )}
              </div>
            ) : (
              <div className="orders-table-wrapper">
                <table className="orders-table">
                  <thead>
                    <tr>
                      <th>ORDER</th>
                      <th>CUSTOMER</th>
                      <th>PRODUCTS</th>
                      <th>AMOUNT</th>
                      <th>DATE</th>
                      <th>STATUS</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredOrders.map((order) => (
                      <tr key={order._id}>
                        <td>
                          <span className="order-id">
                            #{order._id.slice(-6).toUpperCase()}
                          </span>
                        </td>

                        <td>
                          <div className="order-customer">
                            <strong>
                              {order.customer?.fullName || "Unknown"}
                            </strong>
                            <span>{order.customer?.email || "—"}</span>
                            <span>{order.customer?.phone || "—"}</span>
                          </div>
                        </td>

                        <td>
                          <div className="order-products">
                            {(order.items || []).map((item, index) => (
                              <p key={`${item.product}-${index}`}>
                                {item.name} × {item.quantity}
                              </p>
                            ))}
                          </div>
                        </td>

                        <td className="order-total">
                          {formatCurrency(order.totalAmount)}
                        </td>

                        <td className="order-date">
                          {formatDate(order.createdAt)}
                        </td>

                        <td>
                          <span
                            className={`order-status status-${order.status}`}
                          >
                            <span className="status-dot" />
                            {order.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {filteredOrders.length > 0 && (
              <div className="orders-footer">
                Showing {filteredOrders.length} of {orders.length} orders
              </div>
            )}
          </section>

          <footer className="admin-footer">
            <span>© {new Date().getFullYear()} Anya Jewells</span>
            <span>Made with care for your store.</span>
          </footer>
        </div>
      </main>
    </div>
  );
}

export default AdminOrders;
