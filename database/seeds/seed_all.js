/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function seed(knex) {
  // Xóa dữ liệu cũ (theo thứ tự tránh lỗi FK)
  await knex("attendances").del();
  await knex("employee_images").del();
  await knex("employees").del();
  await knex("users").del();

  // 1. Seed admin user
  const [admin] = await knex("users")
    .insert({
      email: "admin@company.com",
      password_hash: "$2b$10$replace_this_with_bcrypt_hash", // bcrypt hash
      role: "admin",
    })
    .returning("*");

  // 2. Seed employees
  const employees = await knex("employees")
    .insert([
      {
        full_name: "Sarah Lee",
        email: "sarah@company.com",
        phone: "0123456789",
        position: "Developer",
        role: "employee",
      },
      {
        full_name: "John Park",
        email: "john@company.com",
        phone: "0987654321",
        position: "Designer",
        role: "employee",
      },
      {
        full_name: "Alex Kim",
        email: "alex@company.com",
        phone: "0111222333",
        position: "Manager",
        role: "manager",
      },
    ])
    .returning("*");

  // 3. Seed attendances
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  const attendanceData = [
    {
      employee_id: employees[0].employee_id, // Sarah
      date: today.toISOString().slice(0, 10),
      check_in: new Date(`${today.toISOString().slice(0, 10)} 08:55:00`),
      check_out: new Date(`${today.toISOString().slice(0, 10)} 17:30:00`),
      total_hours: 7.5,
      status: "Present",
    },
    {
      employee_id: employees[1].employee_id, // John
      date: today.toISOString().slice(0, 10),
      check_in: new Date(`${today.toISOString().slice(0, 10)} 09:02:00`),
      check_out: null,
      total_hours: null,
      status: "Not-checked-out",
    },
    {
      employee_id: employees[2].employee_id, // Alex
      date: yesterday.toISOString().slice(0, 10),
      check_in: new Date(`${yesterday.toISOString().slice(0, 10)} 08:45:00`),
      check_out: new Date(`${yesterday.toISOString().slice(0, 10)} 16:45:00`),
      total_hours: 8,
      status: "Present",
    },
  ];

  await knex("attendances").insert(attendanceData);

  console.log("✅ Seed data inserted successfully!");
}
