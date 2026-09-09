import { useState } from "react";
import { isAuthRetryableFetchError } from "@supabase/supabase-js";
import { useAuth } from "../../state/AuthContext";
import "./login.css";

export default function Login() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    const { error: signInError } = await signIn(email, password);
    setBusy(false);
    if (signInError) {
      setError(
        isAuthRetryableFetchError(signInError)
          ? "Tidak dapat sambung ke pelayan. Sila semak sambungan internet dan cuba lagi."
          : "Emel atau kata laluan salah.",
      );
    }
  };

  return (
    <div className="login-shell">
      <form className="login-card" onSubmit={submit}>
        <div className="dash-brand-eyebrow">URUSETIA</div>
        <div className="login-title">Log masuk PSKPP HOKI</div>
        <input
          type="email"
          placeholder="Emel"
          autoComplete="username"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Kata laluan"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        {error && <div className="login-error">{error}</div>}
        <button className="btn btn-primary" type="submit" disabled={busy}>
          {busy ? "Log masuk..." : "Log masuk"}
        </button>
      </form>
    </div>
  );
}
