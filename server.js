import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware để parse JSON
app.use(express.json());

// Serve static files from dist directory
app.use(express.static(path.join(__dirname, 'dist')));

// API endpoint để write config file
app.post('/api/write-config', (req, res) => {
  try {
    const config = req.body;
    const configPath = path.join(__dirname, 'data', 'config.json');
    
    // Ensure data directory exists
    const dataDir = path.join(__dirname, 'data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
    res.json({ success: true });
    console.log('Config file updated successfully');
  } catch (error) {
    console.error('Error writing config file:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to write config file', 
      details: error.message 
    });
  }
});

// API endpoint để write CSV file
app.post('/api/write-csv', (req, res) => {
  try {
    const { content } = req.body;
    const csvPath = path.join(__dirname, 'data', 'data.csv');
    
    // Ensure data directory exists
    const dataDir = path.join(__dirname, 'data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    
    fs.writeFileSync(csvPath, content);
    res.json({ success: true });
    console.log('CSV file updated successfully');
  } catch (error) {
    console.error('Error writing CSV file:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to write CSV file', 
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
  console.log(`- POST /api/write-config`);
  console.log(`- POST /api/write-csv`);
});
