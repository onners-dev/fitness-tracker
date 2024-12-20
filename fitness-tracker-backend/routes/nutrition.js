const express = require('express');
const router = express.Router();
const pool = require('../db');
const authorization = require('../middleware/authorization');

// Function to calculate nutrition goals
function calculateNutrientGoals(profile) {
    const { 
      current_weight, 
      height, 
      age, 
      fitness_goal, 
      activity_level,
      gender = 'male'  // Add default value and destructure
    } = profile;

    // Add extensive validation
    const requiredFields = [
      'current_weight', 
      'height', 
      'age', 
      'fitness_goal', 
      'activity_level',
      'gender'
    ];
  
    // Check for missing or invalid fields
    requiredFields.forEach(field => {
      if (!profile[field]) {
        throw new Error(`Missing required field: ${field}`);
      }
    });
  
    // Validate numeric fields
    const numericFields = ['current_weight', 'height', 'age'];
    numericFields.forEach(field => {
      if (isNaN(Number(profile[field]))) {
        throw new Error(`Invalid numeric value for ${field}: ${profile[field]}`);
      }
    });
  
    // Base Metabolic Rate Calculation (Mifflin-St Jeor Equation)
    let bmr;
    switch(gender.toLowerCase()) {
        case 'male':
            // Mifflin-St Jeor for males
            bmr = 10 * current_weight + 6.25 * height - 5 * age + 5;
            break;
        case 'female':
            // Mifflin-St Jeor for females
            bmr = 10 * current_weight + 6.25 * height - 5 * age - 161;
            break;
        default:
            // Fallback to a more neutral calculation
            bmr = 10 * current_weight + 6.25 * height - 5 * age + (gender.toLowerCase() === 'male' ? 5 : -161);
    }

    // Activity Multipliers
    const activityMultipliers = {
      'sedentary': 1.2,
      'lightly_active': 1.375,
      'moderately_active': 1.55,
      'very_active': 1.725
    };
  
    // Total Daily Energy Expenditure (TDEE)
    const tdee = bmr * (activityMultipliers[activity_level] || 1.2);
  
    // Goal-based calorie adjustments
    let calorieAdjustment = 0;
    switch(fitness_goal) {
      case 'weight_loss':
        calorieAdjustment = -500;  // Calorie deficit
        break;
      case 'muscle_gain':
        calorieAdjustment = 300;   // Calorie surplus
        break;
      default:  // maintenance
        calorieAdjustment = 0;
    }
  
    const dailyCalories = Math.round(tdee + calorieAdjustment);
  
    // Macronutrient Distribution
    // Consider potentially different macronutrient ratios based on gender and goal
    let proteinGoal, carbGoal, fatGoal;
  
    // Protein goals can be slightly different based on gender and goal
    const proteinMultiplier = gender.toLowerCase() === 'female' 
      ? (fitness_goal === 'muscle_gain' ? 2.0 : 1.4)  // Slightly lower for females
      : (fitness_goal === 'muscle_gain' ? 2.2 : 1.6); // Slightly higher for males
  
    switch(fitness_goal) {
      case 'muscle_gain':
        proteinGoal = Math.round(current_weight * proteinMultiplier);
        carbGoal = Math.round((dailyCalories * 0.4) / 4);  // 40% carbs
        fatGoal = Math.round((dailyCalories * 0.2) / 9);   // 20% fats
        break;
      case 'weight_loss':
        proteinGoal = Math.round(current_weight * proteinMultiplier);
        carbGoal = Math.round((dailyCalories * 0.3) / 4);  // 30% carbs
        fatGoal = Math.round((dailyCalories * 0.3) / 9);   // 30% fats
        break;
      default:  // maintenance
        proteinGoal = Math.round(current_weight * proteinMultiplier);
        carbGoal = Math.round((dailyCalories * 0.5) / 4);  // 50% carbs
        fatGoal = Math.round((dailyCalories * 0.25) / 9);  // 25% fats
    }
  
    return {
      daily_calories_goal: dailyCalories,
      daily_protein_goal: proteinGoal,
      daily_carbs_goal: carbGoal,
      daily_fats_goal: fatGoal
    };
}

router.post('/calculate-goals', authorization, async (req, res) => {
  try {
      const userProfile = await pool.query(
          `SELECT 
              current_weight, 
              height, 
              date_part('year', age(date_of_birth)) AS age, 
              fitness_goal, 
              activity_level,
              gender,
              date_of_birth
          FROM user_profiles 
          WHERE user_id = $1`, 
          [req.user.id]
      );

      const profile = userProfile.rows[0];

      // Calculate age if not already present
      if (!profile.age && profile.date_of_birth) {
          profile.age = new Date().getFullYear() - new Date(profile.date_of_birth).getFullYear();
      }

      // Provide default values if missing
      profile.gender = profile.gender || 'male';
      
      // Validate required fields
      const requiredFields = [
          'current_weight', 
          'height', 
          'fitness_goal', 
          'activity_level'
      ];

      const missingFields = requiredFields.filter(field => 
          !profile[field] || profile[field] === null
      );

      if (missingFields.length > 0) {
          return res.status(400).json({ 
              message: 'Incomplete profile',
              missingFields: missingFields
          });
      }

      // Ensure age is calculated or provided
      if (!profile.age) {
          return res.status(400).json({
              message: 'Unable to calculate age. Please update your date of birth.'
          });
      }

      // Convert string values to numbers
      const profileData = {
          current_weight: Number(profile.current_weight),
          height: Number(profile.height),
          age: Number(profile.age),
          fitness_goal: profile.fitness_goal,
          activity_level: profile.activity_level,
          gender: profile.gender
      };

      try {
          const nutritionGoals = calculateNutrientGoals(profileData);

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
                  req.user.id
              ]
          );

          res.json(nutritionGoals);
      } catch (calculationError) {
          console.error('Nutrition Goals Calculation Error:', {
              message: calculationError.message,
              stack: calculationError.stack,
              profile: profileData
          });

          res.status(500).json({ 
              message: 'Error in nutrition goals calculation',
              details: calculationError.message
          });
      }
  } catch (error) {
      console.error('Nutrition Goals Route Error:', {
          message: error.message,
          stack: error.stack
      });

      res.status(500).json({ 
          message: 'Error calculating nutrition goals',
          details: error.message
      });
  }
});

// Route to get current nutrition goals
router.get('/goals', authorization, async (req, res) => {
  try {
      const { rows } = await pool.query(
          `SELECT 
              daily_calories_goal, 
              daily_protein_goal, 
              daily_carbs_goal, 
              daily_fats_goal 
          FROM user_profiles 
          WHERE user_id = $1`,
          [req.user.id]
      );

      if (rows.length === 0) {
          return res.status(404).json({ message: 'No nutrition goals found' });
      }

      res.json(rows[0]);
  } catch (error) {
      res.status(500).json({ message: 'Error fetching nutrition goals' });
  }
});

module.exports = router;
router.calculateNutrientGoals = calculateNutrientGoals;