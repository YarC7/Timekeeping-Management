import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import { SessionModel } from "../models/session.model";
import { UserModel } from "../models/user.model";
import bcrypt from "bcryptjs";

const ACCESS_TOKEN_EXPIRES_IN = "15m";
const REFRESH_TOKEN_EXPIRES_IN = 7 * 24 * 60 * 60; // 7 days in seconds
const JWT_SECRET = process.env.JWT_SECRET || "secret";
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "refresh_secret";

export class AuthService {
  static async login(
    email: string,
    password: string,
    userAgent?: string,
    ipAddress?: string,
  ) {
    const user = await UserModel.findByEmail(email);
    if (!user) {
      throw new Error("Invalid credentials");
    }
   
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) throw new Error("Invalid credentials");
    const sessionId = uuidv4();
    const accessToken = jwt.sign(
      {
        user_id: user.user_id,
        email: user.email,
        session_id: sessionId,
        role: user.role,
      },
      JWT_SECRET,
      { expiresIn: ACCESS_TOKEN_EXPIRES_IN },
    );
    const refreshToken = jwt.sign(
      { user_id: user.user_id, session_id: sessionId },
      JWT_REFRESH_SECRET,
      { expiresIn: REFRESH_TOKEN_EXPIRES_IN },
    );
    const refreshTokenHash = await bcrypt.hash(refreshToken, 10);
    const expiresAt = new Date(Date.now() + REFRESH_TOKEN_EXPIRES_IN * 1000);
    await SessionModel.create({
      id: sessionId,
      userId: user.user_id,
      refreshToken: refreshTokenHash,
      expiresAt,
    });
    return { accessToken, refreshToken, user };
  }

  static async logout(sessionId: string) {
    await SessionModel.destroy(sessionId);
  }

  static async refresh(refreshToken: string) {
    let payload: any;
    try {
      payload = jwt.verify(refreshToken, JWT_REFRESH_SECRET);
    } catch {
      throw new Error("Invalid refresh token");
    }
    const session = await SessionModel.findById(payload.session_id);
    if (!session) throw new Error("Invalid session");
    const valid = await bcrypt.compare(
      refreshToken,
      // DB column is refresh_token_hash
      session.refresh_token_hash,
    );
    if (!valid) throw new Error("Invalid refresh token");
    if (new Date(session.expires_at) < new Date())
      throw new Error("Session expired");
    // Lấy email từ DB để đưa vào accessToken mới
    const user = await UserModel.findById(payload.user_id);
    const accessToken = jwt.sign(
      {
        user_id: payload.user_id,
        email: user?.email,
        session_id: payload.session_id,
        // Session không lưu role; lấy role từ user
        role: user?.role,
      },
      JWT_SECRET,
      { expiresIn: ACCESS_TOKEN_EXPIRES_IN },
    );
    return { accessToken };
  }
}
