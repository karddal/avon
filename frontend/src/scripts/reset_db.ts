import { readFileSync } from "node:fs";
import { DatabaseSync } from "node:sqlite";

interface User {
  name: string;
  email: string;
  password: string;
  role: string;
}

async function seed() {
  console.log(process.env);

  // run seeding
  const db = new DatabaseSync("../sqlite.db");
  const _session = db.createSession();
  const statement = readFileSync("./src/scripts/drop.sql", "utf-8");
  const _result = db.exec(statement);

  console.log("Dropped DB");
}

seed()
  .then(() => {
    process.exit(0);
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
