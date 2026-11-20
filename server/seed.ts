import 'dotenv/config';
import { initDatabase, resetAndSeedStore } from './store';

async function runSeed() {
  const mode = await initDatabase();
  await resetAndSeedStore();
  console.log(`[Flytrox Seed] Successfully seeded destinations, packages, and sample inquiries (${mode} mode).`);
  process.exit(0);
}

runSeed().catch((err) => {
  console.error('[Flytrox Seed] Failed:', err);
  process.exit(1);
});
