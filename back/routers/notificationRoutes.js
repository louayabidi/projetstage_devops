
const express = require('express');
const router = express.Router();
const { getNotifications, getUnreadNotificationCount, markAllAsRead } = require('../controllers/notificationController');
const passport = require('../middlewares/passport');

// Get all notifications for the authenticated user
router.get('/', passport.authenticate('jwt', { session: false }), getNotifications);

// Get unread notification count
router.get('/unread-count', passport.authenticate('jwt', { session: false }), getUnreadNotificationCount);

// Mark all notifications as read
router.post('/mark-all-read', passport.authenticate('jwt', { session: false }), markAllAsRead);

module.exports = router;