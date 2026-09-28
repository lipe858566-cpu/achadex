import React from "react";
import { useEffect, useState } from "react";
import { LockKeyhole } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { supabaseConfigured } from "../lib/supabase";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const { user, signIn } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) navigate("/painel/dashboard", { replace: true });
  }, [user, navigate]);

  async function submit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { error } = await signIn(email, password);
      if (error) setError(error.message);
      else navigate("/painel/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="login-page">
      <form className="login-card" onSubmit={submit}>
        <div className="login-icon"><LockKeyhole size={25} /></div>
        <h1>ACHADEX</h1>
        <p className="muted">🔐 Acesso restrito</p>

        {!supabaseConfigured && <div className="error">Configure o arquivo .env antes de entrar.</div>}
        {error && <div className="error">{error}</div>}

        <label>E-mail</label>
        <input type="email" value={email} onChange={e => setEmail(e.target.value)} required />

        <label>Senha</label>
        <input type="password" value={password} onChange={e => setPassword(e.target.value)} required />

        <button className="primary wide" disabled={loading || !supabaseConfigured}>
          {loading ? "ENTRANDO..." : "ENTRAR"}
        </button>

        <a className="back-store" href="/">← Voltar para a vitrine</a>
      </form>
    </main>
  );
}