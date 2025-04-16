import { NextFunction, Request, Response } from 'express';
import User from '../models/User';
import { Notification } from '../models/notification.model';

export const getUserProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const user = await User.findById(userId).select('-password');
    if (!user)
      res.status(404).json({ message: 'User not found' });
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching profile', error: err });
  }
};

export const updateUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.user?.userId;
    const updates = req.body;
    const updatedUser = await User.findByIdAndUpdate(id, updates, { new: true }).select('-password');
    res.status(200).json(updatedUser);
  } catch (err) {
    res.status(500).json({ message: 'Update failed', error: err });
  }
};

export const deleteUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.user?.userId;
    await User.findByIdAndDelete(id);
    res.status(200).json({ message: 'User deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Deletion failed', error: err });
  }
};

export const verifyId = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // Assuming you store verification status in User model
    const user = await User.findByIdAndUpdate(
      req.user?.userId,
      { isVerified: true },
      { new: true }
    );
    if (!user)
      res.status(404).json({ message: 'User not found' });

    res.json({ message: 'User ID verified successfully!', user });
  } catch (error) {
    res.status(500).json({ error });
  }
};

export const getUserNotification = async (req: Request, res: Response) => {
  try {
    const notifications = await Notification.find({ userId: req.user?.userId }).sort({ createdAt: -1 });
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ error });
  }
};