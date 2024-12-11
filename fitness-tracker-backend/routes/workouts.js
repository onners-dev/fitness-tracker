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


router.get('/plans/generate', authorization, async (req, res) => {
    const client = await pool.connect();

    try {
        const { 
            fitnessGoal = '', 
            activityLevel = '', 
            primaryFocus = '' 
        } = req.query;
        const userId = req.user.id;

        // Dynamic workout days based on activity level
        const workoutDaysMap = {
            'sedentary': [
                { day: 'Monday', muscleGroups: ['Upper Body'], specificMuscles: ['Chest', 'Triceps'] }
            ],
            'lightly_active': [
                { day: 'Monday', muscleGroups: ['Upper Body'], specificMuscles: ['Chest', 'Triceps'] },
                { day: 'Thursday', muscleGroups: ['Lower Body'], specificMuscles: ['Quadriceps', 'Hamstrings'] }
            ],
            'moderately_active': [
                { day: 'Monday', muscleGroups: ['Upper Body'], specificMuscles: ['Chest', 'Triceps'] },
                { day: 'Tuesday', muscleGroups: ['Lower Body'], specificMuscles: ['Quadriceps', 'Hamstrings'] },
                { day: 'Thursday', muscleGroups: ['Upper Body'], specificMuscles: ['Back', 'Biceps'] }
            ],
            'very_active': [
                { day: 'Monday', muscleGroups: ['Upper Body'], specificMuscles: ['Chest', 'Triceps'] },
                { day: 'Tuesday', muscleGroups: ['Lower Body'], specificMuscles: ['Quadriceps', 'Hamstrings'] },
                { day: 'Wednesday', muscleGroups: ['Upper Body'], specificMuscles: ['Back', 'Biceps'] },
                { day: 'Thursday', muscleGroups: ['Lower Body'], specificMuscles: ['Calves', 'Glutes'] },
                { day: 'Friday', muscleGroups: ['Core'], specificMuscles: ['Abs', 'Lower Back'] },
                { day: 'Saturday', muscleGroups: ['Full Body'], specificMuscles: ['Total Body'] }
            ],
            'extremely_active': [
                { day: 'Monday', muscleGroups: ['Upper Body'], specificMuscles: ['Chest', 'Triceps'] },
                { day: 'Tuesday', muscleGroups: ['Lower Body'], specificMuscles: ['Quadriceps', 'Hamstrings'] },
                { day: 'Wednesday', muscleGroups: ['Upper Body'], specificMuscles: ['Back', 'Biceps'] },
                { day: 'Thursday', muscleGroups: ['Lower Body'], specificMuscles: ['Calves', 'Glutes'] },
                { day: 'Friday', muscleGroups: ['Core'], specificMuscles: ['Abs', 'Lower Back'] },
                { day: 'Saturday', muscleGroups: ['Full Body'], specificMuscles: ['Total Body'] },
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
            // Fetch exercises for the day (similar to previous implementation)
            const exercisesResult = await client.query(
                `WITH detailed_exercises AS (
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
                )
                SELECT * FROM detailed_exercises
                LIMIT 4`,
                [
                    dayInfo.muscleGroups, 
                    dayInfo.specificMuscles, 
                    fitnessGoal, 
                    activityLevel
                ]
            );

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

        // Detailed error logging
        console.error('Workout Plan Generation Error:', {
            message: error.message,
            stack: error.stack,
            input: { fitnessGoal, activityLevel, primaryFocus }
        });

        // Conditional error response based on environment
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