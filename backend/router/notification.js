const express = require('express');
const router = express.Router();
const Notification = require('../models/notification');
const UserSettings = require('../models/user_settings');
const User = require('../models/user');

// Middleware to check if user is authenticated
const isAuthenticated = (req, res, next) => {
//   if (req.session && req.session.user) {
//     next();
//   } else {
//     res.status(401).json({ message: "Unauthorized: Please log in." });
//   }
    next();
};

// Get user notifications with pagination
router.get('/user/:username', isAuthenticated, async (req, res) => {
  try {
    const { username } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Get user settings to check notification preferences
    const userSettings = await UserSettings.findOne({ username });
    if (!userSettings) {
      return res.status(404).json({ message: "User settings not found" });
    }

    // Get notifications
    const notifications = await Notification.find({ username })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Get total count for pagination
    const total = await Notification.countDocuments({ username });

    res.status(200).json({
      notifications,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ message: "Error fetching notifications", error: error.message });
  }
});

// Mark notification as read
router.patch('/:notificationId/read', isAuthenticated, async (req, res) => {
  try {
    const { notificationId } = req.params;
    const notification = await Notification.findByIdAndUpdate(
      notificationId,
      { read: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    res.status(200).json({ message: "Notification marked as read", notification });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ message: "Error marking notification as read", error: error.message });
  }
});

// Mark all notifications as read
router.patch('/mark-all-read', isAuthenticated, async (req, res) => {
  try {
    const { username } = req.body;
    await Notification.updateMany(
      { username, read: false },
      { read: true }
    );

    res.status(200).json({ message: "All notifications marked as read" });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({ message: "Error marking all notifications as read", error: error.message });
  }
});

// Create a new notification
router.post('/', isAuthenticated, async (req, res) => {
  try {
    const { username, type, title, message, eventId } = req.body;

    // Get user settings to check if notifications are enabled
    const userSettings = await UserSettings.findOne({ username });
    if (!userSettings) {
      return res.status(404).json({ message: "User settings not found" });
    }

    // Check if notifications are enabled for this type
    const notificationEnabled = userSettings[`${type}_notifications`];
    if (!notificationEnabled) {
      return res.status(200).json({ message: "Notifications disabled for this type" });
    }

    // Get user ID
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Create notification
    const notification = new Notification({
      user: user._id,
      username,
      type,
      title,
      message,
      eventId
    });

    await notification.save();

    // Emit notification through WebSocket if available
    if (req.app.get('io')) {
      req.app.get('io').to(username).emit('notification', notification);
    }

    res.status(201).json({ message: "Notification created", notification });
  } catch (error) {
    console.error('Error creating notification:', error);
    res.status(500).json({ message: "Error creating notification", error: error.message });
  }
});

// Get notification settings
router.get('/settings/:username', isAuthenticated, async (req, res) => {
  try {
    const { username } = req.params;
    const settings = await UserSettings.findOne({ username });

    if (!settings) {
      return res.status(404).json({ message: "User settings not found" });
    }

    res.status(200).json({ settings });
  } catch (error) {
    console.error('Error fetching notification settings:', error);
    res.status(500).json({ message: "Error fetching notification settings", error: error.message });
  }
});

// Update notification settings
router.post('/settings/update', isAuthenticated, async (req, res) => {
  try {
    const { username, ...settings } = req.body;

    const updatedSettings = await UserSettings.findOneAndUpdate(
      { username },
      { $set: settings },
      { new: true }
    );

    if (!updatedSettings) {
      return res.status(404).json({ message: "User settings not found" });
    }

    res.status(200).json({ message: "Settings updated", settings: updatedSettings });
  } catch (error) {
    console.error('Error updating notification settings:', error);
    res.status(500).json({ message: "Error updating notification settings", error: error.message });
  }
});

module.exports = router; 