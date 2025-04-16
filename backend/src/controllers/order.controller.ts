import { NextFunction, Request, Response } from 'express';
import { Order } from '../models/order';

export const getOrderById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const order = await Order.findById(req.params.id).populate('userId');
        if (!order)
            res.status(404).json({ message: 'Order not found' });
        res.json(order);
    } catch (error) {
        res.status(500).json({ error });
    }
};

export const confirmOrder = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const order = await Order.findByIdAndUpdate(
            req.params.id,
            { status: 'completed' },
            { new: true }
        );
        if (!order)
            res.status(404).json({ message: 'Order not found' });
        res.json({ message: 'Order marked as completed.', order });
    } catch (error) {
        res.status(500).json({ error });
    }
};

export const disputeOrder = async (req: Request, res: Response) => {
    try {
        // Custom dispute logic can go here
        res.json({ message: `Dispute opened for order ${req.params.id}` });
    } catch (error) {
        res.status(500).json({ error });
    }
};

export const uploadAttachment = async (req: Request, res: Response) => {
    try {
        // Example assumes file upload via middleware like `multer`
        res.json({ message: 'Attachment uploaded', file: req.file });
    } catch (error) {
        res.status(500).json({ error });
    }
};

export const listOrders = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.userId;  // assuming auth middleware sets req.user
        const orders = await Order.find({ userId });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ error });
    }
};
