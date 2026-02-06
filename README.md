# 📦 Parcel Intel — Enterprise Logistics Intelligence

> **A high-accuracy shipment tracking platform featuring an event-driven microservices architecture.**

---

## 📊 Dashboard Screenshot

<img width="1910" height="914" alt="screencapture-localhost-3000-2026-02-06-22_18_45" src="https://github.com/user-attachments/assets/f55f191a-4b98-4aac-bbac-aec303e36007" />

---

## 🧠 Overview

**Parcel Intel** is designed to offload resource-intensive scraping tasks from the user interface by utilizing a **Write-Ahead Log (WAL) pattern** with **PostgreSQL**, and a **Redis Job Queue**. The system ensures zero-latency UI interactions while handling complex, long-running backend operations.

The frontend is built using **Next.js 14**, featuring a custom **Glassmorphism** design system that delivers a fluid, app-like experience.

---

## 🏗️ System Architecture

The system employs an **Asynchronous Worker Pattern** to process scraping tasks without blocking the main API.

```
(Client Click) → POST /track
    │
    ▼
API Gateway (Next.js/Express)
    │
    ├─► Enqueue Job ──► Redis Queue
    │                   │
    │                   ▼
    │             Worker Service (Python)
    │                   │
    │                   ├─► Scraper ──► External Logistics Providers
    │                   │
    │                   └─► Publish Status ──► PostgreSQL DB
    │
    ▼
Client Polling ◄── GET /status

```

---

## ⚙️ Core Technologies

### 🖥️ Frontend

* **Next.js 14** (App Router)
* **Tailwind CSS** (Utility-first styling)
* **Glassmorphism UI System** (Custom visual language)
* **Server Actions** (Secure data fetching)

### 🧩 Backend

* **Node.js** (Runtime environment)
* **Express / API Routes** (Request handling)
* **Redis Queue** (Task management)
* **PostgreSQL** (Event storage & tracking data)

### 🧰 DevOps

* **Docker & Docker Compose** (Containerization)
* **Environment-based Config** (Security & flexibility)

---

## 🗄️ Database Design

### Shipment Table (Snapshot State)

```sql
CREATE TABLE shipments (
    id UUID PRIMARY KEY,
    status TEXT,
    last_update TIMESTAMP,
    payload JSONB
);

```

### Event Log (WAL Pattern)

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

1. **Receive:** API accepts tracking request and pushes job to Redis.
2. **Process:** Worker asynchronously dequeues the job.
3. **Scrape:** Worker initiates Playwright to scrape external carrier APIs.
4. **Persist:** Results are committed to the PostgreSQL database.
5. **Update:** Client polls the status endpoint to reflect real-time changes.

---

## 🔐 Key Features

### ✅ Non-Blocking UI

Immediate user feedback while heavy processing executes in the background.

### ✅ Event-Driven Architecture

Shipment updates are treated as discrete, immutable events.

### ✅ Horizontal Scalability

Architecture supports multiple concurrent workers.

### ✅ Fault Tolerance

Automatic retry mechanisms for failed scraping attempts.

---

## 🐳 Docker Setup

### 1️⃣ Clone Repository

```bash
git clone https://github.com/subhaiml/parcel-track-intel.git
cd parcel-track-intel

```

### 2️⃣ Start Services

```bash
docker compose up -d

```

### 3️⃣ Verify Containers

```bash
docker ps

```

*Expected output:* `postgres`, `redis`, `api`, `worker`

---

## 🔑 Environment Variables

Create a `.env` file in the root directory:

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/parcelintel
REDIS_URL=redis://localhost:6379

```

---

## 📡 API Endpoints

### Track Shipment

**POST** `/api/track`

```json
{
  "trackingNumber": "ABC123"
}

```

### Get Shipment Status

**GET** `/api/status/{trackingNumber}`

---

## 🎨 UI Design System

Parcel Intel utilizes a custom **Glass** design language:

* **Frosted Panels:** Translucent backgrounds with backdrop blur.
* **Gradient Overlays:** Subtle, dynamic color meshes.
* **Soft Elevation:** Diffused shadows for depth.

---

## 📈 Future Roadmap

* [ ] AI-based delivery delay prediction
* [ ] Smart route optimization
* [ ] Real-time push notifications (WebSockets)
* [ ] Carrier performance analytics dashboard

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📜 License

Distributed under the MIT License. See `LICENSE` for more information.

---

## ✨ Author

**Subharthi Dutta** B.Tech CSE (AI & ML)

*Full Stack + Systems + Microservices Enthusiast*

---

## 💡 Vision

> *Building enterprise-grade logistics intelligence platforms using modern distributed systems and beautiful UI experiences.*
