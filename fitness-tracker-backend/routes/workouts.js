const router = require('express').Router();
const pool = require('../db');
const authorization = require('../middleware/authorization');

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

// Get workouts with exercise details
router.get('/', authorization, async (req, res) => {
    try {
        const { startDate, endDate } = req.query;

        const query = `
            SELECT 
                uw.workout_id, 
                uw.workout_type,
                uw.workout_name, 
                uw.date, 
                uw.total_duration, 
                uw.total_calories_burned,
                uw.notes,
                json_agg(
                    json_build_object(
                        'exercise_id', e.exercise_id,
                        'exercise_name', e.name,
                        'sets', uwe.sets,
                        'reps', uwe.reps,
                        'weight', uwe.weight,
                        'exercise_notes', uwe.notes,
                        'muscle_groups', (
                            SELECT json_agg(DISTINCT mg.name)
                            FROM exercise_muscles em
                            JOIN muscles m ON em.muscle_id = m.muscle_id
                            JOIN muscle_groups mg ON m.group_id = mg.group_id
                            WHERE em.exercise_id = e.exercise_id
                        )
                    )
                ) as exercises
            FROM user_workouts uw
            LEFT JOIN user_workout_exercises uwe ON uw.workout_id = uwe.workout_id
            LEFT JOIN exercises e ON uwe.exercise_id = e.exercise_id
            WHERE uw.user_id = $1 
            AND uw.date BETWEEN $2 AND $3
            GROUP BY uw.workout_id
            ORDER BY uw.date DESC
        `;

        const { rows } = await pool.query(query, [
            req.user.id, 
            startDate || '1900-01-01', 
            endDate || '2100-12-31'
        ]);

        res.json(rows);
    } catch (err) {
        console.error('Error fetching workouts:', err);
        res.status(500).json({ 
            message: 'Error fetching workouts', 
            error: err.message 
        });
    }
});

module.exports = router;
