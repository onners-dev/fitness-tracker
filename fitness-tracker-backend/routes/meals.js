const express = require('express');
const router = express.Router();
const pool = require('../db');
const authorization = require('../middleware/authorization');

// Debugging route to verify router is working
router.get('/test', (req, res) => {
    console.log('Meals router test route hit');
    res.json({ message: 'Meals router is working' });
});

// Add meal
router.post('/', authorization, async (req, res) => {
    try {
        const { name, calories, protein, carbs, fats, date, serving } = req.body;
        
        console.log('Request body:', req.body);
        console.log('User from request:', req.user);
        console.log('User ID being used:', req.user.user_id);
        
        const { rows } = await pool.query(
            `INSERT INTO meals (user_id, name, calories, protein, carbs, fats, date, serving) 
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
             RETURNING *`,
            [req.user.user_id, name, calories, protein, carbs, fats, date, serving]
        );

        console.log('Inserted meal:', rows[0]);
        res.json(rows[0]);
    } catch (err) {
        console.error('Error in meals POST:', err);
        console.error('Error details:', err.message);
        res.status(500).json({ 
            message: 'Server error',
            error: err.message,
            stack: err.stack 
        });
    }
});

// Delete meal
router.delete('/:id', authorization, async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query(
      'DELETE FROM meals WHERE meal_id = $1 AND user_id = $2',
      [id, req.user.user_id]
    );
    res.json({ message: 'Meal deleted' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Get meals summary
router.get('/date/:date', authorization, async (req, res) => {
    try {
      const { date } = req.params;
      console.log('Received date request:', {
        date,
        userId: req.user.user_id,
        fullRequestPath: req.path,
        fullRequestUrl: req.url
      });
  
      const { rows } = await pool.query(
        'SELECT * FROM meals WHERE user_id = $1 AND date = $2 ORDER BY created_at',
        [req.user.user_id, date]
      );
  
      console.log('Query results:', {
        rowCount: rows.length,
        rows
      });
  
      res.json(rows);
    } catch (err) {
      console.error('Meals date fetch error:', {
        message: err.message,
        stack: err.stack
      });
      res.status(500).json({ 
        message: 'Server error fetching meals',
        error: err.message 
      });
    }
  });

// Error handling middleware specific to meals routes
router.use((err, req, res, next) => {
    console.error('Unhandled error in meals routes:', err);
    res.status(500).json({
        message: 'Unhandled error in meals routes',
        error: err.message,
        stack: err.stack
    });
});

module.exports = router;
