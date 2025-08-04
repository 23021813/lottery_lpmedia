import path from 'path';
import fs from 'fs';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      base: '/lottery_lpmedia/',
      build: {
        assetsDir: 'assets',
        rollupOptions: {
          output: {
            manualChunks: undefined,
          }
        }
      },
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
          }
        }
      ]
    };
});
