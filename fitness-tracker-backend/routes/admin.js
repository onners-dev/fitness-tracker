const express = require('express');
const router = express.Router();
const authorization = require('../middleware/authorization');
const pool = require('../db');


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
      const userCountResult = await pool.query('SELECT COUNT(*) FROM users');
      const activeUsersResult = await pool.query('SELECT COUNT(*) FROM users WHERE last_login > NOW() - INTERVAL \'30 days\'');
      const workoutCountResult = await pool.query('SELECT COUNT(*) FROM user_workouts');
      const mealCountResult = await pool.query('SELECT COUNT(*) FROM meals');
  
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
    
    const result = await pool.query(`
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
    await pool.query('UPDATE users SET is_banned = true WHERE user_id = $1', [userId]);
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
    const workoutFlags = await pool.query(`
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

    const mealFlags = await pool.query(`
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
    const submissions = await pool.query(`
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
    await pool.query('UPDATE user_workouts SET status = $1 WHERE workout_id = $2', [status, workoutId]);
    res.json({ message: `Workout ${status} successfully` });
  } catch (error) {
    console.error('Error reviewing workout:', error);
    res.status(500).json({ message: 'Failed to review workout' });
  }
});

router.get('/system-analytics', adminRoute, async (req, res) => {
  try {
    // Fetch overall system metrics
    const userCountResult = await pool.query('SELECT COUNT(*) FROM users');
    const activeUsersResult = await pool.query('SELECT COUNT(*) FROM users WHERE last_login > NOW() - INTERVAL \'30 days\'');
    const workoutCountResult = await pool.query('SELECT COUNT(*) FROM user_workouts');
    const mealCountResult = await pool.query('SELECT COUNT(*) FROM meals');

    // Fetch user growth data (example)
    const userGrowthResult = await pool.query(`
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
    const submissions = await  pool.query(`
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

    await pool.query(updateQuery, queryParams);

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
    await pool.query('UPDATE meals SET status = $1 WHERE meal_id = $2', [status, mealId]);
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
    const flagResult = await pool.query(`
      SELECT content_type, content_id 
      FROM content_flags 
      WHERE flag_id = $1
    `, [flagId]);

    if (flagResult.rows.length === 0) {
      return res.status(404).json({ message: 'Flag not found' });
    }

    const { content_type, content_id } = flagResult.rows[0];

    // Update flag status
    await pool.query(`
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

      await pool.query(updateQuery, updateParams);
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

// Get Exercise Library
router.get('/exercises', adminRoute, async (req, res) => {
  const client = await pool.connect();
  
  try {
    const { muscleName, difficulty, equipment } = req.query;

    console.log('Received filters:', { muscleName, difficulty, equipment });

    // Validate input
    if (!muscleName) {
      return res.status(400).json({ 
        message: 'Muscle name is required',
        receivedParams: req.query 
      });
    }

    let query = `
      WITH muscle_filter AS (
        SELECT DISTINCT e.exercise_id
        FROM exercises e
        JOIN exercise_muscles em ON e.exercise_id = em.exercise_id
        JOIN muscles m ON em.muscle_id = m.muscle_id
        WHERE LOWER(m.name) = LOWER($1)
        OR LOWER(m.name) LIKE LOWER($2)
      )
      SELECT 
        e.exercise_id, 
        e.name, 
        e.description,
        e.difficulty,
        e.instructions,
        e.video_url,
        COALESCE(
          (SELECT array_agg(DISTINCT eq.name) 
           FROM exercise_equipment ee2 
           JOIN equipment eq ON ee2.equipment_id = eq.equipment_id 
           WHERE ee2.exercise_id = e.exercise_id),
          ARRAY['Bodyweight']::text[]
        ) AS equipment_options,
        COALESCE(
          (SELECT array_agg(DISTINCT mg.name)
           FROM exercise_muscles em
           JOIN muscles m ON em.muscle_id = m.muscle_id
           JOIN muscle_groups mg ON m.group_id = mg.group_id
           WHERE em.exercise_id = e.exercise_id),
          ARRAY[]::text[]
        ) AS muscle_groups
      FROM exercises e
      JOIN muscle_filter mf ON e.exercise_id = mf.exercise_id
      WHERE 1=1
    `;

    const queryParams = [muscleName, `%${muscleName}%`];
    let paramCount = 3;

    // Difficulty Filter
    if (difficulty && difficulty !== 'all') {
      query += ` AND LOWER(e.difficulty) = LOWER($${paramCount})`;
      queryParams.push(difficulty);
      paramCount++;
    }

    // Equipment Filter
    if (equipment && equipment !== 'all') {
      query += ` AND EXISTS (
        SELECT 1 FROM exercise_equipment ee2 
        JOIN equipment eq2 ON ee2.equipment_id = eq2.equipment_id 
        WHERE ee2.exercise_id = e.exercise_id 
        AND LOWER(eq2.name) = LOWER($${paramCount})
      )`;
      queryParams.push(equipment);
      paramCount++;
    }

    console.log('Executing query:', query);
    console.log('Query parameters:', queryParams);

    // Diagnostic query to check muscle existence
    const muscleCheckQuery = `
      SELECT 
        m.muscle_id, 
        m.name as muscle_name, 
        mg.name as muscle_group_name 
      FROM muscles m
      JOIN muscle_groups mg ON m.group_id = mg.group_id
      WHERE LOWER(m.name) = LOWER($1) OR LOWER(m.name) LIKE LOWER($2)
    `;

    const muscleCheckResult = await client.query(muscleCheckQuery, [muscleName, `%${muscleName}%`]);
    
    if (muscleCheckResult.rows.length === 0) {
      console.warn(`No muscle found for name: ${muscleName}`);
      const availableMusclesResult = await client.query('SELECT name FROM muscles ORDER BY name');
      return res.status(404).json({ 
        message: 'No muscle found',
        muscleName: muscleName,
        availableMuscles: availableMusclesResult.rows.map(r => r.name)
      });
    }

    const result = await client.query(query, queryParams);

    console.log('Raw query results:', result.rows);

    // If no results, return an informative response
    if (result.rows.length === 0) {
      return res.json({
        message: 'No exercises found for the specified muscle',
        muscle: muscleCheckResult.rows[0],
        searchParams: req.query
      });
    }

    res.json(result.rows);

  } catch (error) {
    console.error('Detailed error fetching exercises:', {
      message: error.message,
      stack: error.stack,
      query: req.query
    });
    res.status(500).json({ 
      message: 'Error fetching exercises',
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  } finally {
    client.release();
  }
});



// Delete an Exercise
router.delete('/exercises/:id', adminRoute, async (req, res) => {
  const client = await pool.connect();
  const { id } = req.params;

  try {
    // First, remove related records in junction tables
    await client.query('DELETE FROM exercise_equipment WHERE exercise_id = $1', [id]);
    await client.query('DELETE FROM exercise_muscles WHERE exercise_id = $1', [id]);
    
    // Then delete the exercise
    const result = await client.query('DELETE FROM exercises WHERE exercise_id = $1', [id]);
    
    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Exercise not found' });
    }

    res.json({ message: 'Exercise deleted successfully' });
  } catch (error) {
    console.error('Error deleting exercise:', error);
    res.status(500).json({ message: 'Failed to delete exercise', error: error.message });
  } finally {
    client.release();
  }
});

// Get Single Exercise Details
router.get('/exercises/:exerciseId', adminRoute, async (req, res) => {
  const client = await pool.connect();
  
  try {
      const { exerciseId } = req.params;

      const query = `
          SELECT 
              e.exercise_id, 
              e.name, 
              e.difficulty, 
              e.description,
              e.instructions,
              e.video_url,
              COALESCE(
                  (SELECT array_agg(DISTINCT eq.name) 
                   FROM exercise_equipment ee2 
                   JOIN equipment eq ON ee2.equipment_id = eq.equipment_id 
                   WHERE ee2.exercise_id = e.exercise_id),
                  ARRAY['Bodyweight']::text[]
              ) AS equipment_options,
              COALESCE(
                  (SELECT array_agg(DISTINCT mg.name)
                   FROM exercise_muscles em
                   JOIN muscles m ON em.muscle_id = m.muscle_id
                   JOIN muscle_groups mg ON m.group_id = mg.group_id
                   WHERE em.exercise_id = e.exercise_id),
                  ARRAY[]::text[]
              ) AS muscle_groups
          FROM exercises e
          WHERE e.exercise_id = $1
      `;

      const result = await client.query(query, [exerciseId]);

      if (result.rows.length === 0) {
          return res.status(404).json({ message: 'Exercise not found' });
      }

      res.json(result.rows[0]);
  } catch (error) {
      console.error('Error fetching exercise details:', error);
      res.status(500).json({ message: 'Error fetching exercise details', error: error.message });
  } finally {
      client.release();
  }
});

// Get Available Equipment
router.get('/equipment', adminRoute, async (req, res) => {
  const client = await pool.connect();
  
  try {
      const result = await client.query('SELECT name FROM equipment ORDER BY name');
      res.json(result.rows.map(row => row.name));
  } catch (error) {
      console.error('Error fetching equipment:', error);
      res.status(500).json({ message: 'Error fetching equipment', error: error.message });
  } finally {
      client.release();
  }
});

// Get Muscle Groups
router.get('/muscle-groups', adminRoute, async (req, res) => {
  const client = await pool.connect();
  
  try {
    const result = await client.query(`
      SELECT 
        name, 
        description 
      FROM muscle_groups 
      ORDER BY name
    `);
    
    // If you want to return both name and description
    res.json(result.rows.map(row => ({
      name: row.name,
      description: row.description
    })));
  } catch (error) {
    console.error('Error fetching muscle groups:', error);
    res.status(500).json({ message: 'Error fetching muscle groups' });
  } finally {
    client.release();
  }
});


// Get Muscles for a Group
router.get('/muscles', adminRoute, async (req, res) => {
  const client = await pool.connect();
  
  try {
    const { groupName } = req.query;
    
    const groupResult = await client.query(
      'SELECT group_id FROM muscle_groups WHERE LOWER(name) = LOWER($1)',
      [groupName]
    );

    if (groupResult.rows.length === 0) {
      return res.status(404).json({ message: 'Muscle group not found' });
    }

    const musclesResult = await client.query(
      `SELECT 
        muscle_id, 
        name, 
        description 
      FROM muscles 
      WHERE group_id = $1 
      ORDER BY name`,
      [groupResult.rows[0].group_id]
    );

    res.json(musclesResult.rows);
  } catch (error) {
    console.error('Error fetching muscles:', error);
    res.status(500).json({ message: 'Error fetching muscles' });
  } finally {
    client.release();
  }
});

// Get Muscles for a Specific Muscle Group
router.get('/muscles-in-group', adminRoute, async (req, res) => {
  const client = await pool.connect();
  
  try {
    const { muscleGroupName } = req.query;
    
    // Find the group ID first
    const groupResult = await client.query(
      `SELECT group_id 
       FROM muscle_groups 
       WHERE LOWER(name) = LOWER($1)`,
      [muscleGroupName]
    );

    if (groupResult.rows.length === 0) {
      return res.status(404).json({ 
        message: 'Muscle group not found',
        muscleGroupName: muscleGroupName 
      });
    }

    // Fetch muscles for this group
    const musclesResult = await client.query(
      `SELECT 
        muscle_id, 
        name, 
        description 
      FROM muscles 
      WHERE group_id = $1 
      ORDER BY name`,
      [groupResult.rows[0].group_id]
    );

    res.json(musclesResult.rows);
  } catch (error) {
    console.error('Error fetching muscles in group:', error);
    res.status(500).json({ 
      message: 'Error fetching muscles', 
      error: error.message 
    });
  } finally {
    client.release();
  }
});

// Update the existing update exercise route to handle muscles
router.put('/exercises/:exerciseId', adminRoute, async (req, res) => {
  const client = await pool.connect();
  const { exerciseId } = req.params;
  const { 
    name, 
    description, 
    instructions, 
    difficulty, 
    video_url, 
    equipment_options, 
    muscle_groups,
    muscles  // New field for specific muscles
  } = req.body;

  try {
    await client.query('BEGIN');

    // Update exercise basic details
    const exerciseUpdateResult = await client.query(
      `UPDATE exercises 
       SET name = $1, 
           description = $2, 
           instructions = $3, 
           difficulty = $4, 
           video_url = $5
       WHERE exercise_id = $6
       RETURNING exercise_id`,
      [name, description, instructions, difficulty, video_url, exerciseId]
    );

    if (exerciseUpdateResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ message: 'Exercise not found' });
    }

    // Remove existing equipment associations
    await client.query(
      'DELETE FROM exercise_equipment WHERE exercise_id = $1', 
      [exerciseId]
    );

    // Remove existing muscle associations
    await client.query(
      'DELETE FROM exercise_muscles WHERE exercise_id = $1', 
      [exerciseId]
    );

    // Add new equipment associations
    if (equipment_options && equipment_options.length > 0) {
      const equipmentInsertQuery = `
        INSERT INTO exercise_equipment (exercise_id, equipment_id)
        SELECT $1, equipment_id 
        FROM equipment 
        WHERE name = ANY($2)
      `;
      await client.query(equipmentInsertQuery, [exerciseId, equipment_options]);
    }

    // Add new muscle associations - now using specific muscles
    if (muscles && muscles.length > 0) {
      const muscleInsertQuery = `
        INSERT INTO exercise_muscles (exercise_id, muscle_id)
        SELECT $1, muscle_id 
        FROM muscles 
        WHERE name = ANY($2)
      `;
      await client.query(muscleInsertQuery, [exerciseId, muscles]);
    }

    await client.query('COMMIT');

    res.json({ 
      message: 'Exercise updated successfully', 
      exerciseId: exerciseId 
    });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error updating exercise:', {
      message: error.message,
      stack: error.stack,
      body: req.body
    });
    res.status(500).json({ 
      message: 'Failed to update exercise', 
      error: error.message 
    });
  } finally {
    client.release();
  }
});


module.exports = router;
