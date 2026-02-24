import { supabase } from '../../../config/supabaseClient.js';
import { logAccessCheck, logAuthAction } from '../../../utils/auditLogger.js';

export const checkAccess = async (req, res) => {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ authorized: false, message: 'No token provided.' });
  }

  const { data: { user }, error: authError } = await supabase.auth.getUser(token);

  if (authError || !user) {
    return res.status(401).json({ authorized: false, message: 'Invalid or expired token.' });
  }

  try {
    const { data: userProfile, error: profileError } = await supabase
      .from('users')
      .select('id, first_name, last_name, pledge_class, is_admin, phone_number, address, dob')
      .eq('email', user.email)
      .single();

    if (profileError || !userProfile) {
      // Log failed access check
      if (user.id) {
        await logAccessCheck(user.id, false, { reason: 'User profile not found', email: user.email });
      }
      return res.status(403).json({ authorized: false, message: 'User profile not found.' });
    }

    // Log successful access check
    await logAccessCheck(userProfile.id, true, { email: user.email });

    return res.json({ 
      authorized: true, 
      authUser: userProfile,
    });
  } catch (error) {
    return res.status(500).json({ authorized: false, message: 'Internal server error.', error: "An error occurred" });
  }
};

/**
 * Log an authentication action from the frontend
 * Called when users sign up, login, logout, or change password
 */
export const logAuthEvent = async (req, res) => {
  const { userId, authAction, email, details } = req.body;

  if (!userId || !authAction) {
    return res.status(400).json({ message: 'User ID and auth action are required.' });
  }

  try {
    await logAuthAction(userId, authAction, email, details);
    res.status(200).json({ message: 'Auth action logged successfully.' });
  } catch (error) {
    console.error('Error logging auth event:', error);
    res.status(500).json({ message: 'Error logging auth event.', error: "An error occurred" });
  }
};

/**
 * Forgot password - check if email exists and send reset email
 */
export const forgotPassword = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ success: false, message: "Email is required." });
  }

  const redirectTo = `${process.env.FRONTEND_URL || "http://localhost:5173"}/reset-password`;

  console.log(`[Forgot Password] Attempting to send reset email to: ${email}`);
  console.log(`[Forgot Password] Redirect URL: ${redirectTo}`);

  const { data, error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });

  //Respond the same to avoid issues with security.
  if (error) {
    console.error("❌ [Forgot Password] Error sending reset email:", {
      message: error.message,
      status: error.status,
      code: error.code,
      details: error
    });
    //Still return success!
  } else {
    console.log("✅ [Forgot Password] Reset email request sent successfully");
    if (data) {
      console.log("[Forgot Password] Response data:", data);
    }
  }

  return res.status(200).json({
    success: true,
    message: "If an account exists for that email, you’ll receive a password reset link shortly.",
  });
};