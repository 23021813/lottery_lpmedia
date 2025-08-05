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
          name: 'blob-api',
          configureServer(server) {
            // Import blobStorage dynamically for development
            let blobStorage;
            
            const initBlobStorage = async () => {
              if (!blobStorage) {
                try {
                  const module = await import('./services/blobStorage.js');
                  blobStorage = module.default;
                } catch (error) {
                  console.error('Vercel Blob not available in development:', error);
                  throw new Error('Vercel Blob is required. Please set BLOB_READ_WRITE_TOKEN environment variable.');
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
                    const result = await storage.saveConfig(data);
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify(result));
                  } catch (error) {
                    res.writeHead(500, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'Failed to save config to Vercel Blob', details: error.message }));
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
                    const result = await storage.saveCsv(content);
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify(result));
                  } catch (error) {
                    console.error('CSV write error:', error);
                    res.writeHead(500, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'Failed to save CSV to Vercel Blob', details: error.message }));
                  }
                });
              } else {
                next();
              }
            });

            // Add read endpoints for development
            server.middlewares.use('/api/read-config', async (req, res, next) => {
              if (req.method === 'GET') {
                try {
                  const storage = await initBlobStorage();
                  const config = await storage.getConfig();
                  res.writeHead(200, { 'Content-Type': 'application/json' });
                  res.end(JSON.stringify({ success: true, data: config }));
                } catch (error) {
                  res.writeHead(500, { 'Content-Type': 'application/json' });
                  res.end(JSON.stringify({ error: 'Failed to read config from Vercel Blob', details: error.message }));
                }
              } else {
                next();
              }
            });

            server.middlewares.use('/api/read-csv', async (req, res, next) => {
              if (req.method === 'GET') {
                try {
                  const storage = await initBlobStorage();
                  const csvContent = await storage.getCsv();
                  res.writeHead(200, { 'Content-Type': 'application/json' });
                  res.end(JSON.stringify({ success: true, data: csvContent }));
                } catch (error) {
                  res.writeHead(500, { 'Content-Type': 'application/json' });
                  res.end(JSON.stringify({ error: 'Failed to read CSV from Vercel Blob', details: error.message }));
                }
              } else {
                next();
              }
            });

            server.middlewares.use('/api/list-files', async (req, res, next) => {
              if (req.method === 'GET') {
                try {
                  const storage = await initBlobStorage();
                  const files = await storage.listFiles();
                  res.writeHead(200, { 'Content-Type': 'application/json' });
                  res.end(JSON.stringify({ success: true, data: files }));
                } catch (error) {
                  res.writeHead(500, { 'Content-Type': 'application/json' });
                  res.end(JSON.stringify({ error: 'Failed to list files from Vercel Blob', details: error.message }));
                }
              } else {
                next();
              }
            });
          }
        }
      ]
    };
});
