import path from 'path';
import fs from 'fs';
import { defineConfig, loadEnv } from 'vite';
import formidable from 'formidable';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      base: '/',
      server: {
        port: 3333,
        host: true,
        allowedHosts: ["funky-robin-noticeably.ngrok-free.app","reg.3nestinvest.com"],
        hmr: false,  // Tắt Hot Module Replacement
        watch: {
          ignored: ['**/node_modules/**', '**/dist/**']  // Ignore các thư mục không cần watch
        }
      },
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.ADMIN_PASSWORD': JSON.stringify(env.ADMIN_PASSWORD),
        'process.env.TURNSTILE_SECRET_KEY': JSON.stringify(env.TURNSTILE_SECRET_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      },
      plugins: [
        {
          name: 'copy-data-files',
          writeBundle() {
            // Copy data files to dist after build
            const dataDir = path.join(__dirname, 'data');
            const distDataDir = path.join(__dirname, 'dist', 'data');
            
            if (fs.existsSync(dataDir)) {
              if (!fs.existsSync(distDataDir)) {
                fs.mkdirSync(distDataDir, { recursive: true });
              }
              
              // Copy config.json
              const configPath = path.join(dataDir, 'config.json');
              const distConfigPath = path.join(distDataDir, 'config.json');
              if (fs.existsSync(configPath)) {
                fs.copyFileSync(configPath, distConfigPath);
                console.log('Copied config.json to dist/data/');
              }
              
              // Copy data.csv
              const csvPath = path.join(dataDir, 'data.csv');
              const distCsvPath = path.join(distDataDir, 'data.csv');
              if (fs.existsSync(csvPath)) {
                fs.copyFileSync(csvPath, distCsvPath);
                console.log('Copied data.csv to dist/data/');
              }

              // Copy data_import.csv
              const importCsvPath = path.join(dataDir, 'data_import.csv');
              const distImportCsvPath = path.join(distDataDir, 'data_import.csv');
              if (fs.existsSync(importCsvPath)) {
                fs.copyFileSync(importCsvPath, distImportCsvPath);
                console.log('Copied data_import.csv to dist/data/');
              }
            }

            // Copy Final.html
            const finalHtmlPath = path.join(__dirname, 'Final.html');
            const distFinalHtmlPath = path.join(__dirname, 'dist', 'Final.html');
            if (fs.existsSync(finalHtmlPath)) {
              fs.copyFileSync(finalHtmlPath, distFinalHtmlPath);
              console.log('Copied Final.html to dist/');
            }

            // Copy quayso.html
            const quaysoHtmlPath = path.join(__dirname, 'quayso.html');
            const distQuaysoHtmlPath = path.join(__dirname, 'dist', 'quayso.html');
            if (fs.existsSync(quaysoHtmlPath)) {
              fs.copyFileSync(quaysoHtmlPath, distQuaysoHtmlPath);
              console.log('Copied quayso.html to dist/');
            }
          }
        },
        {
          name: 'file-api',
          configureServer(server) {
            server.middlewares.use('/api/write-config', (req, res, next) => {
              if (req.method === 'POST') {
                let body = '';
                req.on('data', chunk => {
                  body += chunk.toString();
                });
                req.on('end', () => {
                try {
                    const data = JSON.parse(body);
                    const configPath = path.join(__dirname, 'data', 'config.json');
                    fs.writeFileSync(configPath, JSON.stringify(data, null, 2));
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ success: true }));
                  } catch (error) {
                    res.writeHead(500, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'Failed to write config file', details: error.message }));
                  }
                });
              } else {
                next();
              }
            });

            // Async Sequential Queue for atomic CSV write operations
            let csvQueue = Promise.resolve();
            const enqueueCsvTask = (task: () => Promise<any>) => {
              const next = csvQueue.then(task, task);
              csvQueue = next.catch(() => {});
              return next;
            };

            // API endpoint để submit registration an toàn với hàng đợi (Queue) chống race condition và bắt buộc Captcha
            server.middlewares.use('/api/submit-registration', (req, res, next) => {
              if (req.method === 'POST') {
                let body = '';
                req.on('data', chunk => {
                  body += chunk.toString();
                });
                req.on('end', async () => {
                  try {
                    const { name, phone, nationalId, agency, answer, captchaToken } = JSON.parse(body);
                    if (!name || !phone || !nationalId) {
                      res.writeHead(400, { 'Content-Type': 'application/json' });
                      res.end(JSON.stringify({ success: false, error: 'Thiếu thông tin bắt buộc (họ tên, SĐT, CCCD).' }));
                      return;
                    }

                    if (!captchaToken) {
                      res.writeHead(400, { 'Content-Type': 'application/json' });
                      res.end(JSON.stringify({ success: false, error: 'Vui lòng xác thực captcha.' }));
                      return;
                    }

                    // Get client IP
                    const clientIP = req.headers['x-forwarded-for'] || 
                                     (req as any).connection?.remoteAddress || 
                                     (req as any).socket?.remoteAddress || null;

                    process.env.TURNSTILE_SECRET_KEY = env.TURNSTILE_SECRET_KEY;
                    const { verifyTurnstileToken } = await import('./services/turnstileService.js');
                    const verification = await verifyTurnstileToken(captchaToken, clientIP);

                    if (!verification.success) {
                      res.writeHead(400, { 'Content-Type': 'application/json' });
                      res.end(JSON.stringify({ 
                        success: false, 
                        error: verification.error || 'Xác thực captcha thất bại. Vui lòng thử lại.' 
                      }));
                      return;
                    }

                    enqueueCsvTask(async () => {
                      try {

                      const csvPath = path.join(__dirname, 'data', 'data.csv');
                      const distCsvPath = path.join(__dirname, 'dist', 'data', 'data.csv');

                      // Ensure data directories exist
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
                        res.writeHead(400, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ success: false, error: duplicateReason }));
                        return;
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

                      res.writeHead(200, { 'Content-Type': 'application/json' });
                      res.end(JSON.stringify({ success: true, id: newId }));
                    } catch (err: any) {
                      console.error('Error in csv write task:', err);
                      res.writeHead(500, { 'Content-Type': 'application/json' });
                      res.end(JSON.stringify({ success: false, error: err.message }));
                    }
                  });
                } catch (err: any) {
                  console.error('Error in submit-registration:', err);
                  res.writeHead(500, { 'Content-Type': 'application/json' });
                  res.end(JSON.stringify({ success: false, error: err.message }));
                }
                });
              } else {
                next();
              }
            });

            server.middlewares.use('/api/write-csv', (req, res, next) => {
              if (req.method === 'POST') {
                let body = '';
                req.on('data', chunk => {
                  body += chunk.toString();
                });
                req.on('end', () => {
                  try {
                    console.log('CSV API called, body length:', body.length);
                    const { content } = JSON.parse(body);
                    console.log('Content to write, length:', content.length, 'first 100 chars:', content.substring(0, 100));
                    
                    const csvPath = path.join(__dirname, 'data', 'data.csv');
                    console.log('Writing to path:', csvPath);
                    
                    // Check if file exists and is writable
                    try {
                      fs.accessSync(csvPath, fs.constants.W_OK);
                      console.log('File is writable');
                    } catch (accessError) {
                      console.log('File access check failed:', accessError.message);
                    }
                    
                    fs.writeFileSync(csvPath, content);
                    console.log('File written successfully');
                    
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ success: true }));
                  } catch (error) {
                    console.error('CSV write error:', error);
                    res.writeHead(500, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'Failed to write CSV file', details: error.message }));
                  }
                });
              } else {
                next();
              }
            });

            // Verify submission API endpoint for development
            server.middlewares.use('/api/verify-submission', async (req, res, next) => {
              if (req.method === 'POST') {
                let body = '';
                req.on('data', chunk => {
                  body += chunk.toString();
                });
                req.on('end', async () => {
                  try {
                    const { captchaToken, formData } = JSON.parse(body);
                    
                    // Get client IP
                    const clientIP = req.headers['x-forwarded-for'] || 
                                     req.connection?.remoteAddress || 
                                     req.socket?.remoteAddress ||
                                     '127.0.0.1';

                    // Import and use turnstile service with env
                    process.env.TURNSTILE_SECRET_KEY = env.TURNSTILE_SECRET_KEY;
                    const { verifyTurnstileToken } = await import('./services/turnstileService.js');
                    const verification = await verifyTurnstileToken(captchaToken, clientIP);
                    
                    if (!verification.success) {
                      res.writeHead(400, { 'Content-Type': 'application/json' });
                      res.end(JSON.stringify({
                        success: false,
                        error: verification.error || 'Captcha verification failed',
                        errorCodes: verification.errorCodes
                      }));
                      return;
                    }

                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ 
                      success: true, 
                      message: 'Captcha verified successfully' 
                    }));
                    
                    console.log('Turnstile verification successful for IP:', clientIP);
                  } catch (error) {
                    console.error('Error in submission verification:', error);
                    res.writeHead(500, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({
                      success: false,
                      error: 'Server error during verification',
                      details: error.message
                    }));
                  }
                });
              } else {
                next();
              }
            });

            // Upload logo API endpoint for development
            server.middlewares.use('/api/upload-logo', (req, res, next) => {
              if (req.method === 'POST') {
                const form = formidable({
                  maxFileSize: 2 * 1024 * 1024, // 2MB for logo
                  filter: ({ mimetype }) => {
                    return !!(mimetype && mimetype.startsWith('image/'));
                  }
                });

                form.parse(req, (err, fields, files) => {
                  if (err) {
                    console.error('Logo upload error:', err);
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ success: false, error: err.message }));
                    return;
                  }

                  try {
                    const logoFile = Array.isArray(files.logo) 
                      ? files.logo[0] 
                      : files.logo;

                    if (!logoFile) {
                      res.writeHead(400, { 'Content-Type': 'application/json' });
                      res.end(JSON.stringify({ success: false, error: 'No file uploaded' }));
                      return;
                    }

                    // Ensure public directory exists
                    const publicDir = path.join(__dirname, 'public');
                    if (!fs.existsSync(publicDir)) {
                      fs.mkdirSync(publicDir, { recursive: true });
                    }

                    // Read file and save as logo.png
                    const fileData = fs.readFileSync(logoFile.filepath);
                    const logoPath = path.join(publicDir, 'logo.png');
                    fs.writeFileSync(logoPath, fileData);

                    console.log('Logo image updated successfully');
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ success: true }));
                  } catch (error) {
                    console.error('Error uploading logo:', error);
                    res.writeHead(500, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ success: false, error: 'Failed to upload logo', details: error.message }));
                  }
                });
              } else {
                next();
              }
            });

            // Remove logo API endpoint for development
            server.middlewares.use('/api/remove-logo', (req, res, next) => {
              if (req.method === 'POST') {
                try {
                  const logoPath = path.join(__dirname, 'public', 'logo.png');

                  // Remove logo from public directory
                  if (fs.existsSync(logoPath)) {
                    fs.unlinkSync(logoPath);
                  }

                  console.log('Logo removed successfully');
                  res.writeHead(200, { 'Content-Type': 'application/json' });
                  res.end(JSON.stringify({ success: true }));
                } catch (error) {
                  console.error('Error removing logo:', error);
                  res.writeHead(500, { 'Content-Type': 'application/json' });
                  res.end(JSON.stringify({ success: false, error: 'Failed to remove logo', details: error.message }));
                }
              } else {
                next();
              }
            });

            // Upload background API endpoint for development
            server.middlewares.use('/api/upload-background', (req, res, next) => {
              if (req.method === 'POST') {
                const form = formidable({
                  maxFileSize: 5 * 1024 * 1024, // 5MB
                  filter: ({ mimetype }) => {
                    return !!(mimetype && mimetype.startsWith('image/'));
                  }
                });

                form.parse(req, (err, fields, files) => {
                  if (err) {
                    console.error('Upload error:', err);
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ success: false, error: err.message }));
                    return;
                  }

                  try {
                    const backgroundFile = Array.isArray(files.background) 
                      ? files.background[0] 
                      : files.background;

                    if (!backgroundFile) {
                      res.writeHead(400, { 'Content-Type': 'application/json' });
                      res.end(JSON.stringify({ success: false, error: 'No file uploaded' }));
                      return;
                    }

                    // Ensure public directory exists
                    const publicDir = path.join(__dirname, 'public');
                    if (!fs.existsSync(publicDir)) {
                      fs.mkdirSync(publicDir, { recursive: true });
                    }

                    // Read file and save as bg.jpeg
                    const fileData = fs.readFileSync(backgroundFile.filepath);
                    const backgroundPath = path.join(publicDir, 'bg.jpeg');
                    fs.writeFileSync(backgroundPath, fileData);

                    console.log('Background image updated successfully');
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ success: true }));
                  } catch (error) {
                    console.error('Error uploading background:', error);
                    res.writeHead(500, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ success: false, error: 'Failed to upload background', details: error.message }));
                  }
                });
              } else {
                next();
              }
            });
          }
        }
      ]
    };
});
