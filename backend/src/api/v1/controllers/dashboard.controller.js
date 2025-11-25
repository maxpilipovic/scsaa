import { supabase } from '../../../config/supabaseClient.js';

export const getMembership = async (req, res) => {
  const { userId } = req.params;
  try {
    const { data, error } = await supabase
      .from('memberships')
      .select('*')
      .eq('user_id', userId)
      .single();
    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getPayments = async (req, res) => {
  const { userId } = req.params;
  try {
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
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
    res.status(500).json({ error: error.message });
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
    res.status(500).json({ error: error.message });
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
    res.status(500).json({ error: error.message });
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
    res.status(500).json({ error: error.message });
  }
};

export const getMembershipStatus = async (req, res) => {
  const { userId } = req.query;
  try {
    const { data, error } = await supabase
      .from('memberships')
      .select('status')
      .eq('user_id', userId)
      .single();
    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
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
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
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
    res.status(500).json({ error: error.message });
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
    res.status(500).json({ error: error.message });
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
    res.status(500).json({ error: error.message });
  }
};
