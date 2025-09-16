/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  // Users (admin / HR login)
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

  // Employee Images (raw face images / videos)
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
    table.text("url").notNullable(); // path hoặc object storage url
    table.timestamps(true, true);
  });

  // Face Embeddings (JSONB instead of pgvector)
  await knex.schema.createTable("face_embeddings", (table) => {
    table
      .uuid("vector_id")
      .primary()
      .defaultTo(knex.raw("gen_random_uuid()"));
    table
      .uuid("employee_id")
      .notNullable()
      .references("employee_id")
      .inTable("employees")
      .onDelete("CASCADE");
    table
      .uuid("image_id")
      .references("image_id")
      .inTable("employee_images")
      .onDelete("SET NULL");
    table.jsonb("embedding").notNullable(); // lưu mảng vector dưới dạng JSON
    table.text("source"); // nguồn gốc (ảnh/video)
    table.timestamps(true, true);
  });

  // Attendance Logs (raw events)
  await knex.schema.createTable("attendance_logs", (table) => {
    table.increments("log_id").primary();
    table
      .uuid("employee_id")
      .references("employee_id")
      .inTable("employees")
      .onDelete("CASCADE");
    table
      .enu("check_type", ["checkin", "checkout"], {
        useNative: true,
        enumName: "check_type_enum",
      })
      .notNullable();
    table.timestamp("timestamp").defaultTo(knex.fn.now());
    table.float("similarity"); // độ khớp với vector
  });

  // Timekeeping (daily summary)
  await knex.schema.createTable("timekeeping", (table) => {
    table
      .uuid("timekeeping_id")
      .primary()
      .defaultTo(knex.raw("gen_random_uuid()"));
    table
      .uuid("employee_id")
      .notNullable()
      .references("employee_id")
      .inTable("employees")
      .onDelete("CASCADE");
    table.date("work_date").notNullable().defaultTo(knex.fn.now());
    table.timestamp("check_in");
    table.timestamp("check_out");
    table.decimal("total_hours", 5, 2);
    table
      .enu(
        "status",
        ["Present", "Absent", "Late", "Leave", "Not-checked-out"],
        {
          useNative: true,
          enumName: "timekeeping_status_enum",
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
  await knex.schema.dropTableIfExists("timekeeping");
  await knex.schema.dropTableIfExists("attendance_logs");
  await knex.schema.dropTableIfExists("face_embeddings");
  await knex.schema.dropTableIfExists("employee_images");
  await knex.schema.dropTableIfExists("employees");
  await knex.schema.dropTableIfExists("users");
  await knex.raw(`DROP TYPE IF EXISTS timekeeping_status_enum`);
  await knex.raw(`DROP TYPE IF EXISTS check_type_enum`);
}
