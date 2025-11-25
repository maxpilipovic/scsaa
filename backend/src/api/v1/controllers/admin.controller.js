import { supabase } from '../../../config/supabaseClient.js';

// @desc    Get all users from the public 'persons' table
// @route   GET /api/v1/admin/users
// @access  Private/Admin
export const getAllUsers = async (req, res) => {
  try {
    // Fetch all users from the 'persons' table
    const { data: users, error } = await supabase
      .from('users')
      .select('*');

    if (error) {
      throw error;
    }

    res.status(200).json(users);
  } catch (error) {
    console.error('Error fetching all users:', error);
    res.status(500).json({ message: 'Server error while fetching users.', error: error.message });
  }
};

// @desc    Get a single user by ID
// @route   GET /api/v1/admin/users/:userId
// @access  Private/Admin
export const getUserById = async (req, res) => {
  const { userId } = req.params;

  try {
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      // If .single() finds no rows, it returns an error, which we can use to send a 404
      if (error.code === 'PGRST116') {
        return res.status(404).json({ message: 'User not found.' });
      }
      throw error;
    }

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error(`Error fetching user with ID ${userId}:`, error);
    res.status(500).json({ message: 'Server error while fetching user.', error: error.message });
  }
};
