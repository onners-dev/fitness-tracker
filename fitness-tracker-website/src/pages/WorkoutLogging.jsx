import React, { useState, useEffect } from 'react';
import { workoutService, exerciseLibraryService } from '../services/workoutApi';
import './WorkoutLogging.css';

function WorkoutLogging() {
    // Workout type options
    const workoutTypes = [
        'Full Body',
        'Upper Body',
        'Lower Body',
        'Push',
        'Pull',
        'Legs',
        'Cardio',
        'Custom'
    ];

    const [workoutData, setWorkoutData] = useState({
        workout_type: '', 
        workout_name: '', 
        date: new Date().toISOString().split('T')[0],
        total_duration: '',
        total_calories_burned: '',
        notes: '',
        exercises: []
    });

    const [exerciseLibrary, setExerciseLibrary] = useState([]);
    const [currentExercise, setCurrentExercise] = useState({
        exercise_id: '',
        sets: '',
        reps: '',
        weight: '',
        notes: ''
    });

    // Fetch exercise library
    useEffect(() => {
        const fetchExercises = async () => {
            try {
                const exercises = await exerciseLibraryService.getExercises();
                setExerciseLibrary(exercises);
            } catch (error) {
                console.error('Failed to fetch exercise library', error);
                alert('Failed to load exercise library. Please try again later.');
            }
        };
    
        fetchExercises();
    }, []);

    const handleWorkoutChange = (e) => {
        const { name, value } = e.target;
        setWorkoutData(prev => ({
            ...prev,
            [name]: value,
            // Reset workout name if type changes from Custom
            ...(name === 'workout_type' && value !== 'Custom' ? { workout_name: '' } : {})
        }));
    };

    const handleExerciseChange = (e) => {
        const { name, value } = e.target;
        setCurrentExercise(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const addExercise = () => {
        if (currentExercise.exercise_id) {
            const selectedExercise = exerciseLibrary.find(
                ex => ex.exercise_id === parseInt(currentExercise.exercise_id)
            );

            setWorkoutData(prev => ({
                ...prev,
                exercises: [...prev.exercises, {
                    ...currentExercise,
                    exercise_name: selectedExercise.name
                }]
            }));
            
            // Reset current exercise
            setCurrentExercise({
                exercise_id: '',
                sets: '',
                reps: '',
                weight: '',
                notes: ''
            });
        }
    };

    const removeExercise = (index) => {
        setWorkoutData(prev => ({
            ...prev,
            exercises: prev.exercises.filter((_, i) => i !== index)
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Validation
        const errors = [];
        if (!workoutData.workout_type) {
            errors.push('Workout type is required');
        }
        if (workoutData.workout_type === 'Custom' && !workoutData.workout_name.trim()) {
            errors.push('Custom workout name is required');
        }
        if (!workoutData.date) {
            errors.push('Date is required');
        }
        if (workoutData.exercises.length === 0) {
            errors.push('Please add at least one exercise');
        }
        
        // Show errors if any
        if (errors.length > 0) {
            alert(errors.join('\n'));
            return;
        }

        try {
            // Prepare workout data for submission
            const submissionData = {
                ...workoutData,
                total_duration: workoutData.total_duration || null,
                total_calories_burned: workoutData.total_calories_burned || null,
                notes: workoutData.notes || null,
                // Use workout_type or workout_name depending on the type
                workout_name: workoutData.workout_type === 'Custom' 
                    ? workoutData.workout_name 
                    : workoutData.workout_type
            };

            const response = await workoutService.logWorkout(submissionData);
            
            alert('Workout logged successfully!');
            
            // Reset form
            setWorkoutData({
                workout_type: '',
                workout_name: '',
                date: new Date().toISOString().split('T')[0],
                total_duration: '',
                total_calories_burned: '',
                notes: '',
                exercises: []
            });
        } catch (error) {
            console.error('Workout logging error:', error);
            alert(`Failed to log workout: ${error.message}`);
        }
    };

    return (
        <div className="workout-logging">
            <h1>Log Workout</h1>
            <form onSubmit={handleSubmit}>
                {/* Workout Type Selection */}
                <div className="form-group">
                    <label>Workout Type *</label>
                    <select
                        name="workout_type"
                        value={workoutData.workout_type}
                        onChange={handleWorkoutChange}
                        required
                    >
                        <option value="">Select Workout Type</option>
                        {workoutTypes.map(type => (
                            <option key={type} value={type}>{type}</option>
                        ))}
                    </select>
                </div>

                {/* Custom Workout Name (conditionally rendered) */}
                {workoutData.workout_type === 'Custom' && (
                    <div className="form-group">
                        <label>Custom Workout Name *</label>
                        <input
                            type="text"
                            name="workout_name"
                            value={workoutData.workout_name}
                            onChange={handleWorkoutChange}
                            placeholder="Enter custom workout name"
                            required
                        />
                    </div>
                )}

                {/* Date */}
                <div className="form-group">
                    <label>Date *</label>
                    <input
                        type="date"
                        name="date"
                        value={workoutData.date}
                        onChange={handleWorkoutChange}
                        required
                    />
                </div>

                {/* Duration */}
                <div className="form-group">
                    <label>Total Duration (minutes)</label>
                    <input
                        type="number"
                        name="total_duration"
                        value={workoutData.total_duration}
                        onChange={handleWorkoutChange}
                        placeholder="Enter total workout duration"
                        min="0"
                    />
                </div>

                {/* Calories Burned */}
                <div className="form-group">
                    <label>Calories Burned</label>
                    <input
                        type="number"
                        name="total_calories_burned"
                        value={workoutData.total_calories_burned}
                        onChange={handleWorkoutChange}
                        placeholder="Enter total calories burned"
                        min="0"
                    />
                </div>

                {/* Workout Notes */}
                <div className="form-group">
                    <label>Workout Notes</label>
                    <textarea
                        name="notes"
                        value={workoutData.notes}
                        onChange={handleWorkoutChange}
                        placeholder="Additional notes about the workout"
                    />
                </div>

                {/* Exercise Selection Section */}
                <div className="exercises-section">
                    <h2>Exercises</h2>
                    {workoutData.exercises.map((exercise, index) => (
                        <div key={index} className="exercise-item">
                            <span>{exercise.exercise_name}</span>
                            <span>{exercise.sets} sets</span>
                            <span>{exercise.reps} reps</span>
                            <button 
                                type="button" 
                                onClick={() => removeExercise(index)}
                            >
                                Remove
                            </button>
                        </div>
                    ))}

                    {/* Add Exercise Form */}
                    <div className="add-exercise-form">
                        <select
                            name="exercise_id"
                            value={currentExercise.exercise_id}
                            onChange={handleExerciseChange}
                        >
                            <option value="">Select Exercise</option>
                            {exerciseLibrary.map(exercise => (
                                <option 
                                    key={exercise.exercise_id} 
                                    value={exercise.exercise_id}
                                >
                                    {exercise.name}
                                </option>
                            ))}
                        </select>
                        <input
                            type="number"
                            name="sets"
                            placeholder="Sets"
                            value={currentExercise.sets}
                            onChange={handleExerciseChange}
                        />
                        <input
                            type="number"
                            name="reps"
                            placeholder="Reps"
                            value={currentExercise.reps}
                            onChange={handleExerciseChange}
                        />
                        <input
                            type="number"
                            name="weight"
                            placeholder="Weight (optional)"
                            value={currentExercise.weight}
                            onChange={handleExerciseChange}
                        />
                        <button 
                            type="button" 
                            onClick={addExercise}
                        >
                            Add Exercise
                        </button>
                    </div>
                </div>

                {/* Submit Button */}
                <button type="submit" className="submit-workout">
                    Log Workout
                </button>
            </form>
        </div>
    );
}

export default WorkoutLogging;
