const router = require('express').Router();
const pool = require('../db');
const authorization = require('../middleware/authorization');

// Get nutrition trends
router.get('/nutrition', authorization, async (req, res) => {
    try {
        const { days = 30 } = req.query;
        const userId = req.user.user_id;

        const { rows } = await pool.query(`
            SELECT 
                date, 
                SUM(calories) as total_calories,
                SUM(protein) as total_protein,
                SUM(carbs) as total_carbs,
                SUM(fats) as total_fats
            FROM meals
            WHERE user_id = $1 AND date >= NOW() - INTERVAL '${days} days'
            GROUP BY date
            ORDER BY date
        `, [userId]);

        res.json(rows || []);
    } catch (err) {
        console.error('Nutrition trends error:', err);
        res.status(500).json({ message: 'Server error fetching nutrition trends', error: err.message });
    }
});

// Get workout trends
router.get('/workouts', authorization, async (req, res) => {
    try {
        const { days = 30 } = req.query;
        const userId = req.user.user_id;

        const { rows } = await pool.query(`
            SELECT 
                date, 
                COUNT(*) as total_workout_count,
                COALESCE(SUM(total_calories_burned), 0) as total_calories_burned
            FROM user_workouts
            WHERE user_id = $1 
            AND date >= NOW() - INTERVAL '${days} days'
            GROUP BY date
            ORDER BY date
        `, [userId]);

        console.log('Workout trends query results:', rows);

        res.json(rows || []);
    } catch (err) {
        console.error('Workout trends error:', err);
        res.status(500).json({ 
            message: 'Server error fetching workout trends', 
            error: err.message 
        });
    }
});



module.exports = router;
