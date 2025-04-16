
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret";
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "your_refresh_secret";
const JWT_EXPIRES_IN = "7d"; // Short-lived access token
const REFRESH_EXPIRES_IN = "7d"; // Refresh token lasts 7 days

export interface TokenPayload {
  userId: string;
  role: string;
}

export const generateToken = (userId: string, role: string) => {
  const token = jwt.sign({ userId, role }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
  const refreshToken = jwt.sign({ userId, role }, JWT_REFRESH_SECRET, { expiresIn: REFRESH_EXPIRES_IN });

  return { token, refreshToken };
}
