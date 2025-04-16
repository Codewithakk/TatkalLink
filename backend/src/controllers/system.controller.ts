import { Request, Response } from 'express';
import { AuditLog } from '../models/Auditlog';

export const status = (_req: Request, res: Response) => {
    res.json({ status: 'OK', timestamp: new Date() });
};

export const version = (_req: Request, res: Response) => {
    res.json({ apiVersion: '1.0.0', updated: '2025-04-15' });
};

export const userAuditLogs = async (req: Request, res: Response) => {
    try {
        const logs = await AuditLog.find({ userId: req.user?.userId }).sort({ createdAt: -1 });
        res.json(logs);
    } catch (error) {
        res.status(500).json({ error });
    }
};
