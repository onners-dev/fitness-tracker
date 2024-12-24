const router = require('express').Router();
const pool = require('../db');
const authorization = require('../middleware/authorization');




function generatePlanNotes(fitnessGoal, activityLevel, primaryFocus) {
    const goalNotes = {
        'weight_loss': 'Focus on high-intensity exercises and maintain a calorie deficit.',
        'muscle_gain': 'Prioritize progressive overload and adequate protein intake.',
        'maintenance': 'Maintain a balanced approach to strength and cardiovascular fitness.',
        'endurance': 'Gradually increase workout intensity and duration.',
        'general_fitness': 'Mix different types of exercises for overall fitness.'
    };

    const activityNotes = {
        'sedentary': 'Start slow and gradually increase workout intensity.',
        'lightly_active': 'Consistently challenge yourself while avoiding overexertion.',
        'moderately_active': 'Maintain a steady progression in your fitness journey.',
        'very_active': 'Continue pushing your limits with varied and intense workouts.'
    };

    const focusNotes = {
        'strength': 'Emphasize compound movements and progressive overload.',
        'cardio': 'Incorporate varied cardiovascular exercises.',
        'flexibility': 'Include dynamic stretching and mobility work.',
        'weight_management': 'Balance strength training with cardiovascular exercises.',
        'overall_wellness': 'Maintain a holistic approach to fitness and health.',
        '': 'Develop a well-rounded fitness approach.'
    };

    // Safely retrieve notes with fallback
    const goalNote = goalNotes[fitnessGoal] || 'Pursue your fitness goals consistently.';
    const activityNote = activityNotes[activityLevel] || 'Listen to your body and progress gradually.';
    const focusNote = focusNotes[primaryFocus] || 'Maintain a balanced fitness routine.';

    return `${goalNote} ${activityNote} ${focusNote} Always listen to your body and adjust the plan as needed.`;
}

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
                        'exercises', (
                            SELECT json_agg(
                                json_build_object(
                                    'exercise_id', ed.exercise_id,
                                    'name', ed.name,
                                    'sets', ed.sets,
                                    'reps', ed.reps,
                                    'description', ed.description,
                                    'equipment', ed.equipment,
                                    'difficulty', ed.difficulty,
                                    'instructions', ed.instructions,
                                    'video_url', ed.video_url,
                                    'muscle_groups', ed.muscle_groups
                                )
                            )
                            FROM exercise_details ed
                            WHERE ed.plan_day_id = wpd.plan_day_id
                        )
                    )
                ) AS workouts
            FROM user_workout_plans uwp
            JOIN workout_plan_days wpd ON uwp.plan_id = wpd.plan_id
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


router.get('/plans/generate', authorization, async (req, res) => {
    const client = await pool.connect();

    try {
        // Extract query parameters
        const { fitnessGoal, activityLevel, primaryFocus } = req.query;
        const userId = req.user.user_id;

        // Validate parameters
        if (!fitnessGoal) {
            return res.status(400).json({
                message: 'Fitness goal is required',
                userProfile: req.query
            });
        }

        // Check for existing plan
        const existingPlanQuery = `
            SELECT plan_id, fitness_goal, activity_level, created_at
            FROM user_workout_plans
            WHERE user_id = $1 AND fitness_goal = $2 AND activity_level = $3
            ORDER BY created_at DESC
            LIMIT 1
        `;
        const existingPlanResult = await client.query(existingPlanQuery, [userId, fitnessGoal, activityLevel]);

        if (existingPlanResult.rows.length > 0) {
            const existingPlan = existingPlanResult.rows[0];
            console.log('Returning existing workout plan:', existingPlan.plan_id);

            // Fetch workouts for the existing plan
            const workoutsQuery = `
                WITH muscle_groups_agg AS (
                    SELECT 
                        e.exercise_id,
                        array_agg(DISTINCT mg.name) AS muscle_groups
                    FROM exercises e
                    JOIN exercise_muscles em ON e.exercise_id = em.exercise_id
                    JOIN muscles m ON em.muscle_id = m.muscle_id
                    JOIN muscle_groups mg ON m.group_id = mg.group_id
                    GROUP BY e.exercise_id
                )
                SELECT wpd.day_of_week, json_agg(
                    json_build_object(
                        'exercise_id', e.exercise_id,
                        'name', e.name,
                        'sets', wpe.sets,
                        'reps', wpe.reps,
                        'description', e.description,
                        'equipment', e.equipment,
                        'difficulty', e.difficulty,
                        'instructions', e.instructions,
                        'video_url', e.video_url,
                        'muscle_groups', mg.muscle_groups
                    )
                ) AS exercises
                FROM workout_plan_days wpd
                JOIN workout_plan_exercises wpe ON wpd.plan_day_id = wpe.plan_day_id
                JOIN exercises e ON wpe.exercise_id = e.exercise_id
                JOIN muscle_groups_agg mg ON e.exercise_id = mg.exercise_id
                WHERE wpd.plan_id = $1
                GROUP BY wpd.day_of_week
            `;
            const workoutsResult = await client.query(workoutsQuery, [existingPlan.plan_id]);

            const workouts = workoutsResult.rows.reduce((acc, row) => {
                acc[row.day_of_week] = row.exercises;
                return acc;
            }, {});

            return res.json({
                workoutPlanId: existingPlan.plan_id,
                workouts,
                planNotes: generatePlanNotes(fitnessGoal, activityLevel, primaryFocus)
            });
        }

        // If no existing plan, generate a new one
        const workoutDaysMap = {
            'sedentary': [
                { day: 'Monday', muscleGroups: ['Upper Body'], specificMuscles: ['Chest', 'Triceps'] },
                { day: 'Tuesday', muscleGroups: ['Rest'], specificMuscles: ['Rest'] },
                { day: 'Wednesday', muscleGroups: ['Rest'], specificMuscles: ['Rest'] },
                { day: 'Thursday', muscleGroups: ['Rest'], specificMuscles: ['Rest'] },
                { day: 'Friday', muscleGroups: ['Rest'], specificMuscles: ['Rest'] },
                { day: 'Saturday', muscleGroups: ['Rest'], specificMuscles: ['Rest'] },
                { day: 'Sunday', muscleGroups: ['Rest'], specificMuscles: ['Rest'] }
            ],
            'lightly_active': [
                { day: 'Monday', muscleGroups: ['Upper Body'], specificMuscles: ['Chest', 'Triceps'] },
                { day: 'Tuesday', muscleGroups: ['Rest'], specificMuscles: ['Rest'] },
                { day: 'Wednesday', muscleGroups: ['Rest'], specificMuscles: ['Rest'] },
                { day: 'Thursday', muscleGroups: ['Lower Body'], specificMuscles: ['Quadriceps', 'Hamstrings'] },
                { day: 'Friday', muscleGroups: ['Rest'], specificMuscles: ['Rest'] },
                { day: 'Saturday', muscleGroups: ['Rest'], specificMuscles: ['Rest'] },
                { day: 'Sunday', muscleGroups: ['Rest'], specificMuscles: ['Rest'] }
            ],
            'moderately_active': [
                { day: 'Monday', muscleGroups: ['Upper Body'], specificMuscles: ['Chest', 'Triceps'] },
                { day: 'Tuesday', muscleGroups: ['Lower Body'], specificMuscles: ['Quadriceps', 'Hamstrings'] },
                { day: 'Wednesday', muscleGroups: ['Rest'], specificMuscles: ['Rest'] },
                { day: 'Thursday', muscleGroups: ['Upper Body'], specificMuscles: ['Back', 'Biceps'] },
                { day: 'Friday', muscleGroups: ['Core'], specificMuscles: ['Abs', 'Obliques'] },
                { day: 'Saturday', muscleGroups: ['Upper Body'], specificMuscles: ['Shoulders'] },
                { day: 'Sunday', muscleGroups: ['Recovery'], specificMuscles: ['Mobility', 'Stretching'] }
            ],
            'very_active': [
                { day: 'Monday', muscleGroups: ['Upper Body'], specificMuscles: ['Chest', 'Triceps'] },
                { day: 'Tuesday', muscleGroups: ['Lower Body'], specificMuscles: ['Quadriceps', 'Hamstrings'] },
                { day: 'Wednesday', muscleGroups: ['Upper Body'], specificMuscles: ['Back', 'Biceps'] },
                { day: 'Thursday', muscleGroups: ['Lower Body'], specificMuscles: ['Calves', 'Glutes'] },
                { day: 'Friday', muscleGroups: ['Core'], specificMuscles: ['Abs', 'Obliques'] },
                { day: 'Saturday', muscleGroups: ['Upper Body'], specificMuscles: ['Shoulders'] },
                { day: 'Sunday', muscleGroups: ['Recovery'], specificMuscles: ['Mobility', 'Stretching'] }
            ],
            'extremely_active': [
                { day: 'Monday', muscleGroups: ['Upper Body'], specificMuscles: ['Chest', 'Triceps'] },
                { day: 'Tuesday', muscleGroups: ['Lower Body'], specificMuscles: ['Quadriceps', 'Hamstrings'] },
                { day: 'Wednesday', muscleGroups: ['Upper Body'], specificMuscles: ['Back', 'Biceps'] },
                { day: 'Thursday', muscleGroups: ['Lower Body'], specificMuscles: ['Calves', 'Glutes'] },
                { day: 'Friday', muscleGroups: ['Core'], specificMuscles: ['Abs', 'Obliques'] },
                { day: 'Saturday', muscleGroups: ['Upper Body'], specificMuscles: ['Shoulders'] },
                { day: 'Sunday', muscleGroups: ['Recovery'], specificMuscles: ['Mobility', 'Stretching'] }
            ]
        };

        const workoutDays = workoutDaysMap[activityLevel] || workoutDaysMap['very_active'];
        const allExercises = [];

        // Insert workout plan
        await client.query('BEGIN');
        const planResult = await client.query(
            `INSERT INTO user_workout_plans 
            (user_id, fitness_goal, activity_level, primary_focus) 
            VALUES ($1, $2, $3, $4) 
            RETURNING plan_id`,
            [userId, fitnessGoal, activityLevel, primaryFocus]
        );
        const planId = planResult.rows[0].plan_id;

        // Process each workout day
        for (let dayInfo of workoutDays) {
            // Special handling for Rest days
            if (dayInfo.muscleGroups.includes('Rest')) {
                // Insert plan day for Rest
                const dayResult = await client.query(
                    `INSERT INTO workout_plan_days 
                    (plan_id, day_of_week, focus) 
                    VALUES ($1, $2, $3) 
                    RETURNING plan_day_id`,
                    [planId, dayInfo.day, 'Rest']
                );
                const planDayId = dayResult.rows[0].plan_day_id;

                // Create a Rest Day entry
                const restExercise = {
                    exercise_id: 0,
                    name: 'Rest Day',
                    difficulty: 'Rest',
                    equipment: 'None',
                    video_url: 'Rest and recovery',
                    muscle_groups: ['Rest'],
                    muscles: ['Rest']
                };

                // Add to allExercises
                allExercises.push({
                    ...restExercise,
                    sets: 0,
                    reps: 0,
                    day: dayInfo.day,
                    description: exercise.description || '',
                    equipment: exercise.equipment || '',
                    difficulty: exercise.difficulty || '',
                    instructions: exercise.instructions || '',
                    video_url: exercise.video_url || ''
                });

                continue; // Skip to next day
            }

            // Special handling for Recovery days
            if (dayInfo.muscleGroups.includes('Recovery')) {
                const recoveryExercises = await client.query(
                    `SELECT 
                        e.exercise_id, 
                        e.name, 
                        e.description,
                        e.difficulty,
                        e.equipment,
                        e.video_url,
                        array_agg(DISTINCT mg.name) AS muscle_groups,
                        array_agg(DISTINCT m.name) AS muscles
                    FROM exercises e
                    JOIN exercise_muscles em ON e.exercise_id = em.exercise_id
                    JOIN muscles m ON em.muscle_id = m.muscle_id
                    JOIN muscle_groups mg ON m.group_id = mg.group_id
                    WHERE mg.name = 'Recovery'
                    GROUP BY 
                        e.exercise_id, 
                        e.name, 
                        e.description, 
                        e.difficulty,
                        e.equipment,
                        e.video_url
                    ORDER BY RANDOM()
                    LIMIT 4`
                );

                // Insert plan day for Recovery
                const dayResult = await client.query(
                    `INSERT INTO workout_plan_days 
                    (plan_id, day_of_week, focus) 
                    VALUES ($1, $2, $3) 
                    RETURNING plan_day_id`,
                    [planId, dayInfo.day, 'Recovery']
                );
                const planDayId = dayResult.rows[0].plan_day_id;

                // Insert recovery exercises
                for (let [index, exercise] of recoveryExercises.rows.entries()) {
                    await client.query(
                        `INSERT INTO workout_plan_exercises 
                        (plan_day_id, exercise_id, sets, reps, order_index) 
                        VALUES ($1, $2, $3, $4, $5)`,
                        [planDayId, exercise.exercise_id, 2, 12, index + 1]
                    );

                    allExercises.push({
                        ...exercise,
                        sets: 2,
                        reps: 12,
                        day: dayInfo.day,
                        description: exercise.description || '',
                        equipment: exercise.equipment || '',
                        difficulty: exercise.difficulty || '',
                        instructions: exercise.instructions || '',
                        video_url: exercise.video_url || ''
                    });
                }

                continue; // Skip to next day
            }

            // Existing logic for workout days
            const exercisesResult = await client.query(
                `WITH exercise_muscles_agg AS (
                    SELECT 
                        e.exercise_id, 
                        array_agg(DISTINCT mg.name) AS muscle_groups,
                        array_agg(DISTINCT m.name) AS muscles
                    FROM exercises e
                    JOIN exercise_muscles em ON e.exercise_id = em.exercise_id
                    JOIN muscles m ON em.muscle_id = m.muscle_id
                    JOIN muscle_groups mg ON m.group_id = mg.group_id
                    GROUP BY e.exercise_id
                )
                SELECT DISTINCT 
                    e.exercise_id, 
                    e.name, 
                    e.difficulty,
                    e.equipment,
                    e.video_url,
                    em.muscle_groups,
                    em.muscles
                FROM exercises e
                JOIN exercise_muscles_agg em ON e.exercise_id = em.exercise_id
                WHERE 
                    (em.muscle_groups && $1 OR em.muscles && $1)
                    AND em.muscles && $2
                    AND (
                        CASE 
                            WHEN $3 = 'weight_loss' THEN e.difficulty IN ('Beginner', 'Intermediate')
                            WHEN $3 = 'muscle_gain' THEN e.difficulty IN ('Intermediate', 'Advanced')
                            ELSE true
                        END
                    )
                    AND (
                        $4 = 'very_active' OR 
                        ($4 IN ('moderately_active', 'lightly_active') AND e.difficulty != 'Advanced')
                    )
                LIMIT 4`,
                [
                    dayInfo.muscleGroups, 
                    dayInfo.specificMuscles, 
                    fitnessGoal, 
                    activityLevel
                ]
            );

            if (activityLevel === 'sedentary') {
                // If no exercises found, create default bodyweight exercises
                if (exercisesResult.rows.length === 0) {
                    exercisesResult.rows = [
                        {
                            exercise_id: 0,
                            name: 'Wall Push-Ups',
                            difficulty: 'Beginner',
                            equipment: 'Bodyweight',
                            video_url: '',
                            muscle_groups: ['Upper Body'],
                            muscles: ['Chest', 'Triceps']
                        },
                        {
                            exercise_id: 1,
                            name: 'Assisted Dips',
                            difficulty: 'Beginner',
                            equipment: 'Bodyweight',
                            video_url: '',
                            muscle_groups: ['Upper Body'],
                            muscles: ['Triceps', 'Chest']
                        }
                    ];
                }
            }

            // Log exercise selection details
            console.log(`Exercises for ${dayInfo.day}:`, {
                muscleGroups: dayInfo.muscleGroups,
                specificMuscles: dayInfo.specificMuscles,
                exerciseCount: exercisesResult.rowCount,
                exercises: exercisesResult.rows
            });

            // Insert plan day
            const dayResult = await client.query(
                `INSERT INTO workout_plan_days 
                (plan_id, day_of_week, focus) 
                VALUES ($1, $2, $3) 
                RETURNING plan_day_id`,
                [planId, dayInfo.day, dayInfo.muscleGroups.join(' and ')]
            );
            const planDayId = dayResult.rows[0].plan_day_id;

            // Insert exercises for this day
            for (let [index, exercise] of exercisesResult.rows.entries()) {
                await client.query(
                    `INSERT INTO workout_plan_exercises 
                    (plan_day_id, exercise_id, sets, reps, order_index) 
                    VALUES ($1, $2, $3, $4, $5)`,
                    [planDayId, exercise.exercise_id, 3, 12, index + 1]
                );

                allExercises.push({
                    ...exercise,
                    sets: 3,
                    reps: 12,
                    day: dayInfo.day,
                    description: exercise.description || '',
                    equipment: exercise.equipment || '',
                    difficulty: exercise.difficulty || '',
                    instructions: exercise.instructions || '',
                    video_url: exercise.video_url || ''
                });
            }
        }

        await client.query('COMMIT');

        // Construct workouts object
        const workouts = workoutDays.reduce((acc, day) => {
            acc[day.day] = allExercises
                .filter(ex => ex.day === day.day)
                .map(ex => ({
                    exercise_id: ex.exercise_id,
                    name: ex.name,
                    sets: ex.sets,
                    reps: ex.reps,
                    difficulty: ex.difficulty,
                    equipment: ex.equipment,
                    muscle_groups: ex.muscle_groups,
                    description: ex.description,
                    instructions: ex.instructions,
                    video_url: ex.video_url
                }));
            return acc;
        }, {});

        // Generate plan notes
        const planNotes = generatePlanNotes(fitnessGoal, activityLevel, primaryFocus);

        // Respond with workout plan
        res.json({ 
            workoutPlanId: planId, 
            workouts,
            planNotes
        });
        
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Full Error Details:', {
            message: error.message,
            stack: error.stack,
            query: req.query
        });

        res.status(500).json({ 
            message: 'Error generating workout plan',
            error: error.message,
            details: process.env.NODE_ENV !== 'production' ? error.stack : undefined
        });
    } finally {
        client.release();
    }
});

router.post('/plans/generate-save', authorization, async (req, res) => {
    const client = await pool.connect();

    try {
        const { 
            workouts, 
            fitnessGoal, 
            activityLevel, 
            planName, 
            primaryFocus 
        } = req.body;

        // Generate a default name if no name provided
        const defaultPlanName = planName || (() => {
            switch(fitnessGoal) {
                case 'muscle_gain': return 'Muscle Gain Plan';
                case 'weight_loss': return 'Weight Loss Plan';
                case 'maintenance': return 'Maintenance Plan';
                case 'endurance': return 'Endurance Plan';
                default: return 'Workout Plan';
            }
        })();

        await client.query('BEGIN');

        // Insert workout plan with guaranteed name
        const planResult = await client.query(
            `INSERT INTO user_workout_plans 
            (user_id, plan_name, fitness_goal, activity_level, primary_focus) 
            VALUES ($1, $2, $3, $4, $5) 
            RETURNING plan_id`,
            [
                req.user.user_id, 
                defaultPlanName, 
                fitnessGoal, 
                activityLevel, 
                primaryFocus || null
            ]
        );
        const planId = planResult.rows[0].plan_id;

        // Process each workout day
        for (const [day, exercises] of Object.entries(workouts)) {
            // Insert plan day
            const dayResult = await client.query(
                `INSERT INTO workout_plan_days 
                (plan_id, day_of_week, focus) 
                VALUES ($1, $2, $3) 
                RETURNING plan_day_id`,
                [planId, day, 'Generated Plan']
            );
            const planDayId = dayResult.rows[0].plan_day_id;

            // Insert exercises for this day
            for (let [index, exercise] of exercises.entries()) {
                // Ensure comprehensive exercise details are saved
                const exerciseDetailsQuery = `
                    SELECT 
                        description, 
                        equipment, 
                        difficulty, 
                        instructions, 
                        video_url 
                    FROM exercises 
                    WHERE exercise_id = $1
                `;
                
                const exerciseDetailsResult = await client.query(
                    exerciseDetailsQuery, 
                    [exercise.exercise_id]
                );
                
                const exerciseDetails = exerciseDetailsResult.rows[0] || {};

                await client.query(
                    `INSERT INTO workout_plan_exercises 
                    (plan_day_id, exercise_id, sets, reps, order_index) 
                    VALUES ($1, $2, $3, $4, $5)`,
                    [
                        planDayId, 
                        exercise.exercise_id, 
                        exercise.sets || 3, 
                        exercise.reps || 12, 
                        index + 1
                    ]
                );

                // Optional: Log exercise details for debugging
                console.log('Saving Exercise Details:', {
                    exerciseId: exercise.exercise_id,
                    name: exercise.name,
                    sets: exercise.sets || 3,
                    reps: exercise.reps || 12,
                    description: exerciseDetails.description,
                    equipment: exerciseDetails.equipment,
                    difficulty: exerciseDetails.difficulty
                });
            }
        }

        await client.query('COMMIT');

        res.status(201).json({ 
            message: 'Workout plan saved successfully', 
            planId: planId,
            planName: defaultPlanName
        });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error saving generated workout plan:', error);
        res.status(500).json({ 
            message: 'Failed to save generated workout plan',
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