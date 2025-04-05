import { Request, Response } from 'express';
import User  from '../models/User';

export const getUserProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.id;
    const user = await User.findById(userId).select('-password');
    if (!user) 
         res.status(404).json({ message: 'User not found' });
     res.status(200).json(user);
  } catch (err) {
     res.status(500).json({ message: 'Error fetching profile', error: err });
  }
};

export const updateUser = async (req: Request, res: Response) : Promise<void>=> {
  try {
    const { id } = req.params;
    const updates = req.body;
    const updatedUser = await User.findByIdAndUpdate(id, updates, { new: true }).select('-password');
     res.status(200).json(updatedUser);
  } catch (err) {
     res.status(500).json({ message: 'Update failed', error: err });
  }
};

export const deleteUser = async (req: Request, res: Response) : Promise<void>=> {
  try {
    const { id } = req.params;
    await User.findByIdAndDelete(id);
     res.status(200).json({ message: 'User deleted successfully' });
  } catch (err) {
     res.status(500).json({ message: 'Deletion failed', error: err });
  }
};
