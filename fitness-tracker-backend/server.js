const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const path = require('path');  // Add path module
require('dotenv').config();

const app = express();

// Use the specific CORS configuration
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));

// Middleware
app.use(express.json());

// Database configuration
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

// Test database connection
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('Error connecting to the database', err);
  } else {
    console.log('Database connected successfully');
  }
});

// More robust route loading
const loadRoute = (routePath, routeName) => {
  try {
    // Use absolute path to resolve any path issues
    const fullPath = path.resolve(__dirname, routePath);
    console.log(`Attempting to load route from: ${fullPath}`);

    // Clear module cache to prevent potential caching issues
    delete require.cache[require.resolve(fullPath)];

    const route = require(fullPath);

    // Verify it's a valid router
    if (!route || typeof route.use !== 'function') {
      console.error(`Invalid route module for ${routeName}`);
      return null;
    }

    console.log(`Route ${routeName} loaded successfully`);
    return route;
  } catch (err) {
    console.error(`Detailed error loading ${routeName} route:`, {
      message: err.message,
      stack: err.stack,
      code: err.code
    });
    return null;
  }
};

// Detailed route loading with comprehensive logging
const routes = [
  { path: './routes/users', name: 'users', apiPath: '/api/users' },
  { path: './routes/auth', name: 'auth', apiPath: '/api/auth' },
  { path: './routes/exercises', name: 'exercises', apiPath: '/api/exercises' },
  { path: './routes/favorites', name: 'favorites', apiPath: '/api/favorites' },
  { path: './routes/meals', name: 'meals', apiPath: '/api/meals' },
  { path: './routes/foods', name: 'foods', apiPath: '/api/foods' },
  { path: './routes/trends', name: 'trends', apiPath: '/api/trends' },
  { path: './routes/workouts', name: 'workouts', apiPath: '/api/workouts' }
];

routes.forEach(({ path, name, apiPath }) => {
  try {
    const route = loadRoute(path, name);
    if (route) {
      app.use(apiPath, route);
      console.log(`Successfully mounted ${name} route at ${apiPath}`);
    } else {
      console.error(`Failed to mount ${name} route`);
    }
  } catch (err) {
    console.error(`Unexpected error mounting ${name} route:`, err);
  }
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', {
    message: err.message,
    stack: err.stack,
    name: err.name
  });
  
  res.status(500).json({
    message: 'An unexpected server error occurred',
    error: process.env.NODE_ENV === 'production' ? {} : err.message
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Capture and log any unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Capture and log any uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});
