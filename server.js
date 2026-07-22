import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 7020;

// Serve static assets from dist folder
app.use(express.static(path.join(__dirname, 'dist')));

// SPA fallback for React Router (using modern route handler to prevent path-to-regexp wildcard errors)
app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`MarsCargo B2B Production Server running on http://localhost:${PORT}`);
});
