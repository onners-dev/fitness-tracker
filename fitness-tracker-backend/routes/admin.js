const express = require('express');
const router = express.Router();
const authorization = require('../middleware/authorization');
const db = require('../db');

const adminRoute = [
  authorization,  // First, do general token authorization
  authorization.checkAdminAccess  // Then, do admin-specific check
];

// Dashboard Statistics
router.get('/dashboard-stats', adminRoute, async (req, res) => {
    console.log('Admin Dashboard Stats Request:', {
      user: req.user  // This should now be populated
    });
  
    try {
      const userCountResult = await db.query('SELECT COUNT(*) FROM users');
      const activeUsersResult = await db.query('SELECT COUNT(*) FROM users WHERE last_login > NOW() - INTERVAL \'30 days\'');
      const workoutCountResult = await db.query('SELECT COUNT(*) FROM user_workouts');
      const mealCountResult = await db.query('SELECT COUNT(*) FROM meals');
  
      res.json({
        totalUsers: parseInt(userCountResult.rows[0].count),
        activeUsers: parseInt(activeUsersResult.rows[0].count),
        totalWorkouts: parseInt(workoutCountResult.rows[0].count),
        totalMeals: parseInt(mealCountResult.rows[0].count)
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', {
        message: error.message,
        stack: error.stack
      });
      res.status(500).json({ 
        message: 'Failed to fetch dashboard statistics',
        error: error.message,
        details: error.stack
      });
    }
});
  
// User Management
router.get('/users', adminRoute, async (req, res) => {
  try {
    const result = await db.query(`
      SELECT 
        user_id as id, 
        email, 
        created_at as "registeredAt", 
        is_banned as "isBanned"
      FROM users
      ORDER BY created_at DESC
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Failed to fetch users' });
  }
});

router.post('/users/:userId/ban', adminRoute, async (req, res) => {
  const { userId } = req.params;
  try {
    await db.query('UPDATE users SET is_banned = true WHERE user_id = $1', [userId]);
    res.json({ message: 'User banned successfully' });
  } catch (error) {
    console.error('Error banning user:', error);
    res.status(500).json({ message: 'Failed to ban user' });
  }
});

// Content Moderation
router.get('/flagged-content', adminRoute, async (req, res) => {
  try {
    // Note: Adjust these queries based on your actual table structure for flagging
    const workoutFlags = await db.query(`
      SELECT 
        w.workout_id as id, 
        w.workout_name as name, 
        u.email as "userEmail", 
        'No reason provided' as reason, 
        w.created_at as "flaggedAt"
      FROM user_workouts w
      JOIN users u ON w.user_id = u.user_id
      LIMIT 50
    `);

    const mealFlags = await db.query(`
      SELECT 
        m.meal_id as id, 
        m.name, 
        u.email as "userEmail", 
        'No reason provided' as reason, 
        m.created_at as "flaggedAt"
      FROM meals m
      JOIN users u ON m.user_id = u.user_id
      LIMIT 50
    `);

    res.json({
      workoutFlags: workoutFlags.rows,
      mealFlags: mealFlags.rows
    });
  } catch (error) {
    console.error('Error fetching flagged content:', error);
    res.status(500).json({ message: 'Failed to fetch flagged content' });
  }
});

// Workout Moderation
router.get('/workout-submissions', adminRoute, async (req, res) => {
  try {
    const submissions = await db.query(`
      SELECT 
        workout_id as id, 
        workout_name as name, 
        workout_type as description, 
        'N/A' as difficulty, 
        u.email as "submittedBy", 
        created_at as "submittedAt",
        'pending' as status
      FROM user_workouts w
      JOIN users u ON w.user_id = u.user_id
      ORDER BY created_at DESC
      LIMIT 50
    `);

    res.json(submissions.rows);
  } catch (error) {
    console.error('Error fetching workout submissions:', error);
    res.status(500).json({ message: 'Failed to fetch workout submissions' });
  }
});

// Approve/Reject Workout Submission
router.post('/workouts/:workoutId/review', adminRoute, async (req, res) => {
  const { workoutId } = req.params;
  const { status } = req.body;  // 'approved' or 'rejected'

  try {
    // Note: Your current table might not have a status column
    // You may need to add this column or handle differently
    await db.query('UPDATE user_workouts SET status = $1 WHERE workout_id = $2', [status, workoutId]);
    res.json({ message: `Workout ${status} successfully` });
  } catch (error) {
    console.error('Error reviewing workout:', error);
    res.status(500).json({ message: 'Failed to review workout' });
  }
});

module.exports = router;
