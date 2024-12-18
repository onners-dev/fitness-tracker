const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const authorization = require('../middleware/authorization');
const pool = require('../db');
const { calculateNutrientGoals } = require('../routes/nutrition');

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
      // Existing fitness fields
      height, 
      current_weight, 
      target_weight, 
      fitness_goal, 
      activity_level,
      primary_focus,
      weight_unit,
      height_unit,

      // New personal information fields
      first_name,
      last_name,
      email,
      date_of_birth,
      gender
    } = req.body;

    console.log('📥 Received Profile Update:', {
      userId,
      first_name,
      last_name,
      email,
      date_of_birth,
      gender,
      height,
      current_weight,
      target_weight,
      fitness_goal,
      activity_level,
      primary_focus,
      weight_unit,
      height_unit
    });

    // Start a transaction
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      // Update user_profiles table
      const profileUpdateQuery = `
        UPDATE user_profiles
        SET 
          first_name = COALESCE($1, first_name),
          last_name = COALESCE($2, last_name),
          date_of_birth = COALESCE($3, date_of_birth),
          gender = COALESCE($4, gender),
          height = COALESCE($5, height),
          current_weight = COALESCE($6, current_weight),
          target_weight = COALESCE($7, target_weight),
          fitness_goal = COALESCE($8, fitness_goal),
          activity_level = COALESCE($9, activity_level),
          primary_focus = COALESCE($10, primary_focus),
          weight_unit = COALESCE($11, weight_unit),
          height_unit = COALESCE($12, height_unit),
          updated_at = CURRENT_TIMESTAMP
        WHERE user_id = $13
        RETURNING *
      `;

      const profileValues = [
        first_name,
        last_name,
        date_of_birth ? new Date(date_of_birth) : null,
        gender,
        height,
        current_weight,
        target_weight,
        fitness_goal,
        activity_level,
        primary_focus,
        weight_unit || 'kg',
        height_unit || 'cm',
        userId
      ];

      // Execute profile update
      const profileResult = await client.query(profileUpdateQuery, profileValues);

      // Update email in users table if provided
      let userResult;
      if (email) {
        const userUpdateQuery = `
          UPDATE users
          SET email = $1
          WHERE user_id = $2
          RETURNING *
        `;
        userResult = await client.query(userUpdateQuery, [email, userId]);
      }

      // Commit transaction
      await client.query('COMMIT');

      // Fetch final profile data
      const finalProfileQuery = `
        SELECT 
          up.user_id,
          u.email,
          up.first_name,
          up.last_name,
          up.date_of_birth,
          up.gender,
          up.height,
          up.current_weight,
          up.target_weight,
          up.fitness_goal,
          up.activity_level,
          up.primary_focus,
          up.weight_unit,
          up.height_unit
        FROM user_profiles up
        JOIN users u ON up.user_id = u.user_id
        WHERE up.user_id = $1
      `;

      const finalProfileResult = await client.query(finalProfileQuery, [userId]);

      // Prepare response
      const userProfile = finalProfileResult.rows[0];
      const age = userProfile.date_of_birth 
        ? new Date().getFullYear() - new Date(userProfile.date_of_birth).getFullYear() 
        : null;

      // Determine profile completeness
      const isProfileComplete = !!(
        userProfile.height &&
        userProfile.current_weight &&
        userProfile.fitness_goal &&
        userProfile.activity_level &&
        userProfile.primary_focus &&
        userProfile.first_name &&
        userProfile.last_name &&
        userProfile.date_of_birth &&
        userProfile.gender
      );

      // Construct detailed profile response
      const responseProfile = {
        id: userProfile.user_id,
        email: userProfile.email,
        first_name: userProfile.first_name,
        last_name: userProfile.last_name,
        date_of_birth: userProfile.date_of_birth,
        age: age,
        gender: userProfile.gender,
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

      // Trigger nutrition goals recalculation (existing logic)
      if (responseProfile.current_weight && 
          responseProfile.height && 
          responseProfile.fitness_goal && 
          age) {
        try {
          const nutritionGoals = calculateNutrientGoals({
            current_weight: responseProfile.current_weight,
            height: responseProfile.height,
            age: age,
            fitness_goal: responseProfile.fitness_goal,
            activity_level: responseProfile.activity_level,
            gender: responseProfile.gender
          });

          await pool.query(
            `UPDATE user_profiles 
             SET daily_calories_goal = $1,
                 daily_protein_goal = $2,
                 daily_carbs_goal = $3,
                 daily_fats_goal = $4,
                 goals_last_calculated = CURRENT_TIMESTAMP
             WHERE user_id = $5`,
            [
              nutritionGoals.daily_calories_goal,
              nutritionGoals.daily_protein_goal,
              nutritionGoals.daily_carbs_goal,
              nutritionGoals.daily_fats_goal,
              userId
            ]
          );
        } catch (calculationError) {
          console.error('Error in nutrition goals calculation:', calculationError);
        }
      }

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
