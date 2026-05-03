export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();

  if (req.method === "GET") {
    const response = await fetch(`https://api.notion.com/v1/databases/${process.env.NOTION_DB_DEPENSES}/query`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.NOTION_TOKEN}`,
        "Notion-Version": "2022-06-28",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ page_size: 100 }),
    });
    const data = await response.json();

    const depenses = (data.results || []).map((page) => {
      const props = page.properties;
      const labelKey = Object.keys(props).find(k => props[k].type === "title");
      const montantKey = Object.keys(props).find(k => props[k].type === "number");
      return {
        id: page.id,
        label: props[labelKey]?.title?.[0]?.plain_text?.trim() ?? "",
        montant: props[montantKey]?.number ?? 0,
      };
    }).filter(d => d.label);

    return res.status(200).json(depenses);
  }

  return res.status(405).json({ error: "Méthode non autorisée" });
}
