const { Pool } = require('pg');

const pool = new Pool({
    user: 'admin',
    host: 'localhost',
    database: 'parcel_db',
    password: 'password',
    port: 5432,
});

const resetSQL = `
    -- Delete old tables to start fresh
    DROP TABLE IF EXISTS shipments;
    DROP TABLE IF EXISTS search_jobs;

    -- Create Jobs Table (Matches server.js)
    CREATE TABLE search_jobs (
        id UUID PRIMARY KEY,
        tenant_id UUID NOT NULL,
        search_pattern TEXT NOT NULL,
        status VARCHAR(50) DEFAULT 'QUEUED',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    -- Create Shipments Table (Matches worker.py)
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
`;

async function runReset() {
    try {
        console.log("⏳ Resetting Database Tables...");
        await pool.query(resetSQL);
        console.log("✅ SUCCESS: Tables created successfully!");
        console.log("   - search_jobs (Created)");
        console.log("   - shipments (Created)");
    } catch (err) {
        console.error("❌ ERROR:", err);
    } finally {
        await pool.end();
    }
}

runReset();