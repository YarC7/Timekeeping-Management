/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function seed(knex) {
  // Clear tables (reset dữ liệu cũ)
  await knex("timekeeping").del();
  await knex("attendance_logs").del();
  await knex("face_embeddings").del();
  await knex("employee_images").del();
  await knex("employees").del();
  await knex("users").del();

  // 1. Seed Users (Admin & HR)
  const [adminUser] = await knex("users")
    .insert([
      {
        email: "admin@company.com",
        password_hash: "hashed_admin_pw", // TODO: hash bcrypt
        role: "admin",
      },
      {
        email: "hr@company.com",
        password_hash: "hashed_hr_pw",
        role: "hr",
      },
    ])
    .returning("*");

  // 2. Seed Employees
  const [emp1, emp2] = await knex("employees")
    .insert([
      {
        full_name: "Nguyen Van A",
        email: "a@company.com",
        phone: "0909000001",
        position: "Developer",
        role: "employee",
      },
      {
        full_name: "Tran Thi B",
        email: "b@company.com",
        phone: "0909000002",
        position: "Designer",
        role: "employee",
      },
    ])
    .returning("*");

  // 3. Seed Employee Images
  const [img1, img2] = await knex("employee_images")
    .insert([
      {
        employee_id: emp1.employee_id,
        url: "/uploads/a_face1.jpg",
      },
      {
        employee_id: emp2.employee_id,
        url: "/uploads/b_face1.jpg",
      },
    ])
    .returning("*");

  // 4. Seed Face Embeddings (512-dim vector demo)
  function randomEmbedding(dim = 512) {
    return Array.from({ length: dim }, () =>
      parseFloat((Math.random() * 2 - 1).toFixed(4)),
    );
  }

  await knex("face_embeddings").insert([
    {
      employee_id: emp1.employee_id,
      image_id: img1.image_id,
      embedding: JSON.stringify(randomEmbedding()), // ✅ lưu thành JSONB
      source: "registration",
    },
    {
      employee_id: emp2.employee_id,
      image_id: img2.image_id,
      embedding: JSON.stringify(randomEmbedding()),
      source: "registration",
    },
  ]);

  // 5. Seed Attendance Logs (raw events)
  await knex("attendance_logs").insert([
    {
      employee_id: emp1.employee_id,
      check_type: "checkin",
      timestamp: knex.fn.now(),
      similarity: 0.98,
      device_id: "CAM01",
    },
    {
      employee_id: emp1.employee_id,
      check_type: "checkout",
      timestamp: knex.fn.now(),
      similarity: 0.95,
      device_id: "CAM01",
    },
    {
      employee_id: emp2.employee_id,
      check_type: "checkin",
      timestamp: knex.fn.now(),
      similarity: 0.97,
      device_id: "CAM01",
    },
  ]);

  // 6. Seed Timekeeping (daily summary)
  await knex("timekeeping").insert([
    {
      employee_id: emp1.employee_id,
      work_date: knex.fn.now(),
      check_in: knex.fn.now(),
      check_out: knex.fn.now(),
      total_hours: 8.0,
      status: "Present",
    },
    {
      employee_id: emp2.employee_id,
      work_date: knex.fn.now(),
      check_in: knex.fn.now(),
      check_out: null,
      total_hours: 4.5,
      status: "Not-checked-out",
    },
  ]);

  console.log("✅ Seed data inserted!");
}
