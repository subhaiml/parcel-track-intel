# Parcel Intel — Distributed Logistics Intelligence Platform

![Status](https://img.shields.io/badge/Status-Production%20Stable-success)
![Version](https://img.shields.io/badge/Version-v1.0.0-blue)
![License](https://img.shields.io/badge/License-MIT-lightgrey)

**Parcel Intel** is an enterprise-grade, event-driven shipment tracking solution designed to handle high-concurrency logistics queries. It leverages a microservices architecture to decouple the user interface from resource-intensive scraping processes, ensuring 99.9% uptime and zero-blocking UI interactions.

The platform features a premium "Liquid Glass" interface inspired by modern Apple design principles, backed by a robust Redis queuing system and PostgreSQL persistence layer.

---

## 🏗 System Architecture

The system utilizes an **Asynchronous Worker Pattern** to handle long-running tasks (scraping & captcha solving) without freezing the API or Frontend.

```mermaid
graph LR
    A[Client UI] -- POST /track --> B[API Gateway]
    B -- 1. Transaction Start --> C[(PostgreSQL)]
    B -- 2. Enqueue Job --> D[Redis Queue]
    D -- Pop Job --> E[Python Worker]
    E -- Playwright --> F[Logistics Provider]
    E -- Update Status --> C
    A -- Long Polling --> B
    B -- Return Data --> A
🚀 Key Features
Event-Driven Architecture: Decoupled API and Worker services using Redis as a message broker to handle traffic spikes.

Transactional Integrity: Implements "Write-Before-Queue" logic to prevent "Ghost Jobs" (race conditions where jobs exist in the queue but not the database).

Resilient Worker Service: Python-based worker with auto-recovery, transaction rollbacks, and connection pooling.

Modern Glassmorphism UI: Built with Next.js 14 and Tailwind CSS, featuring dynamic backdrops, blur effects, and fluid animations.

Smart Polling & Timeouts: Adaptive polling mechanism on the frontend to reduce server load while providing real-time feedback.

Dual-Mode Tracking: Supports both Waybill (Direct) and Reference Number (Order ID) lookup modes with automated captcha handling.

🛠 Tech Stack
Frontend (Client)
Framework: Next.js 14 (App Router)

Styling: Tailwind CSS (Custom "Liquid Glass" Theme)

State: React Hooks & Polling Ref

Language: TypeScript

Backend (API Gateway)
Runtime: Node.js

Framework: Express.js

Database: PostgreSQL (via pg pool)

Queue: Redis (via node-redis)

Worker Service (Core Engine)
Language: Python 3.10+

Automation: Playwright (Headless/Headed)

Database: psycopg2 (Thread-safe connection)

⚡ Getting Started
Prerequisites
Node.js (v18+)

Python (v3.10+)

PostgreSQL & Redis running locally (or via Docker)

1. Clone the Repository
Bash
git clone [https://github.com/subhaiml/parcel-track-intel.git](https://github.com/subhaiml/parcel-track-intel.git)
cd parcel-track-intel
2. Infrastructure Setup
Ensure your PostgreSQL database parcel_db and Redis server are running.

SQL
-- Database Schema (Run in SQL Tool)
CREATE TABLE search_jobs (
    id UUID PRIMARY KEY,
    tenant_id UUID NOT NULL,
    search_pattern TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'QUEUED',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE shipments (
    id SERIAL PRIMARY KEY,
    job_id UUID REFERENCES search_jobs(id),
    reference_no TEXT,
    waybill_no TEXT,
    origin TEXT,
    destination TEXT,
    status TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
3. Launch Services (Run in separate terminals)
Terminal 1: API Gateway

Bash
cd api-gateway
npm install
node server.js
Terminal 2: Python Worker

Bash
cd worker-service
pip install -r requirements.txt
python worker.py
Terminal 3: Frontend

Bash
cd frontend
npm install
npm run dev
4. Usage
Navigate to http://localhost:3000. Enter a Reference Number (e.g., Dipti-05-02-96) and view the real-time tracking pipeline in action.

🧪 Technical Challenges Solved
The "Ghost Job" Concurrency Issue
Problem: In high-latency networks, the API would push a job to Redis before the Database transaction committed. The Worker would pick up the job instantly, try to save the result, and fail because the Job ID didn't exist in the DB yet (Foreign Key Violation).

Solution: Implemented a strict Synchronous DB-First pattern. The API awaits the Database INSERT confirmation before pushing to Redis. The Worker also implements conn.rollback() in its error handler to prevent transaction locking loops (Postgres Error 25P02).

🔮 Future Roadmap
[ ] Dockerize all services with docker-compose.

[ ] Add WebSockets for push notifications instead of polling.

[ ] Implement multi-tenant authentication (JWT).

[ ] Add analytics dashboard for shipment delivery times.
