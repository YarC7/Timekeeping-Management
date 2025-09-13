/**
 * @param {import("knex").Knex} knex
 */
exports.seed = async function (knex) {
  // Xoá dữ liệu cũ
  await knex("attendances").del();

  const employees = await knex("employees").select("employee_id");

  // Tạo attendance cho mỗi nhân viên
  const now = new Date();
  await knex("attendances").insert(
    employees.map((e, i) => ({
      employee_id: e.employee_id,
      check_in: new Date(now.getTime() - (i + 1) * 3600 * 1000),
      check_out: new Date(now.getTime() - i * 3600 * 1000),
      status: "Present",
    }))
  );
};
