--
-- PostgreSQL database dump
--

-- Dumped from database version 17.2
-- Dumped by pg_dump version 17.2

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Data for Name: equipment; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.equipment (equipment_id, name) VALUES (1, 'Cable Machine');
INSERT INTO public.equipment (equipment_id, name) VALUES (2, 'Weight Plate');
INSERT INTO public.equipment (equipment_id, name) VALUES (3, 'Resistance Band or Doorway');
INSERT INTO public.equipment (equipment_id, name) VALUES (4, 'Dumbbells');
INSERT INTO public.equipment (equipment_id, name) VALUES (5, 'Machine');
INSERT INTO public.equipment (equipment_id, name) VALUES (6, 'Barbell or Dumbbells');
INSERT INTO public.equipment (equipment_id, name) VALUES (7, 'Bench or Step');
INSERT INTO public.equipment (equipment_id, name) VALUES (8, 'Jump Rope');
INSERT INTO public.equipment (equipment_id, name) VALUES (9, 'Bodyweight');
INSERT INTO public.equipment (equipment_id, name) VALUES (10, 'Foam Roller');
INSERT INTO public.equipment (equipment_id, name) VALUES (11, 'Ropes');
INSERT INTO public.equipment (equipment_id, name) VALUES (12, 'Barbell');
INSERT INTO public.equipment (equipment_id, name) VALUES (13, 'Barbell or Bodyweight');
INSERT INTO public.equipment (equipment_id, name) VALUES (14, 'Yoga Mat');
INSERT INTO public.equipment (equipment_id, name) VALUES (15, 'Bicycle');
INSERT INTO public.equipment (equipment_id, name) VALUES (16, 'Dumbbell');
INSERT INTO public.equipment (equipment_id, name) VALUES (17, 'Box');
INSERT INTO public.equipment (equipment_id, name) VALUES (18, 'Bodyweight or Dumbbell');
INSERT INTO public.equipment (equipment_id, name) VALUES (19, 'Running Shoes');
INSERT INTO public.equipment (equipment_id, name) VALUES (20, 'Medicine Ball');


--
-- Data for Name: exercises; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.exercises (exercise_id, name, description, difficulty, instructions, image_url, video_url) VALUES (1, 'Bench Press', 'Classic compound exercise for chest development', 'Intermediate', 'Lie on bench, grip barbell slightly wider than shoulders, lower to chest, press up', NULL, NULL);
INSERT INTO public.exercises (exercise_id, name, description, difficulty, instructions, image_url, video_url) VALUES (2, 'Push-Ups', 'Fundamental bodyweight exercise for upper body strength', 'Beginner', 'Start in plank position, lower chest to ground, push back up', NULL, NULL);
INSERT INTO public.exercises (exercise_id, name, description, difficulty, instructions, image_url, video_url) VALUES (3, 'Dumbbell Flyes', 'Isolation exercise for chest', 'Intermediate', 'Lie on bench, arms extended with dumbbells, lower weights in arc motion, raise back up', NULL, NULL);
INSERT INTO public.exercises (exercise_id, name, description, difficulty, instructions, image_url, video_url) VALUES (4, 'Incline Bench Press', 'Upper chest focused pressing movement', 'Intermediate', 'Lie on incline bench, press barbell from chest to ceiling', NULL, NULL);
INSERT INTO public.exercises (exercise_id, name, description, difficulty, instructions, image_url, video_url) VALUES (5, 'Pull-Ups', 'Compound exercise for back and biceps', 'Intermediate', 'Hang from bar, pull body up until chin over bar', NULL, NULL);
INSERT INTO public.exercises (exercise_id, name, description, difficulty, instructions, image_url, video_url) VALUES (6, 'Bent-Over Rows', 'Builds overall back thickness', 'Intermediate', 'Bend at hips, pull barbell to lower chest', NULL, NULL);
INSERT INTO public.exercises (exercise_id, name, description, difficulty, instructions, image_url, video_url) VALUES (7, 'Lat Pulldowns', 'Great for developing back width', 'Beginner', 'Sit at machine, pull bar to upper chest', NULL, NULL);
INSERT INTO public.exercises (exercise_id, name, description, difficulty, instructions, image_url, video_url) VALUES (8, 'Deadlift', 'Full body pulling movement', 'Advanced', 'Stand with feet shoulder width, bend and grip bar, lift by extending hips and knees', NULL, NULL);
INSERT INTO public.exercises (exercise_id, name, description, difficulty, instructions, image_url, video_url) VALUES (9, 'Overhead Press', 'Primary shoulder building exercise', 'Intermediate', 'Stand with barbell at shoulders, press overhead', NULL, NULL);
INSERT INTO public.exercises (exercise_id, name, description, difficulty, instructions, image_url, video_url) VALUES (10, 'Lateral Raises', 'Builds shoulder width', 'Beginner', 'Stand with dumbbells at sides, raise arms to shoulder level', NULL, NULL);
INSERT INTO public.exercises (exercise_id, name, description, difficulty, instructions, image_url, video_url) VALUES (11, 'Face Pulls', 'Rear deltoid and upper back exercise', 'Beginner', 'Pull rope attachment to face level with elbows high', NULL, NULL);
INSERT INTO public.exercises (exercise_id, name, description, difficulty, instructions, image_url, video_url) VALUES (12, 'Arnold Press', 'Complete shoulder development exercise', 'Intermediate', 'Press dumbbells overhead while rotating palms', NULL, NULL);
INSERT INTO public.exercises (exercise_id, name, description, difficulty, instructions, image_url, video_url) VALUES (14, 'Hammer Curls', 'Targets outer bicep and forearms', 'Beginner', 'Curl dumbbells with palms facing each other', NULL, NULL);
INSERT INTO public.exercises (exercise_id, name, description, difficulty, instructions, image_url, video_url) VALUES (15, 'Preacher Curls', 'Isolated bicep exercise', 'Intermediate', 'Curl weight while arms rest on preacher bench', NULL, NULL);
INSERT INTO public.exercises (exercise_id, name, description, difficulty, instructions, image_url, video_url) VALUES (16, 'Chin-Ups', 'Compound bicep and back exercise', 'Intermediate', 'Pull up on bar with palms facing you', NULL, NULL);
INSERT INTO public.exercises (exercise_id, name, description, difficulty, instructions, image_url, video_url) VALUES (17, 'Tricep Pushdowns', 'Isolation exercise for triceps', 'Beginner', 'Push cable attachment down with elbows at sides', NULL, NULL);
INSERT INTO public.exercises (exercise_id, name, description, difficulty, instructions, image_url, video_url) VALUES (18, 'Skull Crushers', 'Builds tricep mass', 'Intermediate', 'Lie on bench, lower weight to forehead, extend arms', NULL, NULL);
INSERT INTO public.exercises (exercise_id, name, description, difficulty, instructions, image_url, video_url) VALUES (19, 'Diamond Push-Ups', 'Bodyweight tricep exercise', 'Intermediate', 'Push-ups with hands close together', NULL, NULL);
INSERT INTO public.exercises (exercise_id, name, description, difficulty, instructions, image_url, video_url) VALUES (20, 'Overhead Extensions', 'Stretches and strengthens triceps', 'Beginner', 'Hold weight overhead, lower behind head, extend', NULL, NULL);
INSERT INTO public.exercises (exercise_id, name, description, difficulty, instructions, image_url, video_url) VALUES (21, 'Squats', 'Fundamental leg building exercise', 'Intermediate', 'Stand with barbell on shoulders, bend knees and hips, return to standing', NULL, NULL);
INSERT INTO public.exercises (exercise_id, name, description, difficulty, instructions, image_url, video_url) VALUES (22, 'Leg Press', 'Heavy compound leg exercise', 'Beginner', 'Push weight away while seated in machine', NULL, NULL);
INSERT INTO public.exercises (exercise_id, name, description, difficulty, instructions, image_url, video_url) VALUES (23, 'Lunges', 'Unilateral leg development', 'Beginner', 'Step forward, lower back knee to ground, alternate legs', NULL, NULL);
INSERT INTO public.exercises (exercise_id, name, description, difficulty, instructions, image_url, video_url) VALUES (24, 'Leg Extensions', 'Isolation exercise for quads', 'Beginner', 'Sit in machine, extend legs against resistance', NULL, NULL);
INSERT INTO public.exercises (exercise_id, name, description, difficulty, instructions, image_url, video_url) VALUES (25, 'Romanian Deadlift', 'Posterior chain development', 'Intermediate', 'Hold bar in front, bend at hips keeping legs straight', NULL, NULL);
INSERT INTO public.exercises (exercise_id, name, description, difficulty, instructions, image_url, video_url) VALUES (26, 'Leg Curls', 'Isolation exercise for hamstrings', 'Beginner', 'Lie on machine, curl legs against resistance', NULL, NULL);
INSERT INTO public.exercises (exercise_id, name, description, difficulty, instructions, image_url, video_url) VALUES (27, 'Good Mornings', 'Strengthens lower back and hamstrings', 'Intermediate', 'Bar on shoulders, bend at hips keeping back straight', NULL, NULL);
INSERT INTO public.exercises (exercise_id, name, description, difficulty, instructions, image_url, video_url) VALUES (28, 'Standing Calf Raises', 'Basic calf building exercise', 'Beginner', 'Stand on edge of platform, raise heels', NULL, NULL);
INSERT INTO public.exercises (exercise_id, name, description, difficulty, instructions, image_url, video_url) VALUES (29, 'Seated Calf Raises', 'Isolation for calf muscles', 'Beginner', 'Sit at machine, raise heels against weight', NULL, NULL);
INSERT INTO public.exercises (exercise_id, name, description, difficulty, instructions, image_url, video_url) VALUES (30, 'Jump Rope', 'Cardio and calf development', 'Beginner', 'Jump rope continuously', NULL, NULL);
INSERT INTO public.exercises (exercise_id, name, description, difficulty, instructions, image_url, video_url) VALUES (31, 'Crunches', 'Basic ab exercise', 'Beginner', 'Lie on back, curl upper body toward knees', NULL, NULL);
INSERT INTO public.exercises (exercise_id, name, description, difficulty, instructions, image_url, video_url) VALUES (32, 'Planks', 'Core stability exercise', 'Beginner', 'Hold push-up position with straight body', NULL, NULL);
INSERT INTO public.exercises (exercise_id, name, description, difficulty, instructions, image_url, video_url) VALUES (33, 'Russian Twists', 'Works obliques and core', 'Intermediate', 'Sit with feet off ground, twist torso side to side', NULL, NULL);
INSERT INTO public.exercises (exercise_id, name, description, difficulty, instructions, image_url, video_url) VALUES (34, 'Leg Raises', 'Lower ab focus', 'Intermediate', 'Lie on back, raise legs to vertical', NULL, NULL);
INSERT INTO public.exercises (exercise_id, name, description, difficulty, instructions, image_url, video_url) VALUES (35, 'Side Planks', 'Side core stability', 'Beginner', 'Hold side plank position', NULL, NULL);
INSERT INTO public.exercises (exercise_id, name, description, difficulty, instructions, image_url, video_url) VALUES (36, 'Wood Chops', 'Rotational core movement', 'Intermediate', 'Pull cable diagonally across body', NULL, NULL);
INSERT INTO public.exercises (exercise_id, name, description, difficulty, instructions, image_url, video_url) VALUES (37, 'Side Bends', 'Direct oblique work', 'Beginner', 'Hold weight at side, bend sideways', NULL, NULL);
INSERT INTO public.exercises (exercise_id, name, description, difficulty, instructions, image_url, video_url) VALUES (38, 'Incline Dumbbell Press', 'Targets upper chest with dumbbells', 'Intermediate', 'Lie on incline bench, press dumbbells from chest to ceiling', NULL, NULL);
INSERT INTO public.exercises (exercise_id, name, description, difficulty, instructions, image_url, video_url) VALUES (39, 'Decline Bench Press', 'Emphasizes lower chest development', 'Intermediate', 'Lie on decline bench, press barbell from chest to ceiling', NULL, NULL);
INSERT INTO public.exercises (exercise_id, name, description, difficulty, instructions, image_url, video_url) VALUES (40, 'Cable Crossovers', 'Isolation exercise for chest', 'Intermediate', 'Stand between cable machines, pull cables together in front of chest', NULL, NULL);
INSERT INTO public.exercises (exercise_id, name, description, difficulty, instructions, image_url, video_url) VALUES (41, 'T-Bar Rows', 'Targets middle back and lats', 'Intermediate', 'Bend at hips, pull T-bar to chest', NULL, NULL);
INSERT INTO public.exercises (exercise_id, name, description, difficulty, instructions, image_url, video_url) VALUES (42, 'Seated Rows', 'Develops overall back thickness', 'Beginner', 'Sit at machine, pull handle to waist', NULL, NULL);
INSERT INTO public.exercises (exercise_id, name, description, difficulty, instructions, image_url, video_url) VALUES (43, 'Front Raises', 'Targets anterior deltoids', 'Beginner', 'Stand with dumbbells at thighs, raise to shoulder level', NULL, NULL);
INSERT INTO public.exercises (exercise_id, name, description, difficulty, instructions, image_url, video_url) VALUES (44, 'Rear Delt Flyes', 'Isolates rear deltoids', 'Intermediate', 'Bend at hips, raise dumbbells to side', NULL, NULL);
INSERT INTO public.exercises (exercise_id, name, description, difficulty, instructions, image_url, video_url) VALUES (45, 'Concentration Curls', 'Focuses on peak bicep contraction', 'Beginner', 'Sit with elbow on thigh, curl dumbbell to shoulder', NULL, NULL);
INSERT INTO public.exercises (exercise_id, name, description, difficulty, instructions, image_url, video_url) VALUES (46, 'Tricep Dips', 'Bodyweight tricep exercise', 'Intermediate', 'Lower body from parallel bars, extend arms', NULL, NULL);
INSERT INTO public.exercises (exercise_id, name, description, difficulty, instructions, image_url, video_url) VALUES (47, 'Close-Grip Bench Press', 'Targets triceps and inner chest', 'Intermediate', 'Lie on bench, grip barbell shoulder-width, press to ceiling', NULL, NULL);
INSERT INTO public.exercises (exercise_id, name, description, difficulty, instructions, image_url, video_url) VALUES (49, 'Hack Squats', 'Emphasizes quadriceps', 'Intermediate', 'Stand on platform, lower body by bending knees', NULL, NULL);
INSERT INTO public.exercises (exercise_id, name, description, difficulty, instructions, image_url, video_url) VALUES (50, 'Calf Raises on Leg Press', 'Focuses on calves', 'Beginner', 'Sit in leg press, push platform with toes', NULL, NULL);
INSERT INTO public.exercises (exercise_id, name, description, difficulty, instructions, image_url, video_url) VALUES (51, 'Single-Leg Deadlift', 'Challenges balance and hamstrings', 'Intermediate', 'Stand on one leg, hold dumbbells, bend at hips', NULL, NULL);
INSERT INTO public.exercises (exercise_id, name, description, difficulty, instructions, image_url, video_url) VALUES (52, 'Glute Bridges', 'Targets glutes and lower back', 'Beginner', 'Lie on back, lift hips by squeezing glutes', NULL, NULL);
INSERT INTO public.exercises (exercise_id, name, description, difficulty, instructions, image_url, video_url) VALUES (53, 'Hanging Leg Raises', 'Focuses on lower abs', 'Intermediate', 'Hang from bar, raise legs to waist', NULL, NULL);
INSERT INTO public.exercises (exercise_id, name, description, difficulty, instructions, image_url, video_url) VALUES (13, 'Bicep Curls', 'Classic bicep building exercise', 'Beginner', 'Stand with dumbbells, curl weights to shoulders', NULL, '');
INSERT INTO public.exercises (exercise_id, name, description, difficulty, instructions, image_url, video_url) VALUES (54, 'Cable Woodchoppers', 'Rotational core exercise', 'Intermediate', 'Stand with feet shoulder-width, pull cable diagonally across body', NULL, NULL);
INSERT INTO public.exercises (exercise_id, name, description, difficulty, instructions, image_url, video_url) VALUES (55, 'Plank with Shoulder Taps', 'Stabilizes core and shoulders', 'Beginner', 'Hold plank, tap opposite shoulder with hand', NULL, NULL);
INSERT INTO public.exercises (exercise_id, name, description, difficulty, instructions, image_url, video_url) VALUES (56, 'Medicine Ball Slams', 'Explosive core and cardio workout', 'Intermediate', 'Raise ball overhead, slam to ground', NULL, NULL);
INSERT INTO public.exercises (exercise_id, name, description, difficulty, instructions, image_url, video_url) VALUES (57, 'Bicycle Crunches', 'Engages entire core', 'Beginner', 'Lie on back, alternate touching elbows to opposite knees', NULL, NULL);
INSERT INTO public.exercises (exercise_id, name, description, difficulty, instructions, image_url, video_url) VALUES (58, 'Burpees', 'Full body cardio exercise', 'Intermediate', 'Squat, jump to plank, return to squat, jump up', NULL, NULL);
INSERT INTO public.exercises (exercise_id, name, description, difficulty, instructions, image_url, video_url) VALUES (59, 'Mountain Climbers', 'Cardio and core workout', 'Beginner', 'Start in plank, alternate bringing knees to chest', NULL, NULL);
INSERT INTO public.exercises (exercise_id, name, description, difficulty, instructions, image_url, video_url) VALUES (60, 'Rowing Machine', 'Full body cardio and endurance exercise', 'Beginner', 'Sit on machine, pull handle to chest, extend legs', NULL, NULL);
INSERT INTO public.exercises (exercise_id, name, description, difficulty, instructions, image_url, video_url) VALUES (61, 'Battle Ropes', 'Intense cardio and upper body workout', 'Intermediate', 'Hold ropes, create waves by moving arms', NULL, NULL);
INSERT INTO public.exercises (exercise_id, name, description, difficulty, instructions, image_url, video_url) VALUES (62, 'Box Jumps', 'Plyometric leg and cardio exercise', 'Intermediate', 'Jump onto box, step down', NULL, NULL);
INSERT INTO public.exercises (exercise_id, name, description, difficulty, instructions, image_url, video_url) VALUES (63, 'Bulgarian Split Squat', 'Single-leg exercise for building lower body strength', 'Intermediate', 'Stand with one foot elevated behind you on a bench. Lower your body by bending both knees until the back knee nearly touches the ground. Push through the front heel to return to the starting position.', NULL, 'https://example.com/bulgarian-split-squat');
INSERT INTO public.exercises (exercise_id, name, description, difficulty, instructions, image_url, video_url) VALUES (64, 'Romanian Deadlift', 'Exercise for hamstrings and lower back', 'Intermediate', 'Hold weight in front of your thighs. Keeping a slight bend in your knees, hinge at the hips and lower the weight down your legs while maintaining a flat back. Return to standing by driving your hips forward.', NULL, 'https://example.com/romanian-deadlift');
INSERT INTO public.exercises (exercise_id, name, description, difficulty, instructions, image_url, video_url) VALUES (65, 'Full Body HIIT Workout', 'High-intensity interval training for total body fitness', 'Advanced', 'Perform a circuit of high-intensity exercises with short rest periods. Include exercises like burpees, mountain climbers, jump squats, and high knees. 40 seconds of work followed by 20 seconds of rest. Repeat for multiple rounds.', NULL, 'https://example.com/hiit-cardio');
INSERT INTO public.exercises (exercise_id, name, description, difficulty, instructions, image_url, video_url) VALUES (66, 'Steady State Running', 'Consistent-pace cardio for building endurance', 'Beginner', 'Maintain a comfortable, steady pace that allows you to hold a conversation. Focus on steady breathing, good posture, and consistent stride.', NULL, 'https://example.com/steady-state-running');
INSERT INTO public.exercises (exercise_id, name, description, difficulty, instructions, image_url, video_url) VALUES (67, 'Hip Thrusts', 'Isolated glute strengthening exercise', 'Intermediate', 'Sit on the ground with your upper back against a bench. Place a barbell or weight across your hips. Drive your hips up by squeezing your glutes, lifting your hips until your body forms a straight line from knees to shoulders.', NULL, 'https://example.com/hip-thrusts');
INSERT INTO public.exercises (exercise_id, name, description, difficulty, instructions, image_url, video_url) VALUES (68, 'Glute Bridges', 'Bodyweight exercise targeting glutes', 'Beginner', 'Lie on your back with knees bent and feet flat on the floor. Lift your hips off the ground by squeezing your glutes, creating a straight line from your knees to your shoulders.', NULL, 'https://example.com/glute-bridges');
INSERT INTO public.exercises (exercise_id, name, description, difficulty, instructions, image_url, video_url) VALUES (69, 'Lying Leg Raises', 'Exercise to strengthen hip flexors', 'Beginner', 'Lie on your back with legs straight. Keeping one leg on the ground, lift the other leg up while keeping it straight. Slowly lower back down.', NULL, 'https://example.com/lying-leg-raises');
INSERT INTO public.exercises (exercise_id, name, description, difficulty, instructions, image_url, video_url) VALUES (70, 'Standing Hip Flexor Stretch', 'Stretch and mobility exercise for hip flexors', 'Beginner', 'Step one foot forward into a lunge position. Drop your back knee towards the ground while keeping your torso upright. Feel the stretch in the front of the back leg''s hip.', NULL, 'https://example.com/hip-flexor-stretch');
INSERT INTO public.exercises (exercise_id, name, description, difficulty, instructions, image_url, video_url) VALUES (71, 'Sumo Squats', 'Wide-stance squat targeting inner thighs', 'Intermediate', 'Stand with feet wider than shoulder-width, toes pointed outward. Lower your body by bending knees and pushing hips back, keeping your chest up.', NULL, 'https://example.com/sumo-squats');
INSERT INTO public.exercises (exercise_id, name, description, difficulty, instructions, image_url, video_url) VALUES (72, 'Adductor Machine', 'Isolation exercise for inner thigh muscles', 'Beginner', 'Sit in the machine with legs spread. Bring legs together against resistance, then slowly return to starting position.', NULL, 'https://example.com/adductor-machine');
INSERT INTO public.exercises (exercise_id, name, description, difficulty, instructions, image_url, video_url) VALUES (73, 'High-Intensity Interval Training (HIIT)', 'Intense cardiovascular workout', 'Advanced', 'Alternate between high-intensity exercises like burpees, mountain climbers, and jump squats, with short rest periods. Typical format: 40 seconds of work, 20 seconds of rest.', NULL, 'https://example.com/hiit-workout');
INSERT INTO public.exercises (exercise_id, name, description, difficulty, instructions, image_url, video_url) VALUES (74, 'Cycling', 'Low-impact cardiovascular exercise', 'Beginner', 'Maintain a steady pace, adjusting resistance and speed to challenge your cardiovascular system. Can be done on a stationary bike or outdoors.', NULL, 'https://example.com/cycling');
INSERT INTO public.exercises (exercise_id, name, description, difficulty, instructions, image_url, video_url) VALUES (75, 'Full Body Stretching Routine', 'Comprehensive stretching routine for full body flexibility', 'Beginner', 'Perform a series of stretches targeting major muscle groups: hamstrings, quadriceps, back, chest, shoulders, and arms. Hold each stretch for 20-30 seconds, breathing deeply and maintaining proper form.', NULL, 'https://example.com/full-body-stretch');
INSERT INTO public.exercises (exercise_id, name, description, difficulty, instructions, image_url, video_url) VALUES (76, 'Yoga Flow', 'Dynamic yoga sequence for mobility and flexibility', 'Beginner', 'Move through a series of yoga poses including downward dog, warrior poses, sun salutations, and gentle twists. Focus on breathing and maintaining smooth transitions between poses.', NULL, 'https://example.com/yoga-flow');
INSERT INTO public.exercises (exercise_id, name, description, difficulty, instructions, image_url, video_url) VALUES (77, 'Foam Rolling', 'Self-myofascial release for muscle recovery', 'Beginner', 'Use a foam roller to apply pressure to different muscle groups. Roll slowly over each muscle group, pausing on tight or tender spots. Spend 30-60 seconds on each major muscle group.', NULL, 'https://example.com/foam-rolling');
INSERT INTO public.exercises (exercise_id, name, description, difficulty, instructions, image_url, video_url) VALUES (78, 'Dynamic Stretching Warmup', 'Active stretching routine to prepare muscles for exercise', 'Beginner', 'Perform dynamic stretches including arm circles, leg swings, walking lunges, high knees, and torso twists. Each movement should be controlled and through a full range of motion.', NULL, 'https://example.com/dynamic-stretching');
INSERT INTO public.exercises (exercise_id, name, description, difficulty, instructions, image_url, video_url) VALUES (79, 'Mobility Flow', 'Targeted mobility exercises for joint health', 'Beginner', 'Perform a series of mobility drills focusing on ankles, hips, spine, and shoulders. Include exercises like ankle circles, hip openers, cat-cow stretches, and shoulder dislocates.', NULL, 'https://example.com/mobility-flow');
INSERT INTO public.exercises (exercise_id, name, description, difficulty, instructions, image_url, video_url) VALUES (80, 'Hamstring Stretch', 'Deep stretch for back of thigh muscles', 'Beginner', 'Sit on the ground with one leg extended, reach forward towards your toes. Keep your back straight and hold the stretch. Repeat on both sides. Aim to feel a gentle pull in the back of your leg without pain.', NULL, 'https://example.com/hamstring-stretch');
INSERT INTO public.exercises (exercise_id, name, description, difficulty, instructions, image_url, video_url) VALUES (81, 'Chest and Shoulder Opener', 'Stretch to improve upper body flexibility', 'Beginner', 'Stand in a doorway or use a resistance band. Extend arms out to the sides and gently stretch, opening up the chest and shoulders. Hold the position, focusing on breathing and feeling the stretch across the chest.', NULL, 'https://example.com/chest-shoulder-stretch');
INSERT INTO public.exercises (exercise_id, name, description, difficulty, instructions, image_url, video_url) VALUES (82, 'Pigeon Pose', 'Hip and lower back flexibility stretch', 'Intermediate', 'Start in a plank position, bring one knee forward towards the same-side wrist. Extend the other leg back. Lower your hips and upper body, feeling a deep stretch in the hip and glute of the bent leg.', NULL, 'https://example.com/pigeon-pose');
INSERT INTO public.exercises (exercise_id, name, description, difficulty, instructions, image_url, video_url) VALUES (83, 'Spinal Twist', 'Stretch for spine and core mobility', 'Beginner', 'Lie on your back, bring knees to chest. Extend arms out to the sides. Slowly lower knees to one side while keeping shoulders flat on the ground. Turn head in opposite direction. Hold and breathe, then switch sides.', NULL, 'https://example.com/spinal-twist');
INSERT INTO public.exercises (exercise_id, name, description, difficulty, instructions, image_url, video_url) VALUES (84, 'Quad and Hip Flexor Stretch', 'Stretching for front of thigh and hip', 'Beginner', 'Kneel on one knee, other foot forward in a lunge position. Push hips forward while keeping upper body straight. You should feel a stretch in the front of the back leg''s hip and thigh. Hold, then switch sides.', NULL, 'https://example.com/quad-hip-flexor-stretch');


--
-- Data for Name: exercise_equipment; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.exercise_equipment (exercise_id, equipment_id) VALUES (1, 12);
INSERT INTO public.exercise_equipment (exercise_id, equipment_id) VALUES (2, 9);
INSERT INTO public.exercise_equipment (exercise_id, equipment_id) VALUES (3, 4);
INSERT INTO public.exercise_equipment (exercise_id, equipment_id) VALUES (4, 12);
INSERT INTO public.exercise_equipment (exercise_id, equipment_id) VALUES (5, 9);
INSERT INTO public.exercise_equipment (exercise_id, equipment_id) VALUES (6, 12);
INSERT INTO public.exercise_equipment (exercise_id, equipment_id) VALUES (7, 1);
INSERT INTO public.exercise_equipment (exercise_id, equipment_id) VALUES (8, 12);
INSERT INTO public.exercise_equipment (exercise_id, equipment_id) VALUES (9, 12);
INSERT INTO public.exercise_equipment (exercise_id, equipment_id) VALUES (10, 4);
INSERT INTO public.exercise_equipment (exercise_id, equipment_id) VALUES (11, 1);
INSERT INTO public.exercise_equipment (exercise_id, equipment_id) VALUES (12, 4);
INSERT INTO public.exercise_equipment (exercise_id, equipment_id) VALUES (14, 4);
INSERT INTO public.exercise_equipment (exercise_id, equipment_id) VALUES (15, 12);
INSERT INTO public.exercise_equipment (exercise_id, equipment_id) VALUES (16, 9);
INSERT INTO public.exercise_equipment (exercise_id, equipment_id) VALUES (17, 1);
INSERT INTO public.exercise_equipment (exercise_id, equipment_id) VALUES (18, 12);
INSERT INTO public.exercise_equipment (exercise_id, equipment_id) VALUES (19, 9);
INSERT INTO public.exercise_equipment (exercise_id, equipment_id) VALUES (20, 16);
INSERT INTO public.exercise_equipment (exercise_id, equipment_id) VALUES (21, 12);
INSERT INTO public.exercise_equipment (exercise_id, equipment_id) VALUES (22, 5);
INSERT INTO public.exercise_equipment (exercise_id, equipment_id) VALUES (23, 4);
INSERT INTO public.exercise_equipment (exercise_id, equipment_id) VALUES (24, 5);
INSERT INTO public.exercise_equipment (exercise_id, equipment_id) VALUES (25, 12);
INSERT INTO public.exercise_equipment (exercise_id, equipment_id) VALUES (26, 5);
INSERT INTO public.exercise_equipment (exercise_id, equipment_id) VALUES (27, 12);
INSERT INTO public.exercise_equipment (exercise_id, equipment_id) VALUES (28, 5);
INSERT INTO public.exercise_equipment (exercise_id, equipment_id) VALUES (29, 5);
INSERT INTO public.exercise_equipment (exercise_id, equipment_id) VALUES (30, 8);
INSERT INTO public.exercise_equipment (exercise_id, equipment_id) VALUES (31, 9);
INSERT INTO public.exercise_equipment (exercise_id, equipment_id) VALUES (32, 9);
INSERT INTO public.exercise_equipment (exercise_id, equipment_id) VALUES (33, 2);
INSERT INTO public.exercise_equipment (exercise_id, equipment_id) VALUES (34, 9);
INSERT INTO public.exercise_equipment (exercise_id, equipment_id) VALUES (35, 9);
INSERT INTO public.exercise_equipment (exercise_id, equipment_id) VALUES (36, 1);
INSERT INTO public.exercise_equipment (exercise_id, equipment_id) VALUES (37, 16);
INSERT INTO public.exercise_equipment (exercise_id, equipment_id) VALUES (38, 4);
INSERT INTO public.exercise_equipment (exercise_id, equipment_id) VALUES (39, 12);
INSERT INTO public.exercise_equipment (exercise_id, equipment_id) VALUES (40, 1);
INSERT INTO public.exercise_equipment (exercise_id, equipment_id) VALUES (41, 12);
INSERT INTO public.exercise_equipment (exercise_id, equipment_id) VALUES (42, 1);
INSERT INTO public.exercise_equipment (exercise_id, equipment_id) VALUES (43, 4);
INSERT INTO public.exercise_equipment (exercise_id, equipment_id) VALUES (44, 4);
INSERT INTO public.exercise_equipment (exercise_id, equipment_id) VALUES (45, 4);
INSERT INTO public.exercise_equipment (exercise_id, equipment_id) VALUES (46, 9);
INSERT INTO public.exercise_equipment (exercise_id, equipment_id) VALUES (47, 12);
INSERT INTO public.exercise_equipment (exercise_id, equipment_id) VALUES (49, 5);
INSERT INTO public.exercise_equipment (exercise_id, equipment_id) VALUES (50, 5);
INSERT INTO public.exercise_equipment (exercise_id, equipment_id) VALUES (51, 4);
INSERT INTO public.exercise_equipment (exercise_id, equipment_id) VALUES (52, 9);
INSERT INTO public.exercise_equipment (exercise_id, equipment_id) VALUES (53, 9);
INSERT INTO public.exercise_equipment (exercise_id, equipment_id) VALUES (54, 1);
INSERT INTO public.exercise_equipment (exercise_id, equipment_id) VALUES (55, 9);
INSERT INTO public.exercise_equipment (exercise_id, equipment_id) VALUES (56, 20);
INSERT INTO public.exercise_equipment (exercise_id, equipment_id) VALUES (57, 9);
INSERT INTO public.exercise_equipment (exercise_id, equipment_id) VALUES (58, 9);
INSERT INTO public.exercise_equipment (exercise_id, equipment_id) VALUES (59, 9);
INSERT INTO public.exercise_equipment (exercise_id, equipment_id) VALUES (60, 5);
INSERT INTO public.exercise_equipment (exercise_id, equipment_id) VALUES (61, 11);
INSERT INTO public.exercise_equipment (exercise_id, equipment_id) VALUES (62, 17);
INSERT INTO public.exercise_equipment (exercise_id, equipment_id) VALUES (63, 7);
INSERT INTO public.exercise_equipment (exercise_id, equipment_id) VALUES (64, 6);
INSERT INTO public.exercise_equipment (exercise_id, equipment_id) VALUES (65, 9);
INSERT INTO public.exercise_equipment (exercise_id, equipment_id) VALUES (66, 19);
INSERT INTO public.exercise_equipment (exercise_id, equipment_id) VALUES (67, 13);
INSERT INTO public.exercise_equipment (exercise_id, equipment_id) VALUES (68, 9);
INSERT INTO public.exercise_equipment (exercise_id, equipment_id) VALUES (69, 9);
INSERT INTO public.exercise_equipment (exercise_id, equipment_id) VALUES (70, 9);
INSERT INTO public.exercise_equipment (exercise_id, equipment_id) VALUES (71, 18);
INSERT INTO public.exercise_equipment (exercise_id, equipment_id) VALUES (72, 5);
INSERT INTO public.exercise_equipment (exercise_id, equipment_id) VALUES (73, 9);
INSERT INTO public.exercise_equipment (exercise_id, equipment_id) VALUES (74, 15);
INSERT INTO public.exercise_equipment (exercise_id, equipment_id) VALUES (75, 9);
INSERT INTO public.exercise_equipment (exercise_id, equipment_id) VALUES (76, 14);
INSERT INTO public.exercise_equipment (exercise_id, equipment_id) VALUES (77, 10);
INSERT INTO public.exercise_equipment (exercise_id, equipment_id) VALUES (78, 9);
INSERT INTO public.exercise_equipment (exercise_id, equipment_id) VALUES (79, 9);
INSERT INTO public.exercise_equipment (exercise_id, equipment_id) VALUES (80, 9);
INSERT INTO public.exercise_equipment (exercise_id, equipment_id) VALUES (81, 3);
INSERT INTO public.exercise_equipment (exercise_id, equipment_id) VALUES (82, 14);
INSERT INTO public.exercise_equipment (exercise_id, equipment_id) VALUES (83, 9);
INSERT INTO public.exercise_equipment (exercise_id, equipment_id) VALUES (84, 9);
INSERT INTO public.exercise_equipment (exercise_id, equipment_id) VALUES (13, 4);
INSERT INTO public.exercise_equipment (exercise_id, equipment_id) VALUES (13, 12);


--
-- Data for Name: muscle_groups; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.muscle_groups (group_id, name, description) VALUES (1, 'Upper Body', 'Muscles in the upper portion of the body');
INSERT INTO public.muscle_groups (group_id, name, description) VALUES (2, 'Lower Body', 'Muscles in the lower portion of the body');
INSERT INTO public.muscle_groups (group_id, name, description) VALUES (3, 'Core', 'Abdominal and lower back muscles');
INSERT INTO public.muscle_groups (group_id, name, description) VALUES (4, 'Cardiovascular', 'Muscles and systems involved in cardiovascular endurance');
INSERT INTO public.muscle_groups (group_id, name, description) VALUES (5, 'Recovery', 'Muscles and techniques focused on mobility, flexibility, and recovery');


--
-- Data for Name: muscles; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.muscles (muscle_id, group_id, name, description) VALUES (1, 1, 'Chest', 'Pectoralis major and minor muscles');
INSERT INTO public.muscles (muscle_id, group_id, name, description) VALUES (2, 1, 'Back', 'Latissimus dorsi and rhomboids');
INSERT INTO public.muscles (muscle_id, group_id, name, description) VALUES (3, 1, 'Shoulders', 'Deltoid muscles');
INSERT INTO public.muscles (muscle_id, group_id, name, description) VALUES (4, 1, 'Biceps', 'Front of upper arm');
INSERT INTO public.muscles (muscle_id, group_id, name, description) VALUES (5, 1, 'Triceps', 'Back of upper arm');
INSERT INTO public.muscles (muscle_id, group_id, name, description) VALUES (6, 2, 'Quadriceps', 'Front of thigh');
INSERT INTO public.muscles (muscle_id, group_id, name, description) VALUES (7, 2, 'Hamstrings', 'Back of thigh');
INSERT INTO public.muscles (muscle_id, group_id, name, description) VALUES (8, 2, 'Calves', 'Lower leg muscles');
INSERT INTO public.muscles (muscle_id, group_id, name, description) VALUES (9, 3, 'Abs', 'Rectus abdominis');
INSERT INTO public.muscles (muscle_id, group_id, name, description) VALUES (10, 3, 'Obliques', 'Side abdominal muscles');
INSERT INTO public.muscles (muscle_id, group_id, name, description) VALUES (11, 2, 'Glutes', 'Buttock muscles');
INSERT INTO public.muscles (muscle_id, group_id, name, description) VALUES (12, 2, 'Hip Flexors', 'Muscles around the hip joint');
INSERT INTO public.muscles (muscle_id, group_id, name, description) VALUES (13, 2, 'Adductors', 'Inner thigh muscles');
INSERT INTO public.muscles (muscle_id, group_id, name, description) VALUES (14, 4, 'Cardiovascular Endurance', 'Muscles with high aerobic capacity');
INSERT INTO public.muscles (muscle_id, group_id, name, description) VALUES (15, 4, 'Cardiovascular System', 'Full body cardiovascular muscles');
INSERT INTO public.muscles (muscle_id, group_id, name, description) VALUES (16, 5, 'Mobility', 'Muscles and joints involved in movement and flexibility');
INSERT INTO public.muscles (muscle_id, group_id, name, description) VALUES (17, 5, 'Stretching', 'Muscles targeted during stretching and flexibility work');


--
-- Data for Name: exercise_muscles; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.exercise_muscles (exercise_id, muscle_id, is_primary) VALUES (1, 1, true);
INSERT INTO public.exercise_muscles (exercise_id, muscle_id, is_primary) VALUES (2, 1, true);
INSERT INTO public.exercise_muscles (exercise_id, muscle_id, is_primary) VALUES (5, 2, true);
INSERT INTO public.exercise_muscles (exercise_id, muscle_id, is_primary) VALUES (21, 6, true);
INSERT INTO public.exercise_muscles (exercise_id, muscle_id, is_primary) VALUES (8, 7, true);
INSERT INTO public.exercise_muscles (exercise_id, muscle_id, is_primary) VALUES (3, 1, true);
INSERT INTO public.exercise_muscles (exercise_id, muscle_id, is_primary) VALUES (4, 1, true);
INSERT INTO public.exercise_muscles (exercise_id, muscle_id, is_primary) VALUES (6, 2, true);
INSERT INTO public.exercise_muscles (exercise_id, muscle_id, is_primary) VALUES (7, 2, true);
INSERT INTO public.exercise_muscles (exercise_id, muscle_id, is_primary) VALUES (8, 2, true);
INSERT INTO public.exercise_muscles (exercise_id, muscle_id, is_primary) VALUES (9, 3, true);
INSERT INTO public.exercise_muscles (exercise_id, muscle_id, is_primary) VALUES (10, 3, true);
INSERT INTO public.exercise_muscles (exercise_id, muscle_id, is_primary) VALUES (11, 3, true);
INSERT INTO public.exercise_muscles (exercise_id, muscle_id, is_primary) VALUES (12, 3, true);
INSERT INTO public.exercise_muscles (exercise_id, muscle_id, is_primary) VALUES (14, 4, true);
INSERT INTO public.exercise_muscles (exercise_id, muscle_id, is_primary) VALUES (15, 4, true);
INSERT INTO public.exercise_muscles (exercise_id, muscle_id, is_primary) VALUES (16, 4, true);
INSERT INTO public.exercise_muscles (exercise_id, muscle_id, is_primary) VALUES (17, 5, true);
INSERT INTO public.exercise_muscles (exercise_id, muscle_id, is_primary) VALUES (18, 5, true);
INSERT INTO public.exercise_muscles (exercise_id, muscle_id, is_primary) VALUES (19, 5, true);
INSERT INTO public.exercise_muscles (exercise_id, muscle_id, is_primary) VALUES (20, 5, true);
INSERT INTO public.exercise_muscles (exercise_id, muscle_id, is_primary) VALUES (22, 6, true);
INSERT INTO public.exercise_muscles (exercise_id, muscle_id, is_primary) VALUES (23, 6, true);
INSERT INTO public.exercise_muscles (exercise_id, muscle_id, is_primary) VALUES (24, 6, true);
INSERT INTO public.exercise_muscles (exercise_id, muscle_id, is_primary) VALUES (25, 7, true);
INSERT INTO public.exercise_muscles (exercise_id, muscle_id, is_primary) VALUES (26, 7, true);
INSERT INTO public.exercise_muscles (exercise_id, muscle_id, is_primary) VALUES (27, 7, true);
INSERT INTO public.exercise_muscles (exercise_id, muscle_id, is_primary) VALUES (28, 8, true);
INSERT INTO public.exercise_muscles (exercise_id, muscle_id, is_primary) VALUES (29, 8, true);
INSERT INTO public.exercise_muscles (exercise_id, muscle_id, is_primary) VALUES (30, 8, true);
INSERT INTO public.exercise_muscles (exercise_id, muscle_id, is_primary) VALUES (31, 9, true);
INSERT INTO public.exercise_muscles (exercise_id, muscle_id, is_primary) VALUES (32, 9, true);
INSERT INTO public.exercise_muscles (exercise_id, muscle_id, is_primary) VALUES (33, 9, true);
INSERT INTO public.exercise_muscles (exercise_id, muscle_id, is_primary) VALUES (34, 9, true);
INSERT INTO public.exercise_muscles (exercise_id, muscle_id, is_primary) VALUES (35, 10, true);
INSERT INTO public.exercise_muscles (exercise_id, muscle_id, is_primary) VALUES (36, 10, true);
INSERT INTO public.exercise_muscles (exercise_id, muscle_id, is_primary) VALUES (37, 10, true);
INSERT INTO public.exercise_muscles (exercise_id, muscle_id, is_primary) VALUES (38, 1, true);
INSERT INTO public.exercise_muscles (exercise_id, muscle_id, is_primary) VALUES (39, 1, true);
INSERT INTO public.exercise_muscles (exercise_id, muscle_id, is_primary) VALUES (40, 1, true);
INSERT INTO public.exercise_muscles (exercise_id, muscle_id, is_primary) VALUES (41, 2, true);
INSERT INTO public.exercise_muscles (exercise_id, muscle_id, is_primary) VALUES (42, 2, true);
INSERT INTO public.exercise_muscles (exercise_id, muscle_id, is_primary) VALUES (43, 3, true);
INSERT INTO public.exercise_muscles (exercise_id, muscle_id, is_primary) VALUES (44, 3, true);
INSERT INTO public.exercise_muscles (exercise_id, muscle_id, is_primary) VALUES (45, 4, true);
INSERT INTO public.exercise_muscles (exercise_id, muscle_id, is_primary) VALUES (46, 5, true);
INSERT INTO public.exercise_muscles (exercise_id, muscle_id, is_primary) VALUES (47, 5, true);
INSERT INTO public.exercise_muscles (exercise_id, muscle_id, is_primary) VALUES (49, 6, true);
INSERT INTO public.exercise_muscles (exercise_id, muscle_id, is_primary) VALUES (50, 8, true);
INSERT INTO public.exercise_muscles (exercise_id, muscle_id, is_primary) VALUES (51, 7, true);
INSERT INTO public.exercise_muscles (exercise_id, muscle_id, is_primary) VALUES (53, 9, true);
INSERT INTO public.exercise_muscles (exercise_id, muscle_id, is_primary) VALUES (54, 10, true);
INSERT INTO public.exercise_muscles (exercise_id, muscle_id, is_primary) VALUES (57, 9, true);
INSERT INTO public.exercise_muscles (exercise_id, muscle_id, is_primary) VALUES (63, 6, true);
INSERT INTO public.exercise_muscles (exercise_id, muscle_id, is_primary) VALUES (64, 7, true);
INSERT INTO public.exercise_muscles (exercise_id, muscle_id, is_primary) VALUES (52, 11, true);
INSERT INTO public.exercise_muscles (exercise_id, muscle_id, is_primary) VALUES (67, 11, true);
INSERT INTO public.exercise_muscles (exercise_id, muscle_id, is_primary) VALUES (68, 11, true);
INSERT INTO public.exercise_muscles (exercise_id, muscle_id, is_primary) VALUES (69, 12, true);
INSERT INTO public.exercise_muscles (exercise_id, muscle_id, is_primary) VALUES (70, 12, true);
INSERT INTO public.exercise_muscles (exercise_id, muscle_id, is_primary) VALUES (71, 13, true);
INSERT INTO public.exercise_muscles (exercise_id, muscle_id, is_primary) VALUES (72, 13, true);
INSERT INTO public.exercise_muscles (exercise_id, muscle_id, is_primary) VALUES (73, 15, true);
INSERT INTO public.exercise_muscles (exercise_id, muscle_id, is_primary) VALUES (74, 15, true);
INSERT INTO public.exercise_muscles (exercise_id, muscle_id, is_primary) VALUES (21, 11, true);
INSERT INTO public.exercise_muscles (exercise_id, muscle_id, is_primary) VALUES (49, 11, true);
INSERT INTO public.exercise_muscles (exercise_id, muscle_id, is_primary) VALUES (63, 11, true);
INSERT INTO public.exercise_muscles (exercise_id, muscle_id, is_primary) VALUES (23, 12, true);
INSERT INTO public.exercise_muscles (exercise_id, muscle_id, is_primary) VALUES (63, 13, true);
INSERT INTO public.exercise_muscles (exercise_id, muscle_id, is_primary) VALUES (58, 15, true);
INSERT INTO public.exercise_muscles (exercise_id, muscle_id, is_primary) VALUES (59, 15, true);
INSERT INTO public.exercise_muscles (exercise_id, muscle_id, is_primary) VALUES (60, 15, true);
INSERT INTO public.exercise_muscles (exercise_id, muscle_id, is_primary) VALUES (61, 15, true);
INSERT INTO public.exercise_muscles (exercise_id, muscle_id, is_primary) VALUES (62, 15, true);
INSERT INTO public.exercise_muscles (exercise_id, muscle_id, is_primary) VALUES (65, 15, true);
INSERT INTO public.exercise_muscles (exercise_id, muscle_id, is_primary) VALUES (66, 15, true);
INSERT INTO public.exercise_muscles (exercise_id, muscle_id, is_primary) VALUES (75, 16, true);
INSERT INTO public.exercise_muscles (exercise_id, muscle_id, is_primary) VALUES (76, 16, true);
INSERT INTO public.exercise_muscles (exercise_id, muscle_id, is_primary) VALUES (77, 16, true);
INSERT INTO public.exercise_muscles (exercise_id, muscle_id, is_primary) VALUES (78, 16, true);
INSERT INTO public.exercise_muscles (exercise_id, muscle_id, is_primary) VALUES (79, 16, true);
INSERT INTO public.exercise_muscles (exercise_id, muscle_id, is_primary) VALUES (80, 17, true);
INSERT INTO public.exercise_muscles (exercise_id, muscle_id, is_primary) VALUES (81, 17, true);
INSERT INTO public.exercise_muscles (exercise_id, muscle_id, is_primary) VALUES (82, 17, true);
INSERT INTO public.exercise_muscles (exercise_id, muscle_id, is_primary) VALUES (83, 17, true);
INSERT INTO public.exercise_muscles (exercise_id, muscle_id, is_primary) VALUES (84, 17, true);
INSERT INTO public.exercise_muscles (exercise_id, muscle_id, is_primary) VALUES (13, 4, false);


--
-- Name: equipment_equipment_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.equipment_equipment_id_seq', 20, true);


--
-- Name: exercises_exercise_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.exercises_exercise_id_seq', 84, true);


--
-- Name: muscle_groups_group_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.muscle_groups_group_id_seq', 5, true);


--
-- Name: muscles_muscle_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.muscles_muscle_id_seq', 17, true);


--
-- PostgreSQL database dump complete
--

