const router = require('express').Router();
const pool = require('../db');
const authorization = require('../middleware/authorization');
const workoutPlanGenerator = require('../services/workoutPlanGenerator');


router.get('/', authorization, async (req, res) => {
    const client = await pool.connect();

    try {
        const { startDate, endDate } = req.query;
        
        // Validate and parse dates
        const start = startDate ? new Date(startDate) : new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        const end = endDate ? new Date(endDate) : new Date();

        const query = `
            SELECT * FROM user_workouts 
            WHERE user_id = $1 
            AND date BETWEEN $2 AND $3 
            ORDER BY date DESC
        `;

        const result = await client.query(query, [req.user.user_id, start, end]);

        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching workouts:', err);
        res.status(500).json({ 
            message: 'Error fetching workouts', 
            error: err.message 
        });
    } finally {
        client.release();
    }
});


router.get('/exercises', authorization, async (req, res) => {
    const client = await pool.connect();
  
    try {
      const { muscleGroup, difficulty, equipment } = req.query;
  
      let query = `
        SELECT DISTINCT 
          e.exercise_id, 
          e.name, 
          e.description,
          e.difficulty,
          e.equipment,
          array_agg(DISTINCT m.name) AS muscles
        FROM exercises e
        JOIN exercise_muscles em ON e.exercise_id = em.exercise_id
        JOIN muscles m ON em.muscle_id = m.muscle_id
        WHERE 1=1
      `;
  
      const queryParams = [];
      let paramCount = 1;
  
      // Muscle Filter
      if (muscleGroup) {
        query += ` AND LOWER(m.name) = LOWER($${paramCount})`;
        queryParams.push(muscleGroup);
        paramCount++;
      }
  
      // Difficulty Filter
      if (difficulty) {
        query += ` AND LOWER(e.difficulty) = LOWER($${paramCount})`;
        queryParams.push(difficulty);
        paramCount++;
      }
  
      // Equipment Filter
      if (equipment) {
        query += ` AND LOWER(e.equipment) = LOWER($${paramCount})`;
        queryParams.push(equipment);
        paramCount++;
      }
  
      query += ` GROUP BY 
        e.exercise_id, 
        e.name, 
        e.description, 
        e.difficulty, 
        e.equipment
      `;
  
      const result = await client.query(query, queryParams);
  
      res.json(result.rows);
    } catch (error) {
      console.error('Error fetching exercises:', error);
      res.status(500).json({ 
        message: 'Error fetching exercises',
        error: error.message 
      });
    } finally {
      client.release();
    }
});

router.get('/muscles', authorization, async (req, res) => {
    const client = await pool.connect();
  
    try {
      const query = `
        SELECT DISTINCT name 
        FROM muscles 
        ORDER BY name
      `;
  
      const result = await client.query(query);
      res.json(result.rows.map(row => row.name));
    } catch (error) {
      console.error('Error fetching muscles:', error);
      res.status(500).json({ 
        message: 'Error fetching muscles',
        error: error.message 
      });
    } finally {
      client.release();
    }
});

// New route to fetch muscle groups
router.get('/muscle-groups', authorization, async (req, res) => {
    const client = await pool.connect();
  
    try {
      // Query to fetch distinct muscle groups
      const query = `
        SELECT DISTINCT name 
        FROM muscle_groups 
        ORDER BY name
      `;
  
      const result = await client.query(query);
      res.json(result.rows.map(row => row.name));
    } catch (error) {
      console.error('Error fetching muscle groups:', error);
      res.status(500).json({ 
        message: 'Error fetching muscle groups',
        error: error.message 
      });
    } finally {
      client.release();
    }
});
  

router.get('/exercises/details', authorization, async (req, res) => {
    const client = await pool.connect();

    try {
        // Parse exercise IDs from query string
        const exerciseIds = req.query.exerciseIds.split(',').map(id => parseInt(id));

        console.log('Received Exercise IDs:', exerciseIds);  // Add this line

        // Fetch detailed exercise information
        const query = `
            SELECT 
                e.exercise_id,
                e.name,
                e.description,
                e.equipment,
                e.difficulty,
                e.video_url,
                e.image_url,
                e.instructions,
                array_agg(DISTINCT mg.name) AS muscle_groups
            FROM exercises e
            JOIN exercise_muscles em ON e.exercise_id = em.exercise_id
            JOIN muscles m ON em.muscle_id = m.muscle_id
            JOIN muscle_groups mg ON m.group_id = mg.group_id
            WHERE e.exercise_id = ANY($1)
            GROUP BY 
                e.exercise_id, 
                e.name, 
                e.description, 
                e.equipment, 
                e.difficulty, 
                e.video_url, 
                e.image_url,
                e.instructions
        `;

        const result = await client.query(query, [exerciseIds]);

        console.log('Query Result:', JSON.stringify(result.rows, null, 2));  // Add this line

        // If no exercises found, return appropriate response
        if (result.rows.length === 0) {
            console.log('No exercises found for IDs:', exerciseIds);  // Add this line
            return res.status(404).json({ 
                message: 'No exercises found',
                exerciseIds: exerciseIds
            });
        }

        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching exercise details:', {
            message: error.message,
            exerciseIds: req.query.exerciseIds,
            stack: error.stack
        });

        res.status(500).json({ 
            message: 'Error fetching exercise details',
            error: error.message
        });
    } finally {
        client.release();
    }
});


// Log a new workout
router.post('/', authorization, async (req, res) => {
    const client = await pool.connect();

    try {
        console.log('Received workout logging request');
        console.log('Request body:', req.body);
        console.log('User ID:', req.user.user_id);

        const { 
            workout_type,  // Predefined or 'Custom'
            workout_name,  // Name of the workout
            date, 
            total_duration, 
            total_calories_burned, 
            notes,
            exercises 
        } = req.body;

        // Validate required fields
        if (!workout_type) {
            return res.status(400).json({ 
                message: 'Workout type is required' 
            });
        }

        // Additional validation for custom workout
        if (workout_type === 'Custom' && !workout_name) {
            return res.status(400).json({ 
                message: 'Custom workout name is required' 
            });
        }

        await client.query('BEGIN');

        // Insert workout
        const workoutResult = await client.query(
            `INSERT INTO user_workouts 
            (user_id, workout_type, workout_name, date, total_duration, total_calories_burned, notes) 
            VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING workout_id`,
            [
                req.user.user_id, 
                workout_type,
                workout_name || null, 
                date, 
                total_duration || null, 
                total_calories_burned || null, 
                notes || null
            ]
        );

        const workoutId = workoutResult.rows[0].workout_id;

        // Insert workout exercises
        if (exercises && exercises.length > 0) {
            const exerciseQuery = `
                INSERT INTO user_workout_exercises 
                (workout_id, exercise_id, sets, reps, weight, notes) 
                VALUES ($1, $2, $3, $4, $5, $6)
            `;

            for (let exercise of exercises) {
                console.log('Logging exercise:', exercise);
                await client.query(exerciseQuery, [
                    workoutId,
                    exercise.exercise_id, 
                    exercise.sets || null,
                    exercise.reps || null,
                    exercise.weight || null,
                    exercise.notes || null
                ]);
            }
        }

        await client.query('COMMIT');

        console.log('Workout logged successfully:', workoutId);
        res.status(201).json({ 
            message: 'Workout logged successfully', 
            workoutId 
        });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('Detailed error logging workout:', {
            message: err.message,
            stack: err.stack,
            body: req.body
        });
        res.status(500).json({ 
            message: 'Error logging workout', 
            error: err.message,
            details: err.stack 
        });
    } finally {
        client.release();
    }
});

router.get('/plans', authorization, async (req, res) => {
    const client = await pool.connect();

    try {
        const query = `
            WITH exercise_details AS (
                SELECT
                    wpe.plan_day_id,
                    e.exercise_id,
                    e.name,
                    e.description,
                    e.equipment,
                    e.difficulty,
                    e.instructions,
                    e.video_url,
                    wpe.sets,
                    wpe.reps,
                    array_agg(DISTINCT mg.name) AS muscle_groups
                FROM workout_plan_exercises wpe
                JOIN exercises e ON wpe.exercise_id = e.exercise_id
                JOIN exercise_muscles em ON e.exercise_id = em.exercise_id
                JOIN muscles m ON em.muscle_id = m.muscle_id
                JOIN muscle_groups mg ON m.group_id = mg.group_id
                GROUP BY 
                    wpe.plan_day_id, 
                    e.exercise_id, 
                    e.name, 
                    e.description,
                    e.equipment,
                    e.difficulty,
                    e.instructions,
                    e.video_url,
                    wpe.sets, 
                    wpe.reps
            )
            SELECT 
                uwp.plan_id,
                COALESCE(uwp.plan_name, 
                    CASE 
                        WHEN uwp.fitness_goal = 'muscle_gain' THEN 'Muscle Gain Plan'
                        WHEN uwp.fitness_goal = 'weight_loss' THEN 'Weight Loss Plan'
                        WHEN uwp.fitness_goal = 'maintenance' THEN 'Maintenance Plan'
                        WHEN uwp.fitness_goal = 'endurance' THEN 'Endurance Plan'
                        ELSE 'Workout Plan'
                    END
                ) AS plan_name,
                uwp.fitness_goal,
                uwp.activity_level,
                uwp.created_at,
                (
                    SELECT COUNT(DISTINCT wpd.day_of_week)
                    FROM workout_plan_days wpd
                    JOIN workout_plan_exercises wpe ON wpd.plan_day_id = wpe.plan_day_id
                    WHERE wpd.plan_id = uwp.plan_id
                ) AS workout_days_count,
                json_agg(
                    json_build_object(
                        'day', wpd.day_of_week,
                        'exercises', ed.exercises
                    )
                ) AS workouts
            FROM user_workout_plans uwp
            JOIN workout_plan_days wpd ON uwp.plan_id = wpd.plan_id
            LEFT JOIN (
                SELECT 
                    plan_day_id,
                    json_agg(
                        json_build_object(
                            'exercise_id', exercise_id,
                            'name', name,
                            'sets', sets,
                            'reps', reps,
                            'description', description,
                            'equipment', equipment,
                            'difficulty', difficulty,
                            'instructions', instructions,
                            'video_url', video_url,
                            'muscle_groups', muscle_groups
                        )
                    ) AS exercises
                FROM exercise_details
                GROUP BY plan_day_id
            ) ed ON wpd.plan_day_id = ed.plan_day_id
            WHERE uwp.user_id = $1
            GROUP BY uwp.plan_id, uwp.plan_name, uwp.fitness_goal, uwp.activity_level, uwp.created_at
            ORDER BY uwp.created_at DESC
            LIMIT 5
        `;

        const result = await client.query(query, [req.user.user_id]);

        const plans = result.rows.map(plan => ({
            plan_id: plan.plan_id,
            planName: plan.plan_name,
            fitnessGoal: plan.fitness_goal,
            activityLevel: plan.activity_level,
            workoutDaysCount: plan.workout_days_count || 0,
            created_at: plan.created_at,
            workouts: plan.workouts.reduce((acc, day) => {
                acc[day.day] = day.exercises || [];
                return acc;
            }, {})
        }));

        res.json(plans);
    } catch (error) {
        console.error('Error fetching workout plans:', error);
        res.status(500).json({ 
            message: 'Error fetching workout plans', 
            error: error.message 
        });
    } finally {
        client.release();
    }
});

router.post('/plans/generate', authorization, async (req, res) => {
    const client = await pool.connect();
    let planId = null;

    try {
        const { 
            fitness_goal, 
            activity_level, 
            primary_focus = '',
            plan_name,
            plan_id  // for updating existing plan
        } = req.body;

        // Validate required inputs
        if (!fitness_goal || !activity_level) {
            return res.status(400).json({
                message: 'Missing required parameters: fitness_goal and activity_level are required',
                receivedParams: { fitness_goal, activity_level }
            });
        }

        // Validate fitness goal and activity level values
        const validFitnessGoals = [
            'muscle_gain', 'weight_loss', 'maintenance', 'endurance', 'general_fitness'
        ];
        const validActivityLevels = [
            'sedentary', 'lightly_active', 'moderately_active', 'very_active', 'extremely_active'
        ];

        if (!validFitnessGoals.includes(fitness_goal)) {
            return res.status(400).json({
                message: 'Invalid fitness goal',
                received: fitness_goal,
                valid: validFitnessGoals
            });
        }

        if (!validActivityLevels.includes(activity_level)) {
            return res.status(400).json({
                message: 'Invalid activity level',
                received: activity_level,
                valid: validActivityLevels
            });
        }

        await client.query('BEGIN');

        // Check for any pending transaction for the same user
        const pendingCheck = await client.query(
            `SELECT plan_id FROM user_workout_plans 
             WHERE user_id = $1 
             AND created_at > NOW() - INTERVAL '5 seconds'`,
            [req.user.user_id]
        );

        if (pendingCheck.rows.length > 0 && !plan_id) {
            await client.query('ROLLBACK');
            return res.status(429).json({
                message: 'Please wait a moment before creating another plan',
                existingPlanId: pendingCheck.rows[0].plan_id
            });
        }

        if (plan_id) {
            // Verify plan exists and belongs to user
            const existingPlan = await client.query(
                `SELECT plan_id FROM user_workout_plans 
                 WHERE plan_id = $1 AND user_id = $2`,
                [plan_id, req.user.user_id]
            );

            if (existingPlan.rows.length === 0) {
                throw new Error('Plan not found or unauthorized');
            }

            planId = plan_id;

            // Update existing plan metadata
            await client.query(
                `UPDATE user_workout_plans 
                 SET plan_name = $1,
                     fitness_goal = $2,
                     activity_level = $3,
                     primary_focus = $4,
                     updated_at = CURRENT_TIMESTAMP
                 WHERE plan_id = $5`,
                [plan_name, fitness_goal, activity_level, primary_focus, planId]
            );

            // Clear existing exercises and days
            await client.query(
                `DELETE FROM workout_plan_exercises 
                 WHERE plan_day_id IN (
                     SELECT plan_day_id 
                     FROM workout_plan_days 
                     WHERE plan_id = $1
                 )`,
                [planId]
            );
            await client.query(
                `DELETE FROM workout_plan_days 
                 WHERE plan_id = $1`,
                [planId]
            );

            console.log('Existing plan updated:', planId);
        } else {
            // Create new plan
            const newPlanResult = await client.query(
                `INSERT INTO user_workout_plans 
                (user_id, plan_name, fitness_goal, activity_level, primary_focus, status) 
                VALUES ($1, $2, $3, $4, $5, $6) 
                RETURNING plan_id`,
                [
                    req.user.user_id,
                    plan_name || `${fitness_goal.replace('_', ' ').toUpperCase()} Plan`,
                    fitness_goal,
                    activity_level,
                    primary_focus,
                    'active'
                ]
            );
            planId = newPlanResult.rows[0].plan_id;
            console.log('New plan created:', planId);
        }

        // Verify plan exists
        const planVerification = await client.query(
            `SELECT * FROM user_workout_plans WHERE plan_id = $1`,
            [planId]
        );

        if (!planVerification.rows.length) {
            throw new Error('Plan verification failed');
        }

        console.log('Generating workout days for plan:', planId);

        // Generate workout days and exercises
        const generatedPlan = await workoutPlanGenerator.generatePlan(client, req.user.user_id, {
            fitnessGoal: fitness_goal,
            activityLevel: activity_level,
            primaryFocus: primary_focus,
            planName: plan_name,
            planId: planId
        });

        // Verify workout days were created
        const daysVerification = await client.query(
            `SELECT COUNT(*) as day_count 
             FROM workout_plan_days 
             WHERE plan_id = $1`,
            [planId]
        );

        console.log('Days created for plan:', {
            planId,
            dayCount: daysVerification.rows[0].day_count
        });

        if (daysVerification.rows[0].day_count === 0) {
            throw new Error('No workout days were created');
        }

        await client.query('COMMIT');

        return res.json({
            ...generatedPlan,
            workoutPlanId: planId,
            message: plan_id ? 'Plan updated successfully' : 'New plan created successfully'
        });

    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Plan Generation Error:', {
            error: error.message,
            stack: error.stack,
            userId: req.user.user_id,
            requestBody: req.body,
            planId: planId
        });
        
        res.status(500).json({ 
            message: 'Error generating workout plan',
            error: error.message,
            details: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    } finally {
        client.release();
    }
});



router.get('/plans/:planId', authorization, async (req, res) => {
    const client = await pool.connect();

    try {
        const planId = req.params.planId;
        
        console.log('Fetching plan details:', {
            planId,
            userId: req.user.user_id
        });

        // First verify the plan exists and belongs to user
        const planCheck = await client.query(
            `SELECT EXISTS(
                SELECT 1 FROM user_workout_plans 
                WHERE plan_id = $1 AND user_id = $2
            )`,
            [planId, req.user.user_id]
        );

        if (!planCheck.rows[0].exists) {
            console.log('Plan not found or unauthorized:', {
                planId,
                userId: req.user.user_id
            });
            return res.status(404).json({ 
                message: 'Workout plan not found or unauthorized',
                planId: planId
            });
        }

        const query = `
            WITH exercise_details AS (
                SELECT
                    wpe.plan_day_id,
                    e.exercise_id,
                    e.name,
                    e.description,
                    e.equipment,
                    e.difficulty,
                    e.instructions,
                    e.video_url,
                    wpe.sets,
                    wpe.reps,
                    array_agg(DISTINCT mg.name) AS muscle_groups
                FROM workout_plan_exercises wpe
                JOIN exercises e ON wpe.exercise_id = e.exercise_id
                JOIN exercise_muscles em ON e.exercise_id = em.exercise_id
                JOIN muscles m ON em.muscle_id = m.muscle_id
                JOIN muscle_groups mg ON m.group_id = mg.group_id
                GROUP BY 
                    wpe.plan_day_id, 
                    e.exercise_id, 
                    e.name, 
                    e.description,
                    e.equipment,
                    e.difficulty,
                    e.instructions,
                    e.video_url,
                    wpe.sets, 
                    wpe.reps
            )
            SELECT 
                uwp.plan_id AS workoutPlanId,
                uwp.plan_name AS planName,
                uwp.fitness_goal AS fitnessGoal,
                uwp.activity_level AS activityLevel,
                json_object_agg(
                    wpd.day_of_week, 
                    COALESCE(ed.exercises, '[]'::json)
                ) AS workouts
            FROM user_workout_plans uwp
            JOIN workout_plan_days wpd ON uwp.plan_id = wpd.plan_id
            LEFT JOIN (
                SELECT 
                    plan_day_id,
                    json_agg(
                        json_build_object(
                            'exercise_id', exercise_id,
                            'name', name,
                            'sets', sets,
                            'reps', reps,
                            'description', description,
                            'equipment', equipment,
                            'difficulty', difficulty,
                            'muscle_groups', muscle_groups
                        )
                    ) AS exercises
                FROM exercise_details
                GROUP BY plan_day_id
            ) ed ON wpd.plan_day_id = ed.plan_day_id
            WHERE uwp.plan_id = $1
            GROUP BY 
                uwp.plan_id, 
                uwp.plan_name, 
                uwp.fitness_goal, 
                uwp.activity_level
        `;

        const result = await client.query(query, [planId]);

        if (result.rows.length === 0) {
            console.log('No plan data found:', {
                planId,
                userId: req.user.user_id
            });
            return res.status(404).json({ 
                message: 'No plan data found',
                planId: planId
            });
        }

        console.log('Successfully fetched plan:', {
            planId,
            userId: req.user.user_id
        });

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error fetching workout plan details:', {
            error: error.message,
            stack: error.stack,
            planId: req.params.planId,
            userId: req.user.user_id
        });
        res.status(500).json({ 
            message: 'Error fetching workout plan details', 
            error: error.message 
        });
    } finally {
        client.release();
    }
});


router.put('/plans/:planId', authorization, async (req, res) => {
    const client = await pool.connect();

    try {
        const planId = parseInt(req.params.planId);
        console.log('Updating plan:', {
            planId,
            userId: req.user.user_id,
            body: req.body
        });
        
        if (isNaN(planId)) {
            return res.status(400).json({ 
                message: 'Invalid plan ID format',
                receivedId: req.params.planId
            });
        }

        const { 
            plan_name,
            workouts,
            fitness_goal,
            activity_level
        } = req.body;

        // Begin transaction
        await client.query('BEGIN');

        // Update plan metadata
        const updatePlanQuery = `
            UPDATE user_workout_plans
            SET 
                plan_name = $1,
                fitness_goal = $2,
                activity_level = $3,
                updated_at = CURRENT_TIMESTAMP
            WHERE 
                plan_id = $4 AND 
                user_id = $5
            RETURNING plan_id
        `;

        const updateResult = await client.query(updatePlanQuery, [
            plan_name.trim(), 
            fitness_goal, 
            activity_level, 
            planId, 
            req.user.user_id
        ]);

        if (updateResult.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ 
                message: 'Workout plan not found or unauthorized' 
            });
        }

        // Update exercises - first delete existing ones
        await client.query(`
            DELETE FROM workout_plan_exercises 
            WHERE plan_day_id IN (
                SELECT plan_day_id 
                FROM workout_plan_days 
                WHERE plan_id = $1
            )
        `, [planId]);

        // Delete existing plan days
        await client.query(`
            DELETE FROM workout_plan_days 
            WHERE plan_id = $1
        `, [planId]);

        // Re-insert plan days and exercises
        for (const [day, exercises] of Object.entries(workouts)) {
            // Insert plan day
            const dayResult = await client.query(`
                INSERT INTO workout_plan_days 
                (plan_id, day_of_week, focus) 
                VALUES ($1, $2, $3) 
                RETURNING plan_day_id
            `, [planId, day, 'Updated']);

            const planDayId = dayResult.rows[0].plan_day_id;

            // Insert exercises for this day
            for (const [index, exercise] of exercises.entries()) {
                await client.query(`
                    INSERT INTO workout_plan_exercises 
                    (plan_day_id, exercise_id, sets, reps, order_index) 
                    VALUES ($1, $2, $3, $4, $5)
                `, [
                    planDayId, 
                    exercise.exercise_id, 
                    exercise.sets || 3, 
                    exercise.reps || 10, 
                    index + 1
                ]);
            }
        }

        await client.query('COMMIT');

        res.json({
            message: 'Workout plan updated successfully',
            planId: planId
        });

    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error updating workout plan:', error);
        res.status(500).json({
            message: 'Failed to update workout plan',
            error: error.message
        });
    } finally {
        client.release();
    }
});


router.post('/plans/create-custom', authorization, async (req, res) => {
    const client = await pool.connect();
  
    try {
      const { 
        name, 
        fitnessGoal, 
        workoutDays, 
        selectedExercises 
      } = req.body;
  
      await client.query('BEGIN');
  
      // Insert custom workout plan
      const planResult = await client.query(
        `INSERT INTO user_workout_plans 
        (user_id, plan_name, fitness_goal, is_custom) 
        VALUES ($1, $2, $3, $4) 
        RETURNING plan_id`,
        [
          req.user.user_id, 
          name, 
          fitnessGoal, 
          true
        ]
      );
      const planId = planResult.rows[0].plan_id;
  
      // Insert plan days and exercises
      for (const day of workoutDays) {
        const dayResult = await client.query(
          `INSERT INTO workout_plan_days 
          (plan_id, day_of_week, focus) 
          VALUES ($1, $2, $3) 
          RETURNING plan_day_id`,
          [planId, day, 'Custom']
        );
        const planDayId = dayResult.rows[0].plan_day_id;
  
        // Insert exercises for this day
        const dayExercises = selectedExercises[day] || [];
        for (const [index, exercise] of dayExercises.entries()) {
          await client.query(
            `INSERT INTO workout_plan_exercises 
            (plan_day_id, exercise_id, sets, reps, order_index) 
            VALUES ($1, $2, $3, $4, $5)`,
            [
              planDayId, 
              exercise.exercise_id, 
              exercise.sets || 3, 
              exercise.reps || 10, 
              index + 1
            ]
          );
        }
      }
  
      await client.query('COMMIT');
  
      res.status(201).json({ 
        message: 'Custom workout plan created successfully',
        planId: planId
      });
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error creating custom workout plan:', error);
      res.status(500).json({ 
        message: 'Failed to create custom workout plan',
        error: error.message
      });
    } finally {
      client.release();
    }
});
  

router.put('/profile', authorization, async (req, res) => {
    const client = await pool.connect();
  
    try {
      const userId = req.user.user_id;
      const {
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
        weight_unit = 'kg',
        height_unit = 'cm'
      } = req.body;
  
      // Update only the fields that are provided
      const updateFields = [];
      const updateValues = [];
      let paramCount = 1;
  
      const addFieldIfProvided = (fieldName, value) => {
        if (value !== undefined && value !== null) {
          updateFields.push(`${fieldName} = $${paramCount}`);
          updateValues.push(value);
          paramCount++;
        }
      };
  
      addFieldIfProvided('first_name', first_name);
      addFieldIfProvided('last_name', last_name);
      addFieldIfProvided('email', email);
      addFieldIfProvided('date_of_birth', date_of_birth);
      addFieldIfProvided('gender', gender);
      addFieldIfProvided('height', height);
      addFieldIfProvided('current_weight', current_weight);
      addFieldIfProvided('target_weight', target_weight);
      addFieldIfProvided('fitness_goal', fitness_goal);
      addFieldIfProvided('activity_level', activity_level);
      addFieldIfProvided('primary_focus', primary_focus);
      addFieldIfProvided('weight_unit', weight_unit);
      addFieldIfProvided('height_unit', height_unit);
  
      // If no fields to update, return existing profile
      if (updateFields.length === 0) {
        const existingProfile = await client.query(
          'SELECT * FROM user_profiles WHERE user_id = $1',
          [userId]
        );
        return res.json(existingProfile.rows[0]);
      }
  
      // Construct the update query dynamically
      const query = `
        UPDATE user_profiles
        SET ${updateFields.join(', ')}
        WHERE user_id = $${paramCount}
        RETURNING *
      `;
  
      updateValues.push(userId);
  
      const result = await client.query(query, updateValues);
  
      res.json(result.rows[0]);
    } catch (error) {
      console.error('Error updating profile:', error);
      res.status(500).json({ message: 'Error updating profile' });
    } finally {
      client.release();
    }
  });
  

router.delete('/plans/:planId', authorization, async (req, res) => {
    const client = await pool.connect();
    
    try {
      const planId = req.params.planId;
      
      await client.query('BEGIN');
      
      // Delete associated exercises
      await client.query('DELETE FROM workout_plan_exercises WHERE plan_day_id IN (SELECT plan_day_id FROM workout_plan_days WHERE plan_id = $1)', [planId]);
      
      // Delete plan days
      await client.query('DELETE FROM workout_plan_days WHERE plan_id = $1', [planId]);
      
      // Delete the plan itself
      const result = await client.query('DELETE FROM user_workout_plans WHERE plan_id = $1 AND user_id = $2', [planId, req.user.user_id]);
      
      await client.query('COMMIT');
      
      if (result.rowCount === 0) {
        return res.status(404).json({ message: 'Workout plan not found or unauthorized' });
      }
      
      res.json({ message: 'Workout plan deleted successfully' });
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error deleting workout plan:', error);
      res.status(500).json({ message: 'Error deleting workout plan', error: error.message });
    } finally {
      client.release();
    }
});
  


module.exports = router;