import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import blobStorage from './services/blobStorage.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware để parse JSON
app.use(express.json());

// Serve static files from dist directory
app.use(express.static(path.join(__dirname, 'dist')));

// API endpoint để write config file (using Vercel Blob)
app.post('/api/write-config', async (req, res) => {
  try {
    const config = req.body;
    const result = await blobStorage.saveConfig(config);
    res.json(result);
    console.log('Config saved to Vercel Blob successfully');
  } catch (error) {
    console.error('Error saving config to Vercel Blob:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to save config to Vercel Blob', 
      details: error.message 
    });
  }
});

// API endpoint để write CSV file (using Vercel Blob)
app.post('/api/write-csv', async (req, res) => {
  try {
    const { content } = req.body;
    const result = await blobStorage.saveCsv(content);
    res.json(result);
    console.log('CSV saved to Vercel Blob successfully');
  } catch (error) {
    console.error('Error saving CSV to Vercel Blob:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to save CSV to Vercel Blob', 
      details: error.message 
    });
  }
});

// API endpoint để read config file (from Vercel Blob)
app.get('/api/read-config', async (req, res) => {
  try {
    const config = await blobStorage.getConfig();
    res.json({ success: true, data: config });
    console.log('Config loaded from Vercel Blob successfully');
  } catch (error) {
    console.error('Error loading config from Vercel Blob:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to load config from Vercel Blob', 
      details: error.message 
    });
  }
});

// API endpoint để read CSV file (from Vercel Blob)
app.get('/api/read-csv', async (req, res) => {
  try {
    const csvContent = await blobStorage.getCsv();
    res.json({ success: true, data: csvContent });
    console.log('CSV loaded from Vercel Blob successfully');
  } catch (error) {
    console.error('Error loading CSV from Vercel Blob:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to load CSV from Vercel Blob', 
      details: error.message 
    });
  }
});

// API endpoint để list all files (from Vercel Blob)
app.get('/api/list-files', async (req, res) => {
  try {
    const files = await blobStorage.listFiles();
    res.json({ success: true, data: files });
    console.log('Files listed from Vercel Blob successfully');
  } catch (error) {
    console.error('Error listing files from Vercel Blob:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to list files from Vercel Blob', 
      details: error.message 
    });
  }
});

// Serve static files and handle client-side routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Production server running on port ${PORT}`);
  console.log(`API endpoints available:`);
  console.log(`- POST /api/write-config (save to Vercel Blob)`);
  console.log(`- POST /api/write-csv (save to Vercel Blob)`);
  console.log(`- GET /api/read-config (load from Vercel Blob)`);
  console.log(`- GET /api/read-csv (load from Vercel Blob)`);
  console.log(`- GET /api/list-files (list all files in Vercel Blob)`);
});
