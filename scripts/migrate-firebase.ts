import "../server/env";
import { migrateAllDataToFirebase } from "../server/db";

try {
  const result = await migrateAllDataToFirebase();
  console.log("[FIREBASE] Full migration completed:", JSON.stringify(result, null, 2));
  process.exit(0);
} catch (error) {
  console.error("[FIREBASE] Full migration failed:", error instanceof Error ? error.message : error);
  process.exit(1);
}
