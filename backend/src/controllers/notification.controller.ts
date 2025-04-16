import { NextFunction, Request, Response } from 'express';
import { Notification } from '../models/notification.model';  // assumed you have the separate model as we discussed

export const fetchUnread = async (req: Request, res: Response) => {
    try {
        const notifications = await Notification.find({ userId: req.user?.userId, isRead: false });
        res.json(notifications);
    } catch (error) {
        res.status(500).json({ error });
    }
};

export const markAsRead = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const notification = await Notification.findOneAndUpdate(
            { _id: req.params.id, userId: req.user?.userId },
            { isRead: true },
            { new: true }
        );
        if (!notification)
            res.status(404).json({ message: 'Notification not found' });
        res.json(notification);
    } catch (error) {
        res.status(500).json({ error });
    }
};

export const subscribe = async (req: Request, res: Response) => {
    try {
        // You can store a subscription object for push or email.
        res.json({ message: 'Subscription successful', details: req.body });
    } catch (error) {
        res.status(500).json({ error });
    }
};
