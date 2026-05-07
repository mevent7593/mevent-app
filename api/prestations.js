import { Client } from "@notionhq/client";

const notion = new Client({ auth: process.env.NOTION_TOKEN });
const DB_ID = (process.env.NOTION_DB_PRESTATIONS || "").trim();

async function queryDatabase(database_id, sorts) {
  const response = await fetch(`https://api.notion.com/v1/databases/${database_id}/query`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.NOTION_TOKEN}`,
      "Notion-Version": "2022-06-28",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ sorts: sorts || [] }),
  });
  return response.json();
}

async function createPage(database_id, properties) {
  const response = await fetch("https://api.notion.com/v1/pages", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.NOTION_TOKEN}`,
      "Notion-Version": "2022-06-28",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ parent: { database_id }, properties }),
  });
  return response.json();
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();

  if (req.method === "GET") {
    const data = await queryDatabase(DB_ID, [{ property: "Date réservé", direction: "descending" }]);

    const prestations = (data.results || []).map((page) => ({
      id: page.id,
      client: [
        page.properties["Nom"]?.title?.[0]?.plain_text ?? "",
        page.properties["Prénom"]?.rich_text?.[0]?.plain_text ?? "",
      ].filter(Boolean).join(" "),
      type: page.properties["Type d'événement"]?.select?.name ?? "",
      formule: page.properties["Machine utilisée "]?.multi_select?.map(m => m.name).join(", ") ?? "",
      date: page.properties["Date réservé"]?.date?.start ?? null,
      lieu: (page.properties["Lieu"]?.rich_text?.filter(r => !r.plain_text.match(/^\s*See More\s*$/i)).map(r => r.plain_text).join("") ?? "").trim(),
      montant: page.properties["Prix de la presta "]?.number ?? 0,
      acompte: page.properties["Acompte payé"]?.number ?? 0,
      statut: page.properties["Statut de l'évènement"]?.select?.name ?? "À venir",
      bosseurs: page.properties["Les Bosseurs"]?.multi_select?.map(b => b.name) ?? [],
      extras: page.properties["Extras"]?.multi_select?.map(e => e.name) ?? [],
      telephone: page.properties["Téléphone"]?.phone_number ?? "",
      email: page.properties["E-mail"]?.email ?? "",
      filtre: page.properties["Nom sur le filtre"]?.rich_text?.[0]?.plain_text ?? "",
      creneau: page.properties["Créneau horaire"]?.rich_text?.[0]?.plain_text ?? "",
    }));

    return res.status(200).json(prestations);
  }

  if (req.method === "POST") {
    const { nom, prenom, type, machine, date, creneau, lieu, montant, acompte, telephone, email, filtre, musique, bosseurs, extras, statut } = req.body;

    // Récupérer les vrais noms des propriétés depuis Notion
    const dbInfo = await fetch(`https://api.notion.com/v1/databases/${DB_ID}`, {
      headers: {
        "Authorization": `Bearer ${process.env.NOTION_TOKEN}`,
        "Notion-Version": "2022-06-28",
      },
    }).then(r => r.json());

    const props = dbInfo.properties || {};
    const findProp = (keywords) => Object.keys(props).find(k => keywords.some(kw => k.toLowerCase().includes(kw.toLowerCase())));

    const nomStatut = findProp(["Statut"]);
    const nomType = findProp(["Type"]);
    const nomMachine = findProp(["Machine"]);
    const nomDate = findProp(["Date"]);
    const nomCreneau = findProp(["Cr"]);
    const nomPrix = findProp(["Prix"]);
    const nomAcompte = findProp(["Acompte"]);
    const nomPrenom = findProp(["Prénom"]);
    const nomFiltre = findProp(["filtre"]);
    const nomMusique = findProp(["Musique"]);
    const nomBosseurs = findProp(["Bosseur"]);
    const nomExtras = findProp(["Extra"]);
    const nomTel = findProp(["léphone"]);
    const nomEmail = findProp(["mail"]);
    const nomLieu = findProp(["Lieu"]);

    const properties = {
      "Nom": { title: [{ text: { content: nom } }] },
    };
    if (nomPrenom) properties[nomPrenom] = { rich_text: [{ text: { content: prenom || "" } }] };
    if (nomType) properties[nomType] = { select: { name: type || "Photo Booth" } };
    if (nomMachine) properties[nomMachine] = { multi_select: (machine || []).map(m => ({ name: m })) };
    if (nomDate && date) properties[nomDate] = { date: { start: date } };
    if (nomCreneau) properties[nomCreneau] = { rich_text: [{ text: { content: creneau || "" } }] };
    if (nomLieu) properties[nomLieu] = { rich_text: [{ text: { content: lieu || "" } }] };
    if (nomPrix) properties[nomPrix] = { number: montant || 0 };
    if (nomAcompte) properties[nomAcompte] = { number: acompte || 0 };
    if (nomTel && telephone && telephone.trim()) properties[nomTel] = { phone_number: telephone.trim() };
    if (nomEmail && email && email.trim()) properties[nomEmail] = { email: email.trim() };
    if (nomFiltre) properties[nomFiltre] = { rich_text: [{ text: { content: filtre || "" } }] };
    if (nomMusique && musique && musique.trim()) properties[nomMusique] = { url: musique.trim() };
    if (nomBosseurs) properties[nomBosseurs] = { multi_select: (bosseurs || []).map(b => ({ name: b })) };
    if (nomExtras) properties[nomExtras] = { multi_select: (extras || []).map(e => ({ name: e })) };
    if (nomStatut) properties[nomStatut] = { select: { name: statut || "À venir" } };

    const page = await createPage(DB_ID, properties);

    if (page.object === "error") {
      return res.status(500).json({ error: page.message });
    }
    return res.status(201).json({ id: page.id });
  }

  return res.status(405).json({ error: "Méthode non autorisée" });
}
