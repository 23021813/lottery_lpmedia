import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import multer from 'multer';
import dotenv from 'dotenv';
import { verifyTurnstileToken } from './services/turnstileService.js';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware để parse JSON
app.use(express.json());

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Check if file is an image
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

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

// API endpoint để verify submission với Turnstile
app.post('/api/verify-submission', async (req, res) => {
  try {
    const { captchaToken, formData } = req.body;
    
    console.log('=== TURNSTILE VERIFICATION DEBUG ===');
    console.log('Received captcha token:', captchaToken);
    console.log('Environment TURNSTILE_SECRET_KEY exists:', !!process.env.TURNSTILE_SECRET_KEY);
    console.log('Secret key value:', process.env.TURNSTILE_SECRET_KEY);
    
    // Get client IP
    const clientIP = req.headers['x-forwarded-for'] || 
                     req.connection.remoteAddress || 
                     req.socket.remoteAddress ||
                     (req.connection.socket ? req.connection.socket.remoteAddress : null);
    
    console.log('Client IP:', clientIP);

    // Verify Turnstile token
    const verification = await verifyTurnstileToken(captchaToken, clientIP);
    
    console.log('Verification result:', verification);
    
    if (!verification.success) {
      console.log('Verification failed, returning error');
      return res.status(400).json({
        success: false,
        error: verification.error || 'Captcha verification failed',
        errorCodes: verification.errorCodes
      });
    }

    // If verification successful, return success
    console.log('Verification successful, returning success');
    res.json({ 
      success: true, 
      message: 'Captcha verified successfully' 
    });
    
    console.log('Turnstile verification successful for IP:', clientIP);
    console.log('=== END DEBUG ===');
  } catch (error) {
    console.error('Error in submission verification:', error);
    res.status(500).json({
      success: false,
      error: 'Server error during verification',
      details: error.message
    });
  }
});

// API endpoint để upload logo image
app.post('/api/upload-logo', upload.single('logo'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        error: 'No file uploaded' 
      });
    }

    // Ensure public directory exists
    const publicDir = path.join(__dirname, 'public');
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true });
    }

    // Save the file as logo.png in public directory
    const logoPath = path.join(publicDir, 'logo.png');
    fs.writeFileSync(logoPath, req.file.buffer);

    // Also copy to dist/public for production
    const distPublicDir = path.join(__dirname, 'dist', 'public');
    if (!fs.existsSync(distPublicDir)) {
      fs.mkdirSync(distPublicDir, { recursive: true });
    }
    const distLogoPath = path.join(distPublicDir, 'logo.png');
    fs.writeFileSync(distLogoPath, req.file.buffer);

    res.json({ success: true });
    console.log('Logo image updated successfully in both public and dist/public directories');
  } catch (error) {
    console.error('Error uploading logo:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to upload logo', 
      details: error.message 
    });
  }
});

// API endpoint để remove logo
app.post('/api/remove-logo', (req, res) => {
  try {
    const logoPath = path.join(__dirname, 'public', 'logo.png');
    const distLogoPath = path.join(__dirname, 'dist', 'public', 'logo.png');

    // Remove logo from public directory
    if (fs.existsSync(logoPath)) {
      fs.unlinkSync(logoPath);
    }

    // Remove logo from dist/public directory
    if (fs.existsSync(distLogoPath)) {
      fs.unlinkSync(distLogoPath);
    }

    res.json({ success: true });
    console.log('Logo removed successfully from both directories');
  } catch (error) {
    console.error('Error removing logo:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to remove logo', 
      details: error.message 
    });
  }
});

// API endpoint để upload background image
app.post('/api/upload-background', upload.single('background'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        error: 'No file uploaded' 
      });
    }

    // Ensure public directory exists
    const publicDir = path.join(__dirname, 'public');
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true });
    }

    // Save the file as bg.jpeg in public directory
    const backgroundPath = path.join(publicDir, 'bg.jpeg');
    fs.writeFileSync(backgroundPath, req.file.buffer);

    // Also copy to dist/public for production
    const distPublicDir = path.join(__dirname, 'dist', 'public');
    if (!fs.existsSync(distPublicDir)) {
      fs.mkdirSync(distPublicDir, { recursive: true });
    }
    const distBackgroundPath = path.join(distPublicDir, 'bg.jpeg');
    fs.writeFileSync(distBackgroundPath, req.file.buffer);

    res.json({ success: true });
    console.log('Background image updated successfully in both public and dist/public directories');
  } catch (error) {
    console.error('Error uploading background:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to upload background', 
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
  console.log(`- POST /api/verify-submission`);
  console.log(`- POST /api/upload-logo`);
  console.log(`- POST /api/remove-logo`);
  console.log(`- POST /api/upload-background`);
});
