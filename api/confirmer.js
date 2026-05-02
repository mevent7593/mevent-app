const TOKEN = process.env.NOTION_TOKEN;

async function getPage(page_id) {
  const response = await fetch(`https://api.notion.com/v1/pages/${page_id}`, {
    headers: {
      "Authorization": `Bearer ${TOKEN}`,
      "Notion-Version": "2022-06-28",
    },
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
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Méthode non autorisée" });

  const { prestationId } = req.body;

  await updatePage(prestationId, {
    "Statut de l'évènement": { select: { name: "Confirmé" } },
  });

  const page = await getPage(prestationId);
  const prestation = {
    id: prestationId,
    client: [
      page.properties["Nom"]?.title?.[0]?.plain_text ?? "",
      page.properties["Prénom"]?.rich_text?.[0]?.plain_text ?? "",
    ].filter(Boolean).join(" "),
    type: page.properties["Type d'événement"]?.select?.name ?? "",
    date: page.properties["Date réservé"]?.date?.start ?? null,
    lieu: page.properties["Lieu"]?.rich_text?.[0]?.plain_text ?? "",
  };

  if (process.env.MAKE_WEBHOOK_URL) {
    await fetch(process.env.MAKE_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prestation, appUrl: process.env.VITE_APP_URL }),
    });
  }

  return res.status(200).json({ success: true });
}
