import { NextFunction, Request, Response } from "express";
import redisClient from "../cache/redisClient";
import httpError from "../utils/httpError";
import httpResponse from "../utils/httpResponse";
import { AuthRequest } from "../Types/types";
import jwt, { JwtPayload, TokenExpiredError, JsonWebTokenError } from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

// ✅ Middleware for authentication
export const authMiddleware = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const token = req.header("Authorization")?.split(" ")[1];

        if (!token) {
            return httpResponse(req, res, 401, "Access denied. No token provided.");
        }

        let decoded: JwtPayload | null = null;

        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
        } catch (error) {
            if (error instanceof TokenExpiredError) {
                return httpResponse(req, res, 401, "Token has expired. Please log in again.");
            }
            if (error instanceof JsonWebTokenError) {
                return httpResponse(req, res, 401, "Invalid token.");
            }
            return httpError(next, error, req, 401);
        }

        if (!decoded?.userId || !decoded?.role) {
            return httpResponse(req, res, 401, "Invalid token payload.");
        }

        const redisToken = await redisClient.get(`auth:${decoded.userId}`);
        if (!redisToken || redisToken !== token) {
            return httpResponse(req, res, 401, "Invalid or expired session.");
        }

        // Attach user to request
        req.user = {
            userId: decoded.userId,
            role: decoded.role
        };

        next();
    } catch (error) {
        return httpError(next, error, req, 401);
    }
};

// ✅ Role-based access control middleware
export const roleMiddleware = (allowedRoles: string[]) => {
    return (req: AuthRequest, res: Response, next: NextFunction) => {
        const userRole = req.user?.role;

        if (!userRole || !allowedRoles.includes(userRole)) {
            return httpResponse(req, res, 403, "Forbidden: Insufficient permissions.");
        }

        next();
    };
};
