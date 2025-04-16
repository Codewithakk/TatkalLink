import { NextFunction, Request, Response } from 'express';
import TicketRequest from '../models/TicketRequest';
import mongoose from 'mongoose';
import { Order } from '../models/order';

export const createTicketRequest = async (req: Request, res: Response) => {
  try {
    const seekerId = req.user?.userId;
    const newRequest = await TicketRequest.create({ ...req.body, seekerId });
    res.status(201).json(newRequest);
  } catch (err) {
    res.status(500).json({ message: 'Error creating ticket request', error: err });
  }
};

export const getUserRequests = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const userId = req.user?.userId;
  if (!userId) {
    res.status(401).json({ message: 'Unauthorized' });
  }
  const role = req.user?.role;
  const filter = role === 'seeker' ? { seekerId: userId } : { acceptedBy: userId };
  const tickets = await TicketRequest.find(filter);
  res.status(200).json(tickets);
};

export const getAllOpenRequests = async (_req: Request, res: Response) => {
  const openRequests = await TicketRequest.find({ status: 'open' });
  res.status(200).json(openRequests);
};

export const acceptRequest = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const providerId = req.user?.userId; // Ensure your auth middleware sets this

    if (!providerId) {
      res.status(401).json({ message: 'Unauthorized: Provider not identified' });
      return;
    }

    const ticket = await TicketRequest.findById(req.params.id);

    if (!ticket || ticket.isDeleted) {
      res.status(404).json({ message: 'Request not found' });
      return;
    }

    if (ticket.status !== 'open') {
      res.status(400).json({ message: `Cannot accept request. Current status: ${ticket.status}` });
      return;
    }

    // Update ticket status
    ticket.status = 'accepted';
    ticket.acceptedBy = new mongoose.Types.ObjectId(providerId);
    ticket.acceptedAt = new Date();

    await ticket.save();

    res.status(200).json({
      message: 'Request accepted successfully',
      ticket
    });
  } catch (error) {
    console.error('Error accepting request:', error);
    next(error); // Send to global error handler
  }
};


export const updateTicketStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { status } = req.body;
  const ticket = await TicketRequest.findByIdAndUpdate(req.params.id, { status }, { new: true });
  if (!ticket) res.status(404).json({ message: 'Request not found' });
  res.status(200).json(ticket);
};

export const getAllRequests = async (_req: Request, res: Response) => {
  try {
    const requests = await TicketRequest.find().populate('seekerId');
    res.json(requests);
  } catch (error) {
    res.status(500).json({ error });
  }
};

export const getAllCompletedRequests = async (req: Request, res: Response) => {
  try {
    // assuming provider's orders
    const orders = await Order.find({ status: 'completed', userId: req.user?.userId });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error });
  }
};

export const getAllStatistics = async (req: Request, res: Response) => {
  try {
    const completed = await Order.countDocuments({ userId: req.user?.userId, status: 'completed' });
    const pending = await Order.countDocuments({ userId: req.user?.userId, status: 'pending' });
    const totalRequests = await TicketRequest.countDocuments({ acceptedBy: req.user?.userId, status: 'completed' });

    res.json({
      totalCompletedOrders: completed,
      pendingOrders: pending,
      ticketRequestsHandled: totalRequests
    });
  } catch (error) {
    res.status(500).json({ error });
  }
};

export const getAllEarnings = async (req: Request, res: Response) => {
  try {
    // Assuming earnings are based on orders for simplicity
    const completedOrders = await Order.find({ userId: req.user?.userId, status: 'completed' });

    const totalEarnings = completedOrders.reduce((sum, order) => sum + order.totalAmount, 0);
    res.json({ totalEarnings, completedOrderCount: completedOrders.length });
  } catch (error) {
    res.status(500).json({ error });
  }
};