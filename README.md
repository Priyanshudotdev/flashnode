# flashnode

A high-performance Node.js & Express API built with MongoDB and Redis caching. It implements cache-aside strategies, TTL expiration, and instant cache invalidation to achieve sub-millisecond database response times under heavy load.

## 🚀 Quick Start
```bash
# Start MongoDB & Redis containers
docker run -d --name redis-server -p 6379:6379 redis:latest
docker run -d --name mongodb -p 27018:27017 mongo:7

# Install dependencies & run dev server
pnpm install
pnpm dev
```
