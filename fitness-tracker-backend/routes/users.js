const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const authorization = require('../middleware/authorization');
const pool = require('../db');

router.get('/profile', authorization, async (req, res) => {
  try {
      const userId = req.user.id;

      const result = await pool.query(
          `SELECT 
              u.user_id,
              u.email,
              up.first_name,
              up.last_name,
              up.date_of_birth AS age,
              up.gender,
              up.height,
              up.current_weight,
              up.target_weight,
              up.fitness_goal,
              up.activity_level,
              up.primary_focus
          FROM users u
          JOIN user_profiles up ON u.user_id = up.user_id
          WHERE u.user_id = $1`, 
          [userId]
      );

      if (result.rows.length === 0) {
          return res.status(404).json({ message: 'User not found' });
      }

      const profile = result.rows[0];

      // Add profile completeness check
      const isProfileComplete = !!(
          profile.height &&
          profile.current_weight &&
          profile.fitness_goal &&
          profile.activity_level &&
          profile.primary_focus
      );

      // Prepare the response
      const userProfile = {
          id: profile.user_id,
          email: profile.email,
          first_name: profile.first_name,
          last_name: profile.last_name,
          age: profile.age ? new Date().getFullYear() - new Date(profile.age).getFullYear() : null,
          gender: profile.gender,
          height: profile.height,
          current_weight: profile.current_weight,
          target_weight: profile.target_weight,
          fitness_goal: profile.fitness_goal,
          activity_level: profile.activity_level,
          primary_focus: profile.primary_focus,
          // Add profile completeness flag
          is_profile_complete: isProfileComplete
      };

      res.json(userProfile);
  } catch (error) {
      console.error('FULL Error details:', error);
      res.status(500).json({ 
          message: 'Server error', 
          errorName: error.name,
          errorMessage: error.message 
      });
  }
});


// Update profile route
router.put('/profile', authorization, async (req, res) => {
  try {
    const userId = req.user.id;
    const { 
      height, 
      current_weight, 
      target_weight, 
      fitness_goal, 
      activity_level,
      primary_focus,
      weight_unit,
      height_unit
    } = req.body;

    console.log('📥 Received Profile Update:', {
      userId,
      height,
      current_weight,
      target_weight,
      fitness_goal,
      activity_level,
      primary_focus,
      weight_unit,
      height_unit
    });

    // Validate required fields
    const requiredFields = [
      'height', 
      'current_weight', 
      'fitness_goal', 
      'activity_level', 
      'primary_focus'
    ];

    const missingFields = requiredFields.filter(field => 
      req.body[field] === undefined || 
      req.body[field] === null || 
      req.body[field] === ''
    );

    if (missingFields.length > 0) {
      return res.status(400).json({ 
        message: `Missing required fields: ${missingFields.join(', ')}` 
      });
    }

    // Additional validation
    if (height <= 0 || height > 300) {
      return res.status(400).json({ message: 'Invalid height' });
    }

    if (current_weight <= 0 || current_weight > 500) {
      return res.status(400).json({ message: 'Invalid current weight' });
    }

    // Start a transaction
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      // Prepare update query
      const updateQuery = `
        UPDATE user_profiles
        SET 
          height = $1,
          current_weight = $2,
          target_weight = $3,
          fitness_goal = $4,
          activity_level = $5,
          primary_focus = $6,
          weight_unit = $7,
          height_unit = $8,
          updated_at = CURRENT_TIMESTAMP
        WHERE user_id = $9
        RETURNING *
      `;

      const values = [
        height,
        current_weight,
        target_weight || null,
        fitness_goal,
        activity_level,
        primary_focus,
        weight_unit || 'kg',
        height_unit || 'cm',
        userId
      ];

      // Execute update
      const result = await client.query(updateQuery, values);

      // Fetch updated user profile with additional details
      const profileQuery = `
        SELECT 
          up.user_id,
          u.email,
          up.first_name,
          up.last_name,
          up.height,
          up.current_weight,
          up.target_weight,
          up.fitness_goal,
          up.activity_level,
          up.primary_focus,
          up.weight_unit,
          up.height_unit,
          up.date_of_birth
        FROM user_profiles up
        JOIN users u ON up.user_id = u.user_id
        WHERE up.user_id = $1
      `;

      const profileResult = await client.query(profileQuery, [userId]);

      // Commit transaction
      await client.query('COMMIT');

      // Prepare response
      const userProfile = profileResult.rows[0];
      const age = userProfile.date_of_birth 
        ? new Date().getFullYear() - new Date(userProfile.date_of_birth).getFullYear() 
        : null;

      // Determine profile completeness
      const isProfileComplete = !!(
        userProfile.height &&
        userProfile.current_weight &&
        userProfile.fitness_goal &&
        userProfile.activity_level &&
        userProfile.primary_focus
      );

      // Construct detailed profile response
      const responseProfile = {
        id: userProfile.user_id,
        email: userProfile.email,
        first_name: userProfile.first_name,
        last_name: userProfile.last_name,
        age: age,
        height: userProfile.height,
        current_weight: userProfile.current_weight,
        target_weight: userProfile.target_weight,
        fitness_goal: userProfile.fitness_goal,
        activity_level: userProfile.activity_level,
        primary_focus: userProfile.primary_focus,
        weight_unit: userProfile.weight_unit,
        height_unit: userProfile.height_unit,
        is_profile_complete: isProfileComplete
      };

      console.log('✅ Profile Update Success:', responseProfile);

      res.json(responseProfile);
    } catch (updateError) {
      // Rollback transaction in case of error
      await client.query('ROLLBACK');

      console.error('❌ Profile Update Transaction Error:', {
        name: updateError.name,
        message: updateError.message,
        stack: updateError.stack
      });

      res.status(500).json({ 
        message: 'Error updating profile',
        error: updateError.message 
      });
    } finally {
      // Always release the client
      client.release();
    }
  } catch (error) {
    console.error('❌ Profile Update Outer Error:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });

    res.status(500).json({ 
      message: 'Unexpected error updating profile',
      error: error.message 
    });
  }
});


module.exports = router;
