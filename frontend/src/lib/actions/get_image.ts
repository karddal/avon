import {auth} from "@/lib/auth";
import {headers} from "next/headers";
import {Pool} from "pg";
import {DatabaseSync} from "node:sqlite";

export async function get_user_image_from_id(user_id: string): Promise<string> {
    const isProd = process.env.NODE_ENV === "production";
    if (isProd) {
        let db = new Pool({
            connectionString: process.env.BA_DATABASE_URL,
        });

        const result = await db.query("SELECT image from user WHERE id = ?", [user_id]);
        let out = result.rows[0];
        if (!out) {
            throw new Error("cannot find user in db");
        }
        return out;

    } else {
        let db = new DatabaseSync("../sqlite.db");
        const session = db.createSession();
        console.log("querying ", user_id)
        const query = db.prepare("SELECT image FROM user WHERE id = ?");
        const result = query.get(user_id) as { name: string } | undefined;
        if (!result) {
            throw new Error("cannot find user in db");
        }

        return result.name;
    }
}

