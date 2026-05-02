const DB_DISPOS = process.env.NOTION_DB_DISPOS;
const TOKEN = process.env.NOTION_TOKEN;

async function queryDatabase(database_id, filter) {
  const body = filter ? { filter } : {};
  const response = await fetch(`https://api.notion.com/v1/databases/${database_id}/query`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${TOKEN}`,
      "Notion-Version": "2022-06-28",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  return response.json();
}

async function createPage(properties) {
  const response = await fetch("https://api.notion.com/v1/pages", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${TOKEN}`,
      "Notion-Version": "2022-06-28",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ parent: { database_id: DB_DISPOS }, properties }),
  });
  return response.json();
}

async function updatePage(page_id, properties) {
  const response = await fetch(`https://api.notion.com/v1/pages/${page_id}`, {
    method: "PATCH",
    headers: {
      "Authorization": `Bearer ${TOKEN}`,
      "Notion-Version": "2022-06-28",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ properties }),
  });
  return response.json();
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();

  if (req.method === "GET") {
    const { prestationId } = req.query;
    const data = await queryDatabase(DB_DISPOS, {
      property: "Prestation",
      relation: { contains: prestationId },
    });

    const dispos = (data.results || []).map((page) => ({
      id: page.id,
      membreId: page.properties["Membre"]?.relation?.[0]?.id ?? null,
      membre: page.properties["Membre"]?.relation?.[0]?.id ?? "",
      disponible: page.properties["Disponible"]?.select?.name ?? "En attente",
      reponduLe: page.properties["Répondu le"]?.date?.start ?? null,
    }));

    return res.status(200).json(dispos);
  }

  if (req.method === "POST") {
    const { prestationId, membreId, disponible } = req.body;
    const today = new Date().toISOString().split("T")[0];

    const existing = await queryDatabase(DB_DISPOS, {
      and: [
        { property: "Prestation", relation: { contains: prestationId } },
        { property: "Membre", relation: { contains: membreId } },
      ],
    });

    if (existing.results?.length > 0) {
      await updatePage(existing.results[0].id, {
        "Disponible": { select: { name: disponible } },
        "Répondu le": { date: { start: today } },
      });
    } else {
      await createPage({
        "Titre": { title: [{ text: { content: `Dispo ${membreId}` } }] },
        "Prestation": { relation: [{ id: prestationId }] },
        "Membre": { relation: [{ id: membreId }] },
        "Disponible": { select: { name: disponible } },
        "Répondu le": { date: { start: today } },
      });
    }

    return res.status(200).json({ success: true });
  }

  return res.status(405).json({ error: "Méthode non autorisée" });
}
