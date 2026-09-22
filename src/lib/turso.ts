import { createClient, Client, InValue } from "@libsql/client";
import { hashPassword } from "./auth";

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

// ----------------------------------------------------
// DATABASE INITIALIZATION & SCHEMA DEFINITION
// ----------------------------------------------------

let tablesInitialized = false;

export async function initAllTables() {
  if (tablesInitialized) return;
  const db = getTursoClient();

  // 1. Subscribers table (existing)
  await db.execute(`
    CREATE TABLE IF NOT EXISTS subscribers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      name TEXT,
      status TEXT DEFAULT 'active',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Migration: ensure name column exists in existing database
  try {
    await db.execute(`ALTER TABLE subscribers ADD COLUMN name TEXT;`);
  } catch {
    // Column already exists or table freshly created
  }

  // 2. Admin users table
  await db.execute(`
    CREATE TABLE IF NOT EXISTS admin_users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      salt TEXT NOT NULL,
      role TEXT DEFAULT 'admin',
      status TEXT DEFAULT 'active',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // 3. Products table
  await db.execute(`
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      category TEXT NOT NULL,
      tagline TEXT,
      description TEXT,
      price REAL NOT NULL,
      compare_at_price REAL,
      inventory INTEGER DEFAULT 0,
      sku TEXT,
      images TEXT,
      features TEXT,
      is_featured INTEGER DEFAULT 0,
      status TEXT DEFAULT 'active',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // 4. Orders table
  await db.execute(`
    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      customer_name TEXT NOT NULL,
      customer_email TEXT NOT NULL,
      customer_phone TEXT,
      shipping_address TEXT NOT NULL,
      items TEXT NOT NULL,
      subtotal REAL NOT NULL,
      shipping_fee REAL DEFAULT 0,
      total_amount REAL NOT NULL,
      payment_method TEXT NOT NULL,
      payment_status TEXT DEFAULT 'pending',
      order_status TEXT DEFAULT 'pending',
      payment_proof_url TEXT,
      tracking_number TEXT,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // 5. Payment Methods table
  await db.execute(`
    CREATE TABLE IF NOT EXISTS payment_methods (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      account_name TEXT,
      account_number TEXT,
      instructions TEXT,
      qr_code_url TEXT,
      is_active INTEGER DEFAULT 1,
      sort_order INTEGER DEFAULT 0
    );
  `);

  // 6. Store Settings table
  await db.execute(`
    CREATE TABLE IF NOT EXISTS store_settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
  `);

  await seedDefaultData(db);
  tablesInitialized = true;
}

// ----------------------------------------------------
// DEFAULT SEED DATA
// ----------------------------------------------------

async function seedDefaultData(db: Client) {
  // Check if admin user exists
  const adminCheck = await db.execute("SELECT COUNT(*) as count FROM admin_users");
  if (Number(adminCheck.rows[0]?.count ?? 0) === 0) {
    const defaultPass = hashPassword("nubb@admin2026");
    await db.execute({
      sql: `INSERT INTO admin_users (name, username, email, password_hash, salt, role, status) 
            VALUES (?, ?, ?, ?, ?, ?, ?)`,
      args: [
        "NUBB Founder",
        "admin",
        "admin@nubb.store",
        defaultPass.hash,
        defaultPass.salt,
        "superadmin",
        "active",
      ],
    });
  }

  // Check if payment methods exist
  const pmCheck = await db.execute("SELECT COUNT(*) as count FROM payment_methods");
  if (Number(pmCheck.rows[0]?.count ?? 0) === 0) {
    const defaultMethods = [
      {
        id: "gcash",
        name: "GCash Express",
        account_name: "NUBB Store / John T.",
        account_number: "0917-XXX-NUBB",
        instructions: "Send exact total to GCash number or scan QR. Upload screenshot of payment receipt upon checkout.",
        qr_code_url: "",
        is_active: 1,
        sort_order: 1,
      },
      {
        id: "maya",
        name: "Maya / PayMaya",
        account_name: "NUBB Crafts",
        account_number: "0917-XXX-NUBB",
        instructions: "Transfer to Maya account. Please include your Order ID in reference.",
        qr_code_url: "",
        is_active: 1,
        sort_order: 2,
      },
      {
        id: "bank_transfer",
        name: "Bank Transfer (BDO / BPI)",
        account_name: "NUBB Handmade Studio",
        account_number: "BDO: 0023-4567-8901",
        instructions: "Direct bank deposit or InstaPay online transfer. Attach proof of payment.",
        qr_code_url: "",
        is_active: 1,
        sort_order: 3,
      },
      {
        id: "cod",
        name: "Cash on Delivery (Davao City & Nationwide)",
        account_name: "",
        account_number: "",
        instructions: "Pay in cash upon doorstep arrival. Please prepare exact amount.",
        qr_code_url: "",
        is_active: 1,
        sort_order: 4,
      },
    ];

    for (const pm of defaultMethods) {
      await db.execute({
        sql: `INSERT INTO payment_methods (id, name, account_name, account_number, instructions, qr_code_url, is_active, sort_order)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
          pm.id,
          pm.name,
          pm.account_name,
          pm.account_number,
          pm.instructions,
          pm.qr_code_url,
          pm.is_active,
          pm.sort_order,
        ],
      });
    }
  }

  // Check store settings
  const settingsCheck = await db.execute("SELECT COUNT(*) as count FROM store_settings");
  if (Number(settingsCheck.rows[0]?.count ?? 0) === 0) {
    const defaultSettings = [
      { key: "staging_pin", value: "nubb2026" },
      { key: "shipping_fee", value: "120" },
      { key: "free_shipping_threshold", value: "2000" },
      { key: "currency_symbol", value: "₱" },
      { key: "store_announcement", value: "HANDCRAFTED IN SMALL BATCHES — STAGING PREVIEW ACTIVE" },
    ];
    for (const s of defaultSettings) {
      await db.execute({
        sql: "INSERT OR REPLACE INTO store_settings (key, value) VALUES (?, ?)",
        args: [s.key, s.value],
      });
    }
  }

  // Check if products exist
  const prodCheck = await db.execute("SELECT COUNT(*) as count FROM products");
  if (Number(prodCheck.rows[0]?.count ?? 0) === 0) {
    const sampleProducts = [
      {
        name: "The Obsidian Tactile Lighter Cover",
        slug: "obsidian-tactile-lighter-cover",
        category: "lighter-covers",
        tagline: "Heavyweight sculpted grip case for standard BIC lighters.",
        description:
          "Hand-carved and cast with tactile organic contours. Designed to give your everyday lighter substantial weight, ergonomic grip, and distinctive rugged character. Snug friction fit with textured ridges that feel alive in your hand.",
        price: 850,
        compare_at_price: 1100,
        inventory: 14,
        sku: "NUBB-LC-OBS-01",
        images: JSON.stringify([
          "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&w=800&q=80",
          "https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=800&q=80",
        ]),
        features: JSON.stringify([
          "Custom friction-fit for classic BIC full-size lighters",
          "Hand-finished matte tactile resin composite",
          "Bottom loop for lanyard / paracord attachment",
          "Made by hand in limited studio batches",
        ]),
        is_featured: 1,
        status: "active",
      },
      {
        name: "Rust Terracotta Woven Lighter Sleeve",
        slug: "rust-terracotta-woven-lighter-sleeve",
        category: "lighter-covers",
        tagline: "Knotted cord wrap with industrial brass grommet.",
        description:
          "Micro-woven with heavy abrasion-resistant cordage in NUBB's signature rust orange. Features a bottom eyelet for tethering to keyrings, bags, or belt loops. Never drop or misplace your fire.",
        price: 650,
        compare_at_price: 800,
        inventory: 20,
        sku: "NUBB-LC-TER-02",
        images: JSON.stringify([
          "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=800&q=80",
          "https://images.unsplash.com/photo-1513094735237-8f2714d57c13?auto=format&fit=crop&w=800&q=80",
        ]),
        features: JSON.stringify([
          "Tight mil-spec braided wrap",
          "Rust terracotta earthy tone",
          "Antiqued brass hardware clip",
          "Reusable sleeve over multiple lighters",
        ]),
        is_featured: 1,
        status: "active",
      },
      {
        name: "550 'Nomad' Cobra Paracord Bracelet",
        slug: "nomad-cobra-paracord-bracelet",
        category: "paracord-bracelets",
        tagline: "Heavy-duty survival cordage with tactile shackle.",
        description:
          "Woven from authentic Type III 550 Mil-Spec nylon paracord with 7 inner structural strands. Secured with a custom-engineered matte black stainless steel bow shackle. Wear it daily or deploy 9 feet of emergency cordage when off-grid.",
        price: 950,
        compare_at_price: 1200,
        inventory: 18,
        sku: "NUBB-PB-NOM-01",
        images: JSON.stringify([
          "https://images.unsplash.com/photo-1611591475155-42e9fba5ce55?auto=format&fit=crop&w=800&q=80",
          "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=80",
        ]),
        features: JSON.stringify([
          "9 ft of usable 550 lb tensile strength cordage",
          "Adjustable 3-hole stainless steel shackle pin",
          "Dual-tone olive brown and dark charcoal weave",
          "Resistant to UV, rot, and saltwater",
        ]),
        is_featured: 1,
        status: "active",
      },
      {
        name: "The 'Knotwork' Minimalist Cord Cuff",
        slug: "knotwork-minimalist-cord-cuff",
        category: "paracord-bracelets",
        tagline: "Slim profile sliding-knot bracelet with brass bead.",
        description:
          "For those who want understated daily carry. Lightweight, water-safe, and infinitely adjustable via precision twin sliding barrel knots. Accented with a hand-hammered raw brass NUBB emblem bead.",
        price: 490,
        compare_at_price: 600,
        inventory: 35,
        sku: "NUBB-PB-KNT-02",
        images: JSON.stringify([
          "https://images.unsplash.com/photo-1573408301185-9146fe634ad0?auto=format&fit=crop&w=800&q=80",
          "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80",
        ]),
        features: JSON.stringify([
          "Universal adjustable wrist fit (6.5in to 8.5in)",
          "Solid brass hand-stamped centerpiece",
          "Quick-drying Japanese micro-cord",
          "All-weather daily wearable",
        ]),
        is_featured: 1,
        status: "active",
      },
      {
        name: "Tactile EDC Utility Carabiner & Lanyard",
        slug: "tactile-edc-utility-carabiner",
        category: "accessories",
        tagline: "Quick-release key tethers and gear loop.",
        description:
          "Heavy-gauge matte aluminum carabiner married to a box-braided paracord tail. Ideal for anchoring your NUBB lighter cover, keys, or pouch to belt loops and pack MOLLE webbing.",
        price: 520,
        compare_at_price: 650,
        inventory: 25,
        sku: "NUBB-ACC-CRB-01",
        images: JSON.stringify([
          "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=80",
        ]),
        features: JSON.stringify([
          "Anodized matte earth finish",
          "Snag-free keylock gate design",
          "Box-woven paracord pull tab",
        ]),
        is_featured: 0,
        status: "active",
      },
    ];

    for (const p of sampleProducts) {
      await db.execute({
        sql: `INSERT INTO products (name, slug, category, tagline, description, price, compare_at_price, inventory, sku, images, features, is_featured, status)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
          p.name,
          p.slug,
          p.category,
          p.tagline,
          p.description,
          p.price,
          p.compare_at_price,
          p.inventory,
          p.sku,
          p.images,
          p.features,
          p.is_featured,
          p.status,
        ],
      });
    }
  }
}

// ----------------------------------------------------
// SUBSCRIBERS
// ----------------------------------------------------

export interface Subscriber {
  id: number;
  email: string;
  name: string | null;
  status: string;
  created_at: string;
}

export async function addSubscriber(email: string, name?: string) {
  await initAllTables();
  const db = getTursoClient();
  const normalizedEmail = email.trim().toLowerCase();
  const trimmedName = name?.trim() || null;

  try {
    await db.execute({
      sql: "INSERT INTO subscribers (email, name) VALUES (?, ?)",
      args: [normalizedEmail, trimmedName],
    });
    return { success: true, isNew: true };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    if (
      errorMessage.includes("UNIQUE constraint failed") ||
      errorMessage.includes("already exists") ||
      errorMessage.includes("constraint failed")
    ) {
      if (trimmedName) {
        try {
          await db.execute({
            sql: "UPDATE subscribers SET name = ? WHERE email = ?",
            args: [trimmedName, normalizedEmail],
          });
        } catch {}
      }
      return { success: true, isNew: false, message: "You're already on the list!" };
    }
    throw error;
  }
}

export async function getSubscribers(
  search?: string,
  status?: string
): Promise<Subscriber[]> {
  await initAllTables();
  const db = getTursoClient();

  let query = "SELECT * FROM subscribers WHERE 1=1";
  const args: InValue[] = [];

  if (status && status !== "all") {
    query += " AND status = ?";
    args.push(status);
  }

  if (search && search.trim()) {
    query += " AND (email LIKE ? OR name LIKE ?)";
    const wildcard = `%${search.trim()}%`;
    args.push(wildcard, wildcard);
  }

  query += " ORDER BY created_at DESC";

  const result = await db.execute({ sql: query, args });
  return result.rows as unknown as Subscriber[];
}

export async function getSubscriberById(id: number): Promise<Subscriber | null> {
  await initAllTables();
  const db = getTursoClient();
  const result = await db.execute({
    sql: "SELECT * FROM subscribers WHERE id = ?",
    args: [id],
  });
  if (result.rows.length === 0) return null;
  return result.rows[0] as unknown as Subscriber;
}

export async function deleteSubscriber(id: number): Promise<boolean> {
  await initAllTables();
  const db = getTursoClient();
  const result = await db.execute({
    sql: "DELETE FROM subscribers WHERE id = ?",
    args: [id],
  });
  return result.rowsAffected > 0;
}

export async function updateSubscriber(
  id: number,
  data: { status?: string; name?: string; email?: string }
): Promise<boolean> {
  await initAllTables();
  const db = getTursoClient();

  const updates: string[] = [];
  const args: InValue[] = [];

  if (data.status !== undefined) {
    updates.push("status = ?");
    args.push(data.status);
  }
  if (data.name !== undefined) {
    updates.push("name = ?");
    args.push(data.name.trim() || null);
  }
  if (data.email !== undefined) {
    updates.push("email = ?");
    args.push(data.email.trim().toLowerCase());
  }

  if (updates.length === 0) return false;

  args.push(id);
  const result = await db.execute({
    sql: `UPDATE subscribers SET ${updates.join(", ")} WHERE id = ?`,
    args,
  });

  return result.rowsAffected > 0;
}

export async function getSubscribersCount() {
  try {
    await initAllTables();
    const db = getTursoClient();
    const result = await db.execute("SELECT COUNT(*) as count FROM subscribers");
    return Number(result.rows[0]?.count ?? 0);
  } catch {
    return 0;
  }
}

// ----------------------------------------------------
// ADMIN USERS
// ----------------------------------------------------

export interface AdminUser {
  id: number;
  name: string;
  username: string;
  email: string;
  password_hash: string;
  salt: string;
  role: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export async function getAdminUserByUsernameOrEmail(identifier: string): Promise<AdminUser | null> {
  await initAllTables();
  const db = getTursoClient();
  const lower = identifier.trim().toLowerCase();
  const result = await db.execute({
    sql: "SELECT * FROM admin_users WHERE LOWER(username) = ? OR LOWER(email) = ? LIMIT 1",
    args: [lower, lower],
  });
  if (result.rows.length === 0) return null;
  return result.rows[0] as unknown as AdminUser;
}

export async function getAdminUsers(): Promise<Omit<AdminUser, "password_hash" | "salt">[]> {
  await initAllTables();
  const db = getTursoClient();
  const result = await db.execute(
    "SELECT id, name, username, email, role, status, created_at, updated_at FROM admin_users ORDER BY id ASC"
  );
  return result.rows as unknown as Omit<AdminUser, "password_hash" | "salt">[];
}

export async function createAdminUser(data: {
  name: string;
  username: string;
  email: string;
  password: string;
  role?: string;
}) {
  await initAllTables();
  const db = getTursoClient();
  const { hash, salt } = hashPassword(data.password);

  const result = await db.execute({
    sql: `INSERT INTO admin_users (name, username, email, password_hash, salt, role, status)
          VALUES (?, ?, ?, ?, ?, ?, 'active')`,
    args: [
      data.name.trim(),
      data.username.trim().toLowerCase(),
      data.email.trim().toLowerCase(),
      hash,
      salt,
      data.role || "admin",
    ],
  });
  return { id: Number(result.lastInsertRowid) };
}

export async function updateAdminUser(
  id: number,
  data: {
    name?: string;
    email?: string;
    password?: string;
    role?: string;
    status?: string;
  }
) {
  await initAllTables();
  const db = getTursoClient();
  const sets: string[] = ["updated_at = CURRENT_TIMESTAMP"];
  const args: InValue[] = [];

  if (data.name) {
    sets.push("name = ?");
    args.push(data.name.trim());
  }
  if (data.email) {
    sets.push("email = ?");
    args.push(data.email.trim().toLowerCase());
  }
  if (data.role) {
    sets.push("role = ?");
    args.push(data.role);
  }
  if (data.status) {
    sets.push("status = ?");
    args.push(data.status);
  }
  if (data.password && data.password.trim().length > 0) {
    const { hash, salt } = hashPassword(data.password.trim());
    sets.push("password_hash = ?");
    args.push(hash);
    sets.push("salt = ?");
    args.push(salt);
  }

  args.push(id);
  await db.execute({
    sql: `UPDATE admin_users SET ${sets.join(", ")} WHERE id = ?`,
    args,
  });
  return { success: true };
}

export async function deleteAdminUser(id: number) {
  await initAllTables();
  const db = getTursoClient();
  // Ensure we do not delete the last superadmin
  const totalSuper = await db.execute("SELECT COUNT(*) as count FROM admin_users WHERE role = 'superadmin'");
  const user = await db.execute({ sql: "SELECT role FROM admin_users WHERE id = ?", args: [id] });
  if (user.rows[0]?.role === "superadmin" && Number(totalSuper.rows[0]?.count ?? 0) <= 1) {
    throw new Error("Cannot delete the only Super Admin.");
  }

  await db.execute({ sql: "DELETE FROM admin_users WHERE id = ?", args: [id] });
  return { success: true };
}

// ----------------------------------------------------
// PRODUCTS
// ----------------------------------------------------

export interface Product {
  id: number;
  name: string;
  slug: string;
  category: string;
  tagline: string | null;
  description: string | null;
  price: number;
  compare_at_price: number | null;
  inventory: number;
  sku: string | null;
  images: string; // JSON string
  features: string | null; // JSON string
  is_featured: number;
  status: string;
  created_at: string;
  updated_at: string;
}

export async function getProducts(options?: {
  category?: string;
  status?: string;
  featuredOnly?: boolean;
}): Promise<Product[]> {
  await initAllTables();
  const db = getTursoClient();
  const conditions: string[] = [];
  const args: InValue[] = [];

  if (options?.category && options.category !== "all") {
    conditions.push("category = ?");
    args.push(options.category);
  }
  if (options?.status) {
    conditions.push("status = ?");
    args.push(options.status);
  } else {
    // default to active if not specified
    conditions.push("status != 'archived'");
  }
  if (options?.featuredOnly) {
    conditions.push("is_featured = 1");
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
  const result = await db.execute({
    sql: `SELECT * FROM products ${whereClause} ORDER BY is_featured DESC, id DESC`,
    args,
  });

  return result.rows as unknown as Product[];
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  await initAllTables();
  const db = getTursoClient();
  const result = await db.execute({
    sql: "SELECT * FROM products WHERE slug = ? LIMIT 1",
    args: [slug],
  });
  if (result.rows.length === 0) return null;
  return result.rows[0] as unknown as Product;
}

export async function getProductById(id: number): Promise<Product | null> {
  await initAllTables();
  const db = getTursoClient();
  const result = await db.execute({
    sql: "SELECT * FROM products WHERE id = ?",
    args: [id],
  });
  if (result.rows.length === 0) return null;
  return result.rows[0] as unknown as Product;
}

export async function createProduct(data: {
  name: string;
  slug?: string;
  category: string;
  tagline?: string;
  description?: string;
  price: number;
  compare_at_price?: number;
  inventory?: number;
  sku?: string;
  images: string[];
  features?: string[];
  is_featured?: number;
  status?: string;
}) {
  await initAllTables();
  const db = getTursoClient();

  const slug =
    data.slug ||
    data.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

  const result = await db.execute({
    sql: `INSERT INTO products (name, slug, category, tagline, description, price, compare_at_price, inventory, sku, images, features, is_featured, status)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [
      data.name,
      slug,
      data.category,
      data.tagline || "",
      data.description || "",
      data.price,
      data.compare_at_price || null,
      data.inventory ?? 0,
      data.sku || "",
      JSON.stringify(data.images || []),
      JSON.stringify(data.features || []),
      data.is_featured ? 1 : 0,
      data.status || "active",
    ],
  });

  return { id: Number(result.lastInsertRowid), slug };
}

export async function updateProduct(
  id: number,
  data: Partial<{
    name: string;
    slug: string;
    category: string;
    tagline: string;
    description: string;
    price: number;
    compare_at_price: number | null;
    inventory: number;
    sku: string;
    images: string[];
    features: string[];
    is_featured: number;
    status: string;
  }>
) {
  await initAllTables();
  const db = getTursoClient();
  const sets: string[] = ["updated_at = CURRENT_TIMESTAMP"];
  const args: InValue[] = [];

  if (data.name !== undefined) {
    sets.push("name = ?");
    args.push(data.name);
  }
  if (data.slug !== undefined) {
    sets.push("slug = ?");
    args.push(data.slug);
  }
  if (data.category !== undefined) {
    sets.push("category = ?");
    args.push(data.category);
  }
  if (data.tagline !== undefined) {
    sets.push("tagline = ?");
    args.push(data.tagline);
  }
  if (data.description !== undefined) {
    sets.push("description = ?");
    args.push(data.description);
  }
  if (data.price !== undefined) {
    sets.push("price = ?");
    args.push(data.price);
  }
  if (data.compare_at_price !== undefined) {
    sets.push("compare_at_price = ?");
    args.push(data.compare_at_price);
  }
  if (data.inventory !== undefined) {
    sets.push("inventory = ?");
    args.push(data.inventory);
  }
  if (data.sku !== undefined) {
    sets.push("sku = ?");
    args.push(data.sku);
  }
  if (data.images !== undefined) {
    sets.push("images = ?");
    args.push(JSON.stringify(data.images));
  }
  if (data.features !== undefined) {
    sets.push("features = ?");
    args.push(JSON.stringify(data.features));
  }
  if (data.is_featured !== undefined) {
    sets.push("is_featured = ?");
    args.push(data.is_featured ? 1 : 0);
  }
  if (data.status !== undefined) {
    sets.push("status = ?");
    args.push(data.status);
  }

  args.push(id);
  await db.execute({
    sql: `UPDATE products SET ${sets.join(", ")} WHERE id = ?`,
    args,
  });

  return { success: true };
}

export async function deleteProduct(id: number) {
  await initAllTables();
  const db = getTursoClient();
  await db.execute({
    sql: "UPDATE products SET status = 'archived', updated_at = CURRENT_TIMESTAMP WHERE id = ?",
    args: [id],
  });
  return { success: true };
}

export async function updateProductStock(id: number, delta: number) {
  await initAllTables();
  const db = getTursoClient();
  await db.execute({
    sql: "UPDATE products SET inventory = MAX(0, inventory + ?), updated_at = CURRENT_TIMESTAMP WHERE id = ?",
    args: [delta, id],
  });
  return { success: true };
}

// ----------------------------------------------------
// ORDERS
// ----------------------------------------------------

export interface OrderItem {
  productId: number;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

export interface ShippingAddress {
  address: string;
  city: string;
  province: string;
  postalCode: string;
  country: string;
}

export interface Order {
  id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string | null;
  shipping_address: string; // JSON
  items: string; // JSON
  subtotal: number;
  shipping_fee: number;
  total_amount: number;
  payment_method: string;
  payment_status: string;
  order_status: string;
  payment_proof_url: string | null;
  tracking_number: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export async function createOrder(data: {
  customer_name: string;
  customer_email: string;
  customer_phone?: string;
  shipping_address: ShippingAddress;
  items: OrderItem[];
  subtotal: number;
  shipping_fee: number;
  total_amount: number;
  payment_method: string;
  payment_proof_url?: string;
  notes?: string;
}): Promise<string> {
  await initAllTables();
  const db = getTursoClient();

  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(1000 + Math.random() * 9000);
  const orderId = `NUBB-${timestamp}-${random}`;

  // Decrement inventory for each item
  for (const item of data.items) {
    await updateProductStock(item.productId, -item.quantity);
  }

  await db.execute({
    sql: `INSERT INTO orders (id, customer_name, customer_email, customer_phone, shipping_address, items, subtotal, shipping_fee, total_amount, payment_method, payment_status, order_status, payment_proof_url, notes)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', 'pending', ?, ?)`,
    args: [
      orderId,
      data.customer_name,
      data.customer_email,
      data.customer_phone || "",
      JSON.stringify(data.shipping_address),
      JSON.stringify(data.items),
      data.subtotal,
      data.shipping_fee,
      data.total_amount,
      data.payment_method,
      data.payment_proof_url || null,
      data.notes || "",
    ],
  });

  return orderId;
}

export async function getOrders(statusFilter?: string): Promise<Order[]> {
  await initAllTables();
  const db = getTursoClient();

  if (statusFilter && statusFilter !== "all") {
    const result = await db.execute({
      sql: "SELECT * FROM orders WHERE order_status = ? ORDER BY created_at DESC",
      args: [statusFilter],
    });
    return result.rows as unknown as Order[];
  }

  const result = await db.execute("SELECT * FROM orders ORDER BY created_at DESC");
  return result.rows as unknown as Order[];
}

export async function getOrderById(id: string): Promise<Order | null> {
  await initAllTables();
  const db = getTursoClient();
  const result = await db.execute({
    sql: "SELECT * FROM orders WHERE id = ? LIMIT 1",
    args: [id],
  });
  if (result.rows.length === 0) return null;
  return result.rows[0] as unknown as Order;
}

export async function updateOrderStatus(
  id: string,
  data: {
    order_status?: string;
    payment_status?: string;
    tracking_number?: string;
  }
) {
  await initAllTables();
  const db = getTursoClient();
  const sets: string[] = ["updated_at = CURRENT_TIMESTAMP"];
  const args: InValue[] = [];

  if (data.order_status) {
    sets.push("order_status = ?");
    args.push(data.order_status);
  }
  if (data.payment_status) {
    sets.push("payment_status = ?");
    args.push(data.payment_status);
  }
  if (data.tracking_number !== undefined) {
    sets.push("tracking_number = ?");
    args.push(data.tracking_number);
  }

  args.push(id);
  await db.execute({
    sql: `UPDATE orders SET ${sets.join(", ")} WHERE id = ?`,
    args,
  });

  return { success: true };
}

// ----------------------------------------------------
// PAYMENT METHODS
// ----------------------------------------------------

export interface PaymentMethod {
  id: string;
  name: string;
  account_name: string | null;
  account_number: string | null;
  instructions: string | null;
  qr_code_url: string | null;
  is_active: number;
  sort_order: number;
}

export async function getPaymentMethods(onlyActive = true): Promise<PaymentMethod[]> {
  await initAllTables();
  const db = getTursoClient();
  const sql = onlyActive
    ? "SELECT * FROM payment_methods WHERE is_active = 1 ORDER BY sort_order ASC"
    : "SELECT * FROM payment_methods ORDER BY sort_order ASC";

  const result = await db.execute(sql);
  return result.rows as unknown as PaymentMethod[];
}

export async function updatePaymentMethod(
  id: string,
  data: Partial<{
    name: string;
    account_name: string;
    account_number: string;
    instructions: string;
    qr_code_url: string;
    is_active: number;
  }>
) {
  await initAllTables();
  const db = getTursoClient();
  const sets: string[] = [];
  const args: InValue[] = [];

  if (data.name !== undefined) {
    sets.push("name = ?");
    args.push(data.name);
  }
  if (data.account_name !== undefined) {
    sets.push("account_name = ?");
    args.push(data.account_name);
  }
  if (data.account_number !== undefined) {
    sets.push("account_number = ?");
    args.push(data.account_number);
  }
  if (data.instructions !== undefined) {
    sets.push("instructions = ?");
    args.push(data.instructions);
  }
  if (data.qr_code_url !== undefined) {
    sets.push("qr_code_url = ?");
    args.push(data.qr_code_url);
  }
  if (data.is_active !== undefined) {
    sets.push("is_active = ?");
    args.push(data.is_active ? 1 : 0);
  }

  if (sets.length === 0) return { success: true };

  args.push(id);
  await db.execute({
    sql: `UPDATE payment_methods SET ${sets.join(", ")} WHERE id = ?`,
    args,
  });

  return { success: true };
}

// ----------------------------------------------------
// STORE SETTINGS
// ----------------------------------------------------

export async function getStoreSettings(): Promise<Record<string, string>> {
  await initAllTables();
  const db = getTursoClient();
  const result = await db.execute("SELECT key, value FROM store_settings");
  const settings: Record<string, string> = {};
  for (const row of result.rows) {
    if (row.key && typeof row.key === "string") {
      settings[row.key] = String(row.value);
    }
  }
  return settings;
}

export async function getStoreSetting(key: string, defaultValue = ""): Promise<string> {
  await initAllTables();
  const db = getTursoClient();
  const result = await db.execute({
    sql: "SELECT value FROM store_settings WHERE key = ? LIMIT 1",
    args: [key],
  });
  if (result.rows.length === 0) return defaultValue;
  return String(result.rows[0]?.value ?? defaultValue);
}

export async function setStoreSetting(key: string, value: string) {
  await initAllTables();
  const db = getTursoClient();
  await db.execute({
    sql: "INSERT OR REPLACE INTO store_settings (key, value) VALUES (?, ?)",
    args: [key, value],
  });
  return { success: true };
}

// ----------------------------------------------------
// DASHBOARD METRICS
// ----------------------------------------------------

export async function getDashboardMetrics() {
  await initAllTables();
  const db = getTursoClient();

  const totalSalesRes = await db.execute(
    "SELECT COALESCE(SUM(total_amount), 0) as total FROM orders WHERE payment_status = 'verified' OR payment_status = 'paid'"
  );
  const totalOrdersRes = await db.execute("SELECT COUNT(*) as count FROM orders");
  const pendingOrdersRes = await db.execute(
    "SELECT COUNT(*) as count FROM orders WHERE order_status = 'pending'"
  );
  const lowStockRes = await db.execute(
    "SELECT * FROM products WHERE inventory <= 5 AND status = 'active' ORDER BY inventory ASC"
  );
  const recentOrdersRes = await db.execute(
    "SELECT * FROM orders ORDER BY created_at DESC LIMIT 6"
  );

  const totalSubscribersRes = await db.execute("SELECT COUNT(*) as count FROM subscribers");
  const activeSubscribersRes = await db.execute(
    "SELECT COUNT(*) as count FROM subscribers WHERE status = 'active'"
  );

  return {
    totalRevenue: Number(totalSalesRes.rows[0]?.total ?? 0),
    totalOrders: Number(totalOrdersRes.rows[0]?.count ?? 0),
    pendingOrders: Number(pendingOrdersRes.rows[0]?.count ?? 0),
    totalSubscribers: Number(totalSubscribersRes.rows[0]?.count ?? 0),
    activeSubscribers: Number(activeSubscribersRes.rows[0]?.count ?? 0),
    lowStockProducts: lowStockRes.rows as unknown as Product[],
    recentOrders: recentOrdersRes.rows as unknown as Order[],
  };
}
