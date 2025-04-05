import { NextFunction, Request, Response } from 'express';
import TicketRequest from '../models/TicketRequest';

export const createTicketRequest = async (req: Request, res: Response) => {
  try {
    const seekerId = (req as any).user.id;
    const newRequest = await TicketRequest.create({ ...req.body, seekerId });
    res.status(201).json(newRequest);
  } catch (err) {
    res.status(500).json({ message: 'Error creating ticket request', error: err });
  }
};

export const getUserRequests = async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const role = (req as any).user.role;
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
    const providerId = (req as any).user.id;
    const ticket = await TicketRequest.findById(req.params.id);

    if (!ticket) {
      res.status(404).json({ message: 'Request not found' });
      return;
    }

    if (ticket.status !== 'open') {
      res.status(400).json({ message: 'Already accepted' });
      return;
    }

    ticket.status = 'accepted';
    ticket.acceptedBy = providerId;
    await ticket.save();

    res.status(200).json(ticket);
  } catch (error) {
    next(error); // This passes the error to your error-handling middleware
  }
};


export const updateTicketStatus = async (req: Request, res: Response, next: NextFunction) :Promise<void> => {
  const { status } = req.body;
  const ticket = await TicketRequest.findByIdAndUpdate(req.params.id, { status }, { new: true });
  if (!ticket)  res.status(404).json({ message: 'Request not found' });
  res.status(200).json(ticket);
};
