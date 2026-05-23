import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import toast from "react-hot-toast";

export default function Navbar() {
  const { isLoggedIn, user, logout } = useAuth();
  const { totalItems } = useCart();
  const location = useLocation();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 16);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => setMobileOpen(false), [location]);

  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully");
    navigate("/");
  };

  const navLinks = [
    { to: "/", label: "Home" },
    { to: "/products", label: "Products" },
    ...(isLoggedIn ? [{ to: "/orders", label: "My Orders" }] : []),
  ];

  const isActive = (path) =>
    path === "/" ? location.pathname === "/" : location.pathname.startsWith(path);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white shadow-nav py-3"
          : "bg-white/90 backdrop-blur-sm py-4"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-primary-600 flex items-center justify-center shadow-btn group-hover:bg-primary-700 transition-colors duration-200">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          </div>
          <span className="text-xl font-bold text-primary-600 tracking-tight">ShopNova</span>
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                isActive(link.to)
                  ? "bg-primary-50 text-primary-700 font-semibold"
                  : "text-gray-600 hover:text-primary-700 hover:bg-primary-50"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2">

          {/* Cart */}
          <Link
            to="/cart"
            aria-label="Cart"
            className="relative p-2.5 rounded-xl text-gray-500 hover:text-primary-600 hover:bg-primary-50 transition-all duration-200"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-primary-600 text-white text-[10px] font-bold flex items-center justify-center">
                {totalItems > 9 ? "9+" : totalItems}
              </span>
            )}
          </Link>

          {/* Auth — desktop */}
          {isLoggedIn ? (
            <div className="hidden md:flex items-center gap-3 ml-1">
              <span className="text-sm text-gray-500">
                Hi, <span className="text-primary-600 font-semibold">{user?.name?.split(" ")[0]}</span>
              </span>
              <button onClick={handleLogout} className="btn-secondary py-2">
                Logout
              </button>
            </div>
          ) : (
            <div className="hidden md:flex items-center gap-2 ml-1">
              <Link to="/login" className="btn-ghost">Sign in</Link>
              <Link to="/register" className="btn-primary">Get Started</Link>
            </div>
          )}

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 rounded-lg text-gray-500 hover:text-primary-600 hover:bg-primary-50 transition-colors"
            aria-label="Toggle menu"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {mobileOpen
                ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-white border-t border-surface-200 px-4 py-4 flex flex-col gap-1 shadow-nav animate-slide-up">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                isActive(link.to)
                  ? "bg-primary-50 text-primary-700 font-semibold"
                  : "text-gray-600 hover:bg-primary-50 hover:text-primary-700"
              }`}
            >
              {link.label}
            </Link>
          ))}
          <div className="border-t border-surface-200 pt-3 mt-2 flex flex-col gap-2">
            {isLoggedIn ? (
              <>
                <p className="text-sm text-gray-500 px-4">
                  Signed in as <span className="text-primary-600 font-semibold">{user?.name}</span>
                </p>
                <button onClick={handleLogout} className="btn-secondary w-full justify-center">Logout</button>
              </>
            ) : (
              <>
                <Link to="/login"    className="btn-secondary w-full justify-center">Sign in</Link>
                <Link to="/register" className="btn-primary  w-full justify-center">Get Started</Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
