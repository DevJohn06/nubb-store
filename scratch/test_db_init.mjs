import { initAllTables, getProducts, getAdminUsers, getPaymentMethods, getStoreSettings } from "../src/lib/turso.ts";

async function main() {
  console.log("Initializing database tables...");
  await initAllTables();
  console.log("Tables initialized!");

  const products = await getProducts();
  console.log(`Loaded ${products.length} products:`);
  for (const p of products) {
    console.log(`- [${p.category}] ${p.name} (Stock: ${p.inventory}, Price: ₱${p.price})`);
  }

  const admins = await getAdminUsers();
  console.log(`Admin users (${admins.length}):`, admins.map(a => a.username));

  const pms = await getPaymentMethods(false);
  console.log(`Payment methods (${pms.length}):`, pms.map(p => p.name));

  const settings = await getStoreSettings();
  console.log("Store settings:", settings);
}

main().catch(console.error);
