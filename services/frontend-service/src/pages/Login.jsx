import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginUser } from "../api";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

export default function Login() {
  const { login, isLoggedIn } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  useEffect(() => {
    document.title = "Sign In — ShopNova";
    if (isLoggedIn) navigate("/products");
  }, [isLoggedIn, navigate]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) { toast.error("Please fill in all fields"); return; }
    setLoading(true);
    try {
      const { data } = await loginUser(form);
      login(data.token, data.user);
      toast.success(`Welcome back, ${data.user.name}!`);
      navigate("/products");
    } catch (err) {
      toast.error(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-primary-50 via-white to-secondary-50 pt-20">
      <div className="w-full max-w-md animate-slide-up">

        {/* Card */}
        <div className="bg-white rounded-3xl border border-surface-200 shadow-card-hover p-8">

          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-14 h-14 rounded-2xl bg-primary-600 flex items-center justify-center mx-auto mb-4 shadow-btn">
              <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Welcome back</h1>
            <p className="text-gray-500 text-sm mt-1">Sign in to your ShopNova account</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">

            <div className="flex flex-col gap-1.5">
              <label htmlFor="email" className="text-sm font-semibold text-gray-700">
                Email address
              </label>
              <input
                id="email" name="email" type="email" autoComplete="email"
                placeholder="you@example.com"
                value={form.email} onChange={handleChange}
                className="input-field" required
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="password" className="text-sm font-semibold text-gray-700">
                Password
              </label>
              <div className="relative">
                <input
                  id="password" name="password" type={showPass ? "text" : "password"}
                  autoComplete="current-password" placeholder="••••••••"
                  value={form.password} onChange={handleChange}
                  className="input-field pr-12" required
                />
                <button
                  type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary-600 transition-colors"
                  aria-label="Toggle password visibility"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    {showPass
                      ? <><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></>
                      : <><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></>}
                  </svg>
                </button>
              </div>
            </div>

            <button
              type="submit" id="login-submit" disabled={loading}
              className="btn-primary w-full py-3.5 text-base mt-1"
            >
              {loading
                ? <><svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg> Signing in…</>
                : "Sign In →"}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Don't have an account?{" "}
            <Link to="/register" className="text-primary-600 hover:text-primary-700 font-semibold transition-colors">
              Create one
            </Link>
          </p>
        </div>

        {/* Trust line */}
        <p className="text-center text-xs text-gray-400 mt-6">
          🔒 Your data is protected with 256-bit SSL encryption
        </p>
      </div>
    </div>
  );
}
