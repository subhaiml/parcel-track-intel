const redis = require('redis');
const client = redis.createClient({ url: 'redis://localhost:6379' });

async function purge() {
    await client.connect();
    console.log("🗑️  Purging Redis Queue...");
    await client.del('job_queue');
    console.log("✅ Queue Cleared! Ghost jobs are gone.");
    process.exit(0);
}

purge();