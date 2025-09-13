/**
 * @param {import("knex").Knex} knex
 */
exports.seed = async function (knex) {
  // Xoá dữ liệu cũ trước
  await knex("attendances").del();
  await knex("employees").del();

  // Insert sample employees
  await knex("employees").insert([
    {
      employee_id: knex.raw("gen_random_uuid()"),
      full_name: "Nguyen Van A",
      email: "nguyenvana@company.com",
      phone: "0909000111",
      position: "Software Engineer",
      face_encoding: "encoded_face_data_1",
      role: "employee",
    },
    {
      employee_id: knex.raw("gen_random_uuid()"),
      full_name: "Tran Thi B",
      email: "tranthib@company.com",
      phone: "0909000222",
      position: "UI/UX Designer",
      face_encoding: "encoded_face_data_2",
      role: "employee",
    },
    {
      employee_id: knex.raw("gen_random_uuid()"),
      full_name: "Le Van C",
      email: "levanc@company.com",
      phone: "0909000333",
      position: "Project Manager",
      face_encoding: "encoded_face_data_3",
      role: "manager",
    },
    {
      employee_id: knex.raw("gen_random_uuid()"),
      full_name: "Pham Thi D",
      email: "phamthid@company.com",
      phone: "0909000444",
      position: "HR Specialist",
      face_encoding: "encoded_face_data_4",
      role: "hr",
    },
    {
      employee_id: knex.raw("gen_random_uuid()"),
      full_name: "Do Van E",
      email: "dovane@company.com",
      phone: "0909000555",
      position: "QA Engineer",
      face_encoding: "encoded_face_data_5",
      role: "employee",
    },
  ]);
};
