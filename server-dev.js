// Serveur de développement local pour simuler les Vercel Functions
import 'dotenv/config';
import express from 'express';
import { createServer } from 'vite';

const app = express();
app.use(express.json());

// Import dynamique des handlers API
const routes = ['prestations', 'confirmer', 'disponibilite', 'membres'];
for (const route of routes) {
  const { default: handler } = await import(`./api/${route}.js`);
  app.all(`/api/${route}`, handler);
}

app.listen(3001, () => console.log('API dev server running on http://localhost:3001'));
