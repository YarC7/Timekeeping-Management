/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function seed(knex) {
  // Clear tables (theo thứ tự phụ thuộc)
  await knex("timekeeping").del();
  await knex("face_embeddings").del();
  await knex("employees").del();
  await knex("users").del();

  // 1. Users (Admin & HR)
  const [adminUser, hrUser] = await knex("users")
    .insert([
      {
        email: "admin@company.com",
        password_hash: "hashed_admin_pw", // TODO: bcrypt hash
        role: "admin",
      },
      {
        email: "hr@company.com",
        password_hash: "hashed_hr_pw",
        role: "hr",
      },
    ])
    .returning("*");

  // 2. Employees
  const [emp1, emp2] = await knex("employees")
    .insert([
      {
        employee_id: "HP001",
        full_name: "Nguyen Van A",
        email: "a@company.com",
        phone: "0909000001",
        position: "Developer",
        role: "employee",
      },
      {
        employee_id: "HP002",
        full_name: "Tran Thi B",
        email: "b@company.com",
        phone: "0909000002",
        position: "Designer",
        role: "employee",
      },
    ])
    .returning("*");

  // Helper: random embedding
  function randomEmbedding(dim = 512) {
    return Array.from({ length: dim }, () =>
      parseFloat((Math.random() * 2 - 1).toFixed(4)),
    );
  }

  // 3. Face Embeddings (có image_url)
  await knex("face_embeddings").insert([
    {
      employee_id: emp1.employee_id,
      embedding: JSON.stringify(randomEmbedding()),
      image_url: "/uploads/emp1_face.jpg",
    },
    {
      employee_id: emp2.employee_id,
      embedding: JSON.stringify(randomEmbedding()),
      image_url: "/uploads/emp2_face.jpg",
    },
  ]);

  // 4. Timekeeping logs
  await knex("timekeeping").insert([
    {
      employee_id: emp1.employee_id,
      work_date: knex.fn.now(),
      check_type: "checkin",
      timestamp: knex.fn.now(),
      similarity: 0.97,
      success_image: "/logs/emp1_checkin.jpg",
    },
    {
      employee_id: emp1.employee_id,
      work_date: knex.fn.now(),
      check_type: "checkout",
      timestamp: knex.fn.now(),
      similarity: 0.95,
      success_image: "/logs/emp1_checkout.jpg",
    },
    {
      employee_id: emp2.employee_id,
      work_date: knex.fn.now(),
      check_type: "checkin",
      timestamp: knex.fn.now(),
      similarity: 0.98,
      success_image: "/logs/emp2_checkin.jpg",
    },
  ]);

  console.log("✅ Seed data inserted!");
}
