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

//EVENTS MANAGEMENT
export const getAllEvents = async (req, res) => {
  try {
    const { data, error } = await supabase.from('events').select('*').order('start_time', { ascending: true });
    if (error) throw error;
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ message: 'Server error while fetching events.', error: error.message });
  }
};

export const createEvent = async (req, res) => {
  const { name, description, location, start_time, end_date, user_id } = req.body;
  try {
    const { data, error } = await supabase.from('events').insert([{ name, description, location, start_time, end_date, user_id }]).select().single();
    if (error) throw error;
    res.status(201).json({ message: 'Event created successfully.', event: data });
  } catch (error) {
    console.error('Error creating event:', error);
    res.status(500).json({ message: 'Server error while creating event.', error: error.message });
  }
};

export const updateEvent = async (req, res) => {
  const { eventId } = req.params;
  const { name, description, start_time, end_date, location } = req.body;
  try {
    const { data, error } = await supabase.from('events').update({ name, description, start_time, end_date, location }).eq('event_id', eventId).select().single();
    if (error) throw error;
    res.status(200).json({ message: 'Event updated successfully.', event: data });
  } catch (error) {
    console.error(`Error updating event with ID ${eventId}:`, error);
    res.status(500).json({ message: 'Server error while updating event.', error: error.message });
  }
};

export const deleteEvent = async (req, res) => {
  const { eventId } = req.params;
  try {
    const { error } = await supabase.from('events').delete().eq('event_id', eventId);
    if (error) throw error;
    res.status(200).json({ message: 'Event deleted successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Server error while deleting event.', error: error.message });
  }
};

//ANNOUNCEMENTS MANAEGEMENT
export const getAllAnnouncements = async (req, res) => {
  try {
    const { data, error } = await supabase.from('announcements').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ message: 'Server error while fetching announcements.', error: error.message });
  }
};

export const createAnnouncement = async (req, res) => {
  const { user_id, title, preview } = req.body;
  try {
    const { data, error } = await supabase.from('announcements').insert([{ user_id, title, preview }]).select().single();
    if (error) throw error;
    res.status(201).json({ message: 'Announcement created successfully.', announcement: data });
  } catch (error) {
    console.error('Error creating announcement:', error);
    res.status(500).json({ message: 'Server error while creating announcement.', error: error.message });
  }
};

export const updateAnnouncement = async (req, res) => {
  const { announcementId } = req.params;
  const { title, preview } = req.body;
  try {
    const { data, error } = await supabase.from('announcements').update({ title, preview }).eq('announcement_id', announcementId).select().single();
    if (error) throw error;
    res.status(200).json({ message: 'Announcement updated successfully.', announcement: data });
  } catch (error) {
    console.error(`Error updating announcement with ID ${announcementId}:`, error);
    res.status(500).json({ message: 'Server error while updating announcement.', error: error.message });
  }
};

export const deleteAnnouncement = async (req, res) => {
  const { announcementId } = req.params;
  try {
    const { error } = await supabase.from('announcements').delete().eq('announcement_id', announcementId);
    if (error) throw error;
    res.status(200).json({ message: 'Announcement deleted successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Server error while deleting announcement.', error: error.message });
  }
};