import { createClient, Client } from "@libsql/client";

let clientInstance: Client | null = null;

export function getTursoClient(): Client {
  if (clientInstance) {
    return clientInstance;
  }

  const url = process.env.TURSO_DATABASE_URL || "file:local.db";
  const authToken = process.env.TURSO_AUTH_TOKEN || undefined;

  clientInstance = createClient({
    url,
    authToken,
  });

  return clientInstance;
}

/**
 * Ensures the subscribers table exists in Turso / SQLite database.
 */
export async function initSubscribersTable() {
  const db = getTursoClient();
  await db.execute(`
    CREATE TABLE IF NOT EXISTS subscribers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      status TEXT DEFAULT 'active',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);
}

export async function addSubscriber(email: string) {
  await initSubscribersTable();
  const db = getTursoClient();

  const normalizedEmail = email.trim().toLowerCase();

  try {
    await db.execute({
      sql: "INSERT INTO subscribers (email) VALUES (?)",
      args: [normalizedEmail],
    });
    return { success: true, isNew: true };
  } catch (error: any) {
    // SQLite / Turso unique constraint error code or message check
    const errorMessage = error?.message || String(error);
    if (
      errorMessage.includes("UNIQUE constraint failed") ||
      errorMessage.includes("already exists") ||
      errorMessage.includes("constraint failed")
    ) {
      return { success: true, isNew: false, message: "You're already on the list!" };
    }
    throw error;
  }
}

export async function getSubscribersCount() {
  try {
    await initSubscribersTable();
    const db = getTursoClient();
    const result = await db.execute("SELECT COUNT(*) as count FROM subscribers");
    const count = Number(result.rows[0]?.count ?? 0);
    return count;
  } catch {
    return 0;
  }
}
