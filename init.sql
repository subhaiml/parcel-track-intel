-- 1. Tenants (SaaS Customers)
CREATE TABLE IF NOT EXISTS tenants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    plan VARCHAR(50) DEFAULT 'free'
);

-- 2. Jobs (The batches of searches)
CREATE TABLE IF NOT EXISTS search_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id),
    pattern VARCHAR(255), 
    status VARCHAR(50) DEFAULT 'QUEUED',
    created_at TIMESTAMP DEFAULT NOW()
);

-- 3. Results (The actual parcel data)
CREATE TABLE IF NOT EXISTS shipments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id UUID REFERENCES search_jobs(id),
    reference_no VARCHAR(255),
    waybill_no VARCHAR(255),
    origin VARCHAR(100),
    destination VARCHAR(100),
    status TEXT,
    delivery_date DATE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- 4. Seed a dummy Tenant (So we can test later)
INSERT INTO tenants (name, plan) VALUES ('Test Company', 'premium');