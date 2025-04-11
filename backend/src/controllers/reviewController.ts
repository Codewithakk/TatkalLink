import { NextFunction, Request, Response } from 'express';
import Review from '../models/reviews';
import mongoose from 'mongoose';

// ➕ Create a Review
export const addReview = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const {
            recipientId,
            recipientRole,
            rating,
            comment,
            ticketType,
            relatedRequestId
        } = req.body;

        if (!req.user || !req.user.userId || !req.user.role) {
            res.status(401).json({ error: 'Unauthorized. Missing user info.' });
        }

        if (!recipientId || !recipientRole || !rating || !ticketType) {
            res.status(400).json({ error: 'Missing required fields' });
        }

        const newReview = new Review({
            reviewer: {
                id: req.user?.userId,
                role: req.user?.role,
            },
            recipient: {
                id: recipientId,
                role: recipientRole,
            },
            rating,
            comment,
            ticketType,
            relatedRequestId,
        });

        await newReview.save();

        res.status(201).json({ message: 'Review added successfully', review: newReview });
    } catch (err) {
        res.status(500).json({ error: 'Failed to add review', details: err });
    }
};

// 📥 Get All Reviews for a Recipient (Seeker or Provider)
export const getUserReviews = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const userId = req.user?.userId;

        // if (!userId)
        //     res.status(400).json({ error: 'User ID is missing from request' })
        //     return

        const reviews = await Review.find({ 'recipient.id': userId })
            .sort({ createdAt: -1 })
            .populate('reviewer.id', 'name')
            .populate('recipient.id', 'name');

        res.status(200).json(reviews);
    } catch (err) {
        res.status(500).json({ error: 'Error fetching user reviews', details: err });
    }
};

// 🔍 Get Reviews Written by the Current User
export const getMyReviews = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const userId = req.user?.userId;

        if (!userId) {
            res.status(400).json({ error: 'User ID is missing from request' })
            return;
        }

        const reviews = await Review.find({ 'reviewer.id': userId })
            .sort({ createdAt: -1 })
            .populate('recipient.id', 'name');

        res.status(200).json(reviews);
    } catch (err) {
        res.status(500).json({ error: 'Error fetching your reviews', details: err });
    }
};

// ❌ Delete a Review (only by reviewer)
export const deleteReview = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { id } = req.params;
        const userId = req.user?.userId;

        const review = await Review.findById(id);

        if (!review) {
            res.status(404).json({ message: 'Review not found' });
            return;
        }

        if (review.reviewer.id.toString() !== userId) {
            res.status(403).json({ message: 'Not authorized to delete this review' });
            return;
        }

        await review.deleteOne();

        res.status(200).json({ message: 'Review deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Error deleting review', details: error });
    }
};


// ⭐ Get Average Rating for a User (Seeker or Provider)
export const getAverageRating = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const userId = req.user?.userId;

        const result = await Review.aggregate([
            { $match: { 'recipient.id': new mongoose.Types.ObjectId(userId) } },
            {
                $group: {
                    _id: '$recipient.id',
                    avgRating: { $avg: '$rating' },
                    totalReviews: { $sum: 1 }
                }
            }
        ]);

        if (!result.length) {
            res.status(200).json({ avgRating: 0, totalReviews: 0 });
        }

        res.status(200).json({
            avgRating: result[0].avgRating.toFixed(1),
            totalReviews: result[0].totalReviews
        });
    } catch (err) {
        res.status(500).json({ error: 'Error fetching average rating', details: err });
    }
};

// 💬 Allow Recipient to Respond to a Review (optional)
export const respondToReview = async (req: Request, res: Response): Promise<void> => {
    try {
        const { reviewId } = req.params;
        const { responseText } = req.body;
        const userId = req.user?.userId;

        const review = await Review.findById(reviewId);

        if (!review) {
            res.status(404).json({ message: 'Review not found' });
            return;
        }

        if (review.recipient.id.toString() !== userId) {
            res.status(403).json({ message: 'Not authorized to respond to this review' });
            return;
        }

        if (review.responseText) {
            res.status(400).json({ message: 'You have already responded to this review' });
            return;
        }

        review.responseText = responseText;
        review.responseDate = new Date();

        await review.save();

        res.status(200).json({ message: 'Response added to review', review });
    } catch (err) {
        res.status(500).json({ error: 'Error responding to review', details: err });
    }
};
