import { useState } from "react";

const PASSWORD = "Lesmdu7593@event";

export default function Login({ onLogin }) {
  const [code, setCode] = useState("");
  const [erreur, setErreur] = useState(false);
  const [showOublie, setShowOublie] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (code === PASSWORD) {
      localStorage.setItem("mevent_auth", "1");
      onLogin();
    } else {
      setErreur(true);
      setCode("");
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0a", color: "#fff", fontFamily: "Inter, sans-serif", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div style={{ width: "100%", maxWidth: 380, textAlign: "center" }}>
        <img src="/logo.png" alt="M'event" style={{ height: 140, objectFit: "contain", mixBlendMode: "lighten", marginBottom: 24 }} />
        <h2 style={{ margin: "0 0 8px", color: "#fff", fontSize: 22 }}>Accès réservé</h2>
        <p style={{ color: "#888", fontSize: 14, margin: "0 0 32px" }}>Entrez le mot de passe pour accéder à l'application</p>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <input
            type="password"
            value={code}
            onChange={(e) => { setCode(e.target.value); setErreur(false); }}
            placeholder="Mot de passe"
            autoFocus
            style={{
              width: "100%",
              background: "#111",
              border: `1px solid ${erreur ? "#f44336" : "#2a2a2a"}`,
              borderRadius: 10,
              padding: "14px 16px",
              color: "#fff",
              fontSize: 15,
              boxSizing: "border-box",
              textAlign: "center",
            }}
          />
          {erreur && <div style={{ color: "#f44336", fontSize: 13 }}>Mot de passe incorrect</div>}
          <button
            type="submit"
            style={{
              background: "#C9A84C",
              color: "#000",
              border: "none",
              borderRadius: 10,
              padding: "14px",
              fontWeight: 700,
              cursor: "pointer",
              fontSize: 15,
              marginTop: 8,
            }}
          >
            Se connecter
          </button>
        </form>

        <button
          onClick={() => setShowOublie(true)}
          style={{ background: "transparent", border: "none", color: "#888", fontSize: 13, marginTop: 20, cursor: "pointer", textDecoration: "underline" }}
        >
          Mot de passe oublié ?
        </button>
      </div>

      {showOublie && <MotDePasseOublie onClose={() => setShowOublie(false)} />}
    </div>
  );
}

function MotDePasseOublie({ onClose }) {
  const [email, setEmail] = useState("");
  const [statut, setStatut] = useState(null);
  const [envoi, setEnvoi] = useState(false);

  const handleEnvoyer = async (e) => {
    e.preventDefault();
    setEnvoi(true);
    setStatut(null);
    try {
      const res = await fetch("/api/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (res.ok) setStatut({ ok: true, message: "Mot de passe envoyé par email !" });
      else {
        const data = await res.json();
        setStatut({ ok: false, message: data.error || "Erreur lors de l'envoi" });
      }
    } catch {
      setStatut({ ok: false, message: "Erreur réseau" });
    }
    setEnvoi(false);
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: 16 }}>
      <div style={{ background: "#111", border: "1px solid #2a2a2a", borderRadius: 16, padding: 28, width: "100%", maxWidth: 400 }}>
        <h3 style={{ margin: "0 0 8px", color: "#fff" }}>Mot de passe oublié</h3>
        <p style={{ color: "#888", fontSize: 13, margin: "0 0 20px" }}>
          Entrez votre email. Si vous êtes membre de l'équipe, vous recevrez le mot de passe.
        </p>
        <form onSubmit={handleEnvoyer} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="votre.email@gmail.com"
            autoFocus
            style={{
              width: "100%",
              background: "#0a0a0a",
              border: "1px solid #2a2a2a",
              borderRadius: 10,
              padding: "12px 14px",
              color: "#fff",
              fontSize: 14,
              boxSizing: "border-box",
            }}
          />
          {statut && (
            <div style={{ color: statut.ok ? "#4CAF50" : "#f44336", fontSize: 13 }}>{statut.message}</div>
          )}
          <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
            <button type="button" onClick={onClose} style={{ flex: 1, background: "transparent", border: "1px solid #2a2a2a", color: "#aaa", borderRadius: 8, padding: "12px", cursor: "pointer", fontSize: 14 }}>
              Annuler
            </button>
            <button type="submit" disabled={envoi} style={{ flex: 1, background: "#C9A84C", color: "#000", border: "none", borderRadius: 8, padding: "12px", fontWeight: 700, cursor: "pointer", fontSize: 14 }}>
              {envoi ? "Envoi..." : "Envoyer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
