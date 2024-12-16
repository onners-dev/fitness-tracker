const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../db');

console.log('JWT_SECRET:', process.env.JWT_SECRET); 

// Register new user
router.post('/register', async (req, res) => {
  try {
      const { 
          firstName, 
          lastName, 
          gender, 
          dateOfBirth, 
          email, 
          password 
      } = req.body;

       // Ensure all fields are provided
      if (!firstName || !lastName || !email || !password || !dateOfBirth || !gender) {
        return res.status(400).json({ message: 'All fields are required' });
      }

      // Check if user exists
      const userExists = await pool.query(
          'SELECT * FROM users WHERE email = $1',
          [email]
      );

      if (userExists.rows.length > 0) {
          return res.status(400).json({ message: 'User already exists' });
      }

      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Create user - Using transaction to ensure both user and profile are created
      const client = await pool.connect();
      
      try {
          await client.query('BEGIN');

          // Insert into users table
          const newUser = await client.query(
              'INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING user_id',
              [email, hashedPassword]
          );

          // Insert into user_profiles table
          await client.query(
              `INSERT INTO user_profiles (
                  user_id, 
                  first_name, 
                  last_name, 
                  date_of_birth, 
                  gender
              ) VALUES ($1, $2, $3, $4, $5)`,
              [
                  newUser.rows[0].user_id,
                  firstName,
                  lastName,
                  dateOfBirth,
                  gender
              ]
          );

          await client.query('COMMIT');

          // Create token for automatic login
          const token = jwt.sign(
            { user_id: newUser.rows[0].user_id },  
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

          // Return token along with success message
          res.status(201).json({ 
              message: 'User registered successfully',
              token 
          });
      } catch (err) {
          await client.query('ROLLBACK');
          throw err;
      } finally {
          client.release();
      }
  } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error during registration' });
  }
});

// Login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check if user exists
        const user = await pool.query(
            'SELECT * FROM users WHERE email = $1',
            [email]
        );

        if (user.rows.length === 0) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Check password
        const validPassword = await bcrypt.compare(password, user.rows[0].password_hash);
        if (!validPassword) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Create token - use user_id consistently
        const token = jwt.sign(
            { user_id: user.rows[0].user_id },  // Explicitly use user_id from database row
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        console.log('Login successful for user:', user.rows[0].user_id);
        console.log('Generated Token:', token);

        res.json({ 
            token,
            user: {
                user_id: user.rows[0].user_id,
                email: user.rows[0].email
            }
        });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).send('Server error');
    }
});
module.exports = router;
