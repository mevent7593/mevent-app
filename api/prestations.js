import { Client } from "@notionhq/client";

const notion = new Client({ auth: process.env.NOTION_TOKEN });
const DB_ID = process.env.NOTION_DB_PRESTATIONS;

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
      lieu: (page.properties["Lieu"]?.rich_text?.map(r => r.plain_text).join("") ?? "").replace(/\s*See More\s*/gi, "").trim(),
      montant: page.properties["Prix de la presta "]?.number ?? 0,
      acompte: page.properties["Acompte payé"]?.number ?? 0,
      statut: page.properties["Statut de l'évènement"]?.select?.name ?? "À venir",
      bosseurs: page.properties["Les Bosseurs"]?.multi_select?.map(b => b.name) ?? [],
      telephone: page.properties["Téléphone"]?.phone_number ?? "",
      email: page.properties["E-mail"]?.email ?? "",
      filtre: page.properties["Nom sur le filtre"]?.rich_text?.[0]?.plain_text ?? "",
    }));

    return res.status(200).json(prestations);
  }

  if (req.method === "POST") {
    const { nom, prenom, type, machine, date, lieu, montant, telephone, email, filtre } = req.body;

    const page = await createPage(DB_ID, {
      "Nom": { title: [{ text: { content: nom } }] },
      "Prénom": { rich_text: [{ text: { content: prenom || "" } }] },
      "Type d'événement": { select: { name: type || "Photo Booth" } },
      "Machine utilisée ": { multi_select: (machine || []).map(m => ({ name: m })) },
      "Date réservé": { date: { start: date } },
      "Lieu": { rich_text: [{ text: { content: lieu || "" } }] },
      "Prix de la presta ": { number: montant || 0 },
      "Téléphone": { phone_number: telephone || "" },
      "E-mail": { email: email || "" },
      "Nom sur le filtre": { rich_text: [{ text: { content: filtre || "" } }] },
      "Statut de l'évènement": { select: { name: "À venir" } },
    });

    return res.status(201).json({ id: page.id });
  }

  return res.status(405).json({ error: "Méthode non autorisée" });
}
