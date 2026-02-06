const redis = require('redis');
const { Pool } = require('pg');

// 1. Setup Connections
const redisClient = redis.createClient({ url: 'redis://localhost:6379' });
const pool = new Pool({
    user: 'admin', host: 'localhost', database: 'parcel_db', password: 'password', port: 5432,
});

async function runSystemCheck() {
    console.log("\n🕵️  STARTING SYSTEM DIAGNOSTIC & RESET...\n");

    try {
        // --- REDIS CHECK ---
        await redisClient.connect();
        const queueSize = await redisClient.lLen('job_queue');
        console.log(`   [Redis] Found ${queueSize} old jobs in queue.`);
        
        if (queueSize > 0) {
            console.log("   [Redis] 🧹 Wiping queue clean...");
            await redisClient.flushAll();
            console.log("   [Redis] ✅ Queue is now EMPTY.");
        } else {
            console.log("   [Redis] ✅ Queue is already clean.");
        }

        // --- DATABASE CHECK ---
        console.log("   [DB] 🔌 Connecting to Postgres...");
        const res = await pool.query('SELECT count(*) FROM search_jobs');
        console.log(`   [DB] ✅ Connected! Total historical jobs: ${res.rows[0].count}`);

        console.log("\n✅ SYSTEM IS READY. YOU CAN START THE SERVERS NOW.\n");
    
    } catch (err) {
        console.error("\n❌ CRITICAL ERROR:", err.message);
        console.log("   -> Is your Docker/Postgres running?");
        console.log("   -> Is your Redis running?");
    } finally {
        await redisClient.disconnect();
        await pool.end();
    }
}

runSystemCheck();