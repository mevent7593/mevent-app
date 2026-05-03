import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PrestationCard from "../components/PrestationCard";

const FILTRES = ["Tous", "À venir", "Confirmé", "En cours", "Évènement terminé", "En attente de l'acompte"];
const TYPES = ["Photo Booth", "Vidéo Booth 360°", "Pack Photo & Vidéo", "Autre"];
const MACHINES = ["Photo Booth", "Vidéo Booth 360°"];

export default function Dashboard() {
  const [prestations, setPrestations] = useState([]);
  const [filtre, setFiltre] = useState("Tous");
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetch("/api/prestations")
      .then(r => r.json())
      .then(data => { setPrestations(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const affichees = filtre === "Tous" ? prestations : prestations.filter(p => p.statut === filtre);

  const montantNum = (p) => Number(p.montant) || 0;
  const acompteNum = (p) => Number(p.acompte) || 0;
  const caTotal = prestations.reduce((acc, p) => acc + montantNum(p), 0);
  const caTermine = prestations.filter(p => p.statut === "Évènement terminé").reduce((acc, p) => acc + montantNum(p), 0);
  const caAVenir = prestations.filter(p => ["À venir", "Confirmé", "En attente de l'acompte"].includes(p.statut)).reduce((acc, p) => acc + montantNum(p), 0);
  const acompteTotal = prestations.reduce((acc, p) => acc + acompteNum(p), 0);
  const resteAEncaisser = caTotal - acompteTotal;

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0a", color: "#fff", fontFamily: "Inter, sans-serif" }}>
      {/* Header */}
      <div style={{ borderBottom: "1px solid #1a1a1a", padding: "20px 32px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <img src="/logo.png" alt="M'event" style={{ height: 125, objectFit: "contain", mixBlendMode: "lighten" }} />
        </div>
        <button
          onClick={() => setShowForm(true)}
          style={{ background: "#C9A84C", color: "#000", border: "none", borderRadius: 8, padding: "10px 20px", fontWeight: 700, cursor: "pointer", fontSize: 14 }}
        >
          + Nouvelle prestation
        </button>
      </div>

      <div style={{ padding: "32px" }}>
        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12, marginBottom: 32 }}>
          {[
            { label: "Total", count: prestations.length },
            { label: "À venir", count: prestations.filter(p => p.statut === "À venir" || p.statut === "Confirmé" || p.statut === "En attente de l'acompte").length },
            { label: "En cours", count: prestations.filter(p => p.statut === "En cours").length },
            { label: "Terminées", count: prestations.filter(p => p.statut === "Évènement terminé").length },
          ].map(s => (
            <div key={s.label} style={{ background: "#111", border: "1px solid #2a2a2a", borderRadius: 12, padding: "20px 24px" }}>
              <div style={{ color: "#C9A84C", fontSize: 32, fontWeight: 700 }}>{s.count}</div>
              <div style={{ color: "#888", fontSize: 13, marginTop: 4 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Chiffres d'affaires */}
        <div style={{ background: "#111", border: "1px solid #2a2a2a", borderRadius: 12, padding: 24, marginBottom: 32 }}>
          <h3 style={{ margin: "0 0 20px", color: "#C9A84C", fontSize: 13, textTransform: "uppercase", letterSpacing: 1 }}>Chiffres d'affaires</h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12 }}>
            {[
              { label: "CA Total", value: caTotal, color: "#C9A84C" },
              { label: "CA Terminé", value: caTermine, color: "#4CAF50" },
              { label: "CA À venir", value: caAVenir, color: "#2196F3" },
              { label: "Reste à encaisser", value: resteAEncaisser, color: "#ff9800" },
            ].map(item => (
              <div key={item.label} style={{ background: "#0a0a0a", borderRadius: 10, padding: "16px 20px" }}>
                <div style={{ color: item.color, fontSize: 24, fontWeight: 700 }}>
                  {item.value.toLocaleString("fr-FR")} €
                </div>
                <div style={{ color: "#666", fontSize: 12, marginTop: 4 }}>{item.label}</div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 16, paddingTop: 16, borderTop: "1px solid #1a1a1a", display: "flex", gap: 24 }}>
            <div style={{ fontSize: 13 }}>
              <span style={{ color: "#555" }}>Acomptes encaissés : </span>
              <span style={{ color: "#C9A84C", fontWeight: 600 }}>{acompteTotal.toLocaleString("fr-FR")} €</span>
            </div>
            <div style={{ fontSize: 13 }}>
              <span style={{ color: "#555" }}>Prestation moyenne : </span>
              <span style={{ color: "#C9A84C", fontWeight: 600 }}>
                {prestations.length > 0 ? Math.round(caTotal / prestations.length).toLocaleString("fr-FR") : 0} €
              </span>
            </div>
          </div>
        </div>

        {/* Filtres */}
        <div style={{ display: "flex", gap: 8, marginBottom: 24, flexWrap: "wrap" }}>
          {FILTRES.map(f => (
            <button key={f} onClick={() => setFiltre(f)} style={{
              background: filtre === f ? "#C9A84C" : "#111",
              color: filtre === f ? "#000" : "#aaa",
              border: `1px solid ${filtre === f ? "#C9A84C" : "#2a2a2a"}`,
              borderRadius: 20, padding: "6px 16px", cursor: "pointer",
              fontWeight: filtre === f ? 700 : 400, fontSize: 13,
            }}>
              {f}
            </button>
          ))}
        </div>

        {/* Liste */}
        {loading ? (
          <div style={{ color: "#888", textAlign: "center", marginTop: 60 }}>Chargement...</div>
        ) : affichees.length === 0 ? (
          <div style={{ color: "#555", textAlign: "center", marginTop: 60 }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>📋</div>
            <div>Aucune prestation {filtre !== "Tous" ? `"${filtre}"` : ""}</div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {affichees.map(p => <PrestationCard key={p.id} prestation={p} />)}
          </div>
        )}
      </div>

      {showForm && (
        <NouvellePrestation
          onClose={() => setShowForm(false)}
          onSaved={(p) => { setPrestations(prev => [p, ...prev]); setShowForm(false); }}
        />
      )}
    </div>
  );
}

function NouvellePrestation({ onClose, onSaved }) {
  const [form, setForm] = useState({ nom: "", prenom: "", type: "Photo Booth", machine: [], date: "", lieu: "", montant: "", telephone: "", email: "", filtre: "" });
  const [saving, setSaving] = useState(false);

  const toggleMachine = (m) => {
    setForm(p => ({
      ...p,
      machine: p.machine.includes(m) ? p.machine.filter(x => x !== m) : [...p.machine, m]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const res = await fetch("/api/prestations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, montant: Number(form.montant) }),
    });
    const data = await res.json();
    onSaved({ ...form, id: data.id, client: `${form.nom} ${form.prenom}`.trim(), formule: form.machine.join(", "), statut: "À venir", montant: Number(form.montant) });
  };

  const inputStyle = { width: "100%", background: "#0a0a0a", border: "1px solid #2a2a2a", borderRadius: 8, padding: "10px 12px", color: "#fff", fontSize: 14, boxSizing: "border-box" };
  const labelStyle = { color: "#888", fontSize: 12, display: "block", marginBottom: 6 };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: 16 }}>
      <div style={{ background: "#111", border: "1px solid #2a2a2a", borderRadius: 16, padding: 32, width: "100%", maxWidth: 520, maxHeight: "90vh", overflowY: "auto" }}>
        <h2 style={{ margin: "0 0 24px", color: "#fff" }}>Nouvelle prestation</h2>
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label style={labelStyle}>Nom *</label>
              <input required value={form.nom} onChange={e => setForm(p => ({ ...p, nom: e.target.value }))} style={inputStyle} placeholder="Dupont" />
            </div>
            <div>
              <label style={labelStyle}>Prénom</label>
              <input value={form.prenom} onChange={e => setForm(p => ({ ...p, prenom: e.target.value }))} style={inputStyle} placeholder="Marie" />
            </div>
          </div>
          <div>
            <label style={labelStyle}>Date *</label>
            <input required type="date" value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))} style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Lieu</label>
            <input value={form.lieu} onChange={e => setForm(p => ({ ...p, lieu: e.target.value }))} style={inputStyle} placeholder="Paris 8e" />
          </div>
          <div>
            <label style={labelStyle}>Type d'événement</label>
            <select value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))} style={inputStyle}>
              {TYPES.map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label style={labelStyle}>Machine utilisée</label>
            <div style={{ display: "flex", gap: 8 }}>
              {MACHINES.map(m => (
                <button key={m} type="button" onClick={() => toggleMachine(m)} style={{
                  background: form.machine.includes(m) ? "#C9A84C" : "#0a0a0a",
                  color: form.machine.includes(m) ? "#000" : "#aaa",
                  border: `1px solid ${form.machine.includes(m) ? "#C9A84C" : "#2a2a2a"}`,
                  borderRadius: 8, padding: "8px 14px", cursor: "pointer", fontSize: 13, fontWeight: form.machine.includes(m) ? 700 : 400
                }}>{m}</button>
              ))}
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label style={labelStyle}>Prix (€)</label>
              <input type="number" value={form.montant} onChange={e => setForm(p => ({ ...p, montant: e.target.value }))} style={inputStyle} placeholder="300" />
            </div>
            <div>
              <label style={labelStyle}>Téléphone</label>
              <input value={form.telephone} onChange={e => setForm(p => ({ ...p, telephone: e.target.value }))} style={inputStyle} placeholder="06 00 00 00 00" />
            </div>
          </div>
          <div>
            <label style={labelStyle}>Email client</label>
            <input type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} style={inputStyle} placeholder="client@email.com" />
          </div>
          <div>
            <label style={labelStyle}>Nom sur le filtre</label>
            <input value={form.filtre} onChange={e => setForm(p => ({ ...p, filtre: e.target.value }))} style={inputStyle} placeholder="Marie & Thomas" />
          </div>
          <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
            <button type="button" onClick={onClose} style={{ flex: 1, background: "transparent", border: "1px solid #2a2a2a", color: "#aaa", borderRadius: 8, padding: "12px", cursor: "pointer" }}>Annuler</button>
            <button type="submit" disabled={saving} style={{ flex: 1, background: "#C9A84C", color: "#000", border: "none", borderRadius: 8, padding: "12px", fontWeight: 700, cursor: "pointer" }}>
              {saving ? "Sauvegarde..." : "Créer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
