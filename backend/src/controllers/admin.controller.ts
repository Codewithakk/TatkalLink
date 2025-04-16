import { NextFunction, Request, Response } from 'express';
import User from '../models/User';
import { Order } from '../models/order';
import TicketRequest from '../models/TicketRequest';
import { AuditLog } from '../models/Auditlog';

export const listUsers = async (_req: Request, res: Response) => {
    try {
        const users = await User.find().select('-password');
        res.json(users);
    } catch (error) {
        res.status(500).json({ error });
    }
};

export const banUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const user = await User.findByIdAndUpdate(req.params.id, { isVerified: false }, { new: true });
        if (!user)
            res.status(404).json({ message: 'User not found' });
        res.json({ message: `User ${user?._id} banned.`, user });
    } catch (error) {
        res.status(500).json({ error });
    }
};

export const viewOrders = async (_req: Request, res: Response) => {
    try {
        const orders = await Order.find().populate('userId');
        res.json(orders);
    } catch (error) {
        res.status(500).json({ error });
    }
};

export const viewTicketRequests = async (_req: Request, res: Response) => {
    try {
        const requests = await TicketRequest.find().select('mode to from travelDate timeRange additionalNotes status priority maxBudget contactPreference isDeleted meta createdAt').populate('seekerId', 'name email _id');
        res.json(requests);
    } catch (error) {
        res.status(500).json({ error });
    }
};

export const listDisputes = async (_req: Request, res: Response) => {
    try {
        // Assuming disputed orders or requests have special status or flag
        const disputes = await Order.find({ status: 'cancelled' });
        res.json(disputes);
    } catch (error) {
        res.status(500).json({ error });
    }
};

export const platformStats = async (_req: Request, res: Response) => {
    try {
        const userCount = await User.countDocuments();
        const orderCount = await Order.countDocuments();
        const openRequests = await TicketRequest.countDocuments({ status: 'open' });
        res.json({ userCount, orderCount, openRequests });
    } catch (error) {
        res.status(500).json({ error });
    }
};

export const getAuditLogs = async (_req: Request, res: Response) => {
    try {
        const logs = await AuditLog.find().sort({ createdAt: -1 });
        res.json(logs);
    } catch (error) {
        res.status(500).json({ error });
    }
};
