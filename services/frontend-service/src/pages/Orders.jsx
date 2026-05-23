import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getMyOrders } from "../api";
import { useAuth } from "../context/AuthContext";

/* ── Status config ───────────────────────────────────── */
const STATUS = {
  pending:    { label: "Pending",    cls: "bg-amber-50  text-amber-700  border-amber-200",  dot: "bg-amber-400"  },
  processing: { label: "Processing", cls: "bg-sky-50    text-sky-700    border-sky-200",    dot: "bg-sky-400"    },
  shipped:    { label: "Shipped",    cls: "bg-violet-50 text-violet-700 border-violet-200", dot: "bg-violet-400" },
  delivered:  { label: "Delivered",  cls: "bg-green-50  text-green-700  border-green-200",  dot: "bg-green-500"  },
  cancelled:  { label: "Cancelled",  cls: "bg-red-50    text-red-700    border-red-200",    dot: "bg-red-400"    },
};

const fmt = (d) =>
  new Date(d).toLocaleDateString("en-US", {
    year: "numeric", month: "long", day: "numeric",
    hour: "2-digit", minute: "2-digit",
  });

export default function Orders() {
  const { token } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    document.title = "My Orders — ShopNova";
    getMyOrders(token)
      .then((res) => setOrders(res.data))
      .catch(() => setError("Failed to load orders. Please try again."))
      .finally(() => setLoading(false));
  }, [token]);

  /* ── Loading ─────────────────────────────────────── */
  if (loading) {
    return (
      <div className="pt-24 min-h-screen bg-surface-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500 text-sm">Loading your orders…</p>
        </div>
      </div>
    );
  }

  /* ── Error ───────────────────────────────────────── */
  if (error) {
    return (
      <div className="pt-24 min-h-screen bg-surface-50 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-red-50 border border-red-100 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <p className="text-red-600 font-semibold">{error}</p>
        </div>
      </div>
    );
  }

  /* ── Empty ───────────────────────────────────────── */
  if (orders.length === 0) {
    return (
      <div className="pt-24 min-h-screen bg-surface-50 flex flex-col items-center justify-center px-4 animate-fade-in">
        <div className="text-center">
          <div className="w-24 h-24 rounded-full bg-primary-50 border border-primary-100 flex items-center justify-center mx-auto mb-6">
            <svg className="w-12 h-12 text-primary-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">No orders yet</h1>
          <p className="text-gray-500 mb-8">Your order history will appear here once you make a purchase.</p>
          <Link to="/products" className="btn-primary px-8 py-3.5">Start Shopping</Link>
        </div>
      </div>
    );
  }

  /* ── Orders list ─────────────────────────────────── */
  return (
    <div className="pt-24 pb-20 min-h-screen bg-surface-50 animate-fade-in">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">

        {/* Header */}
        <div className="py-8 border-b border-surface-200 mb-8">
          <h1 className="section-title">My Orders</h1>
          <p className="text-gray-500 mt-1 text-sm">
            {orders.length} order{orders.length !== 1 ? "s" : ""} total
          </p>
        </div>

        <div className="flex flex-col gap-4">
          {orders.map((order) => {
            const isOpen = expanded === order._id;
            const st = STATUS[order.status] || STATUS.pending;

            return (
              <div
                key={order._id}
                className="bg-white rounded-2xl border border-surface-200 shadow-card overflow-hidden hover:border-primary-200 transition-all duration-200"
              >
                {/* Order header row */}
                <button
                  className="w-full text-left p-6 flex flex-col sm:flex-row sm:items-center gap-4"
                  onClick={() => setExpanded(isOpen ? null : order._id)}
                  aria-expanded={isOpen}
                >
                  <div className="flex-1">
                    {/* ID + Status */}
                    <div className="flex items-center gap-3 mb-1.5">
                      <span className="text-xs font-mono text-gray-400 bg-surface-100 border border-surface-200 px-2 py-0.5 rounded-md">
                        #{order._id.slice(-8).toUpperCase()}
                      </span>
                      <span className={`badge border ${st.cls} gap-1.5`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`} />
                        {st.label}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400">{fmt(order.createdAt)}</p>
                    <p className="text-sm text-gray-600 mt-0.5 font-medium">
                      {order.items.length} item{order.items.length !== 1 ? "s" : ""}
                    </p>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className="text-xl font-bold text-primary-700">
                      ${order.totalAmount.toFixed(2)}
                    </span>
                    <svg
                      className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                      fill="none" viewBox="0 0 24 24" stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </button>

                {/* Expandable items */}
                {isOpen && (
                  <div className="border-t border-surface-100 bg-surface-50 px-6 py-5 animate-slide-up">
                    <div className="flex flex-col gap-3">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl overflow-hidden bg-white border border-surface-200 flex-shrink-0">
                            <img
                              src={item.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(item.name)}&size=48&background=f0fdfa&color=0d9488`}
                              alt={item.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(item.name)}&size=48&background=f0fdfa&color=0d9488`;
                              }}
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-800 truncate">{item.name}</p>
                            <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                          </div>
                          <p className="text-sm font-bold text-secondary-600">
                            ${(item.price * item.quantity).toFixed(2)}
                          </p>
                        </div>
                      ))}

                      <div className="border-t border-surface-200 pt-3 mt-1 flex justify-between text-sm font-bold">
                        <span className="text-gray-700">Order Total</span>
                        <span className="text-primary-700">${order.totalAmount.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
