import { useState } from "react";

const PASSWORD = "Lesmdu7593@event";

export default function Login({ onLogin }) {
  const [code, setCode] = useState("");
  const [erreur, setErreur] = useState(false);

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
      </div>
    </div>
  );
}
