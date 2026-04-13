import { readFileSync } from "node:fs";
import { DatabaseSync } from "node:sqlite";
import { api_seed } from "@/scripts/seed_api";

async function seed() {
  // console.log(process.env);
  const db = new DatabaseSync("../sqlite.db");
  db.createSession();

  // Drop all tables
  const dropStatement = readFileSync("./src/scripts/drop.sql", "utf-8");
  db.exec(dropStatement);
  console.log("Dropped all tables");

  // Better Auth
  const baStatement = readFileSync("./src/scripts/seed.sql", "utf-8");
  db.exec(baStatement);
  console.log("Seeded all tables");

  // Data
  await api_seed(db);

  console.log("Seeded DB");
}

seed()
  .then(() => {
    process.exit(0);
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
