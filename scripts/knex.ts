#!/usr/bin/env ts-node
import { execSync } from "child_process";

execSync(
  `knex ${process.argv.slice(2).join(" ")} --knexfile knexfile.ts`,
  { stdio: "inherit" }
);