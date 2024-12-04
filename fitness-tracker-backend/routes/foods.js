// routes/foods.js
const router = require('express').Router();
const pool = require('../db');
const authorization = require('../middleware/authorization');

// Add user-contributed food
router.post('/contribute', authorization, async (req, res) => {
    try {
        const { 
            name, 
            calories, 
            protein, 
            carbs, 
            fats, 
            serving_size, 
            brand,
            barcode,
            category 
        } = req.body;

        const { rows } = await pool.query(
            `INSERT INTO user_contributed_foods 
            (user_id, name, calories, protein, carbs, fats, serving_size, brand, barcode, category) 
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) 
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
                barcode || null,
                category || null
            ]
        );

        res.status(201).json(rows[0]);
    } catch (err) {
        console.error('Error contributing food:', err);
        res.status(500).json({ message: 'Server error while contributing food' });
    }
});

// Get user's contributed foods
router.get('/my-contributions', authorization, async (req, res) => {
    try {
        const { rows } = await pool.query(
            'SELECT * FROM user_contributed_foods WHERE user_id = $1 ORDER BY created_at DESC',
            [req.user.id]
        );
        res.json(rows);
    } catch (err) {
        console.error('Error fetching user contributions:', err);
        res.status(500).json({ message: 'Server error fetching contributions' });
    }
});

// Search user-contributed foods
router.get('/search', authorization, async (req, res) => {
    try {
        const { query } = req.query;
        const { rows } = await pool.query(
            `SELECT * FROM user_contributed_foods 
             WHERE (name ILIKE $1 OR brand ILIKE $1) 
             AND approval_status = 'approved'
             LIMIT 50`,
            [`%${query}%`]
        );
        res.json(rows);
    } catch (err) {
        console.error('Error searching contributed foods:', err);
        res.status(500).json({ message: 'Server error searching foods' });
    }
});

module.exports = router;
