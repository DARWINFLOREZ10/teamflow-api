# Architecture Diagram

```mermaid
flowchart LR
  Client[Client / Postman] --> API[Express API]
  API --> Service[Service Layer]
  Service --> DB[(PostgreSQL + Prisma)]
  Service --> Redis[(Redis Cache & Sessions)]
```
