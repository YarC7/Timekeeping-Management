/**
 * @param {import("knex").Knex} knex
 */
exports.up = async function (knex) {
  await knex.schema.createTable("users", (table) => {
    table
      .uuid("user_id")
      .primary()
      .defaultTo(knex.raw("gen_random_uuid()"));
    table.string("email").notNullable().unique().index();
    table.string("password_hash").notNullable(); // đổi tên cho rõ
    table.enu("role", ["admin", "hr"]).defaultTo("admin"); // role enum thay vì string tự do
    table.timestamps(true, true); // created_at, updated_at
  });
};

exports.down = async function (knex) {
  await knex.schema.dropTableIfExists("users");
};
