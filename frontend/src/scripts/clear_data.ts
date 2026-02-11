import { readFileSync } from "node:fs";
import { DatabaseSync } from "node:sqlite";

async function seed() {
  console.log(process.env);

  // run seeding
  const db = new DatabaseSync("../sqlite.db");
  const _session = db.createSession();
  const statement = readFileSync("./src/scripts/clear_data.sql", "utf-8");
  const _result = db.exec(statement);

  console.log("Cleared DB");
}

seed()
  .then(() => {
    process.exit(0);
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
