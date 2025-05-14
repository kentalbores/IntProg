import { useState, useEffect, useCallback } from 'react';
import axios from '../config/axiosconfig';

/**
 * Custom hook for managing notification settings
 * @param {string} username - The username to fetch settings for
 * @returns {Object} Notification settings state and management functions
 */
const useNotificationSettings = (username) => {
  const [settings, setSettings] = useState({
    push_notifications: true,
    email_notifications: true,
    sms_notifications: false,
    organizer_registrations: true, 
    event_updates: true,
    vendor_bookings: true,
    event_reminders: true,
    marketing_communications: false,
    phone: '',
    phone_verified: false
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [saveError, setSaveError] = useState(null);
  
  // Fetch settings
  const fetchSettings = useCallback(async () => {
    if (!username) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.get(`/api/notifications/settings?username=${username}`);
      
      if (response.data?.settings) {
        setSettings(response.data.settings);
      }
    } catch (err) {
      console.error('Error fetching notification settings:', err);
      setError('Failed to load notification settings');
    } finally {
      setLoading(false);
    }
  }, [username]);
  
  // Initial fetch
  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);
  
  // Update a single setting
  const updateSetting = useCallback(async (setting, value) => {
    try {
      setSaving(true);
      setSaveError(null);
      
      // Optimistically update local state for better UX
      setSettings(prev => ({
        ...prev,
        [setting]: value
      }));
      
      // Send update to server
      const response = await axios.post('/api/notifications/update', {
        username,
        [setting]: value
      });
      
      if (response.data?.settings) {
        // Update with server response to ensure consistency
        setSettings(response.data.settings);
      }
      
      return { success: true };
    } catch (err) {
      console.error(`Error updating ${setting}:`, err);
      setSaveError(`Failed to update ${setting}`);
      
      // Revert to previous state on error
      await fetchSettings();
      
      return { 
        success: false, 
        error: err.message || `Failed to update ${setting}` 
      };
    } finally {
      setSaving(false);
    }
  }, [username, fetchSettings]);
  
  // Update multiple settings at once
  const updateSettings = useCallback(async (settingsToUpdate) => {
    try {
      setSaving(true);
      setSaveError(null);
      
      // Optimistically update local state
      setSettings(prev => ({
        ...prev,
        ...settingsToUpdate
      }));
      
      // Send update to server
      const response = await axios.post('/api/notifications/update', {
        username,
        ...settingsToUpdate
      });
      
      if (response.data?.settings) {
        setSettings(response.data.settings);
      }
      
      return { success: true };
    } catch (err) {
      console.error('Error updating settings:', err);
      setSaveError('Failed to save notification settings');
      
      // Revert to previous state
      await fetchSettings();
      
      return { 
        success: false, 
        error: err.message || 'Failed to save notification settings' 
      };
    } finally {
      setSaving(false);
    }
  }, [username, fetchSettings]);
  
  // Update phone number
  const updatePhone = useCallback(async (phone) => {
    try {
      setSaving(true);
      setSaveError(null);
      
      // Phone requires a separate endpoint
      const response = await axios.post('/api/user/update-phone', {
        username,
        phone
      });
      
      if (response.data) {
        setSettings(prev => ({
          ...prev,
          phone: response.data.phone,
          phone_verified: response.data.phone_verified
        }));
        
        // Enable SMS notifications if phone is verified
        if (response.data.phone_verified) {
          await updateSetting('sms_notifications', true);
        }
      }
      
      return { success: true };
    } catch (err) {
      console.error('Error updating phone:', err);
      setSaveError('Failed to update phone number');
      
      return { 
        success: false, 
        error: err.message || 'Failed to update phone number' 
      };
    } finally {
      setSaving(false);
    }
  }, [username, updateSetting]);
  
  return {
    settings,
    loading,
    saving,
    error,
    saveError,
    updateSetting,
    updateSettings,
    updatePhone,
    refreshSettings: fetchSettings
  };
};

export default useNotificationSettings; 