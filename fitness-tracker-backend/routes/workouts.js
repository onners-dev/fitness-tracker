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

        const result = await client.query(query, [req.user.id, start, end]);

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


router.get('/exercises/details', authorization, async (req, res) => {
    const client = await pool.connect();

    try {
        // Parse exercise IDs from query string
        const exerciseIds = req.query.exerciseIds.split(',').map(id => parseInt(id));

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

        // If no exercises found, return appropriate response
        if (result.rows.length === 0) {
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
        console.log('User ID:', req.user.id);

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
                req.user.id, 
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
                    wpe.sets,
                    wpe.reps,
                    array_agg(DISTINCT mg.name) AS muscle_groups
                FROM workout_plan_exercises wpe
                JOIN exercises e ON wpe.exercise_id = e.exercise_id
                JOIN exercise_muscles em ON e.exercise_id = em.exercise_id
                JOIN muscles m ON em.muscle_id = m.muscle_id
                JOIN muscle_groups mg ON m.group_id = mg.group_id
                GROUP BY wpe.plan_day_id, e.exercise_id, e.name, wpe.sets, wpe.reps
            )
            SELECT 
                uwp.plan_id,
                uwp.fitness_goal,
                uwp.activity_level,
                uwp.created_at,
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
                            'muscle_groups', muscle_groups
                        )
                    ) AS exercises
                FROM exercise_details
                GROUP BY plan_day_id
            ) ed ON wpd.plan_day_id = ed.plan_day_id
            WHERE uwp.user_id = $1
            GROUP BY uwp.plan_id, uwp.fitness_goal, uwp.activity_level, uwp.created_at
            ORDER BY uwp.created_at DESC
            LIMIT 5
        `;

        const result = await client.query(query, [req.user.id]);

        const plans = result.rows.map(plan => ({
            plan_id: plan.plan_id,
            fitnessGoal: plan.fitness_goal,
            activityLevel: plan.activity_level,
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
        // Debug logging
        console.log('Query Parameters:', req.query);

        const { 
            fitnessGoal = '', 
            activityLevel = '', 
            primaryFocus = '' 
        } = req.query;

        // Additional logging
        console.log('Extracted Parameters:', {
            fitnessGoal,
            activityLevel,
            primaryFocus
        });

        const userId = req.user.id;

        // Validate parameters
        if (!fitnessGoal) {
            return res.status(400).json({
                message: 'Fitness goal is required',
                userProfile: req.query
            });
        }

        // Dynamic workout days based on activity level
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
        

        // Default to very_active if activity level is not recognized
        const workoutDays = workoutDaysMap[activityLevel] || workoutDaysMap['very_active'];

        // Prepare to store all exercises
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
                    day: dayInfo.day
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
                    const exerciseInsertResult = await client.query(
                        `INSERT INTO workout_plan_exercises 
                        (plan_day_id, exercise_id, sets, reps, order_index) 
                        VALUES ($1, $2, $3, $4, $5)
                        RETURNING plan_exercise_id`,
                        [planDayId, exercise.exercise_id, 2, 12, index + 1]
                    );

                    // Add to allExercises
                    allExercises.push({
                        ...exercise,
                        sets: 2,
                        reps: 12,
                        day: dayInfo.day
                    });
                }

                continue; // Skip to next day
            }

            // Existing logic for workout days
            const exercisesResult = await client.query(
                `WITH detailed_exercises AS (
                    ${activityLevel === 'sedentary' ? `
                        SELECT DISTINCT 
                            e.exercise_id, 
                            e.name, 
                            e.difficulty,
                            e.equipment,
                            e.video_url,
                            array_agg(DISTINCT mg.name) AS muscle_groups,
                            array_agg(DISTINCT m.name) AS muscles
                        FROM exercises e
                        JOIN exercise_muscles em ON e.exercise_id = em.exercise_id
                        JOIN muscles m ON em.muscle_id = m.muscle_id
                        JOIN muscle_groups mg ON m.group_id = mg.group_id
                        WHERE 
                            e.difficulty = 'Beginner'
                            AND e.equipment = 'Bodyweight'
                            AND mg.name = 'Upper Body'
                        GROUP BY 
                            e.exercise_id, 
                            e.name, 
                            e.difficulty,
                            e.equipment,
                            e.video_url
                        LIMIT 4
                    ` : `
                    SELECT DISTINCT 
                        e.exercise_id, 
                        e.name, 
                        e.difficulty,
                        e.equipment,
                        e.video_url,
                        array_agg(DISTINCT mg.name) AS muscle_groups,
                        array_agg(DISTINCT m.name) AS muscles
                    FROM exercises e
                    JOIN exercise_muscles em ON e.exercise_id = em.exercise_id
                    JOIN muscles m ON em.muscle_id = m.muscle_id
                    JOIN muscle_groups mg ON m.group_id = mg.group_id
                    WHERE 
                        (
                            mg.name = ANY($1) OR 
                            m.name = ANY($1)
                        )
                        AND m.name = ANY($2)
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
                    GROUP BY 
                        e.exercise_id, 
                        e.name, 
                        e.difficulty,
                        e.equipment,
                        e.video_url
                    LIMIT 4
                    `}
                )
                SELECT * FROM detailed_exercises`,
                activityLevel === 'sedentary' 
                    ? [] 
                    : [
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
                const exerciseInsertResult = await client.query(
                    `INSERT INTO workout_plan_exercises 
                    (plan_day_id, exercise_id, sets, reps, order_index) 
                    VALUES ($1, $2, $3, $4, $5)
                    RETURNING plan_exercise_id`,
                    [planDayId, exercise.exercise_id, 3, 12, index + 1]
                );

                // Add full exercise details to allExercises
                allExercises.push({
                    ...exercise,
                    sets: 3,
                    reps: 12,
                    day: dayInfo.day
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
                    muscles: ex.muscles,
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
        // Rollback transaction in case of error
        await client.query('ROLLBACK');

        // More detailed error logging
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


module.exports = router;