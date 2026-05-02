import { useState, useEffect } from "react";
import { useParams, useSearchParams } from "react-router-dom";

export default function Disponibilite() {
  const { prestationId } = useParams();
  const [searchParams] = useSearchParams();
  const membreId = searchParams.get("membre");

  const [prestation, setPrestation] = useState(null);
  const [reponse, setReponse] = useState(null);
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    fetch("/api/prestations")
      .then(r => r.json())
      .then(data => {
        const p = data.find(x => x.id === prestationId);
        setPrestation(p);
      });
  }, [prestationId]);

  const handleReponse = async (choix) => {
    setReponse(choix);
    setSaving(true);
    await fetch("/api/disponibilite", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prestationId, membreId, disponible: choix }),
    });
    setSaving(false);
    setDone(true);
  };

  if (!prestationId || !membreId) return (
    <div style={styles.center}>
      <div style={{ color: "#f44336" }}>Lien invalide.</div>
    </div>
  );

  if (!prestation) return (
    <div style={styles.center}>
      <div style={{ color: "#888" }}>Chargement...</div>
    </div>
  );

  const date = prestation.date
    ? new Date(prestation.date).toLocaleDateString("fr-FR", { weekday: "long", day: "2-digit", month: "long", year: "numeric" })
    : "Date non définie";

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0a", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Inter, sans-serif", padding: 24 }}>
      <div style={{ background: "#111", border: "1px solid #2a2a2a", borderRadius: 16, padding: 40, maxWidth: 440, width: "100%", textAlign: "center" }}>
        {/* Logo */}
        <img src="/logo.png" alt="M'event" style={{ height: 125, objectFit: "contain", marginBottom: 32, mixBlendMode: "lighten" }} />

        {done ? (
          <div>
            <div style={{ fontSize: 64, marginBottom: 16 }}>{reponse === "Oui" ? "✅" : "❌"}</div>
            <h2 style={{ color: "#fff", margin: "0 0 12px" }}>
              {reponse === "Oui" ? "Super, vous êtes disponible !" : "Compris, vous n'êtes pas disponible."}
            </h2>
            <p style={{ color: "#888", fontSize: 14 }}>Votre réponse a bien été enregistrée. Merci !</p>
          </div>
        ) : (
          <>
            <h2 style={{ color: "#fff", margin: "0 0 8px", fontSize: 22 }}>Êtes-vous disponible ?</h2>
            <p style={{ color: "#888", fontSize: 14, margin: "0 0 32px" }}>M'event a besoin de vous pour cette prestation</p>

            {/* Détails prestation */}
            <div style={{ background: "#0a0a0a", borderRadius: 12, padding: 20, marginBottom: 32, textAlign: "left" }}>
              <div style={{ color: "#C9A84C", fontWeight: 600, fontSize: 16, marginBottom: 12 }}>{prestation.client}</div>
              <div style={{ color: "#aaa", fontSize: 13, marginBottom: 6 }}>📋 {prestation.type} — {prestation.formule}</div>
              <div style={{ color: "#aaa", fontSize: 13, marginBottom: 6 }}>📅 {date}</div>
              {prestation.lieu && <div style={{ color: "#aaa", fontSize: 13 }}>📍 {prestation.lieu}</div>}
            </div>

            {/* Boutons */}
            <div style={{ display: "flex", gap: 12 }}>
              <button
                onClick={() => handleReponse("Non")}
                disabled={saving}
                style={{ flex: 1, background: "transparent", border: "1px solid #f44336", color: "#f44336", borderRadius: 10, padding: "16px", fontWeight: 700, cursor: "pointer", fontSize: 15 }}
              >
                Non disponible
              </button>
              <button
                onClick={() => handleReponse("Oui")}
                disabled={saving}
                style={{ flex: 1, background: "#C9A84C", border: "none", color: "#000", borderRadius: 10, padding: "16px", fontWeight: 700, cursor: "pointer", fontSize: 15 }}
              >
                Disponible
              </button>
            </div>
            {saving && <div style={{ color: "#888", fontSize: 13, marginTop: 16 }}>Enregistrement...</div>}
          </>
        )}
      </div>
    </div>
  );
}

const styles = {
  center: {
    minHeight: "100vh",
    background: "#0a0a0a",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "Inter, sans-serif",
  },
};
