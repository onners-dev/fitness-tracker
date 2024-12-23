const express = require('express');
const router = express.Router();
const authorization = require('../middleware/authorization');
const db = require('../db');
router.use(authorization);

router.post('/content', authorization, async (req, res) => {
  const { contentType, contentId, reason } = req.body;
  const userId = req.user.user_id;

  try {
    // Log the incoming data
    console.log('Report details:', {
      contentType,
      contentId,
      userId,
      reason
    });

    // Validate content type and ID exist
    const contentCheckQuery = contentType === 'contributed_food'
      ? 'SELECT * FROM user_contributed_foods WHERE food_id = $1 AND visibility = $2'
      : 'SELECT * FROM meals WHERE meal_id = $1';

    const contentCheckParams = contentType === 'contributed_food'
      ? [contentId, 'public']
      : [contentId];

    const contentCheck = await db.query(contentCheckQuery, contentCheckParams);

    if (contentCheck.rows.length === 0) {
      console.log('Content not found or not publicly visible');
      return res.status(404).json({ message: 'Content not found or not publicly visible' });
    }

    // Insert flag into content_flags table
    const result = await db.query(`
      INSERT INTO content_flags 
        (content_type, content_id, user_id, reason, status) 
      VALUES 
        ($1, $2, $3, $4, 'pending')
      RETURNING flag_id
    `, [contentType, contentId, userId, reason]);

    console.log('Report inserted successfully:', result.rows[0]);

    res.json({ 
      message: 'Content flagged successfully', 
      flagId: result.rows[0].flag_id 
    });
  } catch (error) {
    console.error('Error flagging content:', {
      message: error.message,
      stack: error.stack
    });
    res.status(500).json({ 
      message: 'Failed to flag content',
      error: error.message 
    });
  }
});

// Route to get flagged content for admin
router.get('/flagged-content', authorization.checkAdminAccess, async (req, res) => {
  try {
    // Fetch flagged contributed foods
    const contributedFoods = await db.query(`
      SELECT 
        cf.flag_id,
        f.name,
        u.email,
        cf.reason,
        cf.created_at
      FROM content_flags cf
      JOIN user_contributed_foods f ON cf.content_id = f.food_id AND cf.content_type = 'contributed_food'
      JOIN users u ON f.user_id = u.user_id
      WHERE cf.status = 'pending'
    `);

    // Fetch flagged workouts (if applicable)
    const workouts = await db.query(`
      SELECT 
        cf.flag_id,
        w.workout_name AS name,
        u.email,
        cf.reason,
        cf.created_at
      FROM content_flags cf
      JOIN user_workouts w ON cf.content_id = w.workout_id AND cf.content_type = 'workout'
      JOIN users u ON w.user_id = u.user_id
      WHERE cf.status = 'pending'
    `);

    // Fetch flagged meals (if applicable)
    const meals = await db.query(`
      SELECT 
        cf.flag_id,
        m.name,
        u.email,
        cf.reason,
        cf.created_at
      FROM content_flags cf
      JOIN meals m ON cf.content_id = m.meal_id AND cf.content_type = 'meal'
      JOIN users u ON m.user_id = u.user_id
      WHERE cf.status = 'pending'
    `);

    res.json({
      contributedFoods: contributedFoods.rows,
      workouts: workouts.rows,
      meals: meals.rows
    });
  } catch (error) {
    console.error('Error fetching flagged content:', error);
    res.status(500).json({ 
      message: 'Failed to fetch flagged content',
      error: error.message 
    });
  }
});

// Route to review flagged content
router.post('/flagged-content/:flagId/review', authorization.checkAdminAccess, async (req, res) => {
  const { flagId } = req.params;
  const { contentType, action } = req.body;

  try {
    // Begin transaction
    const client = await db.connect();

    try {
      // Start transaction
      await client.query('BEGIN');

      // First, update the flag status
      const flagUpdateResult = await client.query(`
        UPDATE content_flags
        SET status = $1
        WHERE flag_id = $2
        RETURNING content_type, content_id
      `, [action, flagId]);

      if (flagUpdateResult.rows.length === 0) {
        throw new Error('Flag not found');
      }

      const { content_type, content_id } = flagUpdateResult.rows[0];

      // Update the original content based on action and type
      let contentUpdateQuery = '';
      let contentUpdateParams = [];

      switch (content_type) {
        case 'contributed_food':
          contentUpdateQuery = `
            UPDATE user_contributed_foods
            SET approval_status = $1, 
                visibility = CASE WHEN $1 = 'approved' THEN 'public' ELSE 'personal' END
            WHERE food_id = $2
          `;
          contentUpdateParams = [action === 'approve' ? 'approved' : 'rejected', content_id];
          break;
        
        case 'workout':
          contentUpdateQuery = `
            UPDATE user_workouts
            SET status = $1
            WHERE workout_id = $2
          `;
          contentUpdateParams = [action, content_id];
          break;
        
        case 'meal':
          contentUpdateQuery = `
            UPDATE meals
            SET status = $1
            WHERE meal_id = $2
          `;
          contentUpdateParams = [action, content_id];
          break;
      }

      if (contentUpdateQuery) {
        await client.query(contentUpdateQuery, contentUpdateParams);
      }

      // Commit transaction
      await client.query('COMMIT');

      res.json({ 
        message: `Content ${action}d successfully`,
        contentType: content_type,
        contentId: content_id
      });
    } catch (error) {
      // Rollback transaction in case of error
      await client.query('ROLLBACK');
      throw error;
    } finally {
      // Release the client back to the pool
      client.release();
    }
  } catch (error) {
    console.error('Error reviewing flagged content:', error);
    res.status(500).json({ 
      message: 'Failed to review flagged content',
      error: error.message 
    });
  }
});

module.exports = router;
