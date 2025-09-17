/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  await knex.schema.createTable("sessions", (table) => {
    table.uuid("session_id").primary().defaultTo(knex.raw("gen_random_uuid()"));

    // user liên kết
    table.uuid("user_id").notNullable()
      .references("user_id").inTable("users")
      .onDelete("CASCADE");

    // refresh token (hash để bảo mật, không lưu raw token)
    table.text("refresh_token_hash").notNullable();

    // thông tin thiết bị
    table.string("user_agent");
    table.string("ip_address");

    // thời gian
    table.timestamp("created_at").defaultTo(knex.fn.now());
    table.timestamp("expires_at").notNullable();
  });
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  await knex.schema.dropTableIfExists("sessions");
}
