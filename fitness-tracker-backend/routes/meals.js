const router = require('express').Router();
const pool = require('../db');
const authorization = require('../middleware/authorization');

// Get meals by date
router.get('/date/:date', authorization, async (req, res) => {
  try {
    const { date } = req.params;
    const { rows } = await pool.query(
      'SELECT * FROM meals WHERE user_id = $1 AND date = $2 ORDER BY created_at',
      [req.user.id, date]
    );
    res.json(rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Add meal
router.post('/', authorization, async (req, res) => {
  try {
    const { name, calories, protein, carbs, fats, date, serving } = req.body;
    const { rows } = await pool.query(
      'INSERT INTO meals (user_id, name, calories, protein, carbs, fats, date, serving) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
      [req.user.id, name, calories, protein, carbs, fats, date, serving]
    );
    res.json(rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Delete meal
router.delete('/:id', authorization, async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query(
      'DELETE FROM meals WHERE meal_id = $1 AND user_id = $2',
      [id, req.user.id]
    );
    res.json({ message: 'Meal deleted' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Get meals summary
router.get('/summary', authorization, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const { rows } = await pool.query(
      `SELECT date, 
        SUM(calories) as total_calories,
        SUM(protein) as total_protein,
        SUM(carbs) as total_carbs,
        SUM(fats) as total_fats
       FROM meals 
       WHERE user_id = $1 
       AND date BETWEEN $2 AND $3
       GROUP BY date
       ORDER BY date DESC`,
      [req.user.id, startDate, endDate]
    );
    res.json(rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
