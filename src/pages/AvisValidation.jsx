import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function AvisValidation() {
  const navigate = useNavigate();
  const [avisEnAttente, setAvisEnAttente] = useState([]);
  const [avisValides, setAvisValides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [action, setAction] = useState({});
  const [apercu, setApercu] = useState(null);

  const charger = () => {
    setLoading(true);
    Promise.all([
      fetch("/api/avis?nonValides=1").then(r => r.json()),
      fetch("/api/avis").then(r => r.json()),
    ]).then(([attente, valides]) => {
      setAvisEnAttente(Array.isArray(attente) ? attente : []);
      setAvisValides(Array.isArray(valides) ? valides : []);
      setLoading(false);
    }).catch(() => setLoading(false));
  };

  useEffect(() => { charger(); }, []);

  const valider = async (id) => {
    setAction(a => ({ ...a, [id]: "valider" }));
    await fetch(`/api/avis?id=${id}`, { method: "PATCH" });
    setAction(a => ({ ...a, [id]: null }));
    charger();
  };

  const rejeter = async (id) => {
    if (!window.confirm("Rejeter et supprimer cet avis ?")) return;
    setAction(a => ({ ...a, [id]: "rejeter" }));
    await fetch(`/api/avis?id=${id}`, { method: "DELETE" });
    setAction(a => ({ ...a, [id]: null }));
    charger();
  };

  const renderEtoiles = (note) => "★".repeat(note) + "☆".repeat(5 - note);

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0a", color: "#fff", fontFamily: "Inter, sans-serif" }}>
      <div style={{ borderBottom: "1px solid #1a1a1a", padding: "20px 24px", display: "flex", alignItems: "center", gap: 16 }}>
        <button onClick={() => navigate("/")} style={{ background: "transparent", border: "1px solid #2a2a2a", color: "#aaa", borderRadius: 8, padding: "8px 16px", cursor: "pointer", fontSize: 13 }}>
          ← Retour
        </button>
        <h1 style={{ margin: 0, fontSize: 20, color: "#C9A84C" }}>Avis clients</h1>
      </div>

      <div style={{ padding: "24px 20px", maxWidth: 760, margin: "0 auto" }}>
        {loading ? (
          <div style={{ color: "#888", textAlign: "center", marginTop: 60 }}>Chargement...</div>
        ) : (
          <>
            {/* En attente */}
            <h3 style={{ color: "#C9A84C", fontSize: 13, textTransform: "uppercase", letterSpacing: 1, margin: "0 0 12px" }}>
              En attente de validation ({avisEnAttente.length})
            </h3>
            {avisEnAttente.length === 0 ? (
              <div style={{ color: "#555", textAlign: "center", padding: "32px 0", fontSize: 14, background: "#111", borderRadius: 12, border: "1px solid #1a1a1a" }}>
                Aucun avis en attente
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 32 }}>
                {avisEnAttente.map(a => (
                  <div key={a.id} style={{ background: "#111", border: "1px solid #FF9800", borderRadius: 12, padding: 20 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, marginBottom: 8, flexWrap: "wrap" }}>
                      <div>
                        <div style={{ color: "#fff", fontWeight: 700, fontSize: 15 }}>{a.nom}</div>
                        <div style={{ color: "#888", fontSize: 12, marginTop: 2 }}>
                          {a.type && <span>{a.type}</span>}
                          {a.type && a.lieu && <span> · </span>}
                          {a.lieu && <span>{a.lieu}</span>}
                        </div>
                      </div>
                      <div style={{ color: "#C9A84C", fontSize: 18, letterSpacing: 2 }}>{renderEtoiles(a.note)}</div>
                    </div>
                    <p style={{ color: "#ddd", fontSize: 14, lineHeight: 1.6, margin: "12px 0", whiteSpace: "pre-wrap" }}>
                      « {a.commentaire} »
                    </p>
                    <div style={{ display: "flex", gap: 10, marginTop: 16, flexWrap: "wrap" }}>
                      <button
                        onClick={() => valider(a.id)}
                        disabled={!!action[a.id]}
                        style={{ flex: 1, minWidth: 140, background: "#4CAF50", color: "#000", border: "none", borderRadius: 8, padding: "10px 16px", fontWeight: 700, cursor: "pointer", fontSize: 13 }}
                      >
                        {action[a.id] === "valider" ? "..." : "✅ Valider"}
                      </button>
                      <button
                        onClick={() => rejeter(a.id)}
                        disabled={!!action[a.id]}
                        style={{ flex: 1, minWidth: 140, background: "transparent", color: "#f44336", border: "1px solid #f44336", borderRadius: 8, padding: "10px 16px", fontWeight: 700, cursor: "pointer", fontSize: 13 }}
                      >
                        {action[a.id] === "rejeter" ? "..." : "❌ Rejeter"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Validés */}
            <h3 style={{ color: "#888", fontSize: 13, textTransform: "uppercase", letterSpacing: 1, margin: "0 0 12px" }}>
              Avis publiés ({avisValides.length})
            </h3>
            {avisValides.length === 0 ? (
              <div style={{ color: "#555", textAlign: "center", padding: "32px 0", fontSize: 14, background: "#111", borderRadius: 12, border: "1px solid #1a1a1a" }}>
                Aucun avis publié
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {avisValides.map(a => (
                  <div
                    key={a.id}
                    onClick={() => setApercu(a)}
                    style={{ background: "#0d0d0d", border: "1px solid #1a1a1a", borderRadius: 10, padding: "12px 16px", cursor: "pointer", transition: "border-color 0.15s" }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = "#C9A84C"}
                    onMouseLeave={e => e.currentTarget.style.borderColor = "#1a1a1a"}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8, flexWrap: "wrap" }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ color: "#fff", fontWeight: 600, fontSize: 14 }}>{a.nom}</div>
                        <div style={{ color: "#666", fontSize: 11, marginTop: 2 }}>
                          {a.type}{a.lieu ? ` · ${a.lieu}` : ""}
                        </div>
                      </div>
                      <div style={{ color: "#C9A84C", fontSize: 14, letterSpacing: 2 }}>{renderEtoiles(a.note)}</div>
                    </div>
                    <p style={{ color: "#aaa", fontSize: 13, margin: "6px 0 0", lineHeight: 1.5 }}>« {a.commentaire} »</p>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 6 }}>
                      <span style={{ color: "#C9A84C", fontSize: 11, fontStyle: "italic" }}>📸 Cliquer pour partager</span>
                      <button
                        onClick={(e) => { e.stopPropagation(); rejeter(a.id); }}
                        style={{ background: "transparent", color: "#666", border: "none", padding: 0, fontSize: 11, cursor: "pointer", textDecoration: "underline" }}
                      >
                        Supprimer
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {apercu && <ApercuAvis avis={apercu} onClose={() => setApercu(null)} renderEtoiles={renderEtoiles} />}
    </div>
  );
}

function ApercuAvis({ avis, onClose, renderEtoiles }) {
  return (
    <div
      onClick={onClose}
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.92)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200, padding: 16, overflowY: "auto" }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: "linear-gradient(135deg, #1a1a1a 0%, #0d0d0d 100%)",
          border: "2px solid #C9A84C",
          borderRadius: 24,
          padding: "40px 32px",
          width: "100%",
          maxWidth: 480,
          textAlign: "center",
          position: "relative",
          boxShadow: "0 20px 60px rgba(201, 168, 76, 0.25)",
        }}
      >
        <div style={{ fontSize: 48, color: "#C9A84C", letterSpacing: 6, marginBottom: 16 }}>
          {renderEtoiles(avis.note)}
        </div>

        {avis.type && (
          <div style={{ display: "inline-block", background: "rgba(201,168,76,0.12)", border: "1px solid rgba(201,168,76,0.3)", color: "#C9A84C", fontSize: 11, fontWeight: 600, letterSpacing: 1.5, textTransform: "uppercase", padding: "4px 12px", borderRadius: 20, marginBottom: 24 }}>
            {avis.type}
          </div>
        )}

        <p style={{ color: "#f4f4f4", fontSize: 18, lineHeight: 1.7, fontStyle: "italic", margin: "0 0 32px", fontFamily: "Georgia, serif" }}>
          « {avis.commentaire} »
        </p>

        <div style={{ borderTop: "1px solid rgba(201,168,76,0.2)", paddingTop: 20, display: "flex", alignItems: "center", justifyContent: "center", gap: 14 }}>
          <div style={{ width: 48, height: 48, borderRadius: "50%", background: "linear-gradient(135deg, #C9A84C, #a07830)", display: "flex", alignItems: "center", justifyContent: "center", color: "#000", fontSize: 20, fontWeight: 700, fontFamily: "Georgia, serif" }}>
            {(avis.nom || "?").trim().charAt(0).toUpperCase()}
          </div>
          <div style={{ textAlign: "left" }}>
            <div style={{ color: "#fff", fontWeight: 600, fontSize: 15 }}>{avis.nom}</div>
            {avis.lieu && <div style={{ color: "#888", fontSize: 12, marginTop: 2 }}>{avis.lieu}</div>}
          </div>
        </div>

        <div style={{ marginTop: 24, paddingTop: 16, borderTop: "1px solid rgba(255,255,255,0.05)", color: "#C9A84C", fontSize: 11, letterSpacing: 2, textTransform: "uppercase", fontWeight: 600 }}>
          M'event
        </div>
      </div>

      <button
        onClick={onClose}
        style={{ position: "fixed", top: 16, right: 16, background: "rgba(255,255,255,0.1)", color: "#fff", border: "1px solid #2a2a2a", borderRadius: "50%", width: 40, height: 40, fontSize: 18, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
      >
        ✕
      </button>
    </div>
  );
}
