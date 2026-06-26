import { supabase } from '../../../config/supabaseClient.js';

const PROFILE_PICTURE_BUCKET = process.env.PROFILE_PICTURE_BUCKET || 'profile-pictures';
const ALLOWED_IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);
const EXTENSION_BY_MIME_TYPE = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
};

const getUserProfile = async (userId) => {
  const { data, error } = await supabase
    .from('users')
    .select('id, email, first_name, last_name, profile_picture_url, profile_picture_path')
    .eq('id', userId)
    .single();

  if (error) {
    throw error;
  }

  return data;
};

export const getMyProfile = async (req, res) => {
  try {
    const profile = await getUserProfile(req.user.id);
    res.status(200).json({ profile });
  } catch (error) {
    if (error.code === 'PGRST116') {
      return res.status(404).json({ message: 'User profile not found.' });
    }

    console.error('Error fetching user profile:', error);
    res.status(500).json({ message: 'Server error while fetching profile.' });
  }
};

export const uploadProfilePicture = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'Profile picture file is required.' });
  }

  if (!ALLOWED_IMAGE_TYPES.has(req.file.mimetype)) {
    return res.status(400).json({ message: 'Only JPEG, PNG, WebP, and GIF images are allowed.' });
  }

  const userId = req.user.id;
  const extension = EXTENSION_BY_MIME_TYPE[req.file.mimetype];
  const storagePath = `${userId}/${Date.now()}.${extension}`;

  try {
    const currentProfile = await getUserProfile(userId);

    const { error: uploadError } = await supabase.storage
      .from(PROFILE_PICTURE_BUCKET)
      .upload(storagePath, req.file.buffer, {
        contentType: req.file.mimetype,
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) {
      throw uploadError;
    }

    const { data: publicUrlData } = supabase.storage
      .from(PROFILE_PICTURE_BUCKET)
      .getPublicUrl(storagePath);

    const { data: updatedProfile, error: updateError } = await supabase
      .from('users')
      .update({
        profile_picture_url: publicUrlData.publicUrl,
        profile_picture_path: storagePath,
      })
      .eq('id', userId)
      .select('id, email, first_name, last_name, profile_picture_url, profile_picture_path')
      .single();

    if (updateError) {
      await supabase.storage.from(PROFILE_PICTURE_BUCKET).remove([storagePath]);
      throw updateError;
    }

    if (currentProfile.profile_picture_path) {
      await supabase.storage
        .from(PROFILE_PICTURE_BUCKET)
        .remove([currentProfile.profile_picture_path]);
    }

    res.status(200).json({
      message: 'Profile picture uploaded successfully.',
      profile: updatedProfile,
    });
  } catch (error) {
    if (error.code === 'PGRST116') {
      return res.status(404).json({ message: 'User profile not found.' });
    }

    console.error('Error uploading profile picture:', error);
    res.status(500).json({ message: 'Server error while uploading profile picture.' });
  }
};

export const deleteProfilePicture = async (req, res) => {
  const userId = req.user.id;

  try {
    const currentProfile = await getUserProfile(userId);

    if (currentProfile.profile_picture_path) {
      const { error: removeError } = await supabase.storage
        .from(PROFILE_PICTURE_BUCKET)
        .remove([currentProfile.profile_picture_path]);

      if (removeError) {
        throw removeError;
      }
    }

    const { data: updatedProfile, error: updateError } = await supabase
      .from('users')
      .update({
        profile_picture_url: null,
        profile_picture_path: null,
      })
      .eq('id', userId)
      .select('id, email, first_name, last_name, profile_picture_url, profile_picture_path')
      .single();

    if (updateError) {
      throw updateError;
    }

    res.status(200).json({
      message: 'Profile picture deleted successfully.',
      profile: updatedProfile,
    });
  } catch (error) {
    if (error.code === 'PGRST116') {
      return res.status(404).json({ message: 'User profile not found.' });
    }

    console.error('Error deleting profile picture:', error);
    res.status(500).json({ message: 'Server error while deleting profile picture.' });
  }
};
