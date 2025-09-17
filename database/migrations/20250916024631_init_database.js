/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  // Users (giữ nguyên uuid cho login user)
  await knex.schema.createTable("users", (table) => {
    table.uuid("user_id").primary().defaultTo(knex.raw("gen_random_uuid()"));
    table.string("email").notNullable().unique().index();
    table.string("password_hash").notNullable();
    table.enu("role", ["admin", "hr"]).defaultTo("admin");
    table.timestamps(true, true);
  });

  // Employees (employee_id = mã nhân viên text, ví dụ HP001)
  await knex.schema.createTable("employees", (table) => {
    table.string("employee_id").primary(); // text id
    table.string("full_name").notNullable();
    table.string("email").notNullable().unique().index();
    table.string("phone").notNullable();
    table.string("position").notNullable();
    table.enu("role", ["employee", "manager", "hr"]).defaultTo("employee");
    table.timestamps(true, true);
  });

  // Face Embeddings
  await knex.schema.createTable("face_embeddings", (table) => {
    table.uuid("vector_id").primary().defaultTo(knex.raw("gen_random_uuid()"));
    table
      .string("employee_id")
      .notNullable()
      .references("employee_id")
      .inTable("employees")
      .onDelete("CASCADE");
    table.jsonb("embedding").notNullable();
    table.text("image_url");
    table.timestamps(true, true);
  });

  // Timekeeping (log-based)
  await knex.schema.createTable("timekeeping", (table) => {
    table.increments("log_id").primary();
    table
      .string("employee_id")
      .notNullable()
      .references("employee_id")
      .inTable("employees")
      .onDelete("CASCADE");
    table.date("work_date").notNullable().defaultTo(knex.fn.now());
    table
      .enu("check_type", ["checkin", "checkout"], {
        useNative: true,
        enumName: "check_type_enum",
      })
      .notNullable();
    table.timestamp("timestamp").defaultTo(knex.fn.now());
    table.float("similarity");
    table.text("success_image");
    table.timestamps(true, true);
  });
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  await knex.schema.dropTableIfExists("timekeeping");
  await knex.schema.dropTableIfExists("face_embeddings");
  await knex.schema.dropTableIfExists("employees");
  await knex.schema.dropTableIfExists("users");
  await knex.raw(`DROP TYPE IF EXISTS check_type_enum`);
}
