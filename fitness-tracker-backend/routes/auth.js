const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const { v4: uuidv4 } = require('uuid');
const pool = require('../db');
const authMiddleware = require('../middleware/authorization');

// Configure nodemailer to use Postfix
const transporter = nodemailer.createTransport({
  sendmail: true,
  newline: 'unix',
  path: '/usr/sbin/sendmail'
});

// Generate random verification token (uuid)
function generateVerificationToken() {
  return uuidv4();
}

// User Registration Route
router.post('/register', async (req, res) => {
  console.group('🚀 Backend Registration Attempt');
  console.log('Received Registration Data:', req.body);

  try {
    const { 
      firstName, 
      lastName, 
      gender, 
      dateOfBirth, 
      email, 
      password,
      age 
    } = req.body;

    console.log('Extracted Data:', { 
      firstName, 
      lastName, 
      gender, 
      dateOfBirth, 
      email,
      age
    });

    // Validate input
    const missingFields = [];
    if (!firstName) missingFields.push('firstName');
    if (!lastName) missingFields.push('lastName');
    if (!email) missingFields.push('email');
    if (!password) missingFields.push('password');
    if (!dateOfBirth) missingFields.push('dateOfBirth');
    if (!gender) missingFields.push('gender');
    if (missingFields.length > 0) {
      console.warn('❌ Missing fields:', missingFields);
      return res.status(400).json({ 
        message: `Missing required fields: ${missingFields.join(', ')}` 
      });
    }

    // Check if user already exists
    const userExists = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (userExists.rows.length > 0) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Generate verification token
    const verificationToken = generateVerificationToken();

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Create user (store verification_token)
      const newUser = await client.query(
        'INSERT INTO users (email, password_hash, verification_token, email_verified) VALUES ($1, $2, $3, $4) RETURNING user_id',
        [
          email, 
          hashedPassword, 
          verificationToken,
          false
        ]
      );

      await client.query(
        `INSERT INTO user_profiles (user_id, first_name, last_name, date_of_birth, gender) VALUES ($1, $2, $3, $4, $5)`,
        [newUser.rows[0].user_id, firstName, lastName, dateOfBirth, gender]
      );

      // Generate JWT token
      const token = jwt.sign(
        { 
          user_id: newUser.rows[0].user_id, 
          email: email,
          email_verified: false
        }, 
        process.env.JWT_SECRET, 
        { expiresIn: '1d' }
      );

      await client.query('COMMIT');

      // Send verification email (optional, can be done async)
      const mailOptions = {
        from: 'no-reply@arcus.fit',
        to: email,
        subject: 'Verify Your Email with Arcus',
        text: `Your verification link is: https://arcus.fit/verify-email?token=${verificationToken}&email=${encodeURIComponent(email)}`
      };

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.error('Email Sending Error:', error);
        }
      });

      res.status(201).json({
        message: 'User registered successfully. Please verify your email.',
        email: email,
        token: token,
        user: {
          user_id: newUser.rows[0].user_id,
          email: email,
          email_verified: false,
          needs_profile_setup: true
        }
      });
    } catch (err) {
      await client.query('ROLLBACK');
      console.error('Registration transaction error:', err);
      res.status(500).json({ message: 'Server error during registration' });
    } finally {
      client.release();
    }
  } catch (err) {
    console.error('🚨 Complete Registration Error:', {
      name: err.name,
      message: err.message,
      stack: err.stack
    });
    console.groupEnd();

    res.status(500).json({ 
      message: 'Server error during registration',
      error: err.message 
    });
  }
});


// Email Verification Route (token-based)
router.post('/verify-token', async (req, res) => {
  try {
    const { email, token } = req.body;

    if (!email || !token) {
      return res.status(400).json({ 
        message: 'Email and verification token are required' 
      });
    }

    const result = await pool.query(
      `SELECT * FROM users 
       WHERE email = $1 
       AND verification_token = $2`,
      [email, token]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ 
        message: 'Invalid verification token' 
      });
    }

    const user = result.rows[0];

    // Mark email as verified and clear verification token
    await pool.query(
      `UPDATE users 
       SET email_verified = true, 
           verification_token = NULL
       WHERE email = $1`,
      [email]
    );

    // Generate new token for verified user
    const jwtToken = jwt.sign(
      { 
        user_id: user.user_id, 
        email: user.email,
        email_verified: true
      }, 
      process.env.JWT_SECRET, 
      { expiresIn: '1d' }
    );

    res.status(200).json({ 
      message: 'Email verified successfully',
      email_verified: true,
      token: jwtToken,
      user: {
        user_id: user.user_id,
        email: user.email
      }
    });
  } catch (error) {
    console.error('🚨 Token Verification Error:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });

    res.status(500).json({ 
      message: 'Server error during verification',
      error: error.message
    });
  }
});

// Resend Verification Token Route
router.post('/resend-verification', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ 
        message: 'Email is required' 
      });
    }

    // Check if user exists
    const userResult = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = userResult.rows[0];

    if (!user) {
      return res.status(404).json({ 
        message: 'User not found' 
      });
    }

    // Generate new verification token
    const verificationToken = generateVerificationToken();

    // Update user with new verification token
    await pool.query(
      `UPDATE users 
       SET verification_token = $1 
       WHERE email = $2`,
      [
        verificationToken, 
        email
      ]
    );

    // Send verification email
    const mailOptions = {
      from: 'no-reply@arcus.fit',
      to: email,
      subject: 'New Verification Link for Arcus',
      text: `Your new verification link is: https://arcus.fit/verify-email?token=${verificationToken}&email=${encodeURIComponent(email)}`
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('Resend Verification Email Error:', error);
      }
    });

    res.status(200).json({ 
      message: 'A new verification email has been sent.',
      email: email
    });

  } catch (error) {
    console.error('🚨 Resend Verification Token Error:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });

    res.status(500).json({ 
      message: 'Server error while resending verification link',
      error: error.message 
    });
  }
});

router.post('/login', async (req, res) => {
  console.log('JWT Secret Check:', {
    secretDefined: !!process.env.JWT_SECRET,
    secretLength: process.env.JWT_SECRET ? process.env.JWT_SECRET.length : 'N/A'
  });
  
  try {
    const { email, password } = req.body;

    console.log('🔐 Backend Login Attempt:', { 
      email, 
      emailLength: email.length,
      passwordLength: password.length
    });

    if (!process.env.JWT_SECRET) {
      console.error('❌ JWT_SECRET is UNDEFINED');
      return res.status(500).json({ message: 'Server configuration error' });
    }

    const userResult = await pool.query(`
      SELECT 
        u.user_id, 
        u.email, 
        u.password_hash, 
        u.email_verified,
        u.is_admin,
        CASE WHEN up.user_id IS NOT NULL THEN true ELSE false END as is_profile_complete
      FROM users u
      LEFT JOIN user_profiles up ON u.user_id = up.user_id
      WHERE u.email = $1
    `, [email]);

    const user = userResult.rows[0];

    console.log('User Query Result:', {
      userFound: !!user,
      userDetails: user ? {
        user_id: user.user_id,
        email: user.email,
        email_verified: user.email_verified,
        is_profile_complete: user.is_profile_complete
      } : null
    });

    if (!user) {
      console.warn('❌ User not found:', email);
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const validPassword = await bcrypt.compare(password, user.password_hash);
    
    console.log('Password Validation:', {
      validPassword,
      errorIfFalse: !validPassword ? 'Invalid password' : 'Password matched'
    });

    if (!validPassword) {
      console.warn('❌ Invalid password for:', email);
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    try {
      const isAdmin = user.is_admin === true || user.is_admin === 't';
      const isProfileComplete = user.is_profile_complete === true;

      const tokenPayload = { 
        user_id: user.user_id, 
        email: user.email,
        email_verified: user.email_verified === true || user.email_verified === 't',
        is_admin: user.is_admin === true || user.is_admin === 't',
        is_profile_complete: user.is_profile_complete === true
      };

      const token = jwt.sign(
        tokenPayload, 
        process.env.JWT_SECRET, 
        { 
          algorithm: 'HS256', 
          expiresIn: '1d' 
        }
      );

      res.status(200).json({
        token: token,
        user: {
          user_id: user.user_id,
          email: user.email,
          email_verified: user.email_verified === true || user.email_verified === 't',
          is_admin: isAdmin,
          is_profile_complete: isProfileComplete
        }
      });
  
    } catch (tokenError) {
      console.error('🚨 Token Generation FAILED:', {
        name: tokenError.name,
        message: tokenError.message,
        stack: tokenError.stack
      });
      
      res.status(500).json({ 
        message: 'Failed to generate authentication token',
        error: tokenError.message 
      });
    }
  } catch (err) {
    console.error('🚨 COMPLETE Login Error:', {
      name: err.name,
      message: err.message,
      stack: err.stack
    });
    
    res.status(500).json({ 
      message: 'Unexpected server error during login',
      error: err.message 
    });
  }
});

module.exports = router;
