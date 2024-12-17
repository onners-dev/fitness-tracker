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

// Add a function to generate a random 6-digit code
function generateVerificationCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

router.post('/register', async (req, res) => {
  try {
    const { firstName, lastName, gender, dateOfBirth, email, password } = req.body;

    const userExists = await pool.query('SELECT * FROM users WHERE email = $1', [email]);

    if (userExists.rows.length > 0) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Generate a 6-digit verification code BEFORE inserting user
    const verificationCode = generateVerificationCode();

    try {
      const newUser = await pool.query(
        'INSERT INTO users (email, password_hash, verification_code, verification_code_expires_at) VALUES ($1, $2, $3, $4) RETURNING user_id',
        [
          email, 
          hashedPassword, 
          verificationCode, 
          new Date(Date.now() + 15 * 60 * 1000) // Code expires in 15 minutes
        ]
      );

      await pool.query(
        `INSERT INTO user_profiles (user_id, first_name, last_name, date_of_birth, gender) VALUES ($1, $2, $3, $4, $5)`,
        [newUser.rows[0].user_id, firstName, lastName, dateOfBirth, gender]
      );

      // Send verification email with code
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
      console.error('Registration transaction error:', err);
      res.status(500).json({ message: 'Server error during registration' });
    }
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ message: 'Server error during registration' });
  }
});


// New route to verify code
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

    res.status(200).json({ message: 'Email verified successfully' });
  } catch (error) {
    console.error('Code verification error:', error);
    res.status(500).json({ message: 'Server error during verification' });
  }
});

// Resend verification code
router.post('/resend-verification', async (req, res) => {
  try {
    const { email } = req.body;

    // Generate a new verification code
    const verificationCode = generateVerificationCode();

    // Update the verification code in the database
    await pool.query(
      `UPDATE users 
       SET verification_code = $1, 
           verification_code_expires_at = $2 
       WHERE email = $3 AND email_verified = false`,
      [
        verificationCode, 
        new Date(Date.now() + 15 * 60 * 1000), // Code expires in 15 minutes
        email
      ]
    );

    // Send new verification email
    const mailOptions = {
      from: 'no-reply@arcus.fit',
      to: email,
      subject: 'New Verification Code for Arcus',
      text: `Your new verification code is: ${verificationCode}. This code will expire in 15 minutes.`
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('Error sending verification email:', error);
        return res.status(500).json({ message: 'Failed to send verification email' });
      }
      
      res.status(200).json({ message: 'Verification code resent successfully' });
    });
  } catch (error) {
    console.error('Resend verification error:', error);
    res.status(500).json({ message: 'Server error during resend verification' });
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

    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { 
        user_id: user.user_id, 
        email: user.email 
      }, 
      process.env.JWT_SECRET, 
      { expiresIn: '1d' }
    );

    // Explicitly convert 't' to true
    const isEmailVerified = user.email_verified === 't' || user.email_verified === true;

    console.log('Login User Data:', {
      email_verified: user.email_verified,
      converted_verified: isEmailVerified
    });

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
