# Production Deployment Guide

This guide covers deploying CanvasHub to production environments.

## Prerequisites

- Node.js 18+
- PostgreSQL database
- Redis (optional, for caching)
- Docker (for containerized deployment)

## Environment Setup

1. Copy `.env.example` to `.env` and fill in the required values:

```bash
cp .env.example .env
```

2. Configure your production environment variables:

```env
DATABASE_URL="postgresql://username:password@host:5432/canvashub"
NEXTAUTH_URL="https://yourdomain.com"
NEXTAUTH_SECRET="your-secure-secret"
SENTRY_DSN="your-sentry-dsn"
NODE_ENV="production"
```

## Database Setup

1. Create a PostgreSQL database
2. Run migrations:

```bash
npm run db:migrate
```

3. Generate Prisma client:

```bash
npm run db:generate
```

## Deployment Options

### Option 1: Docker Deployment

1. Build the Docker image:

```bash
docker build -t canvashub .
```

2. Run with docker-compose:

```bash
docker-compose up -d
```

### Option 2: Vercel Deployment

1. Connect your repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy

### Option 3: Railway/Render Deployment

1. Create a new service
2. Connect your repository
3. Set environment variables
4. Add PostgreSQL database
5. Deploy

## Post-Deployment

1. Run database migrations on production
2. Test all features
3. Set up monitoring (Sentry is configured)
4. Configure domain and SSL
5. Set up backups for database

## Monitoring

- Error tracking: Sentry
- Logs: Winston logger (check `logs/` directory)
- Health check: `/api/health`

## Security Checklist

- [ ] Environment variables are set correctly
- [ ] Database credentials are secure
- [ ] HTTPS is enabled
- [ ] CORS is configured properly
- [ ] Rate limiting is implemented
- [ ] Authentication is working
- [ ] Admin routes are protected

## Performance Optimization

- [ ] Images are optimized with Sharp
- [ ] Database queries are efficient
- [ ] Caching is implemented where needed
- [ ] CDN is configured for static assets

## Troubleshooting

### Common Issues

1. **Database connection fails**: Check DATABASE_URL format
2. **Build fails**: Ensure all dependencies are installed
3. **Socket.IO not working**: Check firewall settings for WebSocket connections

### Logs

Check application logs in:

- `logs/error.log`
- `logs/combined.log`
- Docker logs: `docker logs <container-id>`

## Rollback

If deployment fails:

1. Revert to previous version
2. Check logs for errors
3. Restore database backup if needed
