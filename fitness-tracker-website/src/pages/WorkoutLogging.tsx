import React, { useState, useEffect } from 'react'
import type { ChangeEvent, FormEvent } from 'react'
import { useLocation } from "react-router-dom";
import { workoutService, exerciseLibraryService } from "../services/workoutApi";
import { workoutPlanService } from "../services/workoutPlanService";
import "./WorkoutLogging.css";

type Exercise = {
  exercise_id: number | string;
  name: string;
  muscle_groups?: string[];
  sets?: string | number;
  reps?: string | number;
  weight?: string | number;
  notes?: string;
};

type WorkoutPlan = {
  plan_id: number;
  planName?: string;
  workouts: {
    [day: string]: Exercise[];
  };
};

type LoggedExercise = {
  exercise_id: string;
  exercise_name?: string;
  sets: string;
  reps: string;
  weight?: string;
  notes?: string;
  muscle_groups?: string[];
};

type WorkoutData = {
  workout_type: string;
  workout_name: string;
  date: string;
  total_duration: string;
  total_calories_burned: string;
  notes: string;
  exercises: LoggedExercise[];
};

type CurrentExercise = {
  exercise_id: string;
  sets: string;
  reps: string;
  weight: string;
  notes: string;
};

const workoutTypes = [
  "Full Body",
  "Upper Body",
  "Lower Body",
  "Push",
  "Pull",
  "Legs",
  "Cardio",
  "Custom",
];

const initialExercise: CurrentExercise = {
  exercise_id: "",
  sets: "",
  reps: "",
  weight: "",
  notes: "",
};

const initialWorkoutData: WorkoutData = {
    workout_type: "",
    workout_name: "",
    date: new Date().toISOString().split("T")[0] || "",
    total_duration: "",
    total_calories_burned: "",
    notes: "",
    exercises: [],
}
  
const WorkoutLogging: React.FC = () => {
  const location = useLocation() as { state?: any };
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [workoutData, setWorkoutData] = useState<WorkoutData>(initialWorkoutData);
  const [exerciseLibrary, setExerciseLibrary] = useState<Exercise[]>([]);
  const [currentExercise, setCurrentExercise] = useState<CurrentExercise>(initialExercise);
  const [workoutPlans, setWorkoutPlans] = useState<WorkoutPlan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  useEffect(() => {
    const fetchWorkoutPlans = async () => {
      try {
        const plans: WorkoutPlan[] = await workoutPlanService.getUserWorkoutPlans();
        setWorkoutPlans(plans);
      } catch (error) {
        setError("Failed to fetch workout plans");
      }
    };

    fetchWorkoutPlans();
  }, []);

  useEffect(() => {
    const fetchExercises = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const exercises: Exercise[] = await exerciseLibraryService.getExercises();
        setExerciseLibrary(exercises);
      } catch {
        setError("Failed to load exercise library. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchExercises();
  }, []);

  useEffect(() => {
    const { state } = location as Location & { state?: any };
    if (state && state.exercises) {
      const isFromWorkoutPlans = state.source === "workoutPlans";
      if (isFromWorkoutPlans) {
        setWorkoutData((prev) => ({
          ...prev,
          workout_type: typeof state.day === 'string' ? state.day : "Full Body",
          date: new Date().toISOString().split("T")[0] || "",
          exercises: (state.exercises as any[]).map((exercise) => ({
            exercise_id: String(exercise.exercise_id ?? ""),
            exercise_name: typeof exercise.exercise_name === 'string' ? exercise.exercise_name : "",
            sets: exercise.sets ? String(exercise.sets) : "",
            reps: exercise.reps ? String(exercise.reps) : "",
            muscle_groups: Array.isArray(exercise.muscle_groups) ? exercise.muscle_groups : [],
            weight: exercise.weight ? String(exercise.weight) : "",
            notes: typeof exercise.notes === 'string' ? exercise.notes : "",
          })),
        }));
      } else {
        setCurrentExercise((prev) => ({
          ...prev,
          exercise_id: String(state.exercises[0]?.exercise_id ?? ""),
        }));
      }
    }
  }, [location]);

  const handleWorkoutChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setWorkoutData((prev) => ({
      ...prev,
      [name]: value,
      ...(name === "workout_type" && value !== "Custom" ? { workout_name: "" } : {}),
    }));
  };

  const handleExerciseChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setCurrentExercise((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const addExercise = () => {
    if (currentExercise.exercise_id) {
      const selectedExercise = exerciseLibrary.find(
        (ex) => String(ex.exercise_id) === currentExercise.exercise_id
      );
      setWorkoutData((prev) => ({
        ...prev,
        exercises: [
          ...prev.exercises,
          {
            ...currentExercise,
            exercise_name: selectedExercise?.name || "",
          },
        ],
      }));
      setCurrentExercise(initialExercise);
    }
  };

  const removeExercise = (index: number) => {
    setWorkoutData((prev) => ({
      ...prev,
      exercises: prev.exercises.filter((_, i) => i !== index),
    }));
  };

  const importPlanExercises = (planId: string) => {
    try {
      const plan = workoutPlans.find((p) => String(p.plan_id) === planId);
      if (!plan) return;
      const currentDay = new Date().toLocaleDateString("en-US", { weekday: "long" });
      const dayExercises = plan.workouts[currentDay] || [];

      const importedExercises: LoggedExercise[] = dayExercises.map((exercise) => ({
        exercise_id: String(exercise.exercise_id),
        exercise_name: exercise.name,
        sets: exercise.sets?.toString() || "",
        reps: exercise.reps?.toString() || "",
        weight: "",
        notes: `Imported from ${plan.planName || "Workout Plan"}`,
        muscle_groups: Array.isArray(exercise.muscle_groups) ? exercise.muscle_groups : [],
      }));

      setWorkoutData((prev) => ({
        ...prev,
        exercises: importedExercises,
        workout_type: prev.workout_type || importedExercises[0]?.muscle_groups?.[0] || "Full Body",
      }));
    } catch {}
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const errors: string[] = [];
    if (!workoutData.workout_type) errors.push("Workout type is required");
    if (workoutData.workout_type === "Custom" && !workoutData.workout_name.trim()) {
      errors.push("Custom workout name is required");
    }
    if (!workoutData.date) errors.push("Date is required");
    if (workoutData.exercises.length === 0) errors.push("Please add at least one exercise");

    if (errors.length > 0) {
      setError(errors.join("\n"));
      setIsLoading(false);
      return;
    }

    try {
      const submissionData = {
        ...workoutData,
        total_duration: workoutData.total_duration || null,
        total_calories_burned: workoutData.total_calories_burned || null,
        notes: workoutData.notes || null,
        workout_name:
          workoutData.workout_type === "Custom"
            ? workoutData.workout_name
            : workoutData.workout_type,
      };

      await workoutService.logWorkout(submissionData);

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
      setWorkoutData(initialWorkoutData);
    } catch (error: any) {
      setError(`Failed to log workout: ${error?.message ?? "Unknown error"}`);
    } finally {
      setIsLoading(false);
    }
  };

  const updateExerciseField = (index: number, field: keyof LoggedExercise, value: string) => {
    setWorkoutData((prev) => ({
      ...prev,
      exercises: prev.exercises.map((ex, i) =>
        i === index
          ? { ...ex, [field]: value }
          : ex
      ),
    }));
  };

  return (
    <div className="workout-logging" role="main">
      <h1>Log Your Workout</h1>
      {error && (
        <div className="error-message" role="alert">
          {error}
        </div>
      )}
      {success && (
        <div className="success-message" role="alert">
          Workout logged successfully!
        </div>
      )}

      <form onSubmit={handleSubmit} className="workout-form">
        <fieldset className="form-section">
          <legend>Workout Details</legend>

          <div className="workout-plan-import">
            <h3>Import from Workout Plan</h3>
            <select
              value={selectedPlan || ""}
              onChange={(e) => {
                const selectedPlanId = e.target.value;
                setSelectedPlan(selectedPlanId);
                importPlanExercises(selectedPlanId);
              }}
            >
              <option value="">Select a Workout Plan</option>
              {workoutPlans.map((plan) => (
                <option key={plan.plan_id} value={plan.plan_id}>
                  {plan.planName || `Plan - ${plan.plan_id}`}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="workout-type">Workout Type *</label>
            <select
              id="workout-type"
              name="workout_type"
              value={workoutData.workout_type}
              onChange={handleWorkoutChange}
              required
              aria-required="true"
            >
              <option value="">Select Workout Type</option>
              {workoutTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          {workoutData.workout_type === "Custom" && (
            <div className="form-group">
              <label htmlFor="workout-name">Custom Workout Name *</label>
              <input
                id="workout-name"
                type="text"
                name="workout_name"
                value={workoutData.workout_name}
                onChange={handleWorkoutChange}
                placeholder="Enter custom workout name"
                required
                aria-required="true"
              />
            </div>
          )}

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="workout-date">Date *</label>
              <input
                id="workout-date"
                type="date"
                name="date"
                value={workoutData.date}
                onChange={handleWorkoutChange}
                required
                aria-required="true"
              />
            </div>

            <div className="form-group">
              <label htmlFor="workout-duration">Duration (mins)</label>
              <input
                id="workout-duration"
                type="number"
                name="total_duration"
                value={workoutData.total_duration}
                onChange={handleWorkoutChange}
                placeholder="0"
                min="0"
              />
            </div>

            <div className="form-group">
              <label htmlFor="calories-burned">Calories Burned</label>
              <input
                id="calories-burned"
                type="number"
                name="total_calories_burned"
                value={workoutData.total_calories_burned}
                onChange={handleWorkoutChange}
                placeholder="0"
                min="0"
              />
            </div>
          </div>
        </fieldset>

        <fieldset className="form-section">
          <legend>Exercises</legend>

          <div className="exercises-list">
            {workoutData.exercises.map((exercise, index) => (
              <div key={index} className="exercise-card editable">
                <h3>{exercise.exercise_name}</h3>
                <div className="exercise-details">
                  <div className="editable-field">
                    <label>Sets:</label>
                    <input
                      type="number"
                      value={exercise.sets}
                      onChange={(e) =>
                        updateExerciseField(index, "sets", e.target.value)
                      }
                      min="1"
                    />
                  </div>
                  <div className="editable-field">
                    <label>Reps:</label>
                    <input
                      type="number"
                      value={exercise.reps}
                      onChange={(e) =>
                        updateExerciseField(index, "reps", e.target.value)
                      }
                      min="1"
                    />
                  </div>
                  <div className="editable-field">
                    <label>Weight (kg):</label>
                    <input
                      type="number"
                      value={exercise.weight || ""}
                      onChange={(e) =>
                        updateExerciseField(index, "weight", e.target.value)
                      }
                      min="0"
                    />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => removeExercise(index)}
                  className="remove-exercise"
                  aria-label={`Remove ${exercise.exercise_name}`}
                >
                  ×
                </button>
              </div>
            ))}
          </div>

          <div className="add-exercise-section">
            <h3>Add Exercise</h3>
            <div className="add-exercise-form">
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="exercise-select">Exercise *</label>
                  <select
                    id="exercise-select"
                    name="exercise_id"
                    value={currentExercise.exercise_id}
                    onChange={handleExerciseChange}
                  >
                    <option value="">Select Exercise</option>
                    {exerciseLibrary.map((exercise) => (
                      <option key={exercise.exercise_id} value={exercise.exercise_id}>
                        {exercise.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group compact">
                  <label htmlFor="sets">Sets *</label>
                  <input
                    id="sets"
                    type="number"
                    name="sets"
                    placeholder="0"
                    value={currentExercise.sets}
                    onChange={handleExerciseChange}
                    min="1"
                  />
                </div>

                <div className="form-group compact">
                  <label htmlFor="reps">Reps *</label>
                  <input
                    id="reps"
                    type="number"
                    name="reps"
                    placeholder="0"
                    value={currentExercise.reps}
                    onChange={handleExerciseChange}
                    min="1"
                  />
                </div>

                <div className="form-group compact">
                  <label htmlFor="weight">Weight (kg)</label>
                  <input
                    id="weight"
                    type="number"
                    name="weight"
                    placeholder="0"
                    value={currentExercise.weight}
                    onChange={handleExerciseChange}
                    min="0"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={addExercise}
                className="add-exercise-btn"
                disabled={
                  !currentExercise.exercise_id || !currentExercise.sets || !currentExercise.reps
                }
              >
                Add Exercise
              </button>
            </div>
          </div>
        </fieldset>

        <div className="form-group">
          <label htmlFor="workout-notes">Additional Notes</label>
          <textarea
            id="workout-notes"
            name="notes"
            value={workoutData.notes}
            onChange={handleWorkoutChange}
            placeholder="Add any notes about your workout..."
            rows={3}
          />
        </div>

        <button type="submit" className="submit-workout" disabled={isLoading}>
          {isLoading ? "Logging Workout..." : "Log Workout"}
        </button>
      </form>
    </div>
  );
};

export default WorkoutLogging;
