const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const authorization = require('../middleware/authorization');
const pool = require('../db');
const { calculateNutrientGoals } = require('../routes/nutrition');

router.get('/profile', authorization, async (req, res) => {
  try {
      const userId = req.user.user_id;

      const result = await pool.query(
          `SELECT 
              u.user_id,
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

      console.log('Fetched Profile:', profile); // Add detailed logging

      // Add profile completeness check
      const isProfileComplete = !!(
          profile.height &&
          profile.current_weight &&
          profile.fitness_goal &&
          profile.activity_level &&
          profile.primary_focus
      );

      // Calculate age if needed
      const calculateAge = (dateOfBirth) => {
        if (!dateOfBirth) return null;
        const birthDate = new Date(dateOfBirth);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDifference = today.getMonth() - birthDate.getMonth();
        
        if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
          age--;
        }
        
        return age;
      };

      // Prepare the response
      const userProfile = {
          id: profile.user_id,
          email: profile.email,
          first_name: profile.first_name,
          last_name: profile.last_name,
          // Directly use date_of_birth and format it
          date_of_birth: profile.date_of_birth 
              ? new Date(profile.date_of_birth).toISOString().split('T')[0] 
              : null,
          age: calculateAge(profile.date_of_birth),
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

      console.log('Prepared User Profile:', userProfile); // Add detailed logging

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
    const userId = req.user.user_id;
    const { 
      // Personal information fields
      first_name,
      last_name,
      email,
      date_of_birth,
      gender,

      // Fitness fields
      height,
      current_weight,
      target_weight,
      fitness_goal,
      activity_level,
      primary_focus,

      // Units
      weight_unit = 'kg',
      height_unit = 'cm'
    } = req.body;

    console.log('📢 COMPLETE Profile Update Request:', {
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
      // Begin transaction
      await client.query('BEGIN');

      // Fetch current profile to merge with incoming data
      const currentProfileResult = await client.query(
        `SELECT * FROM user_profiles WHERE user_id = $1`, 
        [userId]
      );
      const currentProfile = currentProfileResult.rows[0];

      // Careful date parsing
      let parsedDateOfBirth = null;
      if (date_of_birth) {
        const inputDate = new Date(date_of_birth);
        
        // Validate date
        if (!isNaN(inputDate.getTime())) {
          // Ensure it's stored as a date, but without time component
          parsedDateOfBirth = new Date(
            Date.UTC(
              inputDate.getFullYear(), 
              inputDate.getMonth(), 
              inputDate.getDate()
            )
          );
        }
      }

      // Update user_profiles table with merged data
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
        parsedDateOfBirth, // Use parsed date
        gender,
        height !== undefined ? parseFloat(height) : null,
        current_weight !== undefined ? parseFloat(current_weight) : null,
        target_weight !== undefined ? parseFloat(target_weight) : null,
        fitness_goal,
        activity_level,
        primary_focus,
        weight_unit,
        height_unit,
        userId
      ];

      console.log('🔍 Profile Update Values:', profileValues);

      // Execute profile update
      const profileResult = await client.query(profileUpdateQuery, profileValues);

      console.log('✅ Profile Update Result:', profileResult.rows[0]);

      // Update email in users table if provided
      if (email) {
        const userUpdateQuery = `
          UPDATE users
          SET email = $1::varchar
          WHERE user_id = $2
          RETURNING *
        `;
        const userUpdateResult = await client.query(userUpdateQuery, [email, userId]);
        console.log('📧 Email Update Result:', userUpdateResult.rows[0]);
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

      const userProfile = finalProfileResult.rows[0];
      
      console.log('🎉 Final Profile:', userProfile);

      // Prepare response
      const responseProfile = {
        id: userProfile.user_id,
        email: userProfile.email,
        first_name: userProfile.first_name,
        last_name: userProfile.last_name,
        date_of_birth: userProfile.date_of_birth 
          ? new Date(userProfile.date_of_birth).toISOString().split('T')[0]  // This ensures YYYY-MM-DD
          : null,
        gender: userProfile.gender,
        height: userProfile.height,
        current_weight: userProfile.current_weight,
        target_weight: userProfile.target_weight,
        fitness_goal: userProfile.fitness_goal,
        activity_level: userProfile.activity_level,
        primary_focus: userProfile.primary_focus,
        weight_unit: userProfile.weight_unit,
        height_unit: userProfile.height_unit
      };

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



router.put('/password', authorization, async (req, res) => {
  try {
    const userId = req.user.user_id;
    const { currentPassword, newPassword } = req.body;

    console.log('🔐 Password Update Request:', {
      userId,
      currentPasswordLength: currentPassword ? currentPassword.length : 'N/A',
      newPasswordLength: newPassword ? newPassword.length : 'N/A'
    });

    // Validate input
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Current and new passwords are required' });
    }

    // Fetch user's current password hash
    const userResult = await pool.query(
      'SELECT password_hash FROM users WHERE user_id = $1',
      [userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(
      currentPassword, 
      userResult.rows[0].password_hash
    );

    if (!isCurrentPasswordValid) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    // Validate new password strength
    if (newPassword.length < 8) {
      return res.status(400).json({ message: 'New password must be at least 8 characters long' });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedNewPassword = await bcrypt.hash(newPassword, salt);

    // Update password
    await pool.query(
      'UPDATE users SET password_hash = $1 WHERE user_id = $2',
      [hashedNewPassword, userId]
    );

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('🚨 Password Update Error:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });

    res.status(500).json({ 
      message: 'Error updating password',
      error: error.message 
    });
  }
});


module.exports = router;
