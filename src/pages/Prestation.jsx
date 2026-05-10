import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import StatutBadge from "../components/StatutBadge";

const TYPES = ["Photo Booth", "Vidéo Booth 360°", "Pack Photo & Vidéo", "Autre"];
const MACHINES = ["Photo Booth", "Vidéo Booth 360°", "Combiné (Photo Booth + Vidéo Booth 360°)"];
const BOSSEURS = ["Lassana", "Hamza", "Ibrahima", "Moussa", "Joseph"];
const STATUTS = ["Devis", "À venir", "Acompte payé", "En cours", "Confirmé", "Évènement terminé"];

export default function Prestation() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [prestation, setPrestation] = useState(null);
  const [dispos, setDispos] = useState([]);
  const [confirming, setConfirming] = useState(false);
  const [confirme, setConfirme] = useState(false);
  const [validating, setValidating] = useState(false);
  const [terminating, setTerminating] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);

  useEffect(() => {
    fetch("/api/prestations")
      .then(r => r.json())
      .then(data => {
        const p = (Array.isArray(data) ? data : []).find(x => x.id === id);
        setPrestation(p);
        if (p?.statut === "Confirmé") setConfirme(true);
      });

    fetch(`/api/disponibilite?prestationId=${id}`)
      .then(r => r.json())
      .then(d => setDispos(Array.isArray(d) ? d : []))
      .catch(() => {});
  }, [id]);

  const handleValiderDevis = async () => {
    setValidating(true);
    await fetch("/api/statut", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prestationId: id, statut: "À venir" }),
    });
    setPrestation(p => ({ ...p, statut: "À venir" }));
    setValidating(false);
  };

  const handleConfirmer = async () => {
    setConfirming(true);
    await fetch("/api/confirmer", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prestationId: id }),
    });
    setConfirme(true);
    setConfirming(false);
    setPrestation(p => ({ ...p, statut: "Confirmé" }));
  };

  const handleTerminer = async () => {
    if (!window.confirm("Marquer cette prestation comme terminée ?")) return;
    setTerminating(true);
    await fetch("/api/statut", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prestationId: id, statut: "Évènement terminé" }),
    });
    setPrestation(p => ({ ...p, statut: "Évènement terminé" }));
    setTerminating(false);
  };

  const handleCopierLienAvis = async () => {
    const lien = `https://mevent-app.vercel.app/laisser-avis?prestation=${id}`;
    try {
      await navigator.clipboard.writeText(lien);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2500);
    } catch {
      window.prompt("Copiez ce lien :", lien);
    }
  };

  const handleSupprimer = async () => {
    if (!window.confirm("Supprimer cette prestation ? Cette action est irréversible.")) return;
    setDeleting(true);
    await fetch(`/api/prestation-update?id=${id}`, { method: "DELETE" });
    navigate("/");
  };

  if (!prestation) return (
    <div style={{ minHeight: "100vh", background: "#0a0a0a", color: "#888", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Inter, sans-serif" }}>
      Chargement...
    </div>
  );

  const date = prestation.date
    ? new Date(prestation.date).toLocaleDateString("fr-FR", { weekday: "long", day: "2-digit", month: "long", year: "numeric" })
    : "Date non définie";

  const disponibles = dispos.filter(d => d.disponible === "Oui").length;
  const nonDisponibles = dispos.filter(d => d.disponible === "Non").length;
  const enAttente = dispos.filter(d => d.disponible === "En attente").length;

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0a", color: "#fff", fontFamily: "Inter, sans-serif" }}>
      <div style={{ borderBottom: "1px solid #1a1a1a", padding: "20px 32px", display: "flex", alignItems: "center", gap: 16 }}>
        <button onClick={() => navigate("/")} style={{ background: "transparent", border: "1px solid #2a2a2a", color: "#aaa", borderRadius: 8, padding: "8px 16px", cursor: "pointer", fontSize: 13 }}>
          ← Retour
        </button>
        <img src="/logo.png" alt="M'event" style={{ height: 125, objectFit: "contain", mixBlendMode: "lighten" }} />
      </div>

      <div style={{ padding: "32px", maxWidth: 700, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
          <div>
            <h1 style={{ margin: "0 0 8px", fontSize: 28 }}>{prestation.client}</h1>
            {prestation.type && <div style={{ color: "#C9A84C", fontSize: 15 }}>{prestation.type}{prestation.formule ? ` — ${prestation.formule}` : ""}</div>}
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <StatutBadge statut={prestation.statut} />
            <button onClick={handleCopierLienAvis} style={{ background: "transparent", border: "1px solid #FF9800", color: "#FF9800", borderRadius: 8, padding: "6px 14px", cursor: "pointer", fontSize: 13 }}>
              {linkCopied ? "✓ Copié !" : "📎 Lien avis"}
            </button>
            <button onClick={() => setShowEdit(true)} style={{ background: "transparent", border: "1px solid #2a2a2a", color: "#aaa", borderRadius: 8, padding: "6px 14px", cursor: "pointer", fontSize: 13 }}>✏️ Modifier</button>
            <button onClick={handleSupprimer} disabled={deleting} style={{ background: "transparent", border: "1px solid #f44336", color: "#f44336", borderRadius: 8, padding: "6px 14px", cursor: "pointer", fontSize: 13 }}>
              {deleting ? "..." : "🗑️ Supprimer"}
            </button>
          </div>
        </div>

        {/* Détails */}
        <div style={{ background: "#111", border: "1px solid #2a2a2a", borderRadius: 12, padding: 24, marginBottom: 24 }}>
          <h3 style={{ margin: "0 0 16px", color: "#C9A84C", fontSize: 13, textTransform: "uppercase", letterSpacing: 1 }}>Détails</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            {[
              { label: "Date", value: date },
              { label: "Horaire", value: prestation.creneau || "—" },
              { label: "Lieu", value: prestation.lieu || "—" },
              { label: "Prix", value: prestation.montant ? `${prestation.montant}€` : "—" },
              { label: "Acompte payé", value: prestation.acompte ? `${prestation.acompte}€` : "—" },
              { label: "Téléphone", value: prestation.telephone || "—" },
              { label: "Email", value: prestation.email || "—" },
              { label: "Filtre", value: prestation.filtre || "—" },
              { label: "Équipe", value: prestation.bosseurs?.join(", ") || "—" },
              { label: "Extras", value: prestation.extras?.length ? prestation.extras.join(", ") : "—" },
            ].map(d => (
              <div key={d.label}>
                <div style={{ color: "#555", fontSize: 12, marginBottom: 4 }}>{d.label}</div>
                <div style={{ color: "#fff", fontSize: 14 }}>{d.value}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Terminer prestation */}
        {prestation.statut !== "Devis" && prestation.statut !== "Évènement terminé" && (
          <div style={{ background: "#111", border: "1px solid #4CAF50", borderRadius: 12, padding: 24, marginBottom: 24, textAlign: "center" }}>
            <p style={{ color: "#aaa", margin: "0 0 16px", fontSize: 14 }}>
              La prestation est terminée ? Marquez-la comme terminée pour la déplacer dans les évènements terminés.
            </p>
            <button onClick={handleTerminer} disabled={terminating} style={{ background: "#4CAF50", color: "#000", border: "none", borderRadius: 8, padding: "14px 32px", fontWeight: 700, cursor: "pointer", fontSize: 15 }}>
              {terminating ? "..." : "✅ Marquer comme terminée"}
            </button>
          </div>
        )}

        {/* Valider devis */}
        {prestation.statut === "Devis" && (
          <div style={{ background: "#111", border: "1px solid #FF9800", borderRadius: 12, padding: 24, marginBottom: 24, textAlign: "center" }}>
            <p style={{ color: "#aaa", margin: "0 0 16px", fontSize: 14 }}>
              Le client a accepté le devis ? Validez pour le passer en prestation à venir.
            </p>
            <button onClick={handleValiderDevis} disabled={validating} style={{ background: "#FF9800", color: "#000", border: "none", borderRadius: 8, padding: "14px 32px", fontWeight: 700, cursor: "pointer", fontSize: 15 }}>
              {validating ? "Validation..." : "Valider le devis"}
            </button>
          </div>
        )}

        {/* Confirmer */}
        {!confirme && (prestation.statut === "À venir" || prestation.statut === "En attente de l'acompte") && (
          <div style={{ background: "#111", border: "1px solid #C9A84C", borderRadius: 12, padding: 24, marginBottom: 24, textAlign: "center" }}>
            <p style={{ color: "#aaa", margin: "0 0 16px", fontSize: 14 }}>
              Prestation confirmée par le client ? Notifiez tous les membres pour connaître leurs disponibilités.
            </p>
            <button onClick={handleConfirmer} disabled={confirming} style={{ background: "#C9A84C", color: "#000", border: "none", borderRadius: 8, padding: "14px 32px", fontWeight: 700, cursor: "pointer", fontSize: 15 }}>
              {confirming ? "Envoi en cours..." : "Confirmer et notifier les membres"}
            </button>
          </div>
        )}

        {confirme && (
          <div style={{ background: "#1a2e1a", border: "1px solid #4CAF50", borderRadius: 12, padding: 16, marginBottom: 24, color: "#4CAF50", textAlign: "center", fontSize: 14 }}>
            Prestation confirmée — notifications envoyées aux membres
          </div>
        )}

        {/* Disponibilités */}
        <div style={{ background: "#111", border: "1px solid #2a2a2a", borderRadius: 12, padding: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <h3 style={{ margin: 0, color: "#C9A84C", fontSize: 13, textTransform: "uppercase", letterSpacing: 1 }}>Disponibilités membres</h3>
            <div style={{ display: "flex", gap: 12, fontSize: 13 }}>
              <span style={{ color: "#4CAF50" }}>{disponibles} ✓</span>
              <span style={{ color: "#f44336" }}>{nonDisponibles} ✗</span>
              <span style={{ color: "#888" }}>{enAttente} en attente</span>
            </div>
          </div>
          {dispos.length === 0 ? (
            <div style={{ color: "#555", textAlign: "center", padding: "24px 0", fontSize: 14 }}>Aucune réponse pour l'instant</div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {dispos.map(d => (
                <div key={d.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", background: "#0a0a0a", borderRadius: 8 }}>
                  <span style={{ color: "#fff" }}>{d.membre || "Membre"}</span>
                  <span style={{ color: d.disponible === "Oui" ? "#4CAF50" : d.disponible === "Non" ? "#f44336" : "#888", fontWeight: 600, fontSize: 13 }}>
                    {d.disponible === "Oui" ? "Disponible" : d.disponible === "Non" ? "Non disponible" : "En attente"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal modification */}
      {showEdit && (
        <EditPrestation
          prestation={prestation}
          onClose={() => setShowEdit(false)}
          onSaved={(updated) => { setPrestation(p => ({ ...p, ...updated })); setShowEdit(false); }}
        />
      )}
    </div>
  );
}

function EditPrestation({ prestation, onClose, onSaved }) {
  const nomParts = (prestation.client || "").split(" ");
  const [form, setForm] = useState({
    nom: nomParts[0] || "",
    prenom: nomParts.slice(1).join(" ") || "",
    date: prestation.date || "",
    creneau: prestation.creneau || "",
    lieu: prestation.lieu || "",
    montant: prestation.montant || "",
    acompte: prestation.acompte || "",
    telephone: prestation.telephone || "",
    email: prestation.email || "",
    filtre: prestation.filtre || "",
    musique: prestation.musique || "",
    type: prestation.type || "Photo Booth",
    machine: prestation.formule ? prestation.formule.split(", ").filter(Boolean) : [],
    bosseurs: prestation.bosseurs || [],
    extras: prestation.extras ? prestation.extras.join(", ") : "",
    statut: prestation.statut || "À venir",
  });
  const [saving, setSaving] = useState(false);

  const toggleMachine = (m) => setForm(p => ({ ...p, machine: p.machine.includes(m) ? p.machine.filter(x => x !== m) : [...p.machine, m] }));
  const toggleBosseur = (b) => setForm(p => ({ ...p, bosseurs: p.bosseurs.includes(b) ? p.bosseurs.filter(x => x !== b) : [...p.bosseurs, b] }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    await fetch(`/api/prestation-update?id=${prestation.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        montant: Number(form.montant),
        acompte: Number(form.acompte),
        extras: form.extras ? form.extras.split(",").map(e => e.trim()).filter(Boolean) : [],
      }),
    });
    onSaved({
      client: `${form.nom} ${form.prenom}`.trim(),
      date: form.date,
      lieu: form.lieu,
      montant: Number(form.montant),
      acompte: Number(form.acompte),
      telephone: form.telephone,
      email: form.email,
      filtre: form.filtre,
      type: form.type,
      formule: form.machine.join(", "),
      bosseurs: form.bosseurs,
      extras: form.extras ? form.extras.split(",").map(e => e.trim()).filter(Boolean) : [],
      statut: form.statut,
    });
  };

  const inputStyle = { width: "100%", background: "#0a0a0a", border: "1px solid #2a2a2a", borderRadius: 8, padding: "10px 12px", color: "#fff", fontSize: 14, boxSizing: "border-box" };
  const labelStyle = { color: "#888", fontSize: 12, display: "block", marginBottom: 6 };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: 16 }}>
      <div style={{ background: "#111", border: "1px solid #2a2a2a", borderRadius: 16, padding: 32, width: "100%", maxWidth: 520, maxHeight: "90vh", overflowY: "auto" }}>
        <h2 style={{ margin: "0 0 24px", color: "#fff" }}>Modifier la prestation</h2>
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div><label style={labelStyle}>Nom</label><input value={form.nom} onChange={e => setForm(p => ({ ...p, nom: e.target.value }))} style={inputStyle} /></div>
            <div><label style={labelStyle}>Prénom</label><input value={form.prenom} onChange={e => setForm(p => ({ ...p, prenom: e.target.value }))} style={inputStyle} /></div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div><label style={labelStyle}>Date</label><input type="date" value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))} style={inputStyle} /></div>
            <div><label style={labelStyle}>Créneau</label><input value={form.creneau} onChange={e => setForm(p => ({ ...p, creneau: e.target.value }))} style={inputStyle} placeholder="18h - 23h" /></div>
          </div>
          <div><label style={labelStyle}>Lieu</label><input value={form.lieu} onChange={e => setForm(p => ({ ...p, lieu: e.target.value }))} style={inputStyle} /></div>
          <div><label style={labelStyle}>Type d'événement</label>
            <select value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))} style={inputStyle}>
              {TYPES.map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label style={labelStyle}>Machine utilisée</label>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {MACHINES.map(m => (
                <button key={m} type="button" onClick={() => toggleMachine(m)} style={{ background: form.machine.includes(m) ? "#C9A84C" : "#0a0a0a", color: form.machine.includes(m) ? "#000" : "#aaa", border: `1px solid ${form.machine.includes(m) ? "#C9A84C" : "#2a2a2a"}`, borderRadius: 8, padding: "8px 14px", cursor: "pointer", fontSize: 13, fontWeight: form.machine.includes(m) ? 700 : 400 }}>{m}</button>
              ))}
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div><label style={labelStyle}>Prix (€)</label><input type="number" value={form.montant} onChange={e => setForm(p => ({ ...p, montant: e.target.value }))} style={inputStyle} /></div>
            <div><label style={labelStyle}>Acompte (€)</label><input type="number" value={form.acompte} onChange={e => setForm(p => ({ ...p, acompte: e.target.value }))} style={inputStyle} /></div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div><label style={labelStyle}>Téléphone</label><input value={form.telephone} onChange={e => setForm(p => ({ ...p, telephone: e.target.value }))} style={inputStyle} /></div>
            <div><label style={labelStyle}>Email</label><input type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} style={inputStyle} /></div>
          </div>
          <div><label style={labelStyle}>Nom sur le filtre</label><input value={form.filtre} onChange={e => setForm(p => ({ ...p, filtre: e.target.value }))} style={inputStyle} /></div>
          <div><label style={labelStyle}>Musique (lien)</label><input value={form.musique} onChange={e => setForm(p => ({ ...p, musique: e.target.value }))} style={inputStyle} /></div>
          <div>
            <label style={labelStyle}>Les Bosseurs</label>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {BOSSEURS.map(b => (
                <button key={b} type="button" onClick={() => toggleBosseur(b)} style={{ background: form.bosseurs.includes(b) ? "#C9A84C" : "#0a0a0a", color: form.bosseurs.includes(b) ? "#000" : "#aaa", border: `1px solid ${form.bosseurs.includes(b) ? "#C9A84C" : "#2a2a2a"}`, borderRadius: 8, padding: "8px 14px", cursor: "pointer", fontSize: 13, fontWeight: form.bosseurs.includes(b) ? 700 : 400 }}>{b}</button>
              ))}
            </div>
          </div>
          <div><label style={labelStyle}>Extras (séparés par virgules)</label><input value={form.extras} onChange={e => setForm(p => ({ ...p, extras: e.target.value }))} style={inputStyle} /></div>
          <div><label style={labelStyle}>Statut</label>
            <select value={form.statut} onChange={e => setForm(p => ({ ...p, statut: e.target.value }))} style={inputStyle}>
              {STATUTS.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
            <button type="button" onClick={onClose} style={{ flex: 1, background: "transparent", border: "1px solid #2a2a2a", color: "#aaa", borderRadius: 8, padding: "12px", cursor: "pointer" }}>Annuler</button>
            <button type="submit" disabled={saving} style={{ flex: 1, background: "#C9A84C", color: "#000", border: "none", borderRadius: 8, padding: "12px", fontWeight: 700, cursor: "pointer" }}>
              {saving ? "Sauvegarde..." : "Enregistrer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
