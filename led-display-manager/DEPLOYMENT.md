# Deployment Guide

## Prerequisites

1. **Supabase Project**
   - Create account at https://supabase.com
   - Create new project
   - Run the SQL schema from `supabase-schema.sql`
   - Get your project URL and keys

2. **VNNOX API Credentials**
   - Contact Novastar for API access
   - Get your Access Key (AK) and Access Secret (AS)

3. **Server Requirements**
   - Linux server (Ubuntu 20.04+ recommended)
   - Docker and Docker Compose installed
   - Domain name (optional but recommended)
   - SSL certificate (for HTTPS)

## Environment Setup

1. Clone the repository:
```bash
git clone <your-repo-url>
cd led-display-manager
```

2. Create environment file:
```bash
cp .env.example .env
```

3. Edit `.env` with your credentials:
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_KEY=your_service_key

# VNNOX API
VNNOX_AK=your_access_key
VNNOX_AS=your_access_secret
VNNOX_API_URL=https://api.vnnox.com

# Frontend URL (update for production)
FRONTEND_URL=https://yourdomain.com
```

## Docker Deployment

1. Build and start services:
```bash
docker-compose up -d --build
```

2. Check logs:
```bash
docker-compose logs -f
```

3. Stop services:
```bash
docker-compose down
```

## Manual Deployment

### Backend

1. Install dependencies:
```bash
cd backend
npm install
```

2. Build:
```bash
npm run build
```

3. Start with PM2:
```bash
pm2 start dist/index.js --name led-backend
```

### Frontend

1. Install dependencies:
```bash
cd frontend
npm install
```

2. Build:
```bash
npm run build
```

3. Start with PM2:
```bash
pm2 start npm --name led-frontend -- start
```

## SSL/HTTPS Setup

1. Install Certbot:
```bash
sudo apt install certbot
```

2. Get SSL certificate:
```bash
sudo certbot certonly --standalone -d yourdomain.com
```

3. Update `nginx.conf` with SSL paths

4. Restart nginx:
```bash
docker-compose restart nginx
```

## Monitoring

1. **Application Logs**:
```bash
# Docker logs
docker-compose logs -f backend
docker-compose logs -f frontend

# PM2 logs
pm2 logs
```

2. **System Monitoring**:
```bash
# Check resource usage
docker stats

# PM2 monitoring
pm2 monit
```

## Backup

1. **Database**: Supabase handles automatic backups

2. **Media Files**: Set up regular backups of Supabase Storage

3. **Application**: Keep your repository up to date

## Troubleshooting

### Common Issues

1. **WebSocket Connection Failed**
   - Check CORS settings
   - Ensure nginx is properly configured
   - Verify firewall allows WebSocket connections

2. **Authentication Issues**
   - Verify Supabase keys are correct
   - Check JWT token expiration

3. **VNNOX API Errors**
   - Verify API credentials
   - Check network connectivity
   - Ensure display terminal IDs are correct

### Health Checks

- Backend: `http://yourdomain.com/api/health`
- Frontend: `http://yourdomain.com`

## Security Recommendations

1. **Environment Variables**
   - Never commit `.env` files
   - Use secrets management in production

2. **Network Security**
   - Use HTTPS in production
   - Configure firewall rules
   - Limit API access with rate limiting

3. **Updates**
   - Keep dependencies updated
   - Monitor security advisories
   - Regular system updates

## Scaling

For high traffic:

1. **Load Balancing**: Use nginx as load balancer
2. **Database**: Upgrade Supabase plan
3. **CDN**: Use Cloudflare for static assets
4. **Monitoring**: Implement APM tools

## Support

- Supabase: https://supabase.com/docs
- Novastar VNNOX: Contact your Novastar representative
- Application Issues: Create issue in repository