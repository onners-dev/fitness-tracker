// backend/services/workoutPlanGenerator.js
const pool = require('../db');

class WorkoutPlanGenerator {
    constructor() {
        // Comprehensive workout day configurations
        this.workoutDaysMap = {
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
    }

    generatePlanNotes(fitnessGoal, activityLevel, primaryFocus) {
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
            'very_active': 'Continue pushing your limits with varied and intense workouts.',
            'extremely_active': 'Optimize your training with high-intensity and diverse exercises.'
        };

        const focusNotes = {
            'strength': 'Emphasize compound movements and progressive overload.',
            'cardio': 'Incorporate varied cardiovascular exercises.',
            'flexibility': 'Include dynamic stretching and mobility work.',
            'weight_management': 'Balance strength training with cardiovascular exercises.',
            'overall_wellness': 'Maintain a holistic approach to fitness and health.',
            '': 'Develop a well-rounded fitness approach.'
        };

        const goalNote = goalNotes[fitnessGoal] || 'Pursue your fitness goals consistently.';
        const activityNote = activityNotes[activityLevel] || 'Listen to your body and progress gradually.';
        const focusNote = focusNotes[primaryFocus] || 'Maintain a balanced fitness routine.';

        return `${goalNote} ${activityNote} ${focusNote} Always listen to your body and adjust the plan as needed.`;
    }

    async handleRestAndRecoveryDays(client, planId, dayInfo) {
        if (dayInfo.muscleGroups.includes('Rest')) {
            await client.query(
                `INSERT INTO workout_plan_days 
                (plan_id, day_of_week, focus) 
                VALUES ($1, $2, $3)`,
                [planId, dayInfo.day, 'Rest']
            );
            return [];
        }

        if (dayInfo.muscleGroups.includes('Recovery')) {
            const recoveryExercises = await client.query(
                `SELECT 
                    e.exercise_id, 
                    e.name, 
                    e.description,
                    e.difficulty,
                    COALESCE(
                        (
                            SELECT array_agg(eq.name)
                            FROM exercise_equipment ee
                            JOIN equipment eq ON ee.equipment_id = eq.equipment_id
                            WHERE ee.exercise_id = e.exercise_id
                        ), ARRAY[]::text[]
                    ) AS equipment_options,
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
                    e.video_url
                ORDER BY RANDOM()
                LIMIT 4`
            );

            const dayResult = await client.query(
                `INSERT INTO workout_plan_days 
                (plan_id, day_of_week, focus) 
                VALUES ($1, $2, $3) 
                RETURNING plan_day_id`,
                [planId, dayInfo.day, 'Recovery']
            );
            const planDayId = dayResult.rows[0].plan_day_id;

            const recoveryWorkouts = [];

            for (let [index, exercise] of recoveryExercises.rows.entries()) {
                await client.query(
                    `INSERT INTO workout_plan_exercises 
                    (plan_day_id, exercise_id, sets, reps, order_index) 
                    VALUES ($1, $2, $3, $4, $5)`,
                    [planDayId, exercise.exercise_id, 2, 12, index + 1]
                );

                recoveryWorkouts.push({
                    ...exercise,
                    sets: 2,
                    reps: 12,
                    day: dayInfo.day
                });
            }

            return recoveryWorkouts;
        }

        return [];
    }

    async selectExercisesForDay(client, dayInfo, fitnessGoal, activityLevel) {
        const query = `
            WITH exercise_muscles_agg AS (
                SELECT 
                    e.exercise_id, 
                    e.name,
                    e.description,
                    e.difficulty,
                    COALESCE(
                        (
                            SELECT array_agg(eq.name)
                            FROM exercise_equipment ee
                            JOIN equipment eq ON ee.equipment_id = eq.equipment_id
                            WHERE ee.exercise_id = e.exercise_id
                        ), ARRAY[]::text[]
                    ) AS equipment_options,
                    e.video_url,
                    array_agg(DISTINCT mg.name) AS muscle_groups,
                    array_agg(DISTINCT m.name) AS muscles
                FROM exercises e
                JOIN exercise_muscles em ON e.exercise_id = em.exercise_id
                JOIN muscles m ON em.muscle_id = m.muscle_id
                JOIN muscle_groups mg ON m.group_id = mg.group_id
                GROUP BY 
                    e.exercise_id, 
                    e.name,
                    e.description,
                    e.difficulty,
                    e.video_url
            )
            SELECT DISTINCT 
                ea.exercise_id, 
                ea.name, 
                ea.difficulty,
                ea.equipment_options,
                ea.video_url,
                ea.muscle_groups,
                ea.muscles
            FROM exercise_muscles_agg ea
            WHERE 
                (ea.muscle_groups && $1 OR ea.muscles && $1)
                AND ea.muscles && $2
                AND (
                    CASE 
                        WHEN $3 = 'weight_loss' THEN ea.difficulty IN ('Beginner', 'Intermediate')
                        WHEN $3 = 'muscle_gain' THEN ea.difficulty IN ('Intermediate', 'Advanced')
                        ELSE true
                    END
                )
                AND (
                    $4 = 'very_active' OR 
                    ($4 IN ('moderately_active', 'lightly_active') AND ea.difficulty != 'Advanced')
                )
            LIMIT 4
        `;

        const result = await client.query(query, [
            dayInfo.muscleGroups, 
            dayInfo.specificMuscles, 
            fitnessGoal, 
            activityLevel
        ]);

        if (activityLevel === 'sedentary' && result.rows.length === 0) {
            return [
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

        return result.rows;
    }

    determineExerciseDifficulty(fitnessGoal, activityLevel) {
        const difficultyMap = {
            'weight_loss': {
                'sedentary': 'Beginner',
                'lightly_active': 'Beginner',
                'moderately_active': 'Intermediate',
                'very_active': 'Intermediate',
                'extremely_active': 'Advanced'
            },
            'muscle_gain': {
                'sedentary': 'Beginner',
                'lightly_active': 'Intermediate',
                'moderately_active': 'Intermediate',
                'very_active': 'Advanced',
                'extremely_active': 'Advanced'
            }
        };

        return difficultyMap[fitnessGoal]?.[activityLevel] || 'Intermediate';
    }

    async generatePlan(client, userId, options) {
        const { 
            fitnessGoal, 
            activityLevel, 
            primaryFocus, 
            planName,
            planId
        } = options;

        console.log('Generating plan with options:', {
            userId,
            planId,
            fitnessGoal,
            activityLevel
        });

        const workoutDays = this.workoutDaysMap[activityLevel] || this.workoutDaysMap['moderately_active'];
        const allExercises = [];

        // Verify the plan exists
        const planCheck = await client.query(
            'SELECT plan_id FROM user_workout_plans WHERE plan_id = $1',
            [planId]
        );

        if (!planCheck.rows.length) {
            throw new Error(`Plan with ID ${planId} not found`);
        }

        console.log('Plan verified, generating workout days for plan:', planId);

        // Process each workout day
        for (let dayInfo of workoutDays) {
            console.log('Processing day:', dayInfo.day);

            // Handle Rest and Recovery days
            const specialDayExercises = await this.handleRestAndRecoveryDays(client, planId, dayInfo);
            
            if (specialDayExercises.length > 0) {
                allExercises.push(...specialDayExercises);
                continue;
            }

            // Regular workout day processing
            const exercisesResult = await this.selectExercisesForDay(
                client, 
                dayInfo, 
                fitnessGoal, 
                activityLevel
            );

            // Insert plan day and exercises
            const dayResult = await client.query(
                `INSERT INTO workout_plan_days 
                (plan_id, day_of_week, focus) 
                VALUES ($1, $2, $3) 
                RETURNING plan_day_id`,
                [planId, dayInfo.day, dayInfo.muscleGroups.join(' and ')]
            );
            const planDayId = dayResult.rows[0].plan_day_id;

            console.log('Created workout day:', {
                planId,
                dayOfWeek: dayInfo.day,
                planDayId,
                exerciseCount: exercisesResult.length
            });

            // Insert exercises for this day
            for (let [index, exercise] of exercisesResult.entries()) {
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
                    day: dayInfo.day
                });
            }
        }

        // Verify workout days were created
        const daysVerification = await client.query(
            `SELECT COUNT(*) as day_count 
             FROM workout_plan_days 
             WHERE plan_id = $1`,
            [planId]
        );

        console.log('Workout days verification:', {
            planId,
            dayCount: daysVerification.rows[0].day_count,
            expectedDays: workoutDays.length
        });

        if (daysVerification.rows[0].day_count === 0) {
            throw new Error('Failed to create workout days');
        }

        // Generate workouts object with detailed exercise information
        const workouts = workoutDays.reduce((acc, day) => {
            acc[day.day] = allExercises
                .filter(ex => ex.day === day.day)
                .map(ex => ({
                    exercise_id: ex.exercise_id,
                    name: ex.name,
                    sets: ex.sets,
                    reps: ex.reps,
                    difficulty: ex.difficulty,
                    equipment_options: ex.equipment_options || [],
                    muscle_groups: ex.muscle_groups
                }));
            return acc;
        }, {});

        // Generate comprehensive plan notes
        const planNotes = this.generatePlanNotes(fitnessGoal, activityLevel, primaryFocus);

        return { 
            workoutPlanId: planId, 
            workouts,
            planName,
            planNotes
        };
    }
}

module.exports = new WorkoutPlanGenerator();
