const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const redis = require('redis');
const { Pool } = require('pg');

const app = express();
app.use(cors());
app.use(express.json());

// Redis
const redisClient = redis.createClient({ url: 'redis://localhost:6379' });
redisClient.connect().catch(console.error);

// Postgres
const pool = new Pool({
    user: 'admin',
    host: 'localhost',
    database: 'parcel_db',
    password: 'password',
    port: 5432,
});

app.post('/api/jobs', async (req, res) => {
    try {
        console.log("📝 Job Request:", req.body); 
        const { tenant_id, pattern, mode } = req.body;
        
        // VALIDATION: Ensure tenant_id is a valid UUID
        if (!tenant_id || tenant_id.length < 36) {
            return res.status(400).json({ error: "Invalid Tenant ID. Must be a UUID." });
        }

        const jobId = uuidv4();
        
        // 1. DATABASE INSERT COMES FIRST (The Golden Rule)
        // If this fails, the code stops here and NOTHING goes to Redis.
        await pool.query(
            "INSERT INTO search_jobs (id, tenant_id, search_pattern, status) VALUES ($1, $2, $3, 'QUEUED')",
            [jobId, tenant_id, pattern]
        );
        console.log(`✅ Job ${jobId} saved to DB.`);

        // 2. REDIS PUSH COMES SECOND
        // We only do this if Step 1 succeeded.
        const jobData = { jobId, tenant_id, pattern, mode: mode || 'waybill' };
        await redisClient.lPush('job_queue', JSON.stringify(jobData));
        await redisClient.set(`job:${jobId}`, JSON.stringify({ status: 'QUEUED' }));

        res.json({ jobId, status: 'QUEUED' });

    } catch (err) {
        console.error("❌ API Error:", err);
        // This stops the frontend from thinking it worked
        res.status(500).json({ error: "Database Save Failed: " + err.message });
    }
});

app.get('/api/jobs/:id', async (req, res) => {
    try {
        const jobId = req.params.id;
        const dbRes = await pool.query("SELECT * FROM shipments WHERE job_id = $1", [jobId]);
        res.json({ results: dbRes.rows });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Polling Error" });
    }
});

const PORT = 3001;
app.listen(PORT, () => {
    console.log(`🚀 API running on port ${PORT}`);
});