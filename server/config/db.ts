import pkg from "pg";
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const { Pool } = pkg;

const DB_URL = process.env.DATABASE_URL;

export const pool = new Pool({
  connectionString: DB_URL,
});
