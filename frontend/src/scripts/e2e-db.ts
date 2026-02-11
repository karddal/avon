import {copyFileSync, existsSync} from "node:fs";
import * as readline from "node:readline";

const DB = "../sqlite.db"
const BASE = "../sqlite.db.base"
const E2E_DB = "../sqlite.e2e.db"

const isCI = process.env.CI === "true" || process.env.CI === "1"

function askCreateDB(question: string) {
    return new Promise((resolve) => {
        const questionInterface = readline.createInterface({input: process.stdin, output: process.stdout})

        questionInterface.question(question, (answer) => {
            questionInterface.close()
            resolve((answer || "").trim().toLowerCase())
        })
    })
}

async function checkBaseExists() {
    if (existsSync(BASE)) return

    if (!existsSync(DB)) {
        throw new Error("no db exists")
    }

    if (isCI) {
        copyFileSync(DB, BASE)
        return
    }

    const resp = await askCreateDB(
        "Base test db not found\n" +
        "creat one by copying the current DB (y/N):"
    )

    if (resp !== "y" && resp !== "yes") {
        throw new Error("no base test db exists")
    }

    copyFileSync(DB, BASE)
}

async function main() {
    await checkBaseExists()

    copyFileSync(BASE, E2E_DB)
}

main().catch((e) => {
    console.error(e?.message || e);
    process.exit(1);
});