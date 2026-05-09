const EMAILS_AUTORISES = [
  "jojo.kabz14@gmail.com",
  "mouss.kebe@gmail.com",
  "lassana.diakhate@gmail.com",
  "kabaibrahima.pro@gmail.com",
  "mrouerdani@gmail.com",
];

const PASSWORD = "Lesmdu7593@event";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Méthode non autorisée" });

  const { email } = req.body;
  if (!email) return res.status(400).json({ error: "Email manquant" });

  const emailNormalise = email.trim().toLowerCase();
  if (!EMAILS_AUTORISES.includes(emailNormalise)) {
    return res.status(403).json({ error: "Cet email n'est pas autorisé" });
  }

  const webhookUrl = process.env.MAKE_FORGOT_PASSWORD_WEBHOOK;
  if (!webhookUrl) {
    return res.status(500).json({ error: "Webhook non configuré" });
  }

  await fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: emailNormalise, password: PASSWORD }),
  });

  return res.status(200).json({ success: true });
}
