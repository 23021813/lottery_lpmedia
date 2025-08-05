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
                
                // Set write permissions (readable and writable for owner, readable for group and others)
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
            server.middlewares.use('/api/write-config', (req, res, next) => {
              if (req.method === 'POST') {
                let body = '';
                req.on('data', chunk => {
                  body += chunk.toString();
                });
                req.on('end', () => {
                  try {
                    const data = JSON.parse(body);
                    const dataDir = path.join(__dirname, 'data');
                    const configPath = path.join(dataDir, 'config.json');
                    
                    // Ensure data directory exists with write permissions
                    if (!fs.existsSync(dataDir)) {
                      fs.mkdirSync(dataDir, { recursive: true });
                      try {
                        fs.chmodSync(dataDir, 0o755);
                      } catch (chmodError) {
                        console.warn('Could not set directory permissions:', chmodError.message);
                      }
                    }
                    
                    // Write file
                    fs.writeFileSync(configPath, JSON.stringify(data, null, 2));
                    
                    // Set file permissions
                    try {
                      fs.chmodSync(configPath, 0o644);
                    } catch (chmodError) {
                      console.warn('Could not set file permissions:', chmodError.message);
                    }
                    
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
                    
                    const dataDir = path.join(__dirname, 'data');
                    const csvPath = path.join(dataDir, 'data.csv');
                    console.log('Writing to path:', csvPath);
                    
                    // Ensure data directory exists with write permissions
                    if (!fs.existsSync(dataDir)) {
                      fs.mkdirSync(dataDir, { recursive: true });
                      try {
                        fs.chmodSync(dataDir, 0o755);
                      } catch (chmodError) {
                        console.warn('Could not set directory permissions:', chmodError.message);
                      }
                    }
                    
                    // Check if file exists and is writable
                    try {
                      fs.accessSync(csvPath, fs.constants.W_OK);
                      console.log('File is writable');
                    } catch (accessError) {
                      console.log('File access check failed:', accessError.message);
                    }
                    
                    // Write file
                    fs.writeFileSync(csvPath, content);
                    
                    // Set file permissions
                    try {
                      fs.chmodSync(csvPath, 0o644);
                    } catch (chmodError) {
                      console.warn('Could not set file permissions:', chmodError.message);
                    }
                    
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
