import React, { useEffect, useRef, useState } from 'react';
import ManageSubscriptionButton from '../components/ManageSubscriptionButton';
import { Camera, CreditCard, Trash2, Upload } from 'lucide-react';
import { toast } from 'react-toastify';
import { supabase } from '../lib/supabaseClient';

const SettingsPage = ({ user, profile, membershipData, onProfileUpdated }) => {
  const fileInputRef = useRef(null);
  const [profilePictureUrl, setProfilePictureUrl] = useState(profile?.profile_picture_url || '');
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const hasActiveMembership = membershipData?.status === 'active' || membershipData?.status === 'pending_cancellation';
  const displayFirstName = profile?.first_name || user?.user_metadata?.first_name || '';
  const displayLastName = profile?.last_name || user?.user_metadata?.last_name || '';
  const initials = `${displayFirstName?.[0] || ''}${displayLastName?.[0] || ''}` || user?.email?.[0]?.toUpperCase() || '?';

  useEffect(() => {
    setProfilePictureUrl(profile?.profile_picture_url || '');
  }, [profile?.profile_picture_url]);

  const getAccessToken = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token;
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleProfilePictureChange = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';

    if (!file) {
      return;
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Please choose a JPEG, PNG, WebP, or GIF image.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Profile picture must be 5 MB or smaller.');
      return;
    }

    try {
      setIsUploading(true);
      const token = await getAccessToken();

      if (!token) {
        toast.error('Your session expired. Please sign in again.');
        return;
      }

      const formData = new FormData();
      formData.append('profilePicture', file);

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/profile/picture`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Profile picture upload failed.');
      }

      setProfilePictureUrl(data.profile.profile_picture_url);
      onProfileUpdated?.(data.profile);
      toast.success('Profile picture updated.');
    } catch (error) {
      console.error('Profile picture upload error:', error);
      toast.error(error.message || 'Could not update profile picture.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteProfilePicture = async () => {
    try {
      setIsDeleting(true);
      const token = await getAccessToken();

      if (!token) {
        toast.error('Your session expired. Please sign in again.');
        return;
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/profile/picture`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Profile picture removal failed.');
      }

      setProfilePictureUrl('');
      onProfileUpdated?.(data.profile);
      toast.success('Profile picture removed.');
    } catch (error) {
      console.error('Profile picture delete error:', error);
      toast.error(error.message || 'Could not remove profile picture.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-800">Settings</h1>
        <p className="text-gray-600 mt-1">Manage your account and subscriptions</p>
      </div>

      <div className="space-y-6">
        {/* Account Settings */}
        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Account Information</h2>
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex items-center gap-5">
              <div className="h-24 w-24 shrink-0 overflow-hidden rounded-full bg-indigo-600 text-white flex items-center justify-center text-3xl font-semibold">
                {profilePictureUrl ? (
                  <img
                    src={profilePictureUrl}
                    alt={`${displayFirstName} ${displayLastName}`.trim() || 'Profile'}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  initials
                )}
              </div>

              <div className="space-y-3">
                <div>
                  <h3 className="font-medium text-gray-700">Email</h3>
                  <p className="text-gray-600">{user?.email}</p>
                </div>
                <div>
                  <h3 className="font-medium text-gray-700">Name</h3>
                  <p className="text-gray-600">{displayFirstName} {displayLastName}</p>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                onChange={handleProfilePictureChange}
                className="hidden"
              />
              <button
                type="button"
                onClick={handleUploadClick}
                disabled={isUploading || isDeleting}
                className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-indigo-300"
              >
                {isUploading ? <Upload size={18} className="animate-pulse" /> : <Camera size={18} />}
                {isUploading ? 'Uploading...' : 'Change Photo'}
              </button>
              {profilePictureUrl && (
                <button
                  type="button"
                  onClick={handleDeleteProfilePicture}
                  disabled={isUploading || isDeleting}
                  className="inline-flex items-center gap-2 rounded-lg border border-red-200 px-4 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:text-red-300"
                >
                  <Trash2 size={18} />
                  {isDeleting ? 'Removing...' : 'Remove'}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Subscription Management */}
        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Subscription Management</h2>
          
          <p className="mb-6 text-gray-600">
            Manage all your subscriptions including membership dues and recurring donations. You can update payment methods, cancel subscriptions, or view your billing history.
          </p>

          {hasActiveMembership && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start gap-3">
                <CreditCard className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="font-semibold text-blue-800">Active Subscriptions</p>
                  <p className="text-sm text-blue-700 mt-1">
                    You have active subscriptions. Click below to view and manage them in the billing portal.
                  </p>
                </div>
              </div>
            </div>
          )}

          <ManageSubscriptionButton userId={user?.id} />

          <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-sm text-gray-600">
              <strong>Note:</strong> The billing portal allows you to:
            </p>
            <ul className="mt-2 space-y-1 text-sm text-gray-600 list-disc list-inside">
              <li>View all active subscriptions (membership & donations)</li>
              <li>Update payment methods</li>
              <li>Cancel or resume subscriptions</li>
              <li>Download invoices and billing history</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
