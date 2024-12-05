const router = require('express').Router();
const pool = require('../db');
const authorization = require('../middleware/authorization');

// Get all muscle groups
router.get('/muscle-groups', authorization, async (req, res) => {
    try {
        const muscleGroups = await pool.query('SELECT * FROM muscle_groups ORDER BY name');
        res.json(muscleGroups.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get muscles by group
router.get('/muscles/:groupId', authorization, async (req, res) => {
    try {
        const muscles = await pool.query(
            'SELECT * FROM muscles WHERE group_id = $1 ORDER BY name',
            [req.params.groupId]
        );
        res.json(muscles.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get exercises by muscle
router.get('/by-muscle/:muscleId', authorization, async (req, res) => {
    try {
        console.log('Fetching exercises for muscle:', req.params.muscleId);
        const exercises = await pool.query(`
            SELECT e.* 
            FROM exercises e
            JOIN exercise_muscles em ON e.exercise_id = em.exercise_id
            WHERE em.muscle_id = $1
        `, [req.params.muscleId]);
        
        console.log('Found exercises:', exercises.rows);
        res.json(exercises.rows);
    } catch (err) {
        console.error('Error fetching exercises:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

router.get('/', authorization, async (req, res) => {
    try {
        const { muscle_group, difficulty } = req.query;

        let query = `
            SELECT 
                e.exercise_id, 
                e.name, 
                e.difficulty, 
                e.equipment,
                (
                    SELECT json_agg(DISTINCT mg.name)
                    FROM exercise_muscles em
                    JOIN muscles m ON em.muscle_id = m.muscle_id
                    JOIN muscle_groups mg ON m.group_id = mg.group_id
                    WHERE em.exercise_id = e.exercise_id
                ) as muscle_groups
            FROM exercises e
        `;

        const queryParams = [];
        const whereClauses = [];

        if (muscle_group) {
            whereClauses.push(`
                EXISTS (
                    SELECT 1 
                    FROM exercise_muscles em
                    JOIN muscles m ON em.muscle_id = m.muscle_id
                    JOIN muscle_groups mg ON m.group_id = mg.group_id
                    WHERE em.exercise_id = e.exercise_id AND mg.name = $${queryParams.length + 1}
                )
            `);
            queryParams.push(muscle_group);
        }

        if (difficulty) {
            whereClauses.push(`e.difficulty = $${queryParams.length + 1}`);
            queryParams.push(difficulty);
        }

        if (whereClauses.length > 0) {
            query += ' WHERE ' + whereClauses.join(' AND ');
        }

        console.log('Executing query:', query);
        console.log('Query params:', queryParams);

        const { rows } = await pool.query(query, queryParams);

        console.log('Fetched exercises:', rows);
        res.json(rows);
    } catch (err) {
        console.error('Error fetching all exercises:', err);
        res.status(500).json({ 
            message: 'Server error fetching exercises',
            error: err.message 
        });
    }
});

module.exports = router;
