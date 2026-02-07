import { supabase } from '../../../config/supabaseClient.js';
import { logAction } from '../../../utils/auditLogger.js';

export const getMembership = async (req, res) => {
  const { userId } = req.params;
  
  // Prevent horizontal privilege escalation: user can only access their own data
  if (req.user.id !== userId) {
    return res.status(403).json({ message: 'Forbidden: You can only access your own membership data.' });
  }
  
  try {
    const { data, error } = await supabase
      .from('memberships')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    //Return null or empty object if no membership found (new user)
    //Error code PGRST116 indicates no rows found for single() query
    if (error && error.code === 'PGRST116') {
      return res.json(null);
    }
    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error('Error fetching membership:', error);
    res.status(500).json({ message: 'Server error. Please try again later.' });
  }
};

export const getPayments = async (req, res) => {
  const { userId } = req.params;
  
  // Prevent horizontal privilege escalation: user can only access their own data
  if (req.user.id !== userId) {
    return res.status(403).json({ message: 'Forbidden: You can only access your own payment data.' });
  }
  
  try {
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error('Error fetching payments:', error);
    res.status(500).json({ message: 'Server error. Please try again later.' });
  }
};

export const getEvents = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .order('start_time', { ascending: true });
    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: "An error occurred" });
  }
};

export const getAnnouncements = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('announcements')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: "An error occurred" });
  }
};

export const getTotalMembers = async (req, res) => {
  try {
    const { count, error } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true });
    if (error) throw error;
    res.json({ totalMembers: count });
  } catch (error) {
    res.status(500).json({ error: "An error occurred" });
  }
};

export const getActiveMembers = async (req, res) => {
  try {
    const { count, error } = await supabase
      .from('memberships')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active');
    if (error) throw error;
    res.json({ activeMembers: count });
  } catch (error) {
    res.status(500).json({ error: "An error occurred" });
  }
};

export const getMembershipStatus = async (req, res) => {
  const { userId } = req.query;
  
  // Prevent horizontal privilege escalation: user can only access their own data
  if (req.user.id !== userId) {
    return res.status(403).json({ message: 'Forbidden: You can only check your own membership status.' });
  }
  
  try {
    const { data, error } = await supabase
      .from('memberships')
      .select('status')
      .eq('user_id', userId)
      .single();
    
    //Return null if no membership found (new user)
    //Error code PGRST116 indicates no rows found for single() query
    if (error && error.code === 'PGRST116') {
      return res.json(null);
    }
    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error('Error fetching membership status:', error);
    res.status(500).json({ message: 'Server error. Please try again later.' });
  }
};

export const getAdminStatus = async (req, res) => {
  const userId = req.user.id; // GET userId from authenticated user
  try {
    const { data, error } = await supabase
      .from('users')
      .select('is_admin')
      .eq('id', userId)
      .single();
    if (error) throw error;
    
    // Log admin status check
    if (data?.is_admin) {
      await logAction(userId, 'ADMIN_DASHBOARD_ACCESSED', 'dashboard', { timestamp: new Date().toISOString() });
    }
    
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: "An error occurred" });
  }
};

export const getRecentSignups = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('id, first_name, last_name, created_at')
      .order('created_at', { ascending: false })
      .limit(5); // Adjust limit as needed
    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: "An error occurred" });
  }
};

export const getTotalRevenue = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('payments')
      .select('dues_amount')
      .eq('status', 'succeeded'); 

    if (error) throw error;

    const totalRevenue = data.reduce((sum, payment) => sum + payment.dues_amount, 0);
    res.json({ totalRevenue });
  } catch (error) {
    res.status(500).json({ error: "An error occurred" });
  }
};

export const getMonthlyRecurringRevenue = async (req, res) => {
  try {

    const { count, error: activeMembersError } = await supabase
      .from('memberships')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active');

    if (activeMembersError) throw activeMembersError;

    const yearlyRecurringAmountPerMember = 50; //Example: $50/year

    const mrr = count * yearlyRecurringAmountPerMember;
    res.json({ mrr });
  } catch (error) {
    res.status(500).json({ error: "An error occurred" });
  }
};
