const express = require('express');
const path = require('path');
const pool = require('./db');  // Assuming the db configuration is here
require('dotenv').config();
console.log(process.env.NODE_ENV); 
const fs = require('fs');
const cors = require('cors')

const app = express();
app.use(express.json());  // Middleware to parse JSON requests

app.use(cors({
  origin: [
      'http://localhost:3000',   // React development server
      'http://localhost:5173',   // Vite development server
      'http://127.0.0.1:3000',   // Alternative localhost for React
      'http://127.0.0.1:5173',   // Alternative localhost for Vite
      'http://arcus.fit',        // Production domain
      'https://arcus.fit'        // HTTPS production domain
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));


// Test database connection
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('Error connecting to the database', err);
  } else {
    console.log('Database connected successfully');
  }
});


// More route loading and setup
const routes = [
  { path: './routes/users', name: 'users', apiPath: '/api/users' },
  { path: './routes/auth', name: 'auth', apiPath: '/api/auth' },
  { path: './routes/exercises', name: 'exercises', apiPath: '/api/exercises' },
  { path: './routes/favorites', name: 'favorites', apiPath: '/api/favorites' },
  { path: './routes/meals', name: 'meals', apiPath: '/api/meals' },
  { path: './routes/foods', name: 'foods', apiPath: '/api/foods' },
  { path: './routes/trends', name: 'trends', apiPath: '/api/trends' },
  { path: './routes/workouts', name: 'workouts', apiPath: '/api/workouts' },
  {path: './routes/nutrition', name: 'nutrition', apiPath: '/api/nutrition'},
  {path: './routes/admin', name: 'admin', apiPath: '/api/admin'}
];

const loadRoute = (routePath, routeName) => {
  try {
    // Ensure fullPath is defined using path.resolve for absolute paths
    const fullPath = path.resolve(__dirname, routePath); 

    console.log(`Attempting to load route from: ${fullPath}`);

    // Clear module cache to avoid issues with reloading
    delete require.cache[require.resolve(fullPath)];

    const routeModule = require(fullPath);

    // Handle potential exports
    const route = routeModule.router || routeModule;

    console.log('Loaded route:', route); 

    // More flexible route validation
    if (!route || (typeof route !== 'function' && typeof route.use !== 'function')) {
      console.error(`Invalid route module for ${routeName}`);
      return null;
    }

    console.log(`Route ${routeName} loaded successfully`);
    return route;
  } catch (err) {
    console.error(`Error loading ${routeName}:`, err);
    return null;
  }
};


routes.forEach(({ path, name, apiPath }) => {
  const route = loadRoute(path, name);
  console.log(`Loading route: ${name} at ${apiPath}`);  // Debugging line

  if (route) {
    app.use(apiPath, route);
    console.log(`Successfully mounted ${name} route at ${apiPath}`);
  } else {
    console.error(`Failed to mount ${name} route`);
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

// Ensure app listens on all interfaces (not just localhost)
const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});

console.log('JWT_SECRET:', process.env.JWT_SECRET ? 'Loaded' : 'Not Loaded');


// Capture and log any unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Capture and log any uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});

