import { auth } from "@/lib/auth";
import {DatabaseSync} from "node:sqlite";
import {readFileSync} from "node:fs";

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
  const statement = readFileSync('./src/scripts/seed prod.sql', 'utf-8')
  const result = db.exec(statement)

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
