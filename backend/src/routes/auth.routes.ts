import { Router } from "express";
import authController from "../controllers/auth.controller";
import { authMiddleware, roleMiddleware } from "../middlewares/auth.middleware";
import upload from "../config/multer";
import validateRequest from "../middlewares/ValidateRequest";

const router = Router();

router.post(
  "/signup",
  upload.single("userProfile"),
  authController.signup
);

router.post("/signin", authController.signin);

router.post("/logout", authMiddleware, authController.logout);


router.post(
  "/forgot-password",
  authController.forgotPassword
);

router.post("/verify-otp", authController.verifyOtp);

router.post(
  "/reset-password",
  authController.resetPassword
);

// router.put(
//   "/edit",
//   authController.editUserProfile
// );

router.post("/refresh-token", authController.refreshToken);
// Protected route (authenticated users)
router.get("/profile", authMiddleware, authController.getProfile);

// Admin-only route
router.get(
  "/admin/users",
  authMiddleware,
  roleMiddleware(["admin"]),
  authController.getAllUsers
);


export default router;