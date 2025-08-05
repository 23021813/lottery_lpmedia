# 🚀 Hướng dẫn Deploy Lucky Draw Registration App

## 📋 Tổng quan dự án

Đây là một ứng dụng full-stack bao gồm:
- **Frontend**: React + TypeScript + Vite
- **Backend**: Express.js server
- **Database**: File-based (JSON + CSV)
- **Base URL**: `/lottery_lpmedia/`

## 🏗️ Kiến trúc ứng dụng

```
├── Frontend (React + Vite)
│   ├── Build output: /dist
│   ├── Base path: /lottery_lpmedia/
│   └── Static assets: /public
├── Backend (Express.js)
│   ├── Server file: server.js
│   ├── Port: 3000 (default)
│   └── API endpoints:
│       ├── POST /api/write-config
│       └── POST /api/write-csv
└── Data Storage
    ├── /data/config.json
    └── /data/data.csv
```

## 🔧 Yêu cầu hệ thống

- **Node.js**: >= 18.0.0
- **NPM**: >= 8.0.0
- **RAM**: >= 512MB
- **Disk**: >= 100MB

## ⚙️ Biến môi trường

Tạo file `.env` hoặc `.env.local`:

```env
# Required
GEMINI_API_KEY=your_gemini_api_key_here
ADMIN_PASSWORD=your_admin_password_here

# Optional
PORT=3000
NODE_ENV=production
```

## 🚀 Các phương pháp Deploy

### 1. 🖥️ Deploy trên VPS/Server riêng (Khuyến nghị)

#### Bước 1: Chuẩn bị server
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install -y curl

# Cài đặt Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Cài đặt PM2
sudo npm install -g pm2

# Cài đặt Nginx (optional - cho reverse proxy)
sudo apt install -y nginx
```

#### Bước 2: Upload và cài đặt
```bash
# Clone hoặc upload code
git clone <your-repo-url>
cd lucky-draw-registration-app

# Cài đặt dependencies
npm install

# Tạo file môi trường
cp .env.example .env
# Chỉnh sửa .env với thông tin thực tế

# Build ứng dụng
npm run build:full
```

#### Bước 3: Chạy với PM2
```bash
# Start ứng dụng
pm2 start ecosystem.config.js --env production

# Lưu cấu hình PM2
pm2 save

# Tự động khởi động khi server reboot
pm2 startup
sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u $USER --hp $HOME
```

#### Bước 4: Cấu hình Nginx (Optional)
```nginx
# /etc/nginx/sites-available/lucky-draw
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Kích hoạt site
sudo ln -s /etc/nginx/sites-available/lucky-draw /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 2. ☁️ Deploy trên Heroku

#### Chuẩn bị files:
- ✅ `Procfile` (đã tạo)
- ✅ `package.json` với script "start"

#### Deploy commands:
```bash
# Cài đặt Heroku CLI
# https://devcenter.heroku.com/articles/heroku-cli

# Login và tạo app
heroku login
heroku create your-app-name

# Set environment variables
heroku config:set GEMINI_API_KEY=your_api_key_here
heroku config:set ADMIN_PASSWORD=your_admin_password
heroku config:set NODE_ENV=production

# Deploy
git add .
git commit -m "Deploy to Heroku"
git push heroku main

# Mở ứng dụng
heroku open
```

### 3. ⚡ Deploy trên Vercel

#### Lưu ý quan trọng:
- Vercel phù hợp cho frontend, nhưng có hạn chế với file system
- API endpoints sẽ chạy như serverless functions
- Data persistence có thể gặp vấn đề

#### Deploy:
```bash
# Cài đặt Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables
vercel env add GEMINI_API_KEY
vercel env add ADMIN_PASSWORD
```

### 4. 🚂 Deploy trên Railway

#### Deploy commands:
```bash
# Cài đặt Railway CLI
npm install -g @railway/cli

# Login và deploy
railway login
railway init
railway up

# Set environment variables
railway variables set GEMINI_API_KEY=your_api_key_here
railway variables set ADMIN_PASSWORD=your_admin_password
```

### 5. 🐳 Deploy với Docker

#### Tạo Dockerfile:
```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Build application
RUN npm run build:full

# Create data directory
RUN mkdir -p data

# Expose port
EXPOSE 3000

# Start application
CMD ["npm", "start"]
```

#### Docker commands:
```bash
# Build image
docker build -t lucky-draw-app .

# Run container
docker run -d \
  --name lucky-draw \
  -p 3000:3000 \
  -e GEMINI_API_KEY=your_api_key \
  -e ADMIN_PASSWORD=your_password \
  -v $(pwd)/data:/app/data \
  lucky-draw-app
```

## 🔍 Kiểm tra sau khi deploy

### 1. Health Check
```bash
# Kiểm tra server
curl http://your-domain.com/lottery_lpmedia/

# Kiểm tra API endpoints
curl -X POST http://your-domain.com/api/write-config \
  -H "Content-Type: application/json" \
  -d '{"test": true}'
```

### 2. Logs
```bash
# PM2 logs
pm2 logs lucky-draw-app

# Docker logs
docker logs lucky-draw

# Heroku logs
heroku logs --tail
```

## 🛠️ Troubleshooting

### Lỗi thường gặp:

#### 1. Port đã được sử dụng
```bash
# Tìm process đang dùng port 3000
sudo lsof -i :3000
# Kill process
sudo kill -9 <PID>
```

#### 2. Permission denied khi ghi file
```bash
# Cấp quyền cho thư mục data
chmod 755 data/
chmod 644 data/*.json data/*.csv
```

#### 3. Module not found
```bash
# Xóa node_modules và cài lại
rm -rf node_modules package-lock.json
npm install
```

#### 4. Build failed
```bash
# Kiểm tra Node.js version
node --version  # Should be >= 18

# Clear cache và build lại
npm run build:full
```

## 📊 Monitoring và Maintenance

### 1. PM2 Monitoring
```bash
# Xem status
pm2 status

# Restart app
pm2 restart lucky-draw-app

# Reload app (zero downtime)
pm2 reload lucky-draw-app

# Monitor resources
pm2 monit
```

### 2. Backup Data
```bash
# Backup script
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
tar -czf backup_$DATE.tar.gz data/
```

### 3. Auto-update Script
```bash
#!/bin/bash
# update.sh
git pull origin main
npm install
npm run build:full
pm2 reload lucky-draw-app
```

## 🔐 Security Checklist

- [ ] Set strong ADMIN_PASSWORD
- [ ] Use HTTPS in production
- [ ] Restrict API access if needed
- [ ] Regular backup data files
- [ ] Monitor server resources
- [ ] Keep Node.js updated
- [ ] Use firewall rules

## 📞 Support

Nếu gặp vấn đề trong quá trình deploy, hãy kiểm tra:

1. **Logs**: Luôn kiểm tra logs đầu tiên
2. **Environment variables**: Đảm bảo tất cả biến môi trường đã được set
3. **Port conflicts**: Kiểm tra port 3000 có bị chiếm không
4. **File permissions**: Đảm bảo app có quyền ghi vào thư mục data/
5. **Node.js version**: Phải >= 18.0.0

---

**Khuyến nghị**: Sử dụng VPS với PM2 cho production, Heroku/Railway cho testing/demo.