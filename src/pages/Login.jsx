import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import bgImage from "../assets/FTN_LEK_foto_01.jpg";
import "./Login.css";

const BASE = "http://localhost/pharmasys-backend/api/auth";

export default function Login() {
  const { login } = useContext(AuthContext);
  const navigate  = useNavigate();

  const [mode,     setMode]     = useState("signin"); // signin | signup | forgot
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [confirm,  setConfirm]  = useState("");
  const [name,     setName]     = useState("");
  const [showPass, setShowPass] = useState(false);
  const [showConf, setShowConf] = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");
  const [success,  setSuccess]  = useState(false);
  const [message,  setMessage]  = useState("");

  const reset = (m) => {
    setMode(m); setError(""); setMessage("");
    setEmail(""); setPassword(""); setConfirm(""); setName("");
  };

  // ── Sign In ──────────────────────────────────────────────────
  const handleSignIn = async (e) => {
    e.preventDefault();
    setError("");
    if (!email.trim())    return setError("Please enter your email address.");
    if (!password.trim()) return setError("Please enter your password.");
    setLoading(true);
    try {
      const res  = await fetch(`${BASE}/login.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });
      const data = await res.json();
      if (!data.success) return setError(data.message || "Invalid email or password.");
      const user = data.data.user;
      login({ ...user, token: data.data.token });
      setSuccess(true);
      setTimeout(() => navigate(user.role === "admin" ? "/admin/dashboard" : "/dashboard"), 900);
    } catch {
      setError("Cannot connect to server. Make sure XAMPP is running.");
    } finally { setLoading(false); }
  };

  // ── Sign Up ──────────────────────────────────────────────────
  const handleSignUp = async (e) => {
    e.preventDefault();
    setError(""); setMessage("");
    if (!name.trim())     return setError("Please enter your full name.");
    if (!email.trim())    return setError("Please enter your email address.");
    if (password.length < 6) return setError("Password must be at least 6 characters.");
    if (password !== confirm)  return setError("Passwords do not match.");
    setLoading(true);
    try {
      const res  = await fetch(`${BASE}/register.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), email: email.trim(), password }),
      });
      const data = await res.json();
      if (!data.success) return setError(data.message || "Registration failed.");
      setMessage("✅ Account created! You can now sign in.");
      setTimeout(() => reset("signin"), 2000);
    } catch {
      setError("Cannot connect to server. Make sure XAMPP is running.");
    } finally { setLoading(false); }
  };

  // ── Forgot Password ──────────────────────────────────────────
  const handleForgot = async (e) => {
    e.preventDefault();
    setError(""); setMessage("");
    if (!email.trim()) return setError("Please enter your email address.");
    setLoading(true);
    try {
      const res  = await fetch(`${BASE}/forgot-password.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await res.json();
      if (!data.success) return setError(data.message || "Email not found.");
      setMessage("📧 Reset link sent! Check your inbox.");
    } catch {
      setError("Cannot connect to server. Make sure XAMPP is running.");
    } finally { setLoading(false); }
  };

  const titles = {
    signin: { h: "Welcome back",      p: "Sign in to your PharmaSys account" },
    signup: { h: "Create account",    p: "Join PharmaSys — it's free"         },
    forgot: { h: "Reset password",    p: "Enter your email to receive a reset link" },
  };

  return (
    <div className="login-page">

      {/* LEFT */}
      <div className="login-left" style={{ backgroundImage: `url(${bgImage})` }}>
        <div className="login-left-overlay">
          <div className="login-branding">
            <div className="login-logo"/>
            <div className="login-logo-name">Pharma<span>Sys</span></div>
          </div>
          <h1 className="login-headline">
            Your pharmacy,<br/><span>smarter.</span>
          </h1>
          <p className="login-subtext">
            A platform for inventory, prescriptions, sales and more.
          </p>
        </div>
      </div>

      {/* RIGHT */}
      <div className="login-right">
        <div className="login-card">


          {success ? (
            <div className="login-success">
              <div className="success-icon">✅</div>
              <h2>Welcome back!</h2>
              <p>Taking you to your dashboard...</p>
            </div>
          ) : (
            <>
              <div className="login-card-header">
                <h2>{titles[mode].h}</h2>
                <p>{titles[mode].p}</p>
              </div>

              {error   && <div className="login-error">⚠️ {error}</div>}
              {message && <div className="login-message">✅ {message}</div>}

              {/* ── SIGN IN ── */}
              {mode === "signin" && (
                <form onSubmit={handleSignIn} noValidate>
                  <div className="form-group">
                    <label>Email address</label>
                    <input className="login-inp" type="email" placeholder="you@pharmasys.com"
                      value={email} onChange={e=>{setEmail(e.target.value);setError("");}}
                      autoComplete="email" autoFocus/>
                  </div>
                  <div className="form-group">
                    <label>Password</label>
                    <div className="password-wrap">
                      <input className="login-inp" type={showPass?"text":"password"} placeholder="••••••••"
                        value={password} onChange={e=>{setPassword(e.target.value);setError("");}}
                        autoComplete="current-password"/>
                      <button type="button" className="toggle-pass" onClick={()=>setShowPass(p=>!p)} tabIndex={-1}>
                        {showPass?"🙈":"👁️"}
                      </button>
                    </div>
                  </div>
                  <div className="forgot-wrap">
                    <span className="forgot-link" onClick={()=>reset("forgot")}>Forgot password?</span>
                  </div>
                  <button type="submit" className="sign-btn sign-btn--pharmacist" disabled={loading}>
                    {loading ? <span className="spinner"/> : "Sign In"}
                  </button>
                  <div className="auth-switch">
                    Don't have an account?{" "}
                    <span onClick={()=>reset("signup")}>Sign up</span>
                  </div>
                </form>
              )}

              {/* ── SIGN UP ── */}
              {mode === "signup" && (
                <form onSubmit={handleSignUp} noValidate>
                  <div className="form-group">
                    <label>Full Name</label>
                    <input className="login-inp" type="text" placeholder="e.g. Mary Wanjiku"
                      value={name} onChange={e=>{setName(e.target.value);setError("");}} autoFocus/>
                  </div>
                  <div className="form-group">
                    <label>Email address</label>
                    <input className="login-inp" type="email" placeholder="you@pharmasys.com"
                      value={email} onChange={e=>{setEmail(e.target.value);setError("");}}/>
                  </div>
                  <div className="form-group">
                    <label>Password</label>
                    <div className="password-wrap">
                      <input className="login-inp" type={showPass?"text":"password"} placeholder="At least 6 characters"
                        value={password} onChange={e=>{setPassword(e.target.value);setError("");}}/>
                      <button type="button" className="toggle-pass" onClick={()=>setShowPass(p=>!p)} tabIndex={-1}>
                        {showPass?"🙈":"👁️"}
                      </button>
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Confirm Password</label>
                    <div className="password-wrap">
                      <input className="login-inp" type={showConf?"text":"password"} placeholder="Repeat your password"
                        value={confirm} onChange={e=>{setConfirm(e.target.value);setError("");}}/>
                      <button type="button" className="toggle-pass" onClick={()=>setShowConf(p=>!p)} tabIndex={-1}>
                        {showConf?"🙈":"👁️"}
                      </button>
                    </div>
                    {confirm && password && (
                      <div style={{fontSize:11,marginTop:5,color:confirm===password?"#00e5c0":"#ef4444"}}>
                        {confirm===password?"✓ Passwords match":"✗ Passwords don't match"}
                      </div>
                    )}
                  </div>
                  <button type="submit" className="sign-btn sign-btn--pharmacist" disabled={loading}>
                    {loading ? <span className="spinner"/> : "Create Account"}
                  </button>
                  <div className="auth-switch">
                    Already have an account?{" "}
                    <span onClick={()=>reset("signin")}>Sign in</span>
                  </div>
                </form>
              )}

              {/* ── FORGOT PASSWORD ── */}
              {mode === "forgot" && (
                <form onSubmit={handleForgot} noValidate>
                  <div className="form-group">
                    <label>Email address</label>
                    <input className="login-inp" type="email" placeholder="you@pharmasys.com"
                      value={email} onChange={e=>{setEmail(e.target.value);setError("");}} autoFocus/>
                  </div>
                  <button type="submit" className="sign-btn sign-btn--pharmacist" disabled={loading}>
                    {loading ? <span className="spinner"/> : "Send Reset Link"}
                  </button>
                  <div className="auth-switch">
                    Remember your password?{" "}
                    <span onClick={()=>reset("signin")}>Sign in</span>
                  </div>
                </form>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}