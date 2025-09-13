exports.up = async function (knex) {
  await knex.schema.createTable("employee_images", (table) => {
    table.uuid("image_id").primary().defaultTo(knex.raw("gen_random_uuid()"));
    table
      .uuid("employee_id")
      .notNullable()
      .references("employee_id")
      .inTable("employees")
      .onDelete("CASCADE");
    table.text("url").notNullable(); // link ảnh (có thể local path hoặc cloud)
    table.timestamps(true, true);
  });
};

exports.down = async function (knex) {
  await knex.schema.dropTableIfExists("employee_images");
};
