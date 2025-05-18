# Arcus Fitness Tracker

Arcus Fitness Tracker is a modern, full-stack fitness web app designed to help users track calories, log workouts, manage nutrition, and visualize progress. This was a learning project for me, so the frontend is a bit rough around the edges. I heavily focues on the backend on this project.

---

## Features

- **User Authentication** – Secure login, signup, and email verification.
- **Calorie Tracking** – Log meals, monitor daily calories, and save favorites.
- **Workout Logging** – Track exercises, sets, reps, and rest days.
- **Workout Plan Builder** – Generate or customize workout routines.
- **Workout Library** – Browse and search through a wide range of workouts.
- **Nutrition Monitoring** – Dietary tracking and nutrition moderation (admin).
- **Progress Trends & Analytics** – Visualize trends in fitness and nutrition.
- **Admin Dashboard** – Moderate users, workouts, nutrition data, and review analytics.
- **Profile Onboarding** – Personalized onboarding for new users.

---

## Tech Stack

**Frontend:**
- React (with Vite)
- React Router DOM
- Axios
- Chart.js & Recharts
- Modern CSS

**Backend:**
- Node.js & Express.js
- PostgreSQL ([Schema here!](./fitness_tracker.sql))
- JWT Authentication
- Nodemailer (email support)
- RESTful API

**Other:**
- ESLint & Prettier
- Environment variables support
- Modular, maintainable codebase

---

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/fitness-tracker.git
cd fitness-tracker
```

### 2. Set up the PostgreSQL Database

1. Install PostgreSQL on your local machine.
2. Create a new database named `fitness-tracker`.
3. Load the `fitness-tracker.sql` file into the database.

### 3. Configure the Environment Variables


Create a `.env` file in the backend directory and add the following variables:
```bash
DB_USER=(your database username)
DB_HOST=(your database host)
DB_NAME=(your database name)
DB_PASSWORD=(your database password)
DB_PORT=(your database port)
JWT_SECRET=(a random string of characters)
PORT=(the port number you want to run the backend on)
```
Create a `.env` file in the frontend directory and add the following variables:

```bash
REACT_APP_API_URL=(the URL of your backend)

```

### 4. Install Dependencies

```bash
cd fitness-tracker-backend
npm install

cd ../fitness-tracker-website
npm install
```

### 5. Start the Backend

```bash
cd fitness-tracker-backend
npm start
```

### 6. Start the Frontend

```bash
cd fitness-tracker-website
npm start
```

