require("dotenv").config({ path: ".env.local" });

module.exports = {
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
