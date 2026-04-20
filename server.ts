import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware
  app.use(express.json());

  // API Endpoint for Ads
  // In a real app, you would use firebase-admin to fetch from Firestore here.
  // For this demonstration, we'll return a proxy-like response or instructions.
  app.get('/api/vast', (req, res) => {
    const { videoId, category } = req.query;
    console.log(`Ad requested for video: ${videoId}, category: ${category}`);
    
    // This is a sample response. The frontend can also fetch directly from Firestore.
    // But the user specifically asked for a server-side route.
    res.json({
      success: true,
      message: "Ad endpoint active",
      note: "Use Firestore directly for real-time data, or integrate firebase-admin here with a service account."
    });
  });

  // Vite integration
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
