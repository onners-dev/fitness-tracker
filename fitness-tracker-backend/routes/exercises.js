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

module.exports = router;
