const router = require('express').Router();
const pool = require('../db');
const authorization = require('../middleware/authorization');

// Add to favorites

router.post('/add', authorization, async (req, res) => {
    try {
        const { exerciseId } = req.body;
        const userId = req.user.id;  // Change from userId to id

        await pool.query(
            'INSERT INTO user_favorites (user_id, exercise_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
            [userId, exerciseId]
        );

        res.json({ message: 'Exercise added to favorites' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

router.delete('/remove', authorization, async (req, res) => {
    try {
        const { exerciseId } = req.body;
        const userId = req.user.id;  // Change from userId to id

        await pool.query(
            'DELETE FROM user_favorites WHERE user_id = $1 AND exercise_id = $2',
            [userId, exerciseId]
        );

        res.json({ message: 'Exercise removed from favorites' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

router.get('/', authorization, async (req, res) => {
    try {
        const userId = req.user.id;  // Change from userId to id
        const favorites = await pool.query(
            'SELECT e.* FROM exercises e JOIN user_favorites uf ON e.exercise_id = uf.exercise_id WHERE uf.user_id = $1',
            [userId]
        );

        res.json(favorites.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});


module.exports = router;
