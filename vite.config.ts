import path from 'path';
import fs from 'fs';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      base: '/',
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.ADMIN_PASSWORD': JSON.stringify(env.ADMIN_PASSWORD)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      },
      plugins: [
        {
          name: 'copy-data-folder',
          writeBundle() {
            // Copy data folder to dist after build
            const srcDir = path.join(__dirname, 'data');
            const destDir = path.join(__dirname, 'dist', 'data');
            
            if (fs.existsSync(srcDir)) {
              // Create dist/data directory if it doesn't exist
              if (!fs.existsSync(destDir)) {
                fs.mkdirSync(destDir, { recursive: true });
              }
              
              // Copy all files from data/ to dist/data/ with write permissions
              const files = fs.readdirSync(srcDir);
              files.forEach(file => {
                const srcFile = path.join(srcDir, file);
                const destFile = path.join(destDir, file);
                
                // Copy file
                fs.copyFileSync(srcFile, destFile);
                
                //  Set write permissions (readable and writable for owner, readable for group and others)
                try {
                  fs.chmodSync(destFile, 0o644);
                } catch (chmodError) {
                  console.warn(`Warning: Could not set permissions for ${destFile}:`, chmodError.message);
                }
              });
              
              // Also set write permissions for the directory
              try {
                fs.chmodSync(destDir, 0o755);
              } catch (chmodError) {
                console.warn(`Warning: Could not set permissions for directory ${destDir}:`, chmodError.message);
              }
              
              console.log('✅ Copied data folder to dist/data with write permissions');
            }
          }
        },
        {
          name: 'file-api',
          configureServer(server) {
            // Import blobStorage dynamically for development
            let blobStorage;
            
            const initBlobStorage = async () => {
              if (!blobStorage) {
                try {
                  const module = await import('./services/blobStorage.js');
                  blobStorage = module.default;
                } catch (error) {
                  console.warn('Vercel Blob not available in development, falling back to local files');
                  blobStorage = null;
                }
              }
              return blobStorage;
            };

            server.middlewares.use('/api/write-config', async (req, res, next) => {
              if (req.method === 'POST') {
                let body = '';
                req.on('data', chunk => {
                  body += chunk.toString();
                });
                req.on('end', async () => {
                  try {
                    const data = JSON.parse(body);
                    const storage = await initBlobStorage();
                    
                    if (storage) {
                      // Use Vercel Blob in development if available
                      const result = await storage.saveConfig(data);
                      res.writeHead(200, { 'Content-Type': 'application/json' });
                      res.end(JSON.stringify(result));
                    } else {
                      // Fallback to local file system
                      const dataDir = path.join(__dirname, 'data');
                      const configPath = path.join(dataDir, 'config.json');
                      
                      if (!fs.existsSync(dataDir)) {
                        fs.mkdirSync(dataDir, { recursive: true });
                      }
                      
                      fs.writeFileSync(configPath, JSON.stringify(data, null, 2));
                      res.writeHead(200, { 'Content-Type': 'application/json' });
                      res.end(JSON.stringify({ success: true }));
                    }
                  } catch (error) {
                    res.writeHead(500, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'Failed to write config file', details: error.message }));
                  }
                });
              } else {
                next();
              }
            });

            server.middlewares.use('/api/write-csv', async (req, res, next) => {
              if (req.method === 'POST') {
                let body = '';
                req.on('data', chunk => {
                  body += chunk.toString();
                });
                req.on('end', async () => {
                  try {
                    const { content } = JSON.parse(body);
                    const storage = await initBlobStorage();
                    
                    if (storage) {
                      // Use Vercel Blob in development if available
                      const result = await storage.saveCsv(content);
                      res.writeHead(200, { 'Content-Type': 'application/json' });
                      res.end(JSON.stringify(result));
                    } else {
                      // Fallback to local file system
                      const dataDir = path.join(__dirname, 'data');
                      const csvPath = path.join(dataDir, 'data.csv');
                      
                      if (!fs.existsSync(dataDir)) {
                        fs.mkdirSync(dataDir, { recursive: true });
                      }
                      
                      fs.writeFileSync(csvPath, content);
                      res.writeHead(200, { 'Content-Type': 'application/json' });
                      res.end(JSON.stringify({ success: true }));
                    }
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
          }
        }
      ]
    };
});
