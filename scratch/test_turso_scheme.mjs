import { createClient } from '@libsql/client';
import fs from 'fs';

const envContent = fs.readFileSync('.env', 'utf8');
let token = '';
envContent.split('\n').forEach(line => {
  if (line.startsWith('TURSO_AUTH_TOKEN=')) {
    token = line.substring('TURSO_AUTH_TOKEN='.length).trim().replace(/^"|"$/g, '');
  }
});

const baseHost = 'nubb-db-devjohn06.aws-ap-northeast-1.turso.io';

async function testUrl(url) {
  console.log(`Testing Turso URL: ${url}`);
  try {
    const client = createClient({ url, authToken: token });
    await client.execute(`
      CREATE TABLE IF NOT EXISTS subscribers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        status TEXT DEFAULT 'active',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log(`✅ SUCCESS with URL: ${url}`);
    const res = await client.execute('SELECT COUNT(*) as count FROM subscribers');
    console.log('Subscriber count:', res.rows[0].count);
    return true;
  } catch (err) {
    console.error(`❌ Error with ${url}:`, err.message || err);
    return false;
  }
}

async function run() {
  await testUrl(`libsql://${baseHost}`);
  await testUrl(`https://${baseHost}`);
}

run();
