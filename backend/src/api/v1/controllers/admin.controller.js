import { supabase } from '../../../config/supabaseClient.js';
import { logUserUpdate, logEventAction, logAnnouncementAction, logAction } from '../../../utils/auditLogger.js';
import { sendBulkEmail, announcementEmailTemplate, eventEmailTemplate, customEmailTemplate } from '../../../utils/emailService.js';

// UUID validation helper
const isValidUUID = (uuid) => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
};

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
    res.status(500).json({ message: 'Server error while fetching users.' });
  }
};

export const getUserById = async (req, res) => {
  const { userId } = req.params;

  // Validate UUID format
  if (!isValidUUID(userId)) {
    return res.status(400).json({ message: 'Invalid user ID format.' });
  }

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
    res.status(500).json({ message: 'Server error while fetching user.' });
  }
};

export const getUserPaymentsById = async (req, res) => {
  const { userId } = req.params;

  // Validate UUID format
  if (!isValidUUID(userId)) {
    return res.status(400).json({ message: 'Invalid user ID format.' });
  }

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
    res.status(500).json({ message: 'Server error while fetching payments.' });
  }
};

export const getUserMembershipStatusById = async (req, res) => {
  const { userId } = req.params;

  // Validate UUID format
  if (!isValidUUID(userId)) {
    return res.status(400).json({ message: 'Invalid user ID format.' });
  }

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
    res.status(500).json({ message: 'Server error while fetching membership status.' });
  }
};

// @desc    Update a user's details
// @route   PUT /api/v1/admin/users/:userId
// @access  Private/Admin
export const updateUser = async (req, res) => {
  const { userId } = req.params;
  const rawData = req.body;
  const adminUserId = req.user?.id; // Get admin ID from authenticated user

  // Validate UUID format
  if (!isValidUUID(userId)) {
    return res.status(400).json({ message: 'Invalid user ID format.' });
  }

  // Basic validation
  if (!rawData || Object.keys(rawData).length === 0) {
    return res.status(400).json({ message: 'No update data provided.' });
  }

  // Whitelist of allowed fields that can be updated
  const allowedFields = ['first_name', 'last_name', 'phone_number', 'address', 'dob', 'pledge_class'];
  const updatedData = {};
  
  for (const field of allowedFields) {
    if (field in rawData) {
      // Sanitize string inputs
      if (typeof rawData[field] === 'string') {
        updatedData[field] = rawData[field].trim().slice(0, 255); // Limit length
      } else {
        updatedData[field] = rawData[field];
      }
    }
  }
  
  // Verify that at least one allowed field was provided
  if (Object.keys(updatedData).length === 0) {
    return res.status(400).json({ message: 'No valid fields to update.' });
  }

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

    // Log the user update action
    if (adminUserId) {
      await logUserUpdate(adminUserId, userId, updatedData);
    }

    res.status(200).json({ message: 'User updated successfully.', user: data });
  } catch (error) {
    console.error(`Error updating user with ID ${userId}:`, error);
    res.status(500).json({ message: 'Server error. Please try again later.' });
  }
};

//EVENTS MANAGEMENT
export const getAllEvents = async (req, res) => {
  try {
    const { data, error } = await supabase.from('events').select('*').order('start_time', { ascending: true });
    if (error) throw error;
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ message: 'Server error while fetching events.', error: "An error occurred" });
  }
};

export const createEvent = async (req, res) => {
  const { name, description, location, start_time, end_date, user_id } = req.body;
  const adminUserId = req.body.adminUserId; // Admin user performing the action
  const sendEmailNotification = req.body.sendEmailNotification !== false; // Default to true
  
  try {
    const { data, error } = await supabase.from('events').insert([{ name, description, location, start_time, end_date, user_id }]).select().single();
    if (error) throw error;
    
    // Log the event creation
    if (adminUserId) {
      await logEventAction(adminUserId, 'CREATE', data.event_id, { name, description, location, start_time, end_date });
    }

    // Send email to all users if requested
    if (sendEmailNotification) {
      try {
        const { data: users, error: usersError } = await supabase
          .from('users')
          .select('email');
        
        if (!usersError && users && users.length > 0) {
          const emails = users.map(user => user.email);
          const emailHtml = eventEmailTemplate(name, description, location, start_time);
          
          await sendBulkEmail(emails, `📅 New Event: ${name}`, emailHtml);
          
          // Log the email sending
          if (adminUserId) {
            await logAction(adminUserId, 'EVENT_EMAIL_SENT', 'events', {
              event_id: data.event_id,
              recipients_count: emails.length,
            });
          }
        }
      } catch (emailError) {
        console.error('Error sending event notification emails:', emailError);
        // Don't fail the request if email sending fails
      }
    }
    
    res.status(201).json({ message: 'Event created successfully.', event: data });
  } catch (error) {
    console.error('Error creating event:', error);
    res.status(500).json({ message: 'Server error while creating event.', error: "An error occurred" });
  }
};

export const updateEvent = async (req, res) => {
  const { eventId } = req.params;
  const { name, description, start_time, end_date, location } = req.body;
  const adminUserId = req.body.adminUserId; // Admin user performing the action
  
  try {
    const { data, error } = await supabase.from('events').update({ name, description, start_time, end_date, location }).eq('event_id', eventId).select().single();
    if (error) throw error;
    
    // Log the event update
    if (adminUserId) {
      await logEventAction(adminUserId, 'UPDATE', eventId, { name, description, start_time, end_date, location });
    }
    
    res.status(200).json({ message: 'Event updated successfully.', event: data });
  } catch (error) {
    console.error(`Error updating event with ID ${eventId}:`, error);
    res.status(500).json({ message: 'Server error while updating event.', error: "An error occurred" });
  }
};

export const deleteEvent = async (req, res) => {
  const { eventId } = req.params;
  const adminUserId = req.user?.id; // Admin user from auth middleware
  
  try {
    const { error } = await supabase.from('events').delete().eq('event_id', eventId);
    if (error) throw error;
    
    // Log the event deletion
    if (adminUserId) {
      await logEventAction(adminUserId, 'DELETE', eventId, { deleted_at: new Date().toISOString() });
    }
    
    res.status(200).json({ message: 'Event deleted successfully.' });
  } catch (error) {
    console.error(`Error deleting event with ID ${eventId}:`, error);
    res.status(500).json({ message: 'Server error while deleting event.', error: "An error occurred" });
  }
};

//ANNOUNCEMENTS MANAEGEMENT
export const getAllAnnouncements = async (req, res) => {
  try {
    const { data, error } = await supabase.from('announcements').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ message: 'Server error while fetching announcements.', error: "An error occurred" });
  }
};

export const createAnnouncement = async (req, res) => {
  const { user_id, title, preview } = req.body;
  const adminUserId = req.body.adminUserId; // Admin user performing the action
  const sendEmailNotification = req.body.sendEmailNotification !== false; // Default to true
  
  try {
    const { data, error } = await supabase.from('announcements').insert([{ user_id, title, preview }]).select().single();
    if (error) throw error;
    
    // Log the announcement creation
    if (adminUserId) {
      await logAnnouncementAction(adminUserId, 'CREATE', data.announcements_id, { title, preview });
    }

    // Send email to all users if requested
    if (sendEmailNotification) {
      try {
        const { data: users, error: usersError } = await supabase
          .from('users')
          .select('email');
        
        if (!usersError && users && users.length > 0) {
          const emails = users.map(user => user.email);
          const emailHtml = announcementEmailTemplate(title, preview);
          
          await sendBulkEmail(emails, `📢 New Announcement: ${title}`, emailHtml);
          
          // Log the email sending
          if (adminUserId) {
            await logAction(adminUserId, 'ANNOUNCEMENT_EMAIL_SENT', 'announcements', {
              announcement_id: data.announcements_id,
              recipients_count: emails.length,
            });
          }
        }
      } catch (emailError) {
        console.error('Error sending announcement notification emails:', emailError);
        // Don't fail the request if email sending fails
      }
    }
    
    res.status(201).json({ message: 'Announcement created successfully.', announcement: data });
  } catch (error) {
    console.error('Error creating announcement:', error);
    res.status(500).json({ message: 'Server error while creating announcement.', error: "An error occurred" });
  }
};

export const updateAnnouncement = async (req, res) => {
  const { announcementId } = req.params;
  const { title, preview } = req.body;
  const adminUserId = req.body.adminUserId; // Admin user performing the action
  
  try {
    const { data, error } = await supabase.from('announcements').update({ title, preview }).eq('announcements_id', announcementId).select().single();
    if (error) throw error;
    
    // Log the announcement update
    if (adminUserId) {
      await logAnnouncementAction(adminUserId, 'UPDATE', announcementId, { title, preview });
    }
    
    res.status(200).json({ message: 'Announcement updated successfully.', announcement: data });
  } catch (error) {
    console.error(`Error updating announcement with ID ${announcementId}:`, error);
    res.status(500).json({ message: 'Server error while updating announcement.', error: "An error occurred" });
  }
};

export const deleteAnnouncement = async (req, res) => {
  const { announcementId } = req.params;
  const adminUserId = req.user?.id; // Admin user from auth middleware
  
  try {
    const { error } = await supabase.from('announcements').delete().eq('announcements_id', announcementId);
    if (error) throw error;
    
    // Log the announcement deletion
    if (adminUserId) {
      await logAnnouncementAction(adminUserId, 'DELETE', announcementId, { deleted_at: new Date().toISOString() });
    }
    
    res.status(200).json({ message: 'Announcement deleted successfully.' });
  } catch (error) {
    console.error(`Error deleting announcement with ID ${announcementId}:`, error);
    res.status(500).json({ message: 'Server error while deleting announcement.', error: "An error occurred" });
  }
};

//Check Admin Role
export const checkAdminRole = async (req, res) => {
  const { userId } = req.params;

  try {
    const { data: user, error } = await supabase
      .from('users')
      .select('role')
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

    const isAdmin = user.role === 'admin';
    res.status(200).json({ isAdmin });
  } catch (error) {
    console.error(`Error checking admin role for user with ID ${userId}:`, error);
    res.status(500).json({ message: 'Server error while checking admin role.', error: "An error occurred" });
  }
};

// EMAIL MANAGEMENT

/**
 * Search for users by email or name
 * @route   GET /api/v1/admin/search-users
 * @query   q - Search query (email or name)
 */
export const searchUsers = async (req, res) => {
  const { q } = req.query;

  // Validate search query: must be 2-100 characters
  if (!q || q.length < 2 || q.length > 100) {
    return res.status(400).json({ message: 'Search query must be 2-100 characters.' });
  }

  try {
    const { data: users, error } = await supabase
      .from('users')
      .select('id, email, first_name, last_name')
      .or(`email.ilike.%${q}%,first_name.ilike.%${q}%,last_name.ilike.%${q}%`)
      .limit(20);

    if (error) throw error;

    res.status(200).json(users || []);
  } catch (error) {
    console.error('Error searching users:', error);
    res.status(500).json({ message: 'Server error. Please try again later.' });
  }
};

/**
 * Send a custom email to a user
 * @route   POST /api/v1/admin/send-email-to-user
 * @body    {userId, subject, body, adminUserId}
 */
export const sendEmailToUser = async (req, res) => {
  const { userId, subject, body, adminUserId } = req.body;

  if (!userId || !subject || !body) {
    return res.status(400).json({ message: 'User ID, subject, and body are required.' });
  }

  try {
    // Get the user's email
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('email, first_name, last_name')
      .eq('id', userId)
      .single();

    if (userError || !user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // Send the email
    const { sendEmail } = await import('../../../utils/emailService.js');
    const emailHtml = customEmailTemplate(subject, body);
    const success = await sendEmail(user.email, subject, emailHtml);

    if (!success) {
      return res.status(500).json({ message: 'Failed to send email.' });
    }

    // Log the action
    if (adminUserId) {
      await logAction(adminUserId, 'CUSTOM_EMAIL_SENT', 'emails', {
        recipient_user_id: userId,
        recipient_email: user.email,
        subject,
      });
    }

    res.status(200).json({ 
      message: `Email sent successfully to ${user.email}`,
      recipient: {
        id: user.id,
        email: user.email,
        name: `${user.first_name} ${user.last_name}`,
      }
    });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ message: 'Server error while sending email.', error: "An error occurred" });
  }
};

/**
 * Send a bulk custom email to multiple users
 * @route   POST /api/v1/admin/send-bulk-email
 * @body    {userIds, subject, body, adminUserId}
 */
export const sendBulkCustomEmail = async (req, res) => {
  const { userIds, subject, body, adminUserId } = req.body;

  if (!userIds || !Array.isArray(userIds) || userIds.length === 0 || !subject || !body) {
    return res.status(400).json({ message: 'User IDs (array), subject, and body are required.' });
  }

  try {
    // Get the users' emails
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, email')
      .in('id', userIds);

    if (usersError || !users || users.length === 0) {
      return res.status(404).json({ message: 'Users not found.' });
    }

    const emails = users.map(u => u.email);
    const emailHtml = customEmailTemplate(subject, body);

    // Send bulk email
    const results = await sendBulkEmail(emails, subject, emailHtml);

    // Log the action
    if (adminUserId) {
      await logAction(adminUserId, 'BULK_CUSTOM_EMAIL_SENT', 'emails', {
        recipient_count: results.success,
        failed_count: results.failed,
        subject,
      });
    }

    res.status(200).json({ 
      message: `Bulk email sent. ${results.success} succeeded, ${results.failed} failed.`,
      results,
    });
  } catch (error) {
    console.error('Error sending bulk email:', error);
    res.status(500).json({ message: 'Server error while sending bulk email.', error: "An error occurred" });
  }
};