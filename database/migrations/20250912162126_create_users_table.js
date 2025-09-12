export async function up(knex) {
  await knex.schema.createTable("users", (table) => {
    table.increments("id").primary();
    table.string("name").notNullable();
    table.string("email").unique().notNullable();
    table.timestamps(true, true); // created_at, updated_at
  });
}

export async function down(knex) {
  await knex.schema.dropTableIfExists("users");
}