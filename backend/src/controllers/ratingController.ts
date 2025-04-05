import { Request, Response } from 'express';
import Rating from '../models/Rating';

export const submitRating = async (req: Request, res: Response) => {
  try {
    const seekerId = (req as any).user.id;
    const { providerId, rating, feedback } = req.body;
    const newRating = await Rating.create({ seekerId, providerId, rating, feedback });
    res.status(201).json(newRating);
  } catch (err) {
    res.status(500).json({ message: 'Error submitting rating', error: err });
  }
};

export const getProviderRatings = async (req: Request, res: Response) => {
  const ratings = await Rating.find({ providerId: req.params.id });
  res.status(200).json(ratings);
};
