/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  // Users (dành cho admin / HR login)
  await knex.schema.createTable("users", (table) => {
    table
      .uuid("user_id")
      .primary()
      .defaultTo(knex.raw("gen_random_uuid()"));
    table.string("email").notNullable().unique().index();
    table.string("password_hash").notNullable();
    table.enu("role", ["admin", "hr"]).defaultTo("admin");
    table.timestamps(true, true);
  });

  // Employees
  await knex.schema.createTable("employees", (table) => {
    table
      .uuid("employee_id")
      .primary()
      .defaultTo(knex.raw("gen_random_uuid()"));
    table.string("full_name").notNullable();
    table.string("email").notNullable().unique().index();
    table.string("phone").notNullable();
    table.string("position").notNullable();
    table.enu("role", ["employee", "manager", "hr"]).defaultTo("employee");
    table.timestamps(true, true);
  });

  // Employee Images (face recognition)
  await knex.schema.createTable("employee_images", (table) => {
    table
      .uuid("image_id")
      .primary()
      .defaultTo(knex.raw("gen_random_uuid()"));
    table
      .uuid("employee_id")
      .notNullable()
      .references("employee_id")
      .inTable("employees")
      .onDelete("CASCADE");
    table.text("url").notNullable();
    table.timestamps(true, true);
  });

  // Attendances
  await knex.schema.createTable("attendances", (table) => {
    table
      .uuid("attendance_id")
      .primary()
      .defaultTo(knex.raw("gen_random_uuid()"));
    table
      .uuid("employee_id")
      .notNullable()
      .references("employee_id")
      .inTable("employees")
      .onDelete("CASCADE");
    table.date("date").notNullable().defaultTo(knex.fn.now());
    table.timestamp("check_in").nullable();
    table.timestamp("check_out").nullable();
    table.decimal("total_hours", 5, 2).nullable();
    table
      .enu(
        "status",
        ["Present", "Absent", "Late", "Leave", "Not-checked-out"],
        {
          useNative: true,
          enumName: "attendance_status_enum",
        }
      )
      .defaultTo("Present");
    table.timestamps(true, true);
  });
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  await knex.schema.dropTableIfExists("attendances");
  await knex.schema.dropTableIfExists("employee_images");
  await knex.schema.dropTableIfExists("employees");
  await knex.schema.dropTableIfExists("users");
  await knex.raw(`DROP TYPE IF EXISTS attendance_status_enum`);
}
