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
-- Name: add_exercise_with_equipment(character varying, text, character varying, text, character varying[]); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.add_exercise_with_equipment(p_name character varying, p_description text, p_difficulty character varying, p_instructions text, p_equipment character varying[]) RETURNS integer
    LANGUAGE plpgsql
    AS $$
DECLARE
    v_exercise_id INTEGER;
    v_equipment_name VARCHAR;
    v_equipment_id INTEGER;
BEGIN
    -- Insert exercise
    INSERT INTO exercises (name, description, difficulty, instructions)
    VALUES (p_name, p_description, p_difficulty, p_instructions)
    RETURNING exercise_id INTO v_exercise_id;

    -- Add equipment relationships
    FOREACH v_equipment_name IN ARRAY p_equipment
    LOOP
        -- Get or create equipment
        INSERT INTO equipment (name)
        VALUES (v_equipment_name)
        ON CONFLICT (name) DO NOTHING;

        SELECT equipment_id INTO v_equipment_id
        FROM equipment
        WHERE name = v_equipment_name;

        -- Create relationship
        INSERT INTO exercise_equipment (exercise_id, equipment_id)
        VALUES (v_exercise_id, v_equipment_id);
    END LOOP;

    RETURN v_exercise_id;
END;
$$;


ALTER FUNCTION public.add_exercise_with_equipment(p_name character varying, p_description text, p_difficulty character varying, p_instructions text, p_equipment character varying[]) OWNER TO postgres;

--
-- Name: get_exercise_with_equipment(integer); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_exercise_with_equipment(p_exercise_id integer) RETURNS TABLE(exercise_id integer, name character varying, description text, difficulty character varying, instructions text, image_url character varying, video_url character varying, equipment_options text[])
    LANGUAGE plpgsql
    AS $$
BEGIN
    RETURN QUERY
    SELECT 
        e.exercise_id,
        e.name,
        e.description,
        e.difficulty,
        e.instructions,
        e.image_url,
        e.video_url,
        array_agg(DISTINCT eq.name) AS equipment_options
    FROM exercises e
    LEFT JOIN exercise_equipment ee ON e.exercise_id = ee.exercise_id
    LEFT JOIN equipment eq ON ee.equipment_id = eq.equipment_id
    WHERE e.exercise_id = p_exercise_id
    GROUP BY 
        e.exercise_id,
        e.name,
        e.description,
        e.difficulty,
        e.instructions,
        e.image_url,
        e.video_url;
END;
$$;


ALTER FUNCTION public.get_exercise_with_equipment(p_exercise_id integer) OWNER TO postgres;

--
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;


ALTER FUNCTION public.update_updated_at_column() OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: content_flags; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.content_flags (
    flag_id integer NOT NULL,
    content_type character varying(50) NOT NULL,
    content_id integer NOT NULL,
    user_id integer NOT NULL,
    reason text,
    status character varying(20) DEFAULT 'pending'::character varying,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.content_flags OWNER TO postgres;

--
-- Name: content_flags_flag_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.content_flags_flag_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.content_flags_flag_id_seq OWNER TO postgres;

--
-- Name: content_flags_flag_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.content_flags_flag_id_seq OWNED BY public.content_flags.flag_id;


--
-- Name: equipment; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.equipment (
    equipment_id integer NOT NULL,
    name character varying(100) NOT NULL
);


ALTER TABLE public.equipment OWNER TO postgres;

--
-- Name: equipment_equipment_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.equipment_equipment_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.equipment_equipment_id_seq OWNER TO postgres;

--
-- Name: equipment_equipment_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.equipment_equipment_id_seq OWNED BY public.equipment.equipment_id;


--
-- Name: exercise_equipment; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.exercise_equipment (
    exercise_id integer NOT NULL,
    equipment_id integer NOT NULL
);


ALTER TABLE public.exercise_equipment OWNER TO postgres;

--
-- Name: exercise_muscles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.exercise_muscles (
    exercise_id integer NOT NULL,
    muscle_id integer NOT NULL,
    is_primary boolean DEFAULT false
);


ALTER TABLE public.exercise_muscles OWNER TO postgres;

--
-- Name: exercises; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.exercises (
    exercise_id integer NOT NULL,
    name character varying(200) NOT NULL,
    description text,
    difficulty character varying(50),
    instructions text,
    image_url character varying(255),
    video_url character varying(255)
);


ALTER TABLE public.exercises OWNER TO postgres;

--
-- Name: exercises_exercise_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.exercises_exercise_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.exercises_exercise_id_seq OWNER TO postgres;

--
-- Name: exercises_exercise_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.exercises_exercise_id_seq OWNED BY public.exercises.exercise_id;


--
-- Name: meals; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.meals (
    meal_id integer NOT NULL,
    user_id integer,
    name character varying(255) NOT NULL,
    calories numeric(10,2),
    protein numeric(10,2),
    carbs numeric(10,2),
    fats numeric(10,2),
    date date NOT NULL,
    serving character varying(50),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.meals OWNER TO postgres;

--
-- Name: meals_meal_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.meals_meal_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.meals_meal_id_seq OWNER TO postgres;

--
-- Name: meals_meal_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.meals_meal_id_seq OWNED BY public.meals.meal_id;


--
-- Name: muscle_groups; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.muscle_groups (
    group_id integer NOT NULL,
    name character varying(100) NOT NULL,
    description text
);


ALTER TABLE public.muscle_groups OWNER TO postgres;

--
-- Name: muscle_groups_group_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.muscle_groups_group_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.muscle_groups_group_id_seq OWNER TO postgres;

--
-- Name: muscle_groups_group_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.muscle_groups_group_id_seq OWNED BY public.muscle_groups.group_id;


--
-- Name: muscles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.muscles (
    muscle_id integer NOT NULL,
    group_id integer,
    name character varying(100) NOT NULL,
    description text
);


ALTER TABLE public.muscles OWNER TO postgres;

--
-- Name: muscles_muscle_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.muscles_muscle_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.muscles_muscle_id_seq OWNER TO postgres;

--
-- Name: muscles_muscle_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.muscles_muscle_id_seq OWNED BY public.muscles.muscle_id;


--
-- Name: user_contributed_foods; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_contributed_foods (
    food_id integer NOT NULL,
    user_id integer,
    name character varying(255) NOT NULL,
    calories numeric(10,2) NOT NULL,
    protein numeric(10,2),
    carbs numeric(10,2),
    fats numeric(10,2),
    serving_size character varying(50),
    verified boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    brand character varying(255),
    barcode character varying(50),
    category character varying(100),
    approval_status character varying(20) DEFAULT 'pending'::character varying,
    visibility character varying(20) DEFAULT 'personal'::character varying,
    CONSTRAINT user_contributed_foods_visibility_check CHECK (((visibility)::text = ANY ((ARRAY['personal'::character varying, 'public'::character varying])::text[])))
);


ALTER TABLE public.user_contributed_foods OWNER TO postgres;

--
-- Name: user_contributed_foods_food_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.user_contributed_foods_food_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.user_contributed_foods_food_id_seq OWNER TO postgres;

--
-- Name: user_contributed_foods_food_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.user_contributed_foods_food_id_seq OWNED BY public.user_contributed_foods.food_id;


--
-- Name: user_favorites; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_favorites (
    user_id integer NOT NULL,
    exercise_id integer NOT NULL,
    favorited_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.user_favorites OWNER TO postgres;

--
-- Name: user_profiles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_profiles (
    profile_id integer NOT NULL,
    user_id integer,
    first_name character varying(100),
    last_name character varying(100),
    date_of_birth date,
    gender character varying(50),
    height numeric,
    current_weight numeric,
    fitness_goal character varying(100),
    activity_level character varying(50),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    target_weight numeric,
    primary_focus character varying(100),
    daily_calories_goal integer,
    daily_protein_goal integer,
    daily_carbs_goal integer,
    daily_fats_goal integer,
    goals_last_calculated timestamp without time zone,
    weight_unit character varying(10) DEFAULT 'kg'::character varying,
    height_unit character varying(10) DEFAULT 'cm'::character varying
);


ALTER TABLE public.user_profiles OWNER TO postgres;

--
-- Name: user_profiles_profile_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.user_profiles_profile_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.user_profiles_profile_id_seq OWNER TO postgres;

--
-- Name: user_profiles_profile_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.user_profiles_profile_id_seq OWNED BY public.user_profiles.profile_id;


--
-- Name: user_saved_exercises; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_saved_exercises (
    user_id integer NOT NULL,
    exercise_id integer NOT NULL,
    saved_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.user_saved_exercises OWNER TO postgres;

--
-- Name: user_workout_exercises; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_workout_exercises (
    workout_exercise_id integer NOT NULL,
    workout_id integer,
    exercise_id integer,
    sets integer,
    reps integer,
    weight numeric(10,2),
    notes text
);


ALTER TABLE public.user_workout_exercises OWNER TO postgres;

--
-- Name: user_workout_exercises_workout_exercise_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.user_workout_exercises_workout_exercise_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.user_workout_exercises_workout_exercise_id_seq OWNER TO postgres;

--
-- Name: user_workout_exercises_workout_exercise_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.user_workout_exercises_workout_exercise_id_seq OWNED BY public.user_workout_exercises.workout_exercise_id;


--
-- Name: user_workout_plans; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_workout_plans (
    plan_id integer NOT NULL,
    user_id integer,
    fitness_goal character varying(50),
    activity_level character varying(50),
    primary_focus character varying(50),
    start_date date DEFAULT CURRENT_DATE,
    end_date date,
    status character varying(20) DEFAULT 'active'::character varying,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    plan_name character varying(255),
    is_custom boolean DEFAULT false,
    complexity character varying(50) DEFAULT 'Intermediate'::character varying
);


ALTER TABLE public.user_workout_plans OWNER TO postgres;

--
-- Name: user_workout_plans_plan_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.user_workout_plans_plan_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.user_workout_plans_plan_id_seq OWNER TO postgres;

--
-- Name: user_workout_plans_plan_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.user_workout_plans_plan_id_seq OWNED BY public.user_workout_plans.plan_id;


--
-- Name: user_workouts; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_workouts (
    workout_id integer NOT NULL,
    user_id integer,
    workout_type character varying(50) NOT NULL,
    workout_name character varying(255),
    date date NOT NULL,
    total_duration integer,
    total_calories_burned numeric(10,2),
    notes text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.user_workouts OWNER TO postgres;

--
-- Name: user_workouts_workout_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.user_workouts_workout_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.user_workouts_workout_id_seq OWNER TO postgres;

--
-- Name: user_workouts_workout_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.user_workouts_workout_id_seq OWNED BY public.user_workouts.workout_id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    user_id integer NOT NULL,
    email character varying(255) NOT NULL,
    password_hash character varying(255) NOT NULL,
    email_verified boolean DEFAULT false,
    is_active boolean DEFAULT true,
    account_status character varying(50) DEFAULT 'active'::character varying,
    reset_password_token character varying(255),
    reset_password_expires timestamp without time zone,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    last_login timestamp without time zone,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    verification_token character varying(255),
    is_admin boolean DEFAULT false,
    is_banned boolean DEFAULT false
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Name: users_user_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.users_user_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_user_id_seq OWNER TO postgres;

--
-- Name: users_user_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.users_user_id_seq OWNED BY public.users.user_id;


--
-- Name: workout_plan_days; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.workout_plan_days (
    plan_day_id integer NOT NULL,
    plan_id integer,
    day_of_week character varying(10),
    focus character varying(50),
    notes text
);


ALTER TABLE public.workout_plan_days OWNER TO postgres;

--
-- Name: workout_plan_days_plan_day_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.workout_plan_days_plan_day_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.workout_plan_days_plan_day_id_seq OWNER TO postgres;

--
-- Name: workout_plan_days_plan_day_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.workout_plan_days_plan_day_id_seq OWNED BY public.workout_plan_days.plan_day_id;


--
-- Name: workout_plan_exercises; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.workout_plan_exercises (
    plan_exercise_id integer NOT NULL,
    plan_day_id integer,
    exercise_id integer,
    sets integer,
    reps integer,
    order_index integer,
    notes text
);


ALTER TABLE public.workout_plan_exercises OWNER TO postgres;

--
-- Name: workout_plan_exercises_plan_exercise_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.workout_plan_exercises_plan_exercise_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.workout_plan_exercises_plan_exercise_id_seq OWNER TO postgres;

--
-- Name: workout_plan_exercises_plan_exercise_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.workout_plan_exercises_plan_exercise_id_seq OWNED BY public.workout_plan_exercises.plan_exercise_id;


--
-- Name: content_flags flag_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.content_flags ALTER COLUMN flag_id SET DEFAULT nextval('public.content_flags_flag_id_seq'::regclass);


--
-- Name: equipment equipment_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.equipment ALTER COLUMN equipment_id SET DEFAULT nextval('public.equipment_equipment_id_seq'::regclass);


--
-- Name: exercises exercise_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.exercises ALTER COLUMN exercise_id SET DEFAULT nextval('public.exercises_exercise_id_seq'::regclass);


--
-- Name: meals meal_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.meals ALTER COLUMN meal_id SET DEFAULT nextval('public.meals_meal_id_seq'::regclass);


--
-- Name: muscle_groups group_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.muscle_groups ALTER COLUMN group_id SET DEFAULT nextval('public.muscle_groups_group_id_seq'::regclass);


--
-- Name: muscles muscle_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.muscles ALTER COLUMN muscle_id SET DEFAULT nextval('public.muscles_muscle_id_seq'::regclass);


--
-- Name: user_contributed_foods food_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_contributed_foods ALTER COLUMN food_id SET DEFAULT nextval('public.user_contributed_foods_food_id_seq'::regclass);


--
-- Name: user_profiles profile_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_profiles ALTER COLUMN profile_id SET DEFAULT nextval('public.user_profiles_profile_id_seq'::regclass);


--
-- Name: user_workout_exercises workout_exercise_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_workout_exercises ALTER COLUMN workout_exercise_id SET DEFAULT nextval('public.user_workout_exercises_workout_exercise_id_seq'::regclass);


--
-- Name: user_workout_plans plan_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_workout_plans ALTER COLUMN plan_id SET DEFAULT nextval('public.user_workout_plans_plan_id_seq'::regclass);


--
-- Name: user_workouts workout_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_workouts ALTER COLUMN workout_id SET DEFAULT nextval('public.user_workouts_workout_id_seq'::regclass);


--
-- Name: users user_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users ALTER COLUMN user_id SET DEFAULT nextval('public.users_user_id_seq'::regclass);


--
-- Name: workout_plan_days plan_day_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.workout_plan_days ALTER COLUMN plan_day_id SET DEFAULT nextval('public.workout_plan_days_plan_day_id_seq'::regclass);


--
-- Name: workout_plan_exercises plan_exercise_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.workout_plan_exercises ALTER COLUMN plan_exercise_id SET DEFAULT nextval('public.workout_plan_exercises_plan_exercise_id_seq'::regclass);


--
-- Name: content_flags content_flags_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.content_flags
    ADD CONSTRAINT content_flags_pkey PRIMARY KEY (flag_id);


--
-- Name: equipment equipment_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.equipment
    ADD CONSTRAINT equipment_name_key UNIQUE (name);


--
-- Name: equipment equipment_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.equipment
    ADD CONSTRAINT equipment_pkey PRIMARY KEY (equipment_id);


--
-- Name: exercise_equipment exercise_equipment_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.exercise_equipment
    ADD CONSTRAINT exercise_equipment_pkey PRIMARY KEY (exercise_id, equipment_id);


--
-- Name: exercise_muscles exercise_muscles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.exercise_muscles
    ADD CONSTRAINT exercise_muscles_pkey PRIMARY KEY (exercise_id, muscle_id);


--
-- Name: exercises exercises_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.exercises
    ADD CONSTRAINT exercises_pkey PRIMARY KEY (exercise_id);


--
-- Name: meals meals_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.meals
    ADD CONSTRAINT meals_pkey PRIMARY KEY (meal_id);


--
-- Name: muscle_groups muscle_groups_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.muscle_groups
    ADD CONSTRAINT muscle_groups_pkey PRIMARY KEY (group_id);


--
-- Name: muscles muscles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.muscles
    ADD CONSTRAINT muscles_pkey PRIMARY KEY (muscle_id);


--
-- Name: user_contributed_foods user_contributed_foods_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_contributed_foods
    ADD CONSTRAINT user_contributed_foods_pkey PRIMARY KEY (food_id);


--
-- Name: user_favorites user_favorites_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_favorites
    ADD CONSTRAINT user_favorites_pkey PRIMARY KEY (user_id, exercise_id);


--
-- Name: user_profiles user_profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_profiles
    ADD CONSTRAINT user_profiles_pkey PRIMARY KEY (profile_id);


--
-- Name: user_saved_exercises user_saved_exercises_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_saved_exercises
    ADD CONSTRAINT user_saved_exercises_pkey PRIMARY KEY (user_id, exercise_id);


--
-- Name: user_workout_exercises user_workout_exercises_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_workout_exercises
    ADD CONSTRAINT user_workout_exercises_pkey PRIMARY KEY (workout_exercise_id);


--
-- Name: user_workout_plans user_workout_plans_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_workout_plans
    ADD CONSTRAINT user_workout_plans_pkey PRIMARY KEY (plan_id);


--
-- Name: user_workouts user_workouts_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_workouts
    ADD CONSTRAINT user_workouts_pkey PRIMARY KEY (workout_id);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (user_id);


--
-- Name: workout_plan_days workout_plan_days_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.workout_plan_days
    ADD CONSTRAINT workout_plan_days_pkey PRIMARY KEY (plan_day_id);


--
-- Name: workout_plan_exercises workout_plan_exercises_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.workout_plan_exercises
    ADD CONSTRAINT workout_plan_exercises_pkey PRIMARY KEY (plan_exercise_id);


--
-- Name: idx_user_contributed_foods_name; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_user_contributed_foods_name ON public.user_contributed_foods USING btree (name);


--
-- Name: idx_user_contributed_foods_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_user_contributed_foods_user_id ON public.user_contributed_foods USING btree (user_id);


--
-- Name: user_profiles update_user_profiles_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON public.user_profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: content_flags content_flags_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.content_flags
    ADD CONSTRAINT content_flags_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id);


--
-- Name: exercise_equipment exercise_equipment_equipment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.exercise_equipment
    ADD CONSTRAINT exercise_equipment_equipment_id_fkey FOREIGN KEY (equipment_id) REFERENCES public.equipment(equipment_id);


--
-- Name: exercise_equipment exercise_equipment_exercise_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.exercise_equipment
    ADD CONSTRAINT exercise_equipment_exercise_id_fkey FOREIGN KEY (exercise_id) REFERENCES public.exercises(exercise_id);


--
-- Name: exercise_muscles exercise_muscles_exercise_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.exercise_muscles
    ADD CONSTRAINT exercise_muscles_exercise_id_fkey FOREIGN KEY (exercise_id) REFERENCES public.exercises(exercise_id);


--
-- Name: exercise_muscles exercise_muscles_muscle_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.exercise_muscles
    ADD CONSTRAINT exercise_muscles_muscle_id_fkey FOREIGN KEY (muscle_id) REFERENCES public.muscles(muscle_id);


--
-- Name: meals meals_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.meals
    ADD CONSTRAINT meals_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id);


--
-- Name: muscles muscles_group_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.muscles
    ADD CONSTRAINT muscles_group_id_fkey FOREIGN KEY (group_id) REFERENCES public.muscle_groups(group_id);


--
-- Name: user_contributed_foods user_contributed_foods_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_contributed_foods
    ADD CONSTRAINT user_contributed_foods_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id);


--
-- Name: user_favorites user_favorites_exercise_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_favorites
    ADD CONSTRAINT user_favorites_exercise_id_fkey FOREIGN KEY (exercise_id) REFERENCES public.exercises(exercise_id);


--
-- Name: user_favorites user_favorites_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_favorites
    ADD CONSTRAINT user_favorites_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id);


--
-- Name: user_profiles user_profiles_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_profiles
    ADD CONSTRAINT user_profiles_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id);


--
-- Name: user_saved_exercises user_saved_exercises_exercise_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_saved_exercises
    ADD CONSTRAINT user_saved_exercises_exercise_id_fkey FOREIGN KEY (exercise_id) REFERENCES public.exercises(exercise_id);


--
-- Name: user_saved_exercises user_saved_exercises_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_saved_exercises
    ADD CONSTRAINT user_saved_exercises_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id);


--
-- Name: user_workout_exercises user_workout_exercises_exercise_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_workout_exercises
    ADD CONSTRAINT user_workout_exercises_exercise_id_fkey FOREIGN KEY (exercise_id) REFERENCES public.exercises(exercise_id);


--
-- Name: user_workout_exercises user_workout_exercises_workout_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_workout_exercises
    ADD CONSTRAINT user_workout_exercises_workout_id_fkey FOREIGN KEY (workout_id) REFERENCES public.user_workouts(workout_id) ON DELETE CASCADE;


--
-- Name: user_workout_plans user_workout_plans_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_workout_plans
    ADD CONSTRAINT user_workout_plans_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id);


--
-- Name: user_workouts user_workouts_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_workouts
    ADD CONSTRAINT user_workouts_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id);


--
-- Name: workout_plan_days workout_plan_days_plan_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.workout_plan_days
    ADD CONSTRAINT workout_plan_days_plan_id_fkey FOREIGN KEY (plan_id) REFERENCES public.user_workout_plans(plan_id);


--
-- Name: workout_plan_exercises workout_plan_exercises_exercise_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.workout_plan_exercises
    ADD CONSTRAINT workout_plan_exercises_exercise_id_fkey FOREIGN KEY (exercise_id) REFERENCES public.exercises(exercise_id);


--
-- Name: workout_plan_exercises workout_plan_exercises_plan_day_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.workout_plan_exercises
    ADD CONSTRAINT workout_plan_exercises_plan_day_id_fkey FOREIGN KEY (plan_day_id) REFERENCES public.workout_plan_days(plan_day_id);


--
-- PostgreSQL database dump complete
--

