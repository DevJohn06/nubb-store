import fs from 'fs';
import { createClient } from '@libsql/client';
import { Resend } from 'resend';

function loadEnvFile(filePath, override = false) {
  if (!fs.existsSync(filePath)) return;
  const content = fs.readFileSync(filePath, 'utf8');
  content.split('\n').forEach(line => {
    line = line.trim();
    if (line && !line.startsWith('#') && line.includes('=')) {
      const idx = line.indexOf('=');
      const key = line.substring(0, idx).trim();
      let value = line.substring(idx + 1).trim();
      if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
        value = value.substring(1, value.length - 1);
      }
      if (override || !process.env[key]) {
        process.env[key] = value;
      }
    }
  });
}

// Load .env with override=true so remote Turso URL in .env overrides local file fallback
loadEnvFile('.env.local');
loadEnvFile('.env', true);

const dbUrl = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;
const resendApiKey = process.env.RESEND_API_KEY;
const fromEmail = process.env.RESEND_FROM_EMAIL || 'NUBB <onboarding@resend.dev>';

console.log('--- Environment Check ---');
console.log('TURSO_DATABASE_URL:', dbUrl);
console.log('TURSO_AUTH_TOKEN configured:', authToken ? 'YES' : 'NO');
console.log('RESEND_API_KEY configured:', resendApiKey ? 'YES' : 'NO');
console.log('RESEND_FROM_EMAIL:', fromEmail);

async function runMigrationAndTest() {
  console.log('\n--- 1. Running Remote Turso Database Migration ---');
  try {
    const db = createClient({ url: dbUrl, authToken });
    
    // Execute table creation migration on remote Turso Cloud DB
    await db.execute(`
      CREATE TABLE IF NOT EXISTS subscribers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        status TEXT DEFAULT 'active',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ Remote Turso DB Migration Success: `subscribers` table created on Cloud DB!');

    // Test query on remote Turso DB
    const countRes = await db.execute('SELECT COUNT(*) as count FROM subscribers');
    console.log('✅ Current subscribers count in Remote Turso Cloud DB:', countRes.rows[0].count);

  } catch (err) {
    console.error('❌ Remote Turso Database Migration Error:', err.message || err);
  }

  console.log('\n--- 2. Testing Resend Email ---');
  if (!resendApiKey) {
    console.log('⚠️ RESEND_API_KEY is not set!');
    return;
  }

  const resend = new Resend(resendApiKey);

  // Send to authorized testing address strymkr.john@gmail.com
  const primaryEmail = 'strymkr.john@gmail.com';
  console.log(`Sending test email to authorized account (${primaryEmail}) via Resend...`);

  try {
    const emailRes = await resend.emails.send({
      from: fromEmail,
      to: [primaryEmail],
      subject: 'NUBB Store - Launch Notification Test',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 30px; background-color: #E8E6D8; color: #4D3F15;">
          <div style="max-width: 500px; margin: 0 auto; background: #ffffff; padding: 30px; border: 2px solid #4D3F15;">
            <h1 style="font-size: 28px; color: #892F1A; margin-top: 0;">NUBB</h1>
            <p style="font-weight: bold; letter-spacing: 2px; text-transform: lowercase;">the things we carry.</p>
            <hr style="border: 1px solid #4D3F15; margin: 20px 0;" />
            <p><strong>Hello!</strong></p>
            <p>This is a test notification email from your NUBB coming soon landing page setup.</p>
            <p>Your Remote Turso database and Resend API integration are fully configured and live!</p>
            <br/>
            <p style="font-size: 12px; color: #892F1A;">© ${new Date().getFullYear()} NUBB Store</p>
          </div>
        </div>
      `,
    });

    if (emailRes.error) {
      console.error('❌ Resend API Error:', emailRes.error);
    } else {
      console.log(`✅ Resend Email Dispatched Successfully to ${primaryEmail}! ID:`, emailRes.data.id);
    }
  } catch (err) {
    console.error('❌ Resend Exception:', err.message || err);
  }

  // Attempt sending to wet.johnt@gmail.com
  const requestedEmail = 'wet.johnt@gmail.com';
  console.log(`\nAttempting dispatch to requested email (${requestedEmail})...`);
  try {
    const emailRes2 = await resend.emails.send({
      from: fromEmail,
      to: [requestedEmail],
      subject: 'NUBB Store - Launch Notification Test',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 30px; background-color: #E8E6D8; color: #4D3F15;">
          <div style="max-width: 500px; margin: 0 auto; background: #ffffff; padding: 30px; border: 2px solid #4D3F15;">
            <h1 style="font-size: 28px; color: #892F1A; margin-top: 0;">NUBB</h1>
            <p style="font-weight: bold; letter-spacing: 2px; text-transform: lowercase;">the things we carry.</p>
            <hr style="border: 1px solid #4D3F15; margin: 20px 0;" />
            <p><strong>Hello!</strong></p>
            <p>This is a test notification email from your NUBB coming soon landing page setup.</p>
          </div>
        </div>
      `,
    });

    if (emailRes2.error) {
      console.log(`ℹ️ Resend note for ${requestedEmail}:`, emailRes2.error.message);
    } else {
      console.log(`✅ Resend Email Dispatched Successfully to ${requestedEmail}! ID:`, emailRes2.data.id);
    }
  } catch (err) {
    console.error('❌ Resend Exception:', err.message || err);
  }
}

runMigrationAndTest();
