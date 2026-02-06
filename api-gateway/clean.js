const redis = require('redis');
const client = redis.createClient({ url: 'redis://localhost:6379' });

async function clear() {
    await client.connect();
    console.log("🔥 FLUSHING ALL JOBS...");
    await client.flushAll(); // Nuke everything
    console.log("✅ REDIS IS EMPTY. Ghost jobs are gone.");
    process.exit(0);
}

clear();