const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const pool = require('../db');

// Configure nodemailer to use Postfix
const transporter = nodemailer.createTransport({
  sendmail: true,
  newline: 'unix',
  path: '/usr/sbin/sendmail'
});

// Register new user
router.post('/register', async (req, res) => {
  try {
    const { firstName, lastName, gender, dateOfBirth, email, password } = req.body;

    if (!firstName || !lastName || !email || !password || !dateOfBirth || !gender) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const userExists = await pool.query('SELECT * FROM users WHERE email = $1', [email]);

    if (userExists.rows.length > 0) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const verificationToken = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: '1d' });

      const newUser = await client.query(
        'INSERT INTO users (email, password_hash, verification_token) VALUES ($1, $2, $3) RETURNING user_id',
        [email, hashedPassword, verificationToken]
      );

      await client.query(
        `INSERT INTO user_profiles (user_id, first_name, last_name, date_of_birth, gender) VALUES ($1, $2, $3, $4, $5)`,
        [newUser.rows[0].user_id, firstName, lastName, dateOfBirth, gender]
      );

      await client.query('COMMIT');

      // Send verification email
      const verificationLink = `http://arcus.fit/verify-email?token=${verificationToken}`;
      const mailOptions = {
        from: 'no-reply@arcus.fit',
        to: email,
        subject: 'Verify Your Email with Arcus',
        text: `Please verify your email by clicking the link: ${verificationLink}`
      };

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.error('Error sending email:', error);
        } else {
          console.log('Email sent:', info.response);
        }
      });

      res.status(201).json({ message: 'User registered successfully. Please verify your email.' });
    } catch (err) {
      await client.query('ROLLBACK');
      console.error('Registration transaction error:', err);
      res.status(500).json({ message: 'Server error during registration' });
    } finally {
      client.release();
    }
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ message: 'Server error during registration' });
  }
});


// Verify email
router.get('/verify-email', async (req, res) => {
  const { token } = req.query;

  try {
    const result = await pool.query('SELECT * FROM users WHERE verification_token = $1', [token]);

    if (result.rows.length === 0) {
      return res.status(400).json({ message: 'Invalid or expired token' });
    }

    await pool.query('UPDATE users SET email_verified = true WHERE verification_token = $1', [token]);

    res.status(200).json({ message: 'Email verified successfully' });
  } catch (error) {
    console.error('Verification error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});
    const { token } = req.query;
  
    try {
      const result = await pool.query('SELECT * FROM users WHERE verification_token = $1', [token]);
  
      if (result.rows.length === 0) {
        return res.status(400).json({ message: 'Invalid or expired token' });
      }
  
      await pool.query('UPDATE users SET email_verified = true WHERE verification_token = $1', [token]);
  
      res.status(200).json({ message: 'Email verified successfully' });
    } catch (error) {
      console.error('Verification error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });

// Login
router.post('/login', async (req, res) => {
    try {
      const { email, password } = req.body;
  
      const userResult = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
      const user = userResult.rows[0];
  
      if (!user) {
        return res.status(400).json({ message: 'Invalid credentials' });
      }
  
      if (!user.email_verified) {
        return res.status(400).json({ message: 'Please verify your email before logging in' });
      }
  
      if (!user.is_active || user.account_status !== 'active') {
        return res.status(403).json({ message: 'Account is inactive or suspended' });
      }
  
      const validPassword = await bcrypt.compare(password, user.password_hash);
      if (!validPassword) {
        return res.status(400).json({ message: 'Invalid credentials' });
      }
  
      const token = jwt.sign({ user_id: user.user_id }, process.env.JWT_SECRET, { expiresIn: '1d' });
  
      await pool.query('UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE user_id = $1', [user.user_id]);
  
      res.json({
        token,
        user: {
          user_id: user.user_id,
          email: user.email
        }
      });
    } catch (err) {
      console.error('Login error:', err);
      res.status(500).send('Server error');
    }
  });
  

module.exports = router;
