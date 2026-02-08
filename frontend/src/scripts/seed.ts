import { readFileSync } from "node:fs";
import { DatabaseSync } from "node:sqlite";
import { api_seed } from "@/scripts/seed_api";

async function seed() {
  console.log(process.env);

  const db = new DatabaseSync("../sqlite.db");
  db.createSession();
  const statement = readFileSync("./src/scripts/seed.sql", "utf-8");
  db.exec(statement);

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
