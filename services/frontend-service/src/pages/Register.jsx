import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerUser } from "../api";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

/* Password strength helper */
const getStrength = (p) => {
  if (!p) return null;
  if (p.length < 6)  return { label: "Weak",   bar: "w-1/4", color: "bg-red-400",   text: "text-red-500" };
  if (p.length < 8)  return { label: "Fair",   bar: "w-2/4", color: "bg-amber-400",  text: "text-amber-500" };
  if (p.length < 12) return { label: "Good",   bar: "w-3/4", color: "bg-primary-400", text: "text-primary-600" };
  return               { label: "Strong", bar: "w-full", color: "bg-secondary-500", text: "text-secondary-600" };
};

export default function Register() {
  const { login, isLoggedIn } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  useEffect(() => {
    document.title = "Create Account — ShopNova";
    if (isLoggedIn) navigate("/products");
  }, [isLoggedIn, navigate]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password || !form.confirm) {
      toast.error("Please fill in all fields"); return;
    }
    if (form.password !== form.confirm) { toast.error("Passwords do not match"); return; }
    if (form.password.length < 6) { toast.error("Password must be at least 6 characters"); return; }

    setLoading(true);
    try {
      const { data } = await registerUser({ name: form.name, email: form.email, password: form.password });
      login(data.token, data.user);
      toast.success(`Welcome to ShopNova, ${data.user.name}!`);
      navigate("/products");
    } catch (err) {
      toast.error(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const strength = getStrength(form.password);

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-secondary-50 via-white to-primary-50 py-24">
      <div className="w-full max-w-md animate-slide-up">

        <div className="bg-white rounded-3xl border border-surface-200 shadow-card-hover p-8">

          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-14 h-14 rounded-2xl bg-secondary-600 flex items-center justify-center mx-auto mb-4 shadow-btn">
              <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Create your account</h1>
            <p className="text-gray-500 text-sm mt-1">Join ShopNova today — completely free</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">

            {/* Name */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="name" className="text-sm font-semibold text-gray-700">Full name</label>
              <input
                id="name" name="name" type="text" autoComplete="name"
                placeholder="Jane Doe"
                value={form.name} onChange={handleChange}
                className="input-field" required
              />
            </div>

            {/* Email */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="reg-email" className="text-sm font-semibold text-gray-700">Email address</label>
              <input
                id="reg-email" name="email" type="email" autoComplete="email"
                placeholder="you@example.com"
                value={form.email} onChange={handleChange}
                className="input-field" required
              />
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="reg-password" className="text-sm font-semibold text-gray-700">Password</label>
              <div className="relative">
                <input
                  id="reg-password" name="password" type={showPass ? "text" : "password"}
                  autoComplete="new-password" placeholder="At least 6 characters"
                  value={form.password} onChange={handleChange}
                  className="input-field pr-12" required
                />
                <button
                  type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary-600 transition-colors"
                  aria-label="Toggle password"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </button>
              </div>

              {/* Strength bar */}
              {strength && (
                <div className="mt-1.5 space-y-1">
                  <div className="h-1.5 w-full bg-surface-200 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full transition-all duration-300 ${strength.color} ${strength.bar}`} />
                  </div>
                  <p className={`text-xs font-medium ${strength.text}`}>{strength.label} password</p>
                </div>
              )}
            </div>

            {/* Confirm */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="confirm" className="text-sm font-semibold text-gray-700">Confirm password</label>
              <input
                id="confirm" name="confirm" type={showPass ? "text" : "password"}
                autoComplete="new-password" placeholder="Repeat your password"
                value={form.confirm} onChange={handleChange}
                className={`input-field ${form.confirm && form.confirm !== form.password ? "border-red-400 focus:border-red-500 focus:shadow-[0_0_0_3px_rgba(239,68,68,0.15)]" : ""}`}
                required
              />
              {form.confirm && form.confirm !== form.password && (
                <p className="text-xs text-red-500 font-medium">Passwords don't match</p>
              )}
            </div>

            <button
              type="submit" id="register-submit" disabled={loading}
              className="btn-primary w-full py-3.5 text-base mt-2"
            >
              {loading
                ? <><svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg> Creating account…</>
                : "Create Account →"}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Already have an account?{" "}
            <Link to="/login" className="text-primary-600 hover:text-primary-700 font-semibold transition-colors">
              Sign in
            </Link>
          </p>
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          By creating an account you agree to our Terms of Service.
        </p>
      </div>
    </div>
  );
}
