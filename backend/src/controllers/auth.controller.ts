import { NextFunction, Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { validateFields } from "../utils/validateFields";
import httpResponse from "../utils/httpResponse";
import User from "../models/User";
import { generateToken } from "../utils/generateToken";
import redisClient from "../cache/redisClient";
import httpError from "../utils/httpError";
import sendEmail from "../utils/sendEmail";

const authController = {
  // SIGNUP
  signup: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { name, email, phone, password, role } = req.body;
      const userProfile = req.file ? req.file.path : undefined;

      if (!validateFields({ name, email, phone, password })) {
        return httpResponse(req, res, 400, "All fields are required");
      }

      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return httpResponse(req, res, 400, "User already exists");
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const newUser = new User({
        name,
        email,
        phone,
        userProfile,
        password: hashedPassword,
        role: role || "seeker",
        isVerified: false,
      });

      const { token, refreshToken } = generateToken((newUser._id as string).toString(), newUser.role);
      await newUser.save();

      await redisClient.setEx(`auth:${newUser._id as string}`, 3600, token);
      await redisClient.setEx(`refresh:${newUser._id as string}`, 604800, refreshToken);

      return httpResponse(req, res, 201, "User registered successfully", {
        token,
        refreshToken,
        user: {
          name: newUser.name,
          email: newUser.email,
          phone: newUser.phone,
          userProfile: newUser.userProfile,
          role: newUser.role,
          isVerified: newUser.isVerified,
        },
      });
    } catch (err) {
      return httpError(next, err, req, 500);
    }
  }
  ,

  // ✅ SIGNIN
  signin: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return httpResponse(req, res, 400, "Email and password are required");
      }

      const user = await User.findOne({ email });
      if (!user) {
        return httpResponse(req, res, 400, "Invalid credentials");
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return httpResponse(req, res, 400, "Invalid credentials");
      }

      const { token, refreshToken } = generateToken(user._id as string, user.role);
      await user.save();

      await redisClient.setEx(`auth:${user._id as string}`, 604800, token);
      await redisClient.setEx(`refresh:${user._id as string}`, 604800, refreshToken);

      return httpResponse(req, res, 200, "Login successful", {
        token,
        refreshToken,
        user: {
          name: user.name,
          email: user.email,
          phone: user.phone,
          userProfile: user.userProfile,
          role: user.role,
          isVerified: user.isVerified,
        },
      });
    } catch (err) {
      return httpError(next, err, req, 500);
    }
  },

  // REFRESH TOKEN
  refreshToken: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { refreshToken } = req.body;
      if (!refreshToken) return httpResponse(req, res, 401, "Unauthorized");

      const JWT_SECRET = process.env.JWT_SECRET!;
      const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET!;
      if (!JWT_SECRET || !JWT_REFRESH_SECRET) {
        throw new Error("JWT_SECRET or JWT_REFRESH_SECRET not set.");
      }

      const decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET) as jwt.JwtPayload;
      const userId = decoded.userId;

      const storedRefreshToken = await redisClient.get(`refresh:${userId}`);
      if (!storedRefreshToken || storedRefreshToken !== refreshToken) {
        return httpResponse(req, res, 403, "Invalid refresh token");
      }

      const { token, refreshToken: newRefreshToken } = generateToken(userId, decoded.role);

      await redisClient.setEx(`auth:${userId}`, 3600, token);
      await redisClient.setEx(`refresh:${userId}`, 604800, newRefreshToken);

      await User.updateOne(
        { _id: userId },
        { $push: { tokens: { token } } }
      );

      return httpResponse(req, res, 200, "Token refreshed", {
        token,
        refreshToken: newRefreshToken,
      });
    } catch (err) {
      return httpResponse(req, res, 403, "Invalid or expired refresh token");
    }
  },

  // LOGOUT
  logout: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.userId;
      if (!userId) return httpResponse(req, res, 401, "Unauthorized");

      await redisClient.del(`auth:${userId}`);
      await redisClient.del(`refresh:${userId}`);

      await User.updateOne({ _id: userId }, { $set: { tokens: [] } });

      return httpResponse(req, res, 200, "Logout successful");
    } catch (err) {
      httpError(next, err, req, 500);
    }
  },

  // FORGOT PASSWORD
  forgotPassword: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email } = req.body;
      if (!email) return httpResponse(req, res, 400, "Email is required");

      const user = await User.findOne({ email }).select("fullName email");
      if (!user) return httpResponse(req, res, 400, "User not found");

      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      await redisClient.set(`otp:${otp}`, email, { EX: 300 });

      const emailTemplate = `
       <!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <title>Password Reset</title>
  </head>
  <body style="margin: 0; padding: 0; background-color: #f4f4f4;">
    <div style="font-family: Arial, sans-serif; text-align: center; padding: 40px 20px;">
      <div style="max-width: 600px; margin: auto; background-color: #ffffff; padding: 30px; border-radius: 10px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);">
        
        <h2 style="color: #2c3e50;">🔒 Password Reset Request</h2>
        
        <p style="font-size: 16px; color: #555;">Hi <strong>${user.name}</strong>,</p>
        
        <p style="font-size: 16px; color: #555;">
          We received a request to reset your password. Please use the OTP below to complete the process:
        </p>
        
        <div style="margin: 30px auto; max-width: 200px; background-color: #3498db; padding: 15px; border-radius: 8px;">
          <h3 style="color: #ffffff; letter-spacing: 2px; margin: 0;">${otp}</h3>
        </div>
        
        <p style="font-size: 14px; color: #888;">This OTP is valid for <strong>5 minutes</strong>. Please do not share it with anyone.</p>
        
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;" />
        
        <p style="font-size: 12px; color: #aaa;">
          If you didn’t request this, please ignore this email. Your account is safe.
        </p>
        
      </div>
    </div>
  </body>
</html>     `;

      await sendEmail(user.email, "Password Reset OTP", emailTemplate);
      return httpResponse(req, res, 200, "OTP sent to email");
    } catch (err) {
      httpError(next, err, req, 500);
    }
  },

  resetPassword: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { otp, newPassword } = req.body;

      if (!otp || !newPassword) {
        return httpResponse(req, res, 400, "OTP and new password are required");
      }

      const email = await redisClient.get(`otp:${otp}`);
      if (!email) {
        return httpResponse(req, res, 400, "Invalid or expired OTP");
      }

      const user = await User.findOne({ email });
      if (!user) {
        return httpResponse(req, res, 400, "User not found");
      }

      const hashedPassword = await bcrypt.hash(newPassword, await bcrypt.genSalt(10));
      user.password = hashedPassword;

      await user.save();
      await redisClient.del(`otp:${otp}`);

      return httpResponse(req, res, 200, "Password reset successful");
    } catch (err) {
      httpError(next, err, req, 500);
    }
  },

  // ✅ VERIFY OTP (for password reset or email verification)
  verifyOtp: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { otp } = req.body;
      if (!otp) return httpResponse(req, res, 400, "OTP is required");

      const email = await redisClient.get(`otp:${otp}`);
      if (!email) return httpResponse(req, res, 400, "Invalid or expired OTP");

      await redisClient.del(`otp:${otp}`);
      return httpResponse(req, res, 200, "OTP verified successfully", { email });
    } catch (err) {
      httpError(next, err, req, 500);
    }
  },

  // ✅ GET PROFILE (requires authentication)
  getProfile: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.userId;
      if (!userId) return httpResponse(req, res, 401, "Unauthorized");

      const user = await User.findById(userId).select("-password -tokens");
      if (!user) return httpResponse(req, res, 404, "User not found");

      return httpResponse(req, res, 200, "Profile fetched successfully", { user });
    } catch (err) {
      httpError(next, err, req, 500);
    }
  },

  // ✅ GET ALL USERS (admin only)
  getAllUsers: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const users = await User.find().select("-password -tokens");
      return httpResponse(req, res, 200, "All users fetched successfully", { users });
    } catch (err) {
      httpError(next, err, req, 500);
    }
  },

};

export default authController;