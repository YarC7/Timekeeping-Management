// knexfile.js
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

export default {
  development: {
    client: "pg",
    connection: process.env.DATABASE_URL,
    migrations: {
      directory: "./database/migrations",
      extension: "js",
    },
    seeds: {
      directory: "./database/seeds",
      extension: "js",
    },
  },
};
