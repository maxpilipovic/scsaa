import { supabase } from '../config/supabaseClient.js';

/**
 * Log an action to the audit_logs table
 * @param {string} userId - The ID of the user performing the action (UUID)
 * @param {string} action - A description of the action performed
 * @param {string} tableName - The name of the table affected by the action
 * @param {object} details - Additional details about the action (optional)
 * @returns {Promise<object>} - The inserted log entry or null if error
 */
export const logAction = async (userId, action, tableName, details = null) => {
  try {
    const { data, error } = await supabase
      .from('audit_logs')
      .insert([
        {
          user_id: userId,
          action: action,
          table_name: tableName,
          details: details ? JSON.stringify(details) : null,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error('Error logging action to audit_logs:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Unexpected error in auditLogger:', error);
    return null;
  }
};

/**
 * Log authentication action
 * @param {string} userId - The user ID
 * @param {string} authAction - Type of auth action (e.g., 'LOGIN', 'REGISTER', 'LOGOUT', 'PASSWORD_CHANGE')
 * @param {string} email - User's email (optional)
 * @param {object} additionalDetails - Extra details
 */
export const logAuthAction = async (userId, authAction, email = null, additionalDetails = {}) => {
  const details = {
    auth_action: authAction,
    ...(email && { email }),
    ...additionalDetails,
  };

  return logAction(userId, authAction, 'auth', details);
};

/**
 * Log user update action
 * @param {string} userId - The user ID performing the action
 * @param {string} targetUserId - The user ID being updated
 * @param {object} changedFields - The fields that were changed
 */
export const logUserUpdate = async (userId, targetUserId, changedFields = {}) => {
  const details = {
    target_user_id: targetUserId,
    changed_fields: changedFields,
  };

  return logAction(userId, 'UPDATE_USER', 'users', details);
};

/**
 * Log event management action
 * @param {string} userId - The user ID performing the action
 * @param {string} eventAction - Type of action (CREATE, UPDATE, DELETE)
 * @param {string} eventId - The event ID
 * @param {object} eventDetails - Event details
 */
export const logEventAction = async (userId, eventAction, eventId, eventDetails = {}) => {
  const details = {
    event_id: eventId,
    event_details: eventDetails,
  };

  return logAction(userId, `${eventAction}_EVENT`, 'events', details);
};

/**
 * Log announcement management action
 * @param {string} userId - The user ID performing the action
 * @param {string} announcementAction - Type of action (CREATE, UPDATE, DELETE)
 * @param {string} announcementId - The announcement ID
 * @param {object} announcementDetails - Announcement details
 */
export const logAnnouncementAction = async (userId, announcementAction, announcementId, announcementDetails = {}) => {
  const details = {
    announcement_id: announcementId,
    announcement_details: announcementDetails,
  };

  return logAction(userId, `${announcementAction}_ANNOUNCEMENT`, 'announcements', details);
};

/**
 * Log payment action
 * @param {string} userId - The user ID
 * @param {string} paymentAction - Type of action (INITIATED, COMPLETED, FAILED)
 * @param {object} paymentDetails - Payment details (amount, session_id, etc.)
 */
export const logPaymentAction = async (userId, paymentAction, paymentDetails = {}) => {
  const details = {
    payment_action: paymentAction,
    ...paymentDetails,
  };

  return logAction(userId, paymentAction, 'payments', details);
};

/**
 * Log subscription action
 * @param {string} userId - The user ID
 * @param {string} subscriptionAction - Type of action (SUBSCRIBED, RENEWED, CANCELED, FAILED)
 * @param {object} subscriptionDetails - Subscription details
 */
export const logSubscriptionAction = async (userId, subscriptionAction, subscriptionDetails = {}) => {
  const details = {
    subscription_action: subscriptionAction,
    ...subscriptionDetails,
  };

  return logAction(userId, subscriptionAction, 'memberships', details);
};

/**
 * Log access check (authentication verification)
 * @param {string} userId - The user ID
 * @param {boolean} authorized - Whether the user was authorized
 * @param {object} details - Additional details
 */
export const logAccessCheck = async (userId, authorized, details = {}) => {
  return logAction(userId, authorized ? 'ACCESS_GRANTED' : 'ACCESS_DENIED', 'auth', {
    authorized,
    ...details,
  });
};
