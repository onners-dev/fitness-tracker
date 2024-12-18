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

      // Generate JWT token
      const token = jwt.sign(
        { 
          user_id: user.user_id, 
          email: user.email,
          email_verified: isEmailVerified
        }, 
        process.env.JWT_SECRET, 
        { expiresIn: '1d' }
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
        email: email,
        token: token,  // Ensure token is always sent
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
    console.error('Registration error:', err);
    res.status(500).json({ message: 'Server error during registration' });
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




// Login Route
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log('🔐 Backend Login Attempt:', { email });

    // Find user
    const userResult = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = userResult.rows[0];

    // Check if user exists
    if (!user) {
      console.warn('❌ User not found:', email);
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Verify password
    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) {
      console.warn('❌ Invalid password for:', email);
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Convert verification status
    const isEmailVerified = user.email_verified === 't' || user.email_verified === true;

    // Generate token
    const token = jwt.sign(
      { 
        user_id: user.user_id, 
        email: user.email,
        email_verified: isEmailVerified
      }, 
      process.env.JWT_SECRET, 
      { expiresIn: '1d' }
    );

    console.log('✅ Login Success:', {
      userId: user.user_id,
      email: user.email,
      emailVerified: isEmailVerified,
      tokenGenerated: !!token
    });

    // Fetch user profile to check completeness
    const profileResult = await pool.query(`
      SELECT 
        up.first_name, 
        up.last_name, 
        up.height, 
        up.current_weight, 
        up.fitness_goal, 
        up.activity_level, 
        up.primary_focus
      FROM user_profiles up
      WHERE up.user_id = $1
    `, [user.user_id]);

    // Determine profile completeness
    const profile = profileResult.rows[0];
    const isProfileComplete = !!(
      profile?.height &&
      profile?.current_weight &&
      profile?.fitness_goal &&
      profile?.activity_level &&
      profile?.primary_focus
    );

    // IMPORTANT: Explicitly return token in response
    res.status(200).json({
      token: token,  // Explicitly add token
      user: {
        user_id: user.user_id,
        email: user.email,
        email_verified: isEmailVerified,
        is_profile_complete: isProfileComplete
      }
    });
  } catch (err) {
    console.error('🚨 Login Error:', err);
    res.status(500).json({ 
      message: 'Server error during login',
      error: err.message 
    });
  }
});router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log('🔐 Backend Login Attempt:', { email });

    // Find user
    const userResult = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = userResult.rows[0];

    // Check if user exists
    if (!user) {
      console.warn('❌ User not found:', email);
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Verify password
    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) {
      console.warn('❌ Invalid password for:', email);
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Convert verification status
    const isEmailVerified = user.email_verified === 't' || user.email_verified === true;

    // Generate token
    const token = jwt.sign(
      { 
        user_id: user.user_id, 
        email: user.email,
        email_verified: isEmailVerified
      }, 
      process.env.JWT_SECRET, 
      { 
        expiresIn: '1d' 
      }
    );

    console.log('✅ Login Success:', {
      userId: user.user_id,
      email: user.email,
      emailVerified: isEmailVerified,
      tokenGenerated: !!token
    });

    // Fetch user profile to check completeness
    const profileResult = await pool.query(`
      SELECT 
        up.first_name, 
        up.last_name, 
        up.height, 
        up.current_weight, 
        up.fitness_goal, 
        up.activity_level, 
        up.primary_focus
      FROM user_profiles up
      WHERE up.user_id = $1
    `, [user.user_id]);

    // Determine profile completeness
    const profile = profileResult.rows[0];
    const isProfileComplete = !!(
      profile?.height &&
      profile?.current_weight &&
      profile?.fitness_goal &&
      profile?.activity_level &&
      profile?.primary_focus
    );

    // IMPORTANT: Explicitly return token in response
    res.status(200).json({
      token: token,  // Explicitly add token
      user: {
        user_id: user.user_id,
        email: user.email,
        email_verified: isEmailVerified,
        is_profile_complete: isProfileComplete
      }
    });
  } catch (err) {
    console.error('🚨 Login Error:', err);
    res.status(500).json({ 
      message: 'Server error during login',
      error: err.message 
    });
  }
});




module.exports = router;
