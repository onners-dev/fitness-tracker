const router = require('express').Router();
const pool = require('../db');
const authorization = require('../middleware/authorization');

// Get user's contributions
router.get('/my-contributions', authorization, async (req, res) => {
    try {
        console.log('Received my-contributions request');
        console.log('User ID:', req.user.id);
        
        const { rows } = await pool.query(
            'SELECT * FROM user_contributed_foods WHERE user_id = $1 ORDER BY created_at DESC',
            [req.user.id]
        );

        console.log('Found contributions:', rows);
        res.json(rows);
    } catch (err) {
        console.error('Error fetching user contributions:', err);
        res.status(500).json({ 
            message: 'Server error fetching contributions',
            error: err.message 
        });
    }
});

// Contribute a new food
router.post('/contribute', authorization, async (req, res) => {
    try {
        console.log('Received contribute request');
        console.log('User ID:', req.user.id);
        console.log('Request body:', req.body);

        const { 
            name, 
            calories, 
            protein, 
            carbs, 
            fats, 
            serving_size, 
            brand 
        } = req.body;

        // Validate required fields
        if (!name || !calories) {
            return res.status(400).json({ 
                message: 'Name and calories are required' 
            });
        }

        const { rows } = await pool.query(
            `INSERT INTO user_contributed_foods 
            (user_id, name, calories, protein, carbs, fats, serving_size, brand, approval_status) 
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) 
            RETURNING *`,
            [
                req.user.id, 
                name, 
                calories, 
                protein || null, 
                carbs || null, 
                fats || null, 
                serving_size || '100g',
                brand || null,
                'pending'
            ]
        );

        console.log('Contributed food:', rows[0]);
        res.status(201).json(rows[0]);
    } catch (err) {
        console.error('Error contributing food:', err);
        res.status(500).json({ 
            message: 'Server error while contributing food',
            error: err.message 
        });
    }
});

module.exports = router;
