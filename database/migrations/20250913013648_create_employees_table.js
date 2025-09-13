/**
 * @param {import("knex").Knex} knex
 */
exports.up = async function (knex) {
  await knex.schema.createTable("employees", (table) => {
    table
      .uuid("employee_id")
      .primary()
      .defaultTo(knex.raw("gen_random_uuid()"));
    table.string("email").notNullable().unique().index();
    table.string("full_name").notNullable();
    table.string("phone").notNullable();
    table.string("position").notNullable();
    table.text("face_encoding").nullable();
    table.string("role").defaultTo("employee");
    table.timestamps(true, true);
  });

  await knex.schema.createTable("attendances", (table) => {
    table.increments("attendance_id").primary();
    table
      .uuid("employee_id")
      .notNullable()
      .references("employee_id")
      .inTable("employees")
      .onDelete("CASCADE")
      .index();
    table.timestamp("check_in").nullable();
    table.timestamp("check_out").nullable();
    table
      .enu("status", ["Present", "Absent", "Late", "Leave"])
      .defaultTo("Present");
    table.timestamps(true, true);
  });
};

exports.down = async function (knex) {
  await knex.schema.dropTableIfExists("attendances");
  await knex.schema.dropTableIfExists("employees");
};
