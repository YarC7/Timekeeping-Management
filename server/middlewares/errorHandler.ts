export function errorHandler(err, req, res, next) {
  console.error("🔥 Error:", err);

  // Nếu là lỗi zod
  if (err.name === "ZodError") {
    return res.status(400).json({ 
      error: "Validation error", 
      details: err.errors 
    });
  }

  // Nếu là lỗi custom
  if (err.status) {
    return res.status(err.status).json({ error: err.message });
  }

  // Mặc định: lỗi 500
  res.status(500).json({ error: "Internal Server Error" });
}
