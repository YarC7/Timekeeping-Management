import { Request, Response } from "express";
import { AuthService } from "../services/auth.service";

export const AuthController = {
  async login(req: Request, res: Response) {
    const { email, password } = req.body;
    try {
      const result = await AuthService.login(
        email,
        password,
        req.headers["user-agent"],
        req.ip,
      );
      res.json(result);
    } catch (err: any) {
      console.error("[ERROR] Controller login:", err);
      res.status(401).json({ message: err?.message || "Invalid credentials" });
    }
  },

  async logout(req: Request, res: Response) {
    const { session_id } = req.body;
    try {
      await AuthService.logout(session_id);
      res.json({ message: "Logged out" });
    } catch (err) {
      res.status(400).json({ message: "Logout failed" });
    }
  },

  async refresh(req: Request, res: Response) {
    const { refreshToken } = req.body;
    try {
      const { accessToken } = await AuthService.refresh(refreshToken);
      res.json({ accessToken });
    } catch (err) {
      res.status(401).json({ message: "Invalid refresh token" });
    }
  },
};
