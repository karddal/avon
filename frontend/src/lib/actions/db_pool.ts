import {Pool} from "pg";

const global_pool = globalThis as unknown as {
    pg_pool?: Pool;
}

export const pool =
    global_pool.pg_pool ??
    new Pool({
        connectionString: process.env.BA_DATABASE_URL,
        ssl: {
            rejectUnauthorized: false,
        },
    });

