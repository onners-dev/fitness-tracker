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
    console.log('Fetching users - Authenticated Admin:', req.user);
    
    const result = await db.query(`
      SELECT 
        user_id as id, 
        email, 
        created_at as "registeredAt", 
        COALESCE(is_banned, false) as "isBanned"
      FROM users
      ORDER BY created_at DESC
    `);
    
    console.log('Users fetched:', result.rows.length);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching users:', {
      message: error.message,
      stack: error.stack
    });
    res.status(500).json({ 
      message: 'Failed to fetch users',
      error: error.message,
      details: error.stack 
    });
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

router.get('/system-analytics', adminRoute, async (req, res) => {
  try {
    // Fetch overall system metrics
    const userCountResult = await db.query('SELECT COUNT(*) FROM users');
    const activeUsersResult = await db.query('SELECT COUNT(*) FROM users WHERE last_login > NOW() - INTERVAL \'30 days\'');
    const workoutCountResult = await db.query('SELECT COUNT(*) FROM user_workouts');
    const mealCountResult = await db.query('SELECT COUNT(*) FROM meals');

    // Fetch user growth data (example)
    const userGrowthResult = await db.query(`
      SELECT 
        DATE_TRUNC('day', created_at) AS date, 
        COUNT(*) AS new_users 
      FROM users 
      GROUP BY date 
      ORDER BY date DESC 
      LIMIT 30
    `);

    res.json({
      totalUsers: parseInt(userCountResult.rows[0].count),
      activeUsers: parseInt(activeUsersResult.rows[0].count),
      totalWorkouts: parseInt(workoutCountResult.rows[0].count),
      totalMeals: parseInt(mealCountResult.rows[0].count),
      serverPerformance: {
        averageResponseTime: 250,  // Mock data, replace with actual monitoring
        requestsPerMinute: 100     // Mock data, replace with actual monitoring
      },
      userGrowth: userGrowthResult.rows.map(row => ({
        date: row.date,
        newUsers: parseInt(row.new_users)
      }))
    });
  } catch (error) {
    console.error('Error fetching system analytics:', error);
    res.status(500).json({ 
      message: 'Failed to fetch system analytics',
      error: error.message 
    });
  }
});

// Nutrition Submissions Moderation
router.get('/nutrition-submissions', adminRoute, async (req, res) => {
  try {
    const submissions = await db.query(`
      SELECT 
        f.food_id as id, 
        f.name, 
        f.calories,
        f.protein,
        f.carbs,
        f.fats,
        f.brand,
        f.barcode,
        f.serving_size,
        f.category,
        f.created_at,
        u.email
      FROM user_contributed_foods f
      JOIN users u ON f.user_id = u.user_id
      WHERE f.approval_status = 'pending'
      ORDER BY f.created_at DESC
      LIMIT 50
    `);

    res.json(submissions.rows);
  } catch (error) {
    console.error('Error fetching nutrition submissions:', error);
    res.status(500).json({ message: 'Failed to fetch nutrition submissions' });
  }
});

// Review Nutrition Submission
router.post('/nutrition-submissions/:foodId/review', adminRoute, async (req, res) => {
  const { foodId } = req.params;
  const { status } = req.body;  // 'approve' or 'reject'

  try {
    // Update approval status and visibility
    const updateQuery = status === 'approve' 
      ? 'UPDATE user_contributed_foods SET approval_status = $1, visibility = $2 WHERE food_id = $3'
      : 'UPDATE user_contributed_foods SET approval_status = $1 WHERE food_id = $2';

    const queryParams = status === 'approve' 
      ? ['approved', 'public', foodId]
      : ['rejected', foodId];

    await db.query(updateQuery, queryParams);

    res.json({ 
      message: `Food submission ${status === 'approve' ? 'approved and made public' : 'rejected'}` 
    });
  } catch (error) {
    console.error('Error reviewing nutrition submission:', error);
    res.status(500).json({ message: 'Failed to review nutrition submission' });
  }
});


// Approve/Reject Nutrition Submission
router.post('/meals/:mealId/review', adminRoute, async (req, res) => {
  const { mealId } = req.params;
  const { status } = req.body;  // 'approved' or 'rejected'

  try {
    // Note: You might need to add a status column to your meals table
    await db.query('UPDATE meals SET status = $1 WHERE meal_id = $2', [status, mealId]);
    res.json({ message: `Meal ${status} successfully` });
  } catch (error) {
    console.error('Error reviewing meal:', error);
    res.status(500).json({ message: 'Failed to review meal' });
  }
});

// Add this to your admin routes
router.post('/flagged-content/:flagId/review', adminRoute, async (req, res) => {
  const { flagId } = req.params;
  const { contentType, action } = req.body;

  try {
    // Fetch the flag details
    const flagResult = await db.query(`
      SELECT content_type, content_id 
      FROM content_flags 
      WHERE flag_id = $1
    `, [flagId]);

    if (flagResult.rows.length === 0) {
      return res.status(404).json({ message: 'Flag not found' });
    }

    const { content_type, content_id } = flagResult.rows[0];

    // Update flag status
    await db.query(`
      UPDATE content_flags 
      SET status = $1 
      WHERE flag_id = $2
    `, [action === 'approve' ? 'approved' : 'rejected', flagId]);

    // Handle specific content type actions
    if (action === 'reject') {
      // Update the content's status or visibility
      const updateQuery = content_type === 'contributed_food'
        ? 'UPDATE user_contributed_foods SET approval_status = $1, visibility = $2 WHERE food_id = $3'
        : 'UPDATE meals SET status = $1 WHERE meal_id = $2';
      
      const updateParams = content_type === 'contributed_food'
        ? ['rejected', 'personal', content_id]
        : ['rejected', content_id];

      await db.query(updateQuery, updateParams);
    }

    res.json({ 
      message: `Content ${action}d successfully`,
      contentType: content_type,
      contentId: content_id
    });
  } catch (error) {
    console.error('Error reviewing flagged content:', error);
    res.status(500).json({ 
      message: 'Failed to review flagged content',
      error: error.message 
    });
  }
});




module.exports = router;
