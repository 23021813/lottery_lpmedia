import path from 'path';
import fs from 'fs';
import { defineConfig, loadEnv } from 'vite';
import formidable from 'formidable';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      base: '/',
      server: {
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
