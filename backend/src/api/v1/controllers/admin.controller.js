import { supabase } from '../../../config/supabaseClient.js';

export const getAllUsers = async (req, res) => {
  try {
    //Fetch all users from the 'persons' table
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

export const getUserById = async (req, res) => {
  const { userId } = req.params;

  try {
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      //If .single() finds no rows, it returns an error, which we can use to send a 404
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

export const getUserPaymentsById = async (req, res) => {
  const { userId } = req.params;

  try {
    const { data: payments, error } = await supabase
      .from('payments')
      .select('*')
      .eq('user_id', userId);

    if (error) {
      throw error;
    }

    res.status(200).json(payments);
  } catch (error) {
    console.error(`Error fetching payments for user with ID ${userId}:`, error);
    res.status(500).json({ message: 'Server error while fetching payments.', error: error.message });
  }
};

export const getUserMembershipStatusById = async (req, res) => {
  const { userId } = req.params;

  try {
    const { data: membershipStatus, error } = await supabase
      .from('memberships')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      //If .single() finds no rows, it returns an error, which we can use to send a 404
      if (error.code === 'PGRST116') {
        return res.status(404).json({ message: 'Membership status not found.' });
      }
      throw error;
    }

    if (!membershipStatus) {
      return res.status(404).json({ message: 'Membership status not found.' });
    }

    res.status(200).json(membershipStatus);
  } catch (error) {
    console.error(`Error fetching membership status for user with ID ${userId}:`, error);
    res.status(500).json({ message: 'Server error while fetching membership status.', error: error.message });
  }
};

// @desc    Update a user's details
// @route   PUT /api/v1/admin/users/:userId
// @access  Private/Admin
export const updateUser = async (req, res) => {
  const { userId } = req.params;
  const updatedData = req.body;

  // Basic validation
  if (!updatedData) {
    return res.status(400).json({ message: 'No update data provided.' });
  }

  // Prevent updating the ID or other protected fields
  delete updatedData.id;
  delete updatedData.created_at;

  try {
    const { data, error } = await supabase
      .from('users')
      .update(updatedData)
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    res.status(200).json({ message: 'User updated successfully.', user: data });
  } catch (error) {
    console.error(`Error updating user with ID ${userId}:`, error);
    res.status(500).json({ message: 'Server error while updating user.', error: error.message });
  }
};