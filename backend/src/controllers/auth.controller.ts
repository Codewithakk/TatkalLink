import { NextFunction, Request, Response } from "express";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import jwt from 'jsonwebtoken';
import { validateFields } from "../utils/validateFields";
import httpResponse from "../utils/httpResponse";
import  User from "../models/User";
import { generateToken } from "../utils/generateToken";
import redisClient from "../cache/redisClient";
import httpError from "../utils/httpError";
import sendEmail from "../utils/sendEmail";

export default {
  // **User Signup Function**
  // signup: async (req: Request, res: Response, next: NextFunction) => {
  //   try {
  //     const { userName, userEmail, password } = req.body;
  //     const userProfile = req.file ? req.file.path : null; // Get uploaded profile image URL
  //     if (!validateFields({ userName, userEmail, password })) {
  //       return httpResponse(req, res, 400, "All fields are required except userProfile");
  //     }

  //     const existingUser = await User.findOne({ userEmail });
  //     if (existingUser) {
  //       return httpResponse(req, res, 400, "User already exists");
  //     }

  //     const hashedPassword = await bcrypt.hash(password, await bcrypt.genSalt(10));

  //     const newUser = new User({ userName, userEmail, password: hashedPassword }, userProfile);
  //     await newUser.save();

  //     const token = generateToken(newUser._id as string);
  //     httpResponse(req, res, 201, "User registered successfully", { token, user: newUser });
  //   } catch (err) {
  //     httpError(next, err, req, 500);
  //   }
  // },
  signup: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { userName, userEmail, password } = req.body;
      const userProfile = req.file ? req.file.path : null;
  
      if (!validateFields({ userName, userEmail, password })) {
        return httpResponse(req, res, 400, "All fields are required except userProfile");
      }
  
      const existingUser = await User.findOne({ userEmail });
      if (existingUser) {
        return httpResponse(req, res, 400, "User already exists");
      }
  
      const hashedPassword = await bcrypt.hash(password, await bcrypt.genSalt(10));
      const newUser = new User({ userName, userEmail, password: hashedPassword, userProfile });
      await newUser.save();
  
      // Generate tokens
      const { token, refreshToken } = generateToken(newUser._id as string);
  
      // Store refresh token in Redis
      await redisClient.setEx(`refresh:${newUser._id}`, 604800, refreshToken); // Expires in 7 days
  
      httpResponse(req, res, 201, "User registered successfully", { token, refreshToken, user: newUser });
    } catch (err) {
      httpError(next, err, req, 500);
    }
  },
  
  // **User Sign-In Function**
  // signin: async (req: Request, res: Response, next: NextFunction) => {
  //   try {
  //     const { userEmail, password } = req.body;

  //     if (!validateFields({ userEmail, password })) {
  //       return httpResponse(req, res, 400, "Email and password are required");
  //     }

  //     const user = await User.findOne({ userEmail });
  //     if (!user || !(await bcrypt.compare(password, user.password))) {
  //       return httpResponse(req, res, 400, "Invalid credentials");
  //     }

  //     const token = generateToken(user._id as string);
  //     // 🔹 Store the token in Redis (auto expires in 1 hour)
  //     await redisClient.set(`auth:${user._id}`, token, { EX: 3600 });
  //     httpResponse(req, res, 200, "Login successful", { token, user });
  //   } catch (err) {
  //     httpError(next, err, req, 500);
  //   }
  // },

  // signin: async (req: Request, res: Response, next: NextFunction) => {
  //   try {
  //     const { userEmail, password } = req.body;
  
  //     if (!validateFields({ userEmail, password })) {
  //       return httpResponse(req, res, 400, "Email and password are required");
  //     }
  
  //     const user = await User.findOne({ userEmail }).select("userName userEmail password").lean();
  //     if (!user || !(await bcrypt.compare(password, user.password))) {
  //       return httpResponse(req, res, 400, "Invalid credentials");
  //     }
  
  //     const token = generateToken(user._id as string);
      
  //     // 🔹 Store the token in Redis (expires in 1 day)
  //     // await redisClient.set(`auth:${user._id}`, token, { EX: 86400 });
  //     await redisClient.setEx(`auth:${user._id}`, 86400, token);  
  //     httpResponse(req, res, 200, "Login successful", { token, user });
  //   } catch (err) {
  //     httpError(next, err, req, 500);
  //   }
  // },
  signin: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { userEmail, password } = req.body;

      if (!userEmail || !password) {
          return httpResponse(req, res, 400, "Email and password are required");
      }

      const user = await User.findOne({ userEmail }).select("userName userEmail password").lean();
      if (!user || !(await bcrypt.compare(password, user.password))) {
          return httpResponse(req, res, 400, "Invalid credentials");
      }

      // Generate new tokens
      const { token, refreshToken } = generateToken(user._id as string);

      // 🔹 Store access token in Redis (expires in 1 hour)
      await redisClient.setEx(`auth:${user._id}`, 3600, token);

      // 🔹 Store refresh token in Redis (expires in 7 days)
      await redisClient.setEx(`refresh:${user._id}`, 604800, refreshToken);

      return httpResponse(req, res, 200, "Login successful", { token, refreshToken, user });
  } catch (err) {
      httpError(next, err, req, 500);
  }
  },


  refreshToken: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { refreshToken } = req.body;
      if (!refreshToken) return httpResponse(req, res, 401, "Unauthorized");

      // Ensure JWT secrets are defined
      const JWT_SECRET = process.env.JWT_SECRET!;
      const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET!;
      if (!JWT_SECRET || !JWT_REFRESH_SECRET) {
          throw new Error("JWT_SECRET or JWT_REFRESH_SECRET is not defined in environment variables.");
      }

      // Verify the refresh token
      const decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET) as jwt.JwtPayload;
      const userId = decoded.userId;

      // Check if refresh token exists in Redis
      const storedRefreshToken = await redisClient.get(`refresh:${userId}`);
      if (!storedRefreshToken || storedRefreshToken !== refreshToken) {
          return httpResponse(req, res, 403, "Invalid refresh token");
      }

      // Generate new access & refresh tokens
      const { token, refreshToken: newRefreshToken } = generateToken(userId);
      
      // Store new tokens in Redis
      await redisClient.setEx(`refresh:${userId}`, 604800, newRefreshToken); // 7 days expiry
      await redisClient.setEx(`auth:${userId}`, 3600, token); // 1 hour expiry

      return httpResponse(req, res, 200, "Token refreshed", { token, refreshToken: newRefreshToken });
  } catch (error) {
      return httpResponse(req, res, 403, "Invalid or expired refresh token");
  }
  },
  
  logout: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.userId;
  
      if (!userId) {
        return httpResponse(req, res, 401, "Unauthorized");
      }
  
      // 🔹 Remove refresh token from Redis
      await redisClient.del(`refresh:${userId}`);
  
      return httpResponse(req, res, 200, "Logout successful");
    } catch (err) {
      httpError(next, err, req, 500);
    }
  },
  

  // **Forgot Password Function (Sends OTP)**
  forgotPassword: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { userEmail } = req.body;
      if (!userEmail) return httpResponse(req, res, 400, "Email is required");

      const user = await User.findOne({ userEmail }).select("userName userEmail");
      if (!user) return httpResponse(req, res, 400, "User not found");

      // Generate OTP (6-digit)
      const otp = Math.floor(100000 + Math.random() * 900000).toString();

      // Store OTP in Redis with email (expires in 5 mins)
      await redisClient.set(`otp:${otp}`, userEmail, { EX: 300 });

      // Email Template
      const emailTemplate = `
        <html>
          <body style="font-family: Arial, sans-serif; text-align: center; padding: 20px; background-color: #f9f9f9;">
              <div style="max-width: 500px; margin: auto; background: white; padding: 20px; border-radius: 10px; box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);">
                  <h2 style="color: #3498db;">🔐 Password Reset Request</h2>
                  <p>Hi <strong>${user}</strong>,</p>
                  <p>Use the following OTP to reset your password:</p>
                  <h3 style="background: #3498db; color: white; padding: 15px; display: inline-block; border-radius: 5px;">
                      ${otp}
                  </h3>
                  <p>This OTP is valid for <strong>5 minutes</strong>.</p>
                  <p>If you did not request this, please ignore this email.</p>
                  <br>
                  <p>Thanks,<br><strong>The Mood Meal Team</strong></p>
              </div>
          </body>
        </html>
      `;

      await sendEmail(userEmail, "Password Reset OTP", emailTemplate);

      return httpResponse(req, res, 200, "OTP sent to email");
    } catch (err) {
      httpError(next, err, req, 500);
    }
  },

  // **User Logout Function**
  // logout: async (req: Request, res: Response, next: NextFunction) => {
  //   try {
  //     const userId = req.user?.userId;

  //     if (!userId) {
  //       return httpResponse(req, res, 401, "Unauthorized");
  //     }

  //     // 🔹 Remove token from Redis
  //     await redisClient.del(`auth:${userId}`);

  //     return httpResponse(req, res, 200, "Logout successful");
  //   } catch (err) {
  //     httpError(next, err, req, 500);
  //   }
  // },

  // **Verify OTP Function (No Storage)**
  verifyOtp: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { otp } = req.body;
      if (!otp) return httpResponse(req, res, 400, "OTP is required");

      // Retrieve email associated with OTP from Redis
      const userEmail = await redisClient.get(`otp:${otp}`);
      if (!userEmail) return httpResponse(req, res, 400, "OTP expired or invalid");

      // Fetch user from DB
      const user = await User.findOne({ userEmail });
      if (!user) return httpResponse(req, res, 400, "User not found");

      // 🔹 Store the user's email in Redis for password reset (valid for 5 minutes)
      await redisClient.set(`reset:${userEmail}`, userEmail, { EX: 300 });

      // Delete OTP from Redis after verification
      await redisClient.del(`otp:${otp}`);

      return httpResponse(req, res, 200, "OTP verified successfully", { userEmail });
    } catch (err) {
      httpError(next, err, req, 500);
    }
  },

  // **Reset Password Function (After OTP Verification)**
  resetPassword: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { newPassword } = req.body;
      if (!newPassword) return httpResponse(req, res, 400, "New password is required");

      // 🔹 Retrieve email from Redis (stored after OTP verification)
      const keys = await redisClient.keys("reset:*"); // Get all reset keys
      if (keys.length === 0) return httpResponse(req, res, 400, "OTP verification required");

      // Extract email stored in Redis
      const userEmail = await redisClient.get(keys[0]); // Get first stored email
      if (!userEmail) return httpResponse(req, res, 400, "OTP verification required");

      // Fetch user from DB
      const user = await User.findOne({ userEmail });
      if (!user) return httpResponse(req, res, 400, "User not found");

      // Hash new password and update
      user.password = await bcrypt.hash(newPassword, await bcrypt.genSalt(10));
      await user.save();

      // Delete stored email from Redis after successful reset
      await redisClient.del(`reset:${userEmail}`);

      return httpResponse(req, res, 200, "Your password has been changed successfully");
    } catch (err) {
      httpError(next, err, req, 500);
    }
  },

  // Edit User Profile
  editUserProfile: async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
    try {
      const userId = req.user?.userId;

      // Validate userId exists
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      // Validate userId format
      if (!mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(400).json({ message: "Invalid User ID format" });
      }

      const { name, email } = req.body;
      const userProfile = req.file ? req.file.path : undefined; // Use `undefined` instead of null for optional fields

      // Update user profile
      const updatedUser = await User.findByIdAndUpdate(
        userId,
        { name, email, ...(userProfile && { userProfile }) },
        { new: true }
      ).select("name email userProfile");

      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }

      return res.status(200).json({
        message: "Profile updated successfully",
        user: updatedUser,
      });
    } catch (error) {
      return next(error); // Ensure next(error) is properly handled in error middleware
    }
  }
};


export const getPrivacyPolicy = (_req: Request, res: Response) => {
  res.json({ content: "Privacy Policy: We respect your privacy..." });
};

export const getAboutUs = (_req: Request, res: Response) => {
  res.json({ content: "About Us: We are a leading platform..." });
};

export const getHelp = (_req: Request, res: Response) => {
  res.json({ content: "Help Center: How can we assist you?" });
};