export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "PATCH, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();

  const { id } = req.query;
  if (!id) return res.status(400).json({ error: "ID manquant" });

  const TOKEN = process.env.NOTION_TOKEN;

  if (req.method === "DELETE") {
    await fetch(`https://api.notion.com/v1/pages/${id}`, {
      method: "PATCH",
      headers: { "Authorization": `Bearer ${TOKEN}`, "Notion-Version": "2022-06-28", "Content-Type": "application/json" },
      body: JSON.stringify({ archived: true }),
    });
    return res.status(200).json({ success: true });
  }

  if (req.method === "PATCH") {
    const { nom, prenom, date, lieu, montant, acompte, telephone, email, filtre, musique, statut, type, machine, bosseurs, extras, creneau } = req.body;

    // Récupérer les vrais noms des propriétés
    const DB_ID = (process.env.NOTION_DB_PRESTATIONS || "").trim();
    const dbInfo = await fetch(`https://api.notion.com/v1/databases/${DB_ID}`, {
      headers: { "Authorization": `Bearer ${TOKEN}`, "Notion-Version": "2022-06-28" },
    }).then(r => r.json());

    const props = dbInfo.properties || {};
    const findProp = (keywords) => Object.keys(props).find(k => keywords.some(kw => k.toLowerCase().includes(kw.toLowerCase())));

    const properties = {};
    if (nom) properties["Nom"] = { title: [{ text: { content: nom } }] };
    const nomPrenom = findProp(["Prénom"]);
    if (nomPrenom && prenom !== undefined) properties[nomPrenom] = { rich_text: [{ text: { content: prenom || "" } }] };
    const nomDate = findProp(["Date"]);
    if (nomDate && date) properties[nomDate] = { date: { start: date } };
    const nomLieu = findProp(["Lieu"]);
    if (nomLieu && lieu !== undefined) properties[nomLieu] = { rich_text: [{ text: { content: lieu || "" } }] };
    const nomPrix = findProp(["Prix"]);
    if (nomPrix && montant !== undefined) properties[nomPrix] = { number: Number(montant) || 0 };
    const nomAcompte = findProp(["Acompte"]);
    if (nomAcompte && acompte !== undefined) properties[nomAcompte] = { number: Number(acompte) || 0 };
    const nomTel = findProp(["léphone"]);
    if (nomTel) properties[nomTel] = { phone_number: telephone && telephone.trim() ? telephone.trim() : null };
    const nomEmail = findProp(["mail"]);
    if (nomEmail) properties[nomEmail] = { email: email && email.trim() ? email.trim() : null };
    const nomFiltre = findProp(["filtre"]);
    if (nomFiltre && filtre !== undefined) properties[nomFiltre] = { rich_text: [{ text: { content: filtre || "" } }] };
    const nomMusique = findProp(["Musique"]);
    if (nomMusique) properties[nomMusique] = { url: musique && musique.trim() ? musique.trim() : null };
    const nomStatut = findProp(["Statut"]);
    if (nomStatut && statut) properties[nomStatut] = { select: { name: statut } };
    const nomType = findProp(["Type"]);
    if (nomType && type) properties[nomType] = { select: { name: type } };
    const nomMachine = findProp(["Machine"]);
    if (nomMachine && machine) properties[nomMachine] = { multi_select: machine.map(m => ({ name: m })) };
    const nomBosseurs = findProp(["Bosseur"]);
    if (nomBosseurs && bosseurs) properties[nomBosseurs] = { multi_select: bosseurs.map(b => ({ name: b })) };
    const nomExtras = findProp(["Extra"]);
    if (nomExtras && extras) properties[nomExtras] = { multi_select: extras.map(e => ({ name: e })) };
    const nomCreneau = findProp(["Cr"]);
    if (nomCreneau && creneau !== undefined) properties[nomCreneau] = { rich_text: [{ text: { content: creneau || "" } }] };

    await fetch(`https://api.notion.com/v1/pages/${id}`, {
      method: "PATCH",
      headers: { "Authorization": `Bearer ${TOKEN}`, "Notion-Version": "2022-06-28", "Content-Type": "application/json" },
      body: JSON.stringify({ properties }),
    });

    return res.status(200).json({ success: true });
  }

  return res.status(405).json({ error: "Méthode non autorisée" });
}
