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
             SET first_name = COALESCE($1, first_name),
                 last_name = COALESCE($2, last_name),
                 date_of_birth = COALESCE($3, date_of_birth),
                 gender = COALESCE($4, gender),
                 height = COALESCE($5, height),
                 current_weight = COALESCE($6, current_weight),
                 fitness_goal = COALESCE($7, fitness_goal),
                 activity_level = COALESCE($8, activity_level),
                 updated_at = CURRENT_TIMESTAMP
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
