import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getProducts } from "../api";
import ProductCard from "../components/ProductCard";

/* ── Feature blocks ─────────────────────────────────────── */
const FEATURES = [
  {
    icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />,
    title: "Free Shipping",
    desc: "On all orders over $50",
    bg: "bg-primary-50",
    icon_color: "text-primary-600",
  },
  {
    icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />,
    title: "Secure Checkout",
    desc: "256-bit SSL encryption",
    bg: "bg-secondary-50",
    icon_color: "text-secondary-600",
  },
  {
    icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />,
    title: "Easy Returns",
    desc: "30-day return policy",
    bg: "bg-amber-50",
    icon_color: "text-amber-600",
  },
  {
    icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />,
    title: "24/7 Support",
    desc: "Always here for you",
    bg: "bg-rose-50",
    icon_color: "text-rose-500",
  },
];

export default function Home() {
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = "ShopNova — Premium E-Commerce";
    getProducts({ sort: "rating" })
      .then((res) => setFeatured(res.data.slice(0, 4)))
      .catch(() => setFeatured([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="animate-fade-in">

      {/* ══ HERO ══════════════════════════════════════════════ */}
      <section className="relative min-h-screen flex items-center overflow-hidden bg-gradient-to-br from-primary-50 via-white to-secondary-50">

        {/* Decorative blobs (light, subtle) */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-32 -right-32 w-[480px] h-[480px] rounded-full bg-primary-100/60 blur-[100px]" />
          <div className="absolute -bottom-32 -left-32 w-[480px] h-[480px] rounded-full bg-secondary-100/60 blur-[100px]" />
        </div>

        <div className="relative max-w-5xl mx-auto px-6 py-32 text-center animate-slide-up">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-100 text-primary-700 text-sm font-semibold mb-8 border border-primary-200">
            <span className="w-2 h-2 rounded-full bg-primary-500 animate-pulse-soft" />
            New arrivals every week
          </div>

          <h1 className="text-5xl md:text-7xl font-black text-gray-900 leading-tight mb-6">
            Shop Smarter,{" "}
            <span className="gradient-text">Live Better</span>
          </h1>

          <p className="text-lg md:text-xl text-gray-500 max-w-2xl mx-auto leading-relaxed mb-10">
            Discover curated premium products at unbeatable prices. Fast delivery,
            easy returns, and a shopping experience you'll love.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link to="/products" className="btn-primary text-base px-8 py-3.5">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              Shop Now
            </Link>
            <Link to="/register" className="btn-secondary text-base px-8 py-3.5">
              Create Account
            </Link>
          </div>

          {/* Stats */}
          <div className="mt-16 grid grid-cols-3 gap-8 max-w-md mx-auto">
            {[
              { value: "10k+", label: "Happy Customers" },
              { value: "500+", label: "Products" },
              { value: "4.9 ★", label: "Avg Rating" },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <div className="text-2xl font-black gradient-text">{s.value}</div>
                <div className="text-xs text-gray-500 mt-0.5 font-medium">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll cue */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-float">
          <div className="w-6 h-10 rounded-full border-2 border-primary-300 flex justify-center pt-2">
            <div className="w-1 h-2 rounded-full bg-primary-500 animate-bounce" />
          </div>
        </div>
      </section>

      {/* ══ FEATURES ══════════════════════════════════════════ */}
      <section className="py-16 px-6 bg-white border-y border-surface-200">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className={`flex flex-col items-center text-center gap-3 p-6 rounded-2xl ${f.bg} border border-surface-200 transition-all duration-300 hover:-translate-y-1 hover:shadow-card`}
            >
              <div className={`p-3 rounded-xl bg-white shadow-card ${f.icon_color}`}>
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  {f.icon}
                </svg>
              </div>
              <div>
                <p className="font-semibold text-gray-800 text-sm">{f.title}</p>
                <p className="text-gray-500 text-xs mt-0.5">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ══ FEATURED PRODUCTS ═════════════════════════════════ */}
      <section className="py-20 px-6 bg-surface-50">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-end justify-between mb-10">
            <div>
              <span className="inline-block text-xs font-bold uppercase tracking-widest text-primary-600 mb-2">
                Curated for you
              </span>
              <h2 className="section-title">Top Rated Products</h2>
            </div>
            <Link to="/products" className="btn-ghost hidden sm:inline-flex">
              View all →
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="card-flat h-72 animate-pulse bg-surface-100" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featured.map((p) => <ProductCard key={p._id} product={p} />)}
            </div>
          )}

          <div className="text-center mt-12">
            <Link to="/products" className="btn-primary px-10 py-3.5">
              Browse All Products
            </Link>
          </div>
        </div>
      </section>

      {/* ══ CTA BANNER ════════════════════════════════════════ */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-primary-600 to-secondary-600 p-12 text-center shadow-card-hover">
            {/* White dot pattern overlay */}
            <div
              className="absolute inset-0 opacity-10"
              style={{
                backgroundImage:
                  "radial-gradient(circle, white 1px, transparent 1px)",
                backgroundSize: "28px 28px",
              }}
            />
            <div className="relative">
              <h2 className="text-3xl md:text-4xl font-black text-white mb-4">
                Ready to start shopping?
              </h2>
              <p className="text-primary-100 mb-8 max-w-lg mx-auto">
                Join thousands of happy customers. Create your free account and
                unlock exclusive member deals today.
              </p>
              <Link
                to="/register"
                className="inline-flex items-center gap-2 px-10 py-4 rounded-xl
                           bg-white text-primary-700 font-bold text-base
                           shadow-lg hover:shadow-xl hover:-translate-y-0.5
                           transition-all duration-200"
              >
                Get Started — It's Free →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-surface-200 py-8 px-6 text-center text-sm text-gray-400 bg-white">
        © {new Date().getFullYear()} ShopNova. Built on React microservices.
      </footer>
    </div>
  );
}
