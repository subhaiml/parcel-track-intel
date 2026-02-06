# 🚚 Parcel Intel — Enterprise Logistics Intelligence

> A high-accuracy shipment tracking platform featuring an event-driven microservices architecture and a premium Liquid Glass UI.

---

## 📊 Dashboard Screenshot

*(Insert your screenshot here to showcase the UI)*

---

## 🧠 Overview

**Parcel Intel** is designed to replace resource-intensive scraping tools from the user interface by utilizing a **Write-Ahead Log (WAL) pattern** with **PostgreSQL**, and a **Redis Job Queue**. The system ensures low-latency UI interactions while handling complex, long-running backend tasks.

The frontend is built using **Next.js 14**, featuring a custom *Apple-style glassmorphism* design system that provides a fluid app-like experience.

---

## 🏗️ System Architecture

The system uses an asynchronous Worker Pattern to handle scraping tasks without blocking the API.

```
(Client Click) → POST /track
    → API Gateway (Next.js)
        → Post Job → Redis Queue (BullMQ)
            → Worker Service (Background)
                → Scraper → External Logistics Providers
                → Publish Status → DB
        → Client Polling → /status
```

---

## ⚙️ Core Technologies

### 🖥️ Frontend
- Next.js 14 (App Router)
- Tailwind CSS
- Glassmorphism UI System
- Server Actions

### 🧩 Backend
- Node.js
- Express / Next API Routes
- BullMQ (Redis Queue)
- PostgreSQL (Event Storage + Tracking Data)

### 🧰 DevOps
- Docker & Docker Compose
- Environment-based Config

---

## 🗄️ Database Design

### Event Table (Event Sourcing / WAL Pattern)
```sql
CREATE TABLE shipments (
    id UUID PRIMARY KEY,
    status TEXT,
    last_update TIMESTAMP,
    payload JSONB
);
```

### WAL Event Log
```sql
CREATE TABLE events (
    id UUID PRIMARY KEY,
    shipment_id UUID,
    event_type TEXT,
    payload JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);
```

---

## 🔄 Worker Service Flow

1. API receives tracking request
2. API pushes job to Redis queue
3. Worker picks job asynchronously
4. Worker scrapes logistics provider APIs
5. Worker writes results to PostgreSQL
6. Client polls status endpoint for updates

---

## 🔐 Key Features

### ✅ Non-Blocking UI
Users get instant response while processing happens in background.

### ✅ Event-Driven Tracking
Every shipment update is stored as an immutable event.

### ✅ Horizontal Scalability
Multiple workers can run simultaneously.

### ✅ Fault Tolerance
Jobs retry automatically if scraping fails.

---

## 🐳 Docker Setup

### 1️⃣ Clone Repository
```bash
git clone <repo-url>
cd parcel-intel-platform
```

### 2️⃣ Start Services
```bash
docker compose up -d
```

### 3️⃣ Verify Containers
```bash
docker ps
```

Expected services:
- postgres
- redis
- api
- worker

---

## 🔑 Environment Variables

Create `.env` file:

```
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/parcelintel
REDIS_URL=redis://localhost:6379
```

---

## 📡 API Endpoints

### Track Shipment
```
POST /api/track
```

Body:
```json
{
  "trackingNumber": "ABC123"
}
```

---

### Get Shipment Status
```
GET /api/status/{trackingNumber}
```

---

## 🎨 UI Design System

Parcel Intel uses a custom **Liquid Glass** design language:

- Frosted translucent panels
- Subtle gradient overlays
- Soft shadow elevation
- Apple-inspired motion physics

---

## 📈 Future Roadmap

- AI-based delay prediction
- Smart route optimization
- Real-time push notifications
- Carrier performance analytics

---

## 🤝 Contributing

1. Fork repository
2. Create feature branch
3. Commit changes
4. Open Pull Request

---

## 📜 License

MIT License

---

## ✨ Author

**Subharthi Dutta**  
BTech CSE (AI & ML)  
Full Stack + Systems + Microservices Enthusiast

---

## 💡 Vision

> Build enterprise-grade logistics intelligence platforms using modern distributed systems and beautiful UI experiences.

