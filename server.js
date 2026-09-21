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

// Serve static files from dist directory, with fallback to public and root
app.use(express.static(path.join(__dirname, 'dist')));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(__dirname));

// API endpoint để write config file
app.post('/api/write-config', (req, res) => {
  try {
    const config = req.body;
    
    // Write to both locations for consistency
    const configPath = path.join(__dirname, 'data', 'config.json');
    const distConfigPath = path.join(__dirname, 'dist', 'data', 'config.json');
    
    // Ensure data directories exist
    const dataDir = path.join(__dirname, 'data');
    const distDataDir = path.join(__dirname, 'dist', 'data');
    
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    if (!fs.existsSync(distDataDir)) {
      fs.mkdirSync(distDataDir, { recursive: true });
    }
    
    // Write to both locations
    const configContent = JSON.stringify(config, null, 2);
    fs.writeFileSync(configPath, configContent);
    fs.writeFileSync(distConfigPath, configContent);
    
    res.json({ success: true });
    console.log('Config file updated successfully in both data/ and dist/data/');
  } catch (error) {
    console.error('Error writing config file:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to write config file', 
      details: error.message 
    });
  }
});

// Async Sequential Queue for atomic CSV write operations
let csvQueue = Promise.resolve();
const enqueueCsvTask = (task) => {
  const next = csvQueue.then(task, task);
  csvQueue = next.catch(() => {});
  return next;
};

// API endpoint để submit registration an toàn với hàng đợi (Queue) chống race condition và bắt buộc Captcha
app.post('/api/submit-registration', async (req, res) => {
  try {
    const { name, phone, nationalId, agency, answer, captchaToken } = req.body;
    if (!name || !phone || !nationalId) {
      return res.status(400).json({ success: false, error: 'Thiếu thông tin bắt buộc (họ tên, SĐT, CCCD).' });
    }

    if (!captchaToken) {
      return res.status(400).json({ success: false, error: 'Vui lòng xác thực captcha.' });
    }

    // Get client IP
    const clientIP = req.headers['x-forwarded-for'] || 
                     req.connection?.remoteAddress || 
                     req.socket?.remoteAddress || null;

    const verification = await verifyTurnstileToken(captchaToken, clientIP);
    if (!verification.success) {
      return res.status(400).json({ 
        success: false, 
        error: verification.error || 'Xác thực captcha thất bại. Vui lòng thử lại.' 
      });
    }

    enqueueCsvTask(async () => {
      try {
        const csvPath = path.join(__dirname, 'data', 'data.csv');
        const distCsvPath = path.join(__dirname, 'dist', 'data', 'data.csv');

      const dataDir = path.join(__dirname, 'data');
      const distDataDir = path.join(__dirname, 'dist', 'data');
      if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
      if (!fs.existsSync(distDataDir)) fs.mkdirSync(distDataDir, { recursive: true });

      let content = '';
      if (fs.existsSync(csvPath)) {
        content = fs.readFileSync(csvPath, 'utf8');
      } else {
        content = 'id,name,phone,nationalId,agency,answer,prizeWon\n';
      }

      const lines = content.trim().split('\n');
      let maxId = 0;
      let isDuplicate = false;
      let duplicateReason = '';

      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        const parts = line.split(',').map(f => f.replace(/^"|"$/g, '').trim());
        const curId = parseInt(parts[0], 10);
        if (!isNaN(curId) && curId > maxId) {
          maxId = curId;
        }
        const curPhone = parts[2] || '';
        const curNationalId = parts[3] || '';
        if (curPhone === String(phone).trim()) {
          isDuplicate = true;
          duplicateReason = 'Số điện thoại này đã được đăng ký.';
          break;
        }
        if (curNationalId === String(nationalId).trim()) {
          isDuplicate = true;
          duplicateReason = 'Số CCCD này đã được đăng ký.';
          break;
        }
      }

      if (isDuplicate) {
        return res.status(400).json({ success: false, error: duplicateReason });
      }

      const newId = maxId + 1;
      const cleanName = (name || '').trim().replace(/"/g, '""');
      const cleanPhone = String(phone).trim();
      const cleanNationalId = String(nationalId).trim();
      const cleanAgency = (agency || '').trim().replace(/"/g, '""');
      const cleanAnswer = (answer || '').trim().replace(/"/g, '""');
      const newRow = `${newId},"${cleanName}","${cleanPhone}","${cleanNationalId}","${cleanAgency}","${cleanAnswer}",""`;

      const newContent = content.endsWith('\n') ? content + newRow + '\n' : content + '\n' + newRow + '\n';
      fs.writeFileSync(csvPath, newContent);
      if (fs.existsSync(distDataDir)) {
        fs.writeFileSync(distCsvPath, newContent);
      }

      res.json({ success: true, id: newId });
    } catch (err) {
      console.error('Error in csv write task:', err);
      res.status(500).json({ success: false, error: err.message });
    }
  });
  } catch (err) {
    console.error('Error in submit-registration:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// API endpoint để write CSV file
app.post('/api/write-csv', (req, res) => {
  try {
    const { content } = req.body;
    
    // Write to both locations for consistency
    const csvPath = path.join(__dirname, 'data', 'data.csv');
    const distCsvPath = path.join(__dirname, 'dist', 'data', 'data.csv');
    
    // Ensure data directories exist
    const dataDir = path.join(__dirname, 'data');
    const distDataDir = path.join(__dirname, 'dist', 'data');
    
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    if (!fs.existsSync(distDataDir)) {
      fs.mkdirSync(distDataDir, { recursive: true });
    }
    
    // Write to both locations
    fs.writeFileSync(csvPath, content);
    fs.writeFileSync(distCsvPath, content);
    
    res.json({ success: true });
    console.log('CSV file updated successfully in both data/ and dist/data/');
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

    // Also copy to dist root and dist/public for production
    const distDir = path.join(__dirname, 'dist');
    if (fs.existsSync(distDir)) {
      fs.writeFileSync(path.join(distDir, 'logo.png'), req.file.buffer);
      const distPublicDir = path.join(distDir, 'public');
      if (!fs.existsSync(distPublicDir)) {
        fs.mkdirSync(distPublicDir, { recursive: true });
      }
      fs.writeFileSync(path.join(distPublicDir, 'logo.png'), req.file.buffer);
    }

    res.json({ success: true });
    console.log('Logo image updated successfully in both public/ and dist/ directories');
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
    const distLogoPath = path.join(__dirname, 'dist', 'logo.png');
    const distPublicLogoPath = path.join(__dirname, 'dist', 'public', 'logo.png');

    // Remove logo from public directory
    if (fs.existsSync(logoPath)) {
      fs.unlinkSync(logoPath);
    }

    // Remove logo from dist directory
    if (fs.existsSync(distLogoPath)) {
      fs.unlinkSync(distLogoPath);
    }
    if (fs.existsSync(distPublicLogoPath)) {
      fs.unlinkSync(distPublicLogoPath);
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

    // Also copy to dist root and dist/public for production
    const distDir = path.join(__dirname, 'dist');
    if (fs.existsSync(distDir)) {
      fs.writeFileSync(path.join(distDir, 'bg.jpeg'), req.file.buffer);
      const distPublicDir = path.join(distDir, 'public');
      if (!fs.existsSync(distPublicDir)) {
        fs.mkdirSync(distPublicDir, { recursive: true });
      }
      fs.writeFileSync(path.join(distPublicDir, 'bg.jpeg'), req.file.buffer);
    }

    res.json({ success: true });
    console.log('Background image updated successfully in both public/ and dist/ directories');
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
