import { NextFunction, Request, Response } from 'express';
import TicketRequest from '../models/TicketRequest';
import Seeker from '../models/Seeker';
import User from '../models/User';
import { AuditLog } from '../models/Auditlog';

// Get Profile
export const getProfile = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = req.user?.userId;
        const role = req.user?.role;

        if (role !== 'seeker') {
            res.status(403).json({ message: 'Access denied. Only seekers can access this resource.' });
            return;
        }
        const user = await User.findById(userId).select('-password -tokens');;
        res.status(200).json(user);
    } catch (error) {
        if (!res.headersSent) {
            res.status(500).json({ error: 'Server error', details: error });
        } else {
            console.error('Headers already sent, but error occurred:', error);
        }
    }
};


// Update Profile
export const updateProfile = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = req.user?.userId;

        const user = await User.findById(userId);
        if (!user || user.role !== 'seeker') {
            res.status(403).json({ message: 'Access denied. Only seekers can update profile.' });
        }

        const updates = req.body;

        const updatedProfile = await Seeker.findOneAndUpdate(
            { user: userId },
            updates,
            { new: true }
        ).populate('user', '-password -tokens');

        if (!updatedProfile) {
            res.status(404).json({ message: 'Seeker profile not found' });
        }

        res.status(200).json(updatedProfile);
    } catch (error) {
        res.status(500).json({ error: 'Error updating profile', details: error });
    }
};

// Create a Ticket Request
export const createTicketRequest = async (req: Request, res: Response) => {
    try {
        const {
            mode,
            from,
            to,
            travelDate,
            timeRange,
            additionalNotes,
            maxBudget,
            priority,
            contactPreference,
        } = req.body;

        const newRequest = new TicketRequest({
            seekerId: req.user?.userId,
            mode,
            from,
            to,
            travelDate,
            timeRange,
            additionalNotes,
            maxBudget,
            priority,
            contactPreference,
            status: 'open',
        });

        const saved = await newRequest.save();
        res.status(201).json({ message: 'Request created successfully', request: saved });
    } catch (err) {
        res.status(500).json({ error: 'Error creating ticket request', details: err });
    }
};

// Get all requests by this seeker
export const getMyTicketRequests = async (req: Request, res: Response) => {
    try {
        const requests = await TicketRequest.find({ seekerId: req.user?.userId }).sort({ createdAt: -1 });
        res.status(200).json(requests);
    } catch (err) {
        res.status(500).json({ error: 'Error fetching requests', details: err });
    }
};

// Cancel a ticket request
export const cancelTicketRequest = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const updated = await TicketRequest.findOneAndUpdate(
            { _id: req.params.id, seekerId: req.user?.userId },
            { status: 'cancelled' },
            { new: true }
        );

        if (!updated) {
            res.status(404).json({ message: 'Request not found or unauthorized' });
        }

        res.status(200).json({ message: 'Request cancelled successfully', request: updated });
    } catch (err) {
        res.status(500).json({ error: 'Error cancelling request', details: err });
    }
};

// Get status of a single request
export const getTicketRequestStatus = async (req: Request, res: Response) => {
    try {
        const request = await TicketRequest.findOne({
            _id: req.params.id,
            seekerId: req.user?.userId,
        });

        if (!request) {
            return res.status(404).json({ message: 'Request not found' });
        }

        res.status(200).json({ status: request.status });
    } catch (err) {
        res.status(500).json({ error: 'Error fetching request status', details: err });
    }
};

// Add a provider to favorites
export const addFavoriteProvider = async (req: Request, res: Response) => {
    try {
        const { providerId } = req.body;
        const seeker = await User.findByIdAndUpdate(
            req.user?.userId,
            { $addToSet: { favorites: providerId } },
            { new: true }
        );
        res.status(200).json({ message: 'Provider added to favorites', seeker });
    } catch (error) {
        res.status(500).json({ error: 'Failed to add to favorites', details: error });
    }
};
// Get completed ticket orders
export const getOrderHistory = async (req: Request, res: Response) => {
    try {
        const orders = await TicketRequest.find({
            seekerId: req.user?.userId,
            status: 'fulfilled || completed',
        })
            .sort({ createdAt: -1 });

        if (!orders || orders.length === 0) {
            return res.status(404).json({ message: 'No completed orders found' });
        }

        res.status(200).json(orders);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching orders', details: error });
    }
};


// Submit feedback for a provider
// export const submitFeedback = async (req: Request, res: Response) => {
//     try {
//       const { providerId, rating, comment } = req.body;
//       const feedback = new Feedback({
//         seekerId: req.user?.userId,
//         providerId,
//         rating,
//         comment
//       });
//       await feedback.save();
//       res.status(201).json({ message: 'Feedback submitted' });
//     } catch (error) {
//       res.status(500).json({ error: 'Failed to submit feedback', details: error });
//     }
//   };

// Get user audit logs
export const getAuditLogs = async (req: Request, res: Response) => {
    try {
        const logs = await AuditLog.find({ userId: req.user?.userId }).sort({ createdAt: -1 });
        res.status(200).json(logs);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching logs', details: error });
    }
};
