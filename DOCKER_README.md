# Docker Deployment Guide

This guide explains how to build and run the English Center Frontend application using Docker.

## Prerequisites

- Docker (version 20.10 or higher)
- Docker Compose (version 2.0 or higher)

## Files Overview

- `Dockerfile` - Multi-stage production build
- `Dockerfile.dev` - Development build with hot-reload
- `docker-compose.yml` - Orchestration for both production and development
- `nginx.conf` - Nginx configuration for production
- `.dockerignore` - Files to exclude from Docker build

## Quick Start

### Production Build

```bash
# Build and run production container
docker-compose up web -d

# Access the application at http://localhost:3000
```

### Development Build

```bash
# Build and run development container with hot-reload
docker-compose up web-dev -d

# Access the application at http://localhost:5173
```

## Docker Commands

### Building Images

```bash
# Build production image
docker build -t english-center-fe:latest .

# Build development image
docker build -f Dockerfile.dev -t english-center-fe:dev .
```

### Running Containers

```bash
# Run production container
docker run -d -p 3000:80 --name english-center-fe english-center-fe:latest

# Run development container
docker run -d -p 5173:5173 --name english-center-fe-dev english-center-fe:dev
```

### Managing Containers

```bash
# View running containers
docker ps

# View logs
docker logs english-center-fe
docker logs -f english-center-fe  # Follow logs

# Stop container
docker stop english-center-fe

# Start container
docker start english-center-fe

# Remove container
docker rm english-center-fe

# Remove image
docker rmi english-center-fe:latest
```

### Docker Compose Commands

```bash
# Start services
docker-compose up -d

# Stop services
docker-compose down

# View logs
docker-compose logs -f

# Rebuild and restart
docker-compose up --build -d

# Stop and remove volumes
docker-compose down -v
```

## Environment Variables

To pass environment variables, you can:

1. **Using docker run:**
```bash
docker run -d -p 3000:80 \
  -e VITE_API_URL=https://api.example.com \
  --name english-center-fe \
  english-center-fe:latest
```

2. **Using .env file with docker-compose:**

Create a `.env` file in the project root:
```env
VITE_API_URL=https://api.example.com
VITE_APP_NAME=English Center
```

3. **In docker-compose.yml:**
```yaml
services:
  web:
    environment:
      - VITE_API_URL=${VITE_API_URL}
      - VITE_APP_NAME=${VITE_APP_NAME}
```

## Build Stages Explained

### Production Build (Multi-stage)

**Stage 1: Builder**
- Uses Node.js 20 Alpine (lightweight)
- Installs dependencies
- Builds the application with Vite
- Creates optimized production bundle

**Stage 2: Production**
- Uses Nginx Alpine (very lightweight)
- Copies built files from builder stage
- Serves static files with Nginx
- Final image size: ~25-30MB

### Development Build

- Uses Node.js 20 Alpine
- Runs Vite dev server
- Supports hot-reload
- Mounts source code as volumes

## Nginx Configuration

The included `nginx.conf` provides:

- ✅ React Router support (SPA routing)
- ✅ Gzip compression for assets
- ✅ Cache headers for static files
- ✅ Security headers (XSS, MIME, Frame)
- ✅ Health check endpoint at `/health`
- ✅ Service Worker cache control

## Health Checks

The production container includes a health check:

```bash
# Check container health
docker inspect --format='{{.State.Health.Status}}' english-center-fe

# Manual health check
curl http://localhost:3000/health
```

## Performance Optimization

The Docker setup includes several optimizations:

1. **Multi-stage build** - Reduces final image size
2. **Layer caching** - Speeds up rebuilds
3. **Gzip compression** - Reduces bandwidth
4. **Static asset caching** - Improves load times
5. **Nginx** - Fast, lightweight web server

## Troubleshooting

### Container won't start

```bash
# Check logs
docker logs english-center-fe

# Inspect container
docker inspect english-center-fe
```

### Port already in use

```bash
# Change port mapping
docker run -d -p 8080:80 english-center-fe:latest
```

### Build fails

```bash
# Clear build cache
docker builder prune

# Rebuild without cache
docker build --no-cache -t english-center-fe:latest .
```

### Permission issues

```bash
# Run with specific user
docker run -d -p 3000:80 --user $(id -u):$(id -g) english-center-fe:latest
```

## Production Deployment

### With Docker Hub

```bash
# Tag image
docker tag english-center-fe:latest yourusername/english-center-fe:latest

# Push to Docker Hub
docker push yourusername/english-center-fe:latest

# Pull and run on production server
docker pull yourusername/english-center-fe:latest
docker run -d -p 80:80 yourusername/english-center-fe:latest
```

### With CI/CD (GitHub Actions example)

```yaml
name: Build and Deploy

on:
  push:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Build Docker image
        run: docker build -t english-center-fe:latest .
      
      - name: Push to registry
        run: |
          docker tag english-center-fe:latest ${{ secrets.REGISTRY }}/english-center-fe:latest
          docker push ${{ secrets.REGISTRY }}/english-center-fe:latest
```

## Security Best Practices

1. ✅ Use non-root user in production
2. ✅ Keep base images updated
3. ✅ Don't include sensitive files (.env, secrets)
4. ✅ Use multi-stage builds to minimize attack surface
5. ✅ Scan images for vulnerabilities

```bash
# Scan image for vulnerabilities
docker scan english-center-fe:latest
```

## Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Nginx Documentation](https://nginx.org/en/docs/)
- [Vite Docker Guide](https://vitejs.dev/guide/static-deploy.html)
