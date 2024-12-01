const router = require('express').Router();
const pool = require('../db');
const authorization = require('../middleware/authorization');

// Get user profile
router.get('/profile', authorization, async (req, res) => {
    try {
        const profile = await pool.query(
            'SELECT up.* FROM user_profiles up WHERE up.user_id = $1',
            [req.user.userId]
        );

        res.json(profile.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Update user profile
router.put('/profile', authorization, async (req, res) => {
    try {
        const { 
            first_name, 
            last_name, 
            date_of_birth, 
            gender,
            height,
            current_weight,
            fitness_goal,
            activity_level
        } = req.body;

        const updatedProfile = await pool.query(
            `UPDATE user_profiles 
             SET first_name = $1, 
                 last_name = $2, 
                 date_of_birth = $3, 
                 gender = $4,
                 height = $5,
                 current_weight = $6,
                 fitness_goal = $7,
                 activity_level = $8
             WHERE user_id = $9
             RETURNING *`,
            [first_name, last_name, date_of_birth, gender, height, 
             current_weight, fitness_goal, activity_level, req.user.userId]
        );

        res.json(updatedProfile.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
