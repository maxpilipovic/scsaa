import { supabase } from '../../../config/supabaseClient.js';

/**
 * Middleware to verify that the authenticated user has admin privileges
 * Must be used after the protect middleware
 */
export const verifyAdmin = async (req, res, next) => {
  try {
    // Get userId from the authenticated user (set by protect middleware)
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: 'Not authorized, user not authenticated' });
    }

    // Check if user has admin role
    const { data: user, error } = await supabase
      .from('users')
      .select('is_admin')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error checking admin status:', error);
      return res.status(500).json({ message: 'Error verifying admin status' });
    }

    if (!user || !user.is_admin) {
      return res.status(403).json({ message: 'Forbidden: Admin privileges required' });
    }

    // User is admin, proceed to next middleware/route
    next();
  } catch (error) {
    console.error('Admin middleware error:', error);
    res.status(500).json({ message: 'Server error during admin verification' });
  }
};
