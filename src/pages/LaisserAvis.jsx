import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";

const TYPES = ["Mariage", "Baptême", "Anniversaire", "Soirée", "Corporate", "Autre"];

export default function LaisserAvis() {
  const [params] = useSearchParams();
  const prestationId = params.get("prestation");

  const [form, setForm] = useState({ nom: "", note: 0, commentaire: "", type: "", lieu: "" });
  const [hoverNote, setHoverNote] = useState(0);
  const [envoi, setEnvoi] = useState(false);
  const [envoye, setEnvoye] = useState(false);
  const [erreur, setErreur] = useState(null);

  useEffect(() => {
    if (!prestationId) return;
    fetch("/api/prestations")
      .then(r => r.json())
      .then(data => {
        const p = (Array.isArray(data) ? data : []).find(x => x.id === prestationId);
        if (p) {
          setForm(f => ({
            ...f,
            nom: p.client || "",
            type: TYPES.includes(p.type) ? p.type : (p.type ? "Autre" : ""),
            lieu: p.lieu || "",
          }));
        }
      })
      .catch(() => {});
  }, [prestationId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.note === 0) { setErreur("Veuillez choisir une note"); return; }
    setEnvoi(true);
    setErreur(null);
    try {
      const res = await fetch("/api/avis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) setEnvoye(true);
      else {
        const data = await res.json();
        setErreur(data.error || "Erreur lors de l'envoi");
      }
    } catch {
      setErreur("Erreur réseau");
    }
    setEnvoi(false);
  };

  const inputStyle = { width: "100%", background: "#0a0a0a", border: "1px solid #2a2a2a", borderRadius: 8, padding: "12px 14px", color: "#fff", fontSize: 14, boxSizing: "border-box", fontFamily: "inherit" };
  const labelStyle = { color: "#888", fontSize: 13, display: "block", marginBottom: 6 };

  if (envoye) {
    return (
      <div style={{ minHeight: "100vh", background: "#0a0a0a", color: "#fff", fontFamily: "Inter, sans-serif", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
        <div style={{ textAlign: "center", maxWidth: 460 }}>
          <img src="/logo.png" alt="M'event" style={{ height: 120, objectFit: "contain", mixBlendMode: "lighten", marginBottom: 20 }} />
          <div style={{ fontSize: 64, marginBottom: 16 }}>🌟</div>
          <h2 style={{ margin: "0 0 12px", color: "#C9A84C", fontSize: 24 }}>Merci pour votre avis !</h2>
          <p style={{ color: "#aaa", fontSize: 15, lineHeight: 1.6 }}>
            Votre retour est précieux pour nous. Il sera affiché sur notre site après une rapide validation.
          </p>
          <p style={{ color: "#888", fontSize: 14, marginTop: 24 }}>L'équipe M'event 💛</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0a", color: "#fff", fontFamily: "Inter, sans-serif", padding: "24px 20px" }}>
      <div style={{ maxWidth: 480, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <img src="/logo.png" alt="M'event" style={{ height: 120, objectFit: "contain", mixBlendMode: "lighten" }} />
          <h2 style={{ margin: "8px 0 6px", color: "#fff", fontSize: 22 }}>Votre avis compte</h2>
          <p style={{ color: "#888", fontSize: 14, margin: 0 }}>Partagez votre expérience avec M'event</p>
        </div>

        <form onSubmit={handleSubmit} style={{ background: "#111", border: "1px solid #2a2a2a", borderRadius: 14, padding: 24, display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <label style={labelStyle}>Votre note *</label>
            <div style={{ display: "flex", gap: 8, justifyContent: "center", padding: "8px 0" }}>
              {[1, 2, 3, 4, 5].map(n => {
                const actif = (hoverNote || form.note) >= n;
                return (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setForm(f => ({ ...f, note: n }))}
                    onMouseEnter={() => setHoverNote(n)}
                    onMouseLeave={() => setHoverNote(0)}
                    style={{ background: "transparent", border: "none", cursor: "pointer", fontSize: 38, color: actif ? "#C9A84C" : "#333", transition: "color 0.15s", padding: 0 }}
                  >
                    ★
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label style={labelStyle}>Votre nom *</label>
            <input required value={form.nom} onChange={e => setForm(f => ({ ...f, nom: e.target.value }))} style={inputStyle} placeholder="Marie D." />
          </div>

          <div>
            <label style={labelStyle}>Type d'événement</label>
            <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))} style={inputStyle}>
              <option value="">— Choisir —</option>
              {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          <div>
            <label style={labelStyle}>Lieu</label>
            <input value={form.lieu} onChange={e => setForm(f => ({ ...f, lieu: e.target.value }))} style={inputStyle} placeholder="Paris 8e" />
          </div>

          <div>
            <label style={labelStyle}>Votre commentaire *</label>
            <textarea required rows={5} value={form.commentaire} onChange={e => setForm(f => ({ ...f, commentaire: e.target.value }))} style={{ ...inputStyle, resize: "vertical", minHeight: 100 }} placeholder="Racontez votre expérience..." />
          </div>

          {erreur && <div style={{ color: "#f44336", fontSize: 13, textAlign: "center" }}>{erreur}</div>}

          <button type="submit" disabled={envoi} style={{ background: "#C9A84C", color: "#000", border: "none", borderRadius: 10, padding: "14px", fontWeight: 700, cursor: envoi ? "wait" : "pointer", fontSize: 15, marginTop: 4 }}>
            {envoi ? "Envoi..." : "Envoyer mon avis"}
          </button>
        </form>
      </div>
    </div>
  );
}
