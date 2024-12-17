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

// Generate random verification code
function generateVerificationCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// User Registration Route
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

    // Validate input
    if (!firstName || !lastName || !email || !password || !dateOfBirth || !gender) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Check if user already exists
    const userExists = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (userExists.rows.length > 0) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Generate verification code
    const verificationCode = generateVerificationCode();

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Create user
      const newUser = await client.query(
        'INSERT INTO users (email, password_hash, verification_code, verification_code_expires_at) VALUES ($1, $2, $3, $4) RETURNING user_id',
        [
          email, 
          hashedPassword, 
          verificationCode, 
          new Date(Date.now() + 15 * 60 * 1000) // Code expires in 15 minutes
        ]
      );

      // Create user profile
      await client.query(
        `INSERT INTO user_profiles (user_id, first_name, last_name, date_of_birth, gender) VALUES ($1, $2, $3, $4, $5)`,
        [newUser.rows[0].user_id, firstName, lastName, dateOfBirth, gender]
      );

      await client.query('COMMIT');

      // Send verification email
      const mailOptions = {
        from: 'no-reply@arcus.fit',
        to: email,
        subject: 'Verify Your Email with Arcus',
        text: `Your verification code is: ${verificationCode}. This code will expire in 15 minutes.`
      };

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.error('Email Sending Error:', error);
        } else {
          console.log('Email Sent Successfully:', info);
        }
      });

      res.status(201).json({
        message: 'User registered successfully. Please verify your email.',
        email: email
      });
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

// Email Verification Route
router.post('/verify-code', async (req, res) => {
  try {
    const { email, code } = req.body;

    const result = await pool.query(
      `SELECT * FROM users 
       WHERE email = $1 
       AND verification_code = $2 
       AND verification_code_expires_at > CURRENT_TIMESTAMP`,
      [email, code]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ message: 'Invalid or expired code' });
    }

    // Mark email as verified and clear verification code
    await pool.query(
      `UPDATE users 
       SET email_verified = true, 
           verification_code = NULL, 
           verification_code_expires_at = NULL 
       WHERE email = $1`,
      [email]
    );

    // Generate a new token for the verified user
    const user = result.rows[0];
    const token = jwt.sign(
      { 
        user_id: user.user_id, 
        email: user.email 
      }, 
      process.env.JWT_SECRET, 
      { expiresIn: '1d' }
    );

    res.status(200).json({ 
      message: 'Email verified successfully',
      token, // Send back a new token
      email_verified: true
    });
  } catch (error) {
    console.error('Code verification error:', error);
    res.status(500).json({ message: 'Server error during verification' });
  }
});


// Login Route
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const userResult = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = userResult.rows[0];

    // Check if user exists
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Verify password
    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Create JWT token
    const token = jwt.sign(
      { 
        user_id: user.user_id, 
        email: user.email 
      }, 
      process.env.JWT_SECRET, 
      { expiresIn: '1d' }
    );

    // Convert verification status
    const isEmailVerified = user.email_verified === 't' || user.email_verified === true;

    res.json({
      token,
      user: {
        user_id: user.user_id,
        email: user.email,
        email_verified: isEmailVerified
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).send('Server error');
  }
});

module.exports = router;
