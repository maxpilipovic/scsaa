import { supabase } from '../../../config/supabaseClient.js';

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
      return res.status(403).json({ authorized: false, message: 'User profile not found.' });
    }

    return res.json({ 
      authorized: true, 
      authUser: userProfile,
    });
  } catch (error) {
    return res.status(500).json({ authorized: false, message: 'Internal server error.', error: error.message });
  }
};