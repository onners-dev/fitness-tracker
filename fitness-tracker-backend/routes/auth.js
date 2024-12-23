const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const pool = require('../db');
const authMiddleware = require('../middleware/authorization');

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

    // Validate input with more detailed checks
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
        'INSERT INTO users (email, password_hash, verification_code, verification_code_expires_at, email_verified) VALUES ($1, $2, $3, $4, $5) RETURNING user_id',
        [
          email, 
          hashedPassword, 
          verificationCode, 
          new Date(Date.now() + 15 * 60 * 1000), // Code expires in 15 minutes
          false // explicitly set email_verified to false
        ]
      );

      // Create user profile
      await client.query(
        `INSERT INTO user_profiles (user_id, first_name, last_name, date_of_birth, gender) VALUES ($1, $2, $3, $4, $5)`,
        [newUser.rows[0].user_id, firstName, lastName, dateOfBirth, gender]
      );

      // Generate JWT token - FIXED: use newUser details
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
        text: `Your verification code is: ${verificationCode}. This code will expire in 15 minutes.`
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


// Email Verification Route
router.post('/verify-code', async (req, res) => {
  try {
    const { email, code } = req.body;

    console.log('🔍 Verification Request:', { 
      email, 
      code, 
      codeType: typeof code 
    });

    // Validate input
    if (!email || !code) {
      return res.status(400).json({ 
        message: 'Email and verification code are required' 
      });
    }

    // Ensure code is a string and has 6 digits
    const verificationCode = code.toString().trim();
    if (!/^\d{6}$/.test(verificationCode)) {
      return res.status(400).json({ 
        message: 'Invalid verification code format' 
      });
    }

    const result = await pool.query(
      `SELECT * FROM users 
       WHERE email = $1 
       AND verification_code = $2 
       AND verification_code_expires_at > CURRENT_TIMESTAMP`,
      [email, verificationCode]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ 
        message: 'Invalid or expired verification code' 
      });
    }

    const user = result.rows[0];

    // Mark email as verified and clear verification code
    await pool.query(
      `UPDATE users 
       SET email_verified = true, 
           verification_code = NULL, 
           verification_code_expires_at = NULL 
       WHERE email = $1`,
      [email]
    );

    // Generate new token for verified user
    const token = jwt.sign(
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
      token: token,
      user: {
        user_id: user.user_id,
        email: user.email
      }
    });
  } catch (error) {
    console.error('🚨 Code Verification Error:', {
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

// Resend Verification Code Route
router.post('/resend-verification', async (req, res) => {
  try {
    const { email } = req.body;

    console.log('🔄 Resend Verification Code Request:', { email });

    // Validate input
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

    // Generate new verification code
    const verificationCode = generateVerificationCode();

    // Update user with new verification code
    await pool.query(
      `UPDATE users 
       SET verification_code = $1, 
           verification_code_expires_at = $2 
       WHERE email = $3`,
      [
        verificationCode, 
        new Date(Date.now() + 15 * 60 * 1000), // Code expires in 15 minutes
        email
      ]
    );

    // Send verification email
    const mailOptions = {
      from: 'no-reply@arcus.fit',
      to: email,
      subject: 'New Verification Code for Arcus',
      text: `Your new verification code is: ${verificationCode}. This code will expire in 15 minutes.`
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('Resend Verification Email Error:', error);
      }
    });

    res.status(200).json({ 
      message: 'New verification code has been sent to your email',
      email: email
    });

  } catch (error) {
    console.error('🚨 Resend Verification Code Error:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });

    res.status(500).json({ 
      message: 'Server error while resending verification code',
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

    // Verify JWT secret
    if (!process.env.JWT_SECRET) {
      console.error('❌ JWT_SECRET is UNDEFINED');
      return res.status(500).json({ message: 'Server configuration error' });
    }

    // Find user with profile information
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

    // Extremely detailed logging
    console.log('User Query Result:', {
      userFound: !!user,
      userDetails: user ? {
        user_id: user.user_id,
        email: user.email,
        email_verified: user.email_verified,
        is_profile_complete: user.is_profile_complete
      } : null
    });

    // Check if user exists
    if (!user) {
      console.warn('❌ User not found:', email);
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Detailed password verification logging
    console.log('Password Verification:', {
      inputPasswordLength: password.length,
      storedHashLength: user.password_hash.length
    });

    // Verify password
    const validPassword = await bcrypt.compare(password, user.password_hash);
    
    console.log('Password Validation:', {
      validPassword,
      errorIfFalse: !validPassword ? 'Invalid password' : 'Password matched'
    });

    if (!validPassword) {
      console.warn('❌ Invalid password for:', email);
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Token generation with extremely detailed logging
    try {
      const isAdmin = user.is_admin === true || user.is_admin === 't';
      const isProfileComplete = user.is_profile_complete === true;

      const tokenPayload = { 
        user_id: user.user_id, 
        email: user.email,
        email_verified: user.email_verified === true || user.email_verified === 't',
        is_admin: user.is_admin === true || user.is_admin === 't', // Explicitly convert to boolean
        is_profile_complete: user.is_profile_complete === true
      };

      console.log('Token Payload:', JSON.stringify(tokenPayload, null, 2));

      const token = jwt.sign(
        tokenPayload, 
        process.env.JWT_SECRET, 
        { 
          algorithm: 'HS256', 
          expiresIn: '1d' 
        }
      );

      console.log('🎉 Token Generated Successfully:', {
        tokenLength: token.length,
        firstChars: token.substring(0, 10),
        lastChars: token.substring(token.length - 10)
      });

      // Explicit and complete response
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
