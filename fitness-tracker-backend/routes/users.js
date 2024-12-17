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
      first_name, 
      last_name, 
      email, 
      height, 
      current_weight, 
      target_weight, 
      fitness_goal, 
      activity_level,
      primary_focus,
      age
    } = req.body;

    // Start a transaction
    await pool.query('BEGIN');

    // Update users table if email is provided
    if (email) {
      await pool.query(
        'UPDATE users SET email = $1 WHERE user_id = $2',
        [email, userId]
      );
    }

    // Prepare update for user_profiles
    const updateFields = [];
    const values = [];
    let paramCount = 1;

    if (first_name) {
      updateFields.push(`first_name = $${paramCount}`);
      values.push(first_name);
      paramCount++;
    }
    if (last_name) {
      updateFields.push(`last_name = $${paramCount}`);
      values.push(last_name);
      paramCount++;
    }
    if (height) {
      updateFields.push(`height = $${paramCount}`);
      values.push(height);
      paramCount++;
    }
    if (current_weight) {
      updateFields.push(`current_weight = $${paramCount}`);
      values.push(current_weight);
      paramCount++;
    }
    if (target_weight !== undefined) {
      updateFields.push(`target_weight = $${paramCount}`);
      values.push(target_weight);
      paramCount++;
    }
    if (fitness_goal) {
      updateFields.push(`fitness_goal = $${paramCount}`);
      values.push(fitness_goal);
      paramCount++;
    }
    if (activity_level) {
      updateFields.push(`activity_level = $${paramCount}`);
      values.push(activity_level);
      paramCount++;
    }
    if (primary_focus) {
      updateFields.push(`primary_focus = $${paramCount}`);
      values.push(primary_focus);
      paramCount++;
    }
    if (age) {
      // Calculate date of birth from age
      const dateOfBirth = new Date();
      dateOfBirth.setFullYear(dateOfBirth.getFullYear() - age);

      updateFields.push(`date_of_birth = $${paramCount}`);
      values.push(dateOfBirth);
      paramCount++;
    }

    // Add user ID as the last parameter
    values.push(userId);

    // Construct the full query
    if (updateFields.length > 0) {
      const query = `
        UPDATE user_profiles 
        SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP
        WHERE user_id = $${paramCount}
        RETURNING *
      `;
      
      await pool.query(query, values);
    }

    // Commit the transaction
    await pool.query('COMMIT');

    // Fetch and return the updated profile
    const result = await pool.query(
      `SELECT 
        u.user_id,
        u.email,
        up.first_name,
        up.last_name,
        up.date_of_birth AS age,
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

    // Prepare the response
    const userProfile = {
      id: result.rows[0].user_id,
      email: result.rows[0].email,
      first_name: result.rows[0].first_name,
      last_name: result.rows[0].last_name,
      age: result.rows[0].age ? new Date().getFullYear() - new Date(result.rows[0].age).getFullYear() : null,
      height: result.rows[0].height,
      current_weight: result.rows[0].current_weight,
      target_weight: result.rows[0].target_weight,
      fitness_goal: result.rows[0].fitness_goal,
      activity_level: result.rows[0].activity_level,
      primary_focus: result.rows[0].primary_focus
    };

    res.json(userProfile);
  } catch (error) {
    // Rollback the transaction in case of error
    await pool.query('ROLLBACK');

    console.error('Profile update error:', error);
    res.status(500).json({ message: 'Error updating profile' });
  }
});


module.exports = router;
