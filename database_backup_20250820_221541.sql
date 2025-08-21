--
-- PostgreSQL database dump
--

\restrict jnjeskP1DRAE62UooAg1dpY0NIKiQMdbaGHxW1I2jKxWhz3VivJ6qJ2HO2INqPX

-- Dumped from database version 17.6 (Debian 17.6-1.pgdg13+1)
-- Dumped by pg_dump version 17.6 (Debian 17.6-1.pgdg13+1)

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
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;


--
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


--
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: public; Owner: myf_user
--

CREATE FUNCTION public.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;


ALTER FUNCTION public.update_updated_at_column() OWNER TO myf_user;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: catches; Type: TABLE; Schema: public; Owner: myf_user
--

CREATE TABLE public.catches (
    id integer NOT NULL,
    user_id character varying(255) NOT NULL,
    species character varying(100) NOT NULL,
    weight numeric(10,2),
    length numeric(10,2),
    location character varying(255) NOT NULL,
    latitude numeric(10,6),
    longitude numeric(11,6),
    date timestamp without time zone NOT NULL,
    notes text,
    photo_urls text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.catches OWNER TO myf_user;

--
-- Name: catches_id_seq; Type: SEQUENCE; Schema: public; Owner: myf_user
--

CREATE SEQUENCE public.catches_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.catches_id_seq OWNER TO myf_user;

--
-- Name: catches_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: myf_user
--

ALTER SEQUENCE public.catches_id_seq OWNED BY public.catches.id;


--
-- Name: lures; Type: TABLE; Schema: public; Owner: myf_user
--

CREATE TABLE public.lures (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    type character varying(50),
    brand character varying(100),
    description text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.lures OWNER TO myf_user;

--
-- Name: lures_id_seq; Type: SEQUENCE; Schema: public; Owner: myf_user
--

CREATE SEQUENCE public.lures_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.lures_id_seq OWNER TO myf_user;

--
-- Name: lures_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: myf_user
--

ALTER SEQUENCE public.lures_id_seq OWNED BY public.lures.id;


--
-- Name: migrations; Type: TABLE; Schema: public; Owner: myf_user
--

CREATE TABLE public.migrations (
    id integer NOT NULL,
    filename character varying(255) NOT NULL,
    executed_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.migrations OWNER TO myf_user;

--
-- Name: migrations_id_seq; Type: SEQUENCE; Schema: public; Owner: myf_user
--

CREATE SEQUENCE public.migrations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.migrations_id_seq OWNER TO myf_user;

--
-- Name: migrations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: myf_user
--

ALTER SEQUENCE public.migrations_id_seq OWNED BY public.migrations.id;


--
-- Name: photos; Type: TABLE; Schema: public; Owner: myf_user
--

CREATE TABLE public.photos (
    id integer NOT NULL,
    catch_id integer,
    url text NOT NULL,
    caption text,
    uploaded_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.photos OWNER TO myf_user;

--
-- Name: photos_id_seq; Type: SEQUENCE; Schema: public; Owner: myf_user
--

CREATE SEQUENCE public.photos_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.photos_id_seq OWNER TO myf_user;

--
-- Name: photos_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: myf_user
--

ALTER SEQUENCE public.photos_id_seq OWNED BY public.photos.id;


--
-- Name: species; Type: TABLE; Schema: public; Owner: myf_user
--

CREATE TABLE public.species (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    scientific_name character varying(150),
    description text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.species OWNER TO myf_user;

--
-- Name: species_id_seq; Type: SEQUENCE; Schema: public; Owner: myf_user
--

CREATE SEQUENCE public.species_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.species_id_seq OWNER TO myf_user;

--
-- Name: species_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: myf_user
--

ALTER SEQUENCE public.species_id_seq OWNED BY public.species.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: myf_user
--

CREATE TABLE public.users (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    email character varying(255) NOT NULL,
    firebase_uid character varying(255) NOT NULL,
    username character varying(100),
    subscription_status character varying(50) DEFAULT 'free'::character varying,
    subscription_expires_at timestamp without time zone,
    catches_count integer DEFAULT 0,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    password character varying(255)
);


ALTER TABLE public.users OWNER TO myf_user;

--
-- Name: weather_data; Type: TABLE; Schema: public; Owner: myf_user
--

CREATE TABLE public.weather_data (
    id integer NOT NULL,
    catch_id integer,
    temperature numeric(5,2),
    feels_like numeric(5,2),
    humidity integer,
    pressure numeric(6,2),
    visibility numeric(10,2),
    wind_speed numeric(5,2),
    wind_direction integer,
    clouds integer,
    conditions character varying(100),
    icon character varying(10),
    recorded_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.weather_data OWNER TO myf_user;

--
-- Name: weather_data_id_seq; Type: SEQUENCE; Schema: public; Owner: myf_user
--

CREATE SEQUENCE public.weather_data_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.weather_data_id_seq OWNER TO myf_user;

--
-- Name: weather_data_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: myf_user
--

ALTER SEQUENCE public.weather_data_id_seq OWNED BY public.weather_data.id;


--
-- Name: catches id; Type: DEFAULT; Schema: public; Owner: myf_user
--

ALTER TABLE ONLY public.catches ALTER COLUMN id SET DEFAULT nextval('public.catches_id_seq'::regclass);


--
-- Name: lures id; Type: DEFAULT; Schema: public; Owner: myf_user
--

ALTER TABLE ONLY public.lures ALTER COLUMN id SET DEFAULT nextval('public.lures_id_seq'::regclass);


--
-- Name: migrations id; Type: DEFAULT; Schema: public; Owner: myf_user
--

ALTER TABLE ONLY public.migrations ALTER COLUMN id SET DEFAULT nextval('public.migrations_id_seq'::regclass);


--
-- Name: photos id; Type: DEFAULT; Schema: public; Owner: myf_user
--

ALTER TABLE ONLY public.photos ALTER COLUMN id SET DEFAULT nextval('public.photos_id_seq'::regclass);


--
-- Name: species id; Type: DEFAULT; Schema: public; Owner: myf_user
--

ALTER TABLE ONLY public.species ALTER COLUMN id SET DEFAULT nextval('public.species_id_seq'::regclass);


--
-- Name: weather_data id; Type: DEFAULT; Schema: public; Owner: myf_user
--

ALTER TABLE ONLY public.weather_data ALTER COLUMN id SET DEFAULT nextval('public.weather_data_id_seq'::regclass);


--
-- Data for Name: catches; Type: TABLE DATA; Schema: public; Owner: myf_user
--

COPY public.catches (id, user_id, species, weight, length, location, latitude, longitude, date, notes, photo_urls, created_at, updated_at) FROM stdin;
1	f1c51ca6-770a-4a88-8c54-53cb4a37412d	Bass(Largemouth)	4.50	18.50	Lake Minnetonka, MN	44.913300	-93.503000	2024-06-15 08:30:00	Great morning catch near the lily pads. Used topwater lure at 5.5ft depth	\N	2025-08-20 22:55:30.139027	2025-08-20 22:58:11.090921
2	f1c51ca6-770a-4a88-8c54-53cb4a37412d	Walleye	3.20	17.00	Mille Lacs Lake, MN	46.244100	-93.626700	2024-07-20 19:45:00	Evening bite was on fire. Jig at 12ft, water temp 68.5°F	\N	2025-08-20 22:55:30.139027	2025-08-20 22:58:11.090921
3	f1c51ca6-770a-4a88-8c54-53cb4a37412d	Pike	8.50	32.00	Leech Lake, MN	47.150000	-94.383300	2024-08-10 11:00:00	Monster pike on a spoon at 8ft depth	\N	2025-08-20 22:55:30.139027	2025-08-20 22:58:11.090921
4	f1c51ca6-770a-4a88-8c54-53cb4a37412d	Musky	15.00	42.00	Lake Vermilion, MN	47.833300	-92.350000	2024-09-05 16:30:00	Personal best musky! Bucktail in 15ft of water	\N	2025-08-20 22:55:30.139027	2025-08-20 22:58:11.090921
5	f1c51ca6-770a-4a88-8c54-53cb4a37412d	Bass(Smallmouth)	2.80	14.50	Lake Superior, Duluth	46.829700	-92.010200	2024-05-25 07:15:00	Rocky point produced. Drop shot rig at 18ft	\N	2025-08-20 22:55:30.139027	2025-08-20 22:58:11.090921
6	f1c51ca6-770a-4a88-8c54-53cb4a37412d	Crappie	1.20	11.00	Lake Minnewaska, MN	45.584400	-95.388900	2024-04-12 14:00:00	Spring crappies in the shallows, 4ft depth	\N	2025-08-20 22:55:30.139027	2025-08-20 22:58:11.090921
7	f1c51ca6-770a-4a88-8c54-53cb4a37412d	Bluegill	0.80	8.50	White Bear Lake, MN	45.084700	-92.975000	2024-07-04 10:30:00	Kids first fish! Live bait at 6ft	\N	2025-08-20 22:55:30.139027	2025-08-20 22:58:11.090921
8	f1c51ca6-770a-4a88-8c54-53cb4a37412d	Catfish	12.00	28.00	Mississippi River, Red Wing	44.566700	-92.533300	2024-08-22 21:00:00	Night fishing success with live bait at 20ft	\N	2025-08-20 22:55:30.139027	2025-08-20 22:58:11.090921
9	f1c51ca6-770a-4a88-8c54-53cb4a37412d	Catfish	\N	\N	44.423453, -95.053940	44.423453	-95.053940	2025-08-20 19:22:00	\N	[]	2025-08-20 23:22:56.461671	2025-08-20 23:22:56.461671
10	f1c51ca6-770a-4a88-8c54-53cb4a37412d	Musky	\N	\N	46.042014, -97.661953	46.042014	-97.661953	2025-08-20 19:36:00	\N	[]	2025-08-20 23:37:31.084427	2025-08-20 23:37:31.084427
11	f1c51ca6-770a-4a88-8c54-53cb4a37412d	Trout	33.00	33.00	45.980973, -94.733538	45.980973	-94.733538	2025-08-20 19:37:00	sdaf	["/uploads/catches/1755733144418-musky.jpg"]	2025-08-20 23:39:04.429306	2025-08-20 23:39:04.429306
13	f1c51ca6-770a-4a88-8c54-53cb4a37412d	Bass(Smallmouth)	0.30	0.40	42.418599, -82.831665	42.418599	-82.831665	2025-08-21 04:16:00	\N	[]	2025-08-21 00:17:25.617933	2025-08-21 02:02:56.938422
12	f1c51ca6-770a-4a88-8c54-53cb4a37412d	Perch	0.30	0.20	42.420120, -83.047615	42.420120	-83.047615	2025-08-21 04:16:00	\N	[]	2025-08-21 00:16:52.772769	2025-08-21 02:03:52.635948
15	f1c51ca6-770a-4a88-8c54-53cb4a37412d	Walleye	0.20	0.20	42.410517, -82.667896	42.410517	-82.667896	2025-08-21 13:03:00	sdfsa	["/uploads/catches/1755742025074-470189417.jpg"]	2025-08-21 01:03:29.23932	2025-08-21 02:07:05.123587
\.


--
-- Data for Name: lures; Type: TABLE DATA; Schema: public; Owner: myf_user
--

COPY public.lures (id, name, type, brand, description, created_at) FROM stdin;
14	Bucktail	Spinner	\N	Large inline spinner with hair or synthetic tail	2025-08-20 22:55:30.139027
15	Spoon	Metal	\N	Curved metal lure that wobbles when retrieved	2025-08-20 22:55:30.139027
16	Topwater	Surface	\N	Lure designed to float and create surface disturbance	2025-08-20 22:55:30.139027
17	Crankbait	Diving	\N	Hard-bodied lure with lip that dives when retrieved	2025-08-20 22:55:30.139027
18	Spinnerbait	Wire	\N	Wire-framed lure with spinning blades	2025-08-20 22:55:30.139027
19	Jig	Weighted	\N	Weighted head with hook and soft body or skirt	2025-08-20 22:55:30.139027
20	Swimbait	Soft	\N	Soft plastic lure that mimics swimming fish	2025-08-20 22:55:30.139027
21	Soft Plastic	Soft	\N	Various soft plastic worms, grubs, and creatures	2025-08-20 22:55:30.139027
22	Drop Shot	Finesse	\N	Finesse technique with weight below hook	2025-08-20 22:55:30.139027
23	Rapala	Minnow	\N	Classic floating/diving minnow lure	2025-08-20 22:55:30.139027
24	Rattle Trap	Lipless	\N	Lipless crankbait with internal rattles	2025-08-20 22:55:30.139027
25	Live Bait	Natural	\N	Natural bait like minnows, worms, or leeches	2025-08-20 22:55:30.139027
26	Fly	Fly Fishing	\N	Artificial fly for fly fishing	2025-08-20 22:55:30.139027
\.


--
-- Data for Name: migrations; Type: TABLE DATA; Schema: public; Owner: myf_user
--

COPY public.migrations (id, filename, executed_at) FROM stdin;
1	001_create_tables.sql	2025-08-20 22:54:07.6918
2	002_seed_data.sql	2025-08-20 22:55:30.139027
\.


--
-- Data for Name: photos; Type: TABLE DATA; Schema: public; Owner: myf_user
--

COPY public.photos (id, catch_id, url, caption, uploaded_at) FROM stdin;
\.


--
-- Data for Name: species; Type: TABLE DATA; Schema: public; Owner: myf_user
--

COPY public.species (id, name, scientific_name, description, created_at) FROM stdin;
12	Musky	Esox masquinongy	The muskellunge, often called musky, is a large freshwater fish	2025-08-20 22:55:30.139027
13	Pike	Esox lucius	Northern pike is a predatory fish found in freshwater	2025-08-20 22:55:30.139027
14	Bass(Smallmouth)	Micropterus dolomieu	Smallmouth bass is a popular game fish	2025-08-20 22:55:30.139027
15	Bass(Largemouth)	Micropterus salmoides	Largemouth bass is one of the most sought-after game fish	2025-08-20 22:55:30.139027
16	Walleye	Sander vitreus	Walleye is a freshwater perciform fish	2025-08-20 22:55:30.139027
17	Perch	Perca flavescens	Yellow perch is a popular panfish	2025-08-20 22:55:30.139027
18	Bluegill	Lepomis macrochirus	Bluegill is a species of freshwater sunfish	2025-08-20 22:55:30.139027
19	Catfish	Ictalurus punctatus	Channel catfish is North America's most numerous catfish species	2025-08-20 22:55:30.139027
20	Trout	Salmo trutta	Brown trout is a European species of salmonid fish	2025-08-20 22:55:30.139027
21	Salmon	Salmo salar	Atlantic salmon is a species of ray-finned fish	2025-08-20 22:55:30.139027
22	Crappie	Pomoxis	Crappies are popular panfish	2025-08-20 22:55:30.139027
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: myf_user
--

COPY public.users (id, email, firebase_uid, username, subscription_status, subscription_expires_at, catches_count, created_at, updated_at, password) FROM stdin;
80d3734e-af07-4466-aec1-ac35a87d313f	test@test.com	test@test.com	Test User	free	\N	0	2025-08-20 19:14:42.069557	2025-08-20 19:14:42.069557	\N
f1c51ca6-770a-4a88-8c54-53cb4a37412d	spartanbunk@gmail.com	spartanbunk@gmail.com	Michael Lurtz	free	\N	0	2025-08-20 19:15:33.509646	2025-08-20 19:15:33.509646	$2b$12$9FPZaHVz89J5VNZm1nAwMecb3jQ/4H7vatHgaHLdZFWU7xeB0u/ei
\.


--
-- Data for Name: weather_data; Type: TABLE DATA; Schema: public; Owner: myf_user
--

COPY public.weather_data (id, catch_id, temperature, feels_like, humidity, pressure, visibility, wind_speed, wind_direction, clouds, conditions, icon, recorded_at) FROM stdin;
\.


--
-- Name: catches_id_seq; Type: SEQUENCE SET; Schema: public; Owner: myf_user
--

SELECT pg_catalog.setval('public.catches_id_seq', 15, true);


--
-- Name: lures_id_seq; Type: SEQUENCE SET; Schema: public; Owner: myf_user
--

SELECT pg_catalog.setval('public.lures_id_seq', 26, true);


--
-- Name: migrations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: myf_user
--

SELECT pg_catalog.setval('public.migrations_id_seq', 2, true);


--
-- Name: photos_id_seq; Type: SEQUENCE SET; Schema: public; Owner: myf_user
--

SELECT pg_catalog.setval('public.photos_id_seq', 1, false);


--
-- Name: species_id_seq; Type: SEQUENCE SET; Schema: public; Owner: myf_user
--

SELECT pg_catalog.setval('public.species_id_seq', 22, true);


--
-- Name: weather_data_id_seq; Type: SEQUENCE SET; Schema: public; Owner: myf_user
--

SELECT pg_catalog.setval('public.weather_data_id_seq', 1, false);


--
-- Name: catches catches_pkey; Type: CONSTRAINT; Schema: public; Owner: myf_user
--

ALTER TABLE ONLY public.catches
    ADD CONSTRAINT catches_pkey PRIMARY KEY (id);


--
-- Name: lures lures_name_key; Type: CONSTRAINT; Schema: public; Owner: myf_user
--

ALTER TABLE ONLY public.lures
    ADD CONSTRAINT lures_name_key UNIQUE (name);


--
-- Name: lures lures_pkey; Type: CONSTRAINT; Schema: public; Owner: myf_user
--

ALTER TABLE ONLY public.lures
    ADD CONSTRAINT lures_pkey PRIMARY KEY (id);


--
-- Name: migrations migrations_filename_key; Type: CONSTRAINT; Schema: public; Owner: myf_user
--

ALTER TABLE ONLY public.migrations
    ADD CONSTRAINT migrations_filename_key UNIQUE (filename);


--
-- Name: migrations migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: myf_user
--

ALTER TABLE ONLY public.migrations
    ADD CONSTRAINT migrations_pkey PRIMARY KEY (id);


--
-- Name: photos photos_pkey; Type: CONSTRAINT; Schema: public; Owner: myf_user
--

ALTER TABLE ONLY public.photos
    ADD CONSTRAINT photos_pkey PRIMARY KEY (id);


--
-- Name: species species_name_key; Type: CONSTRAINT; Schema: public; Owner: myf_user
--

ALTER TABLE ONLY public.species
    ADD CONSTRAINT species_name_key UNIQUE (name);


--
-- Name: species species_pkey; Type: CONSTRAINT; Schema: public; Owner: myf_user
--

ALTER TABLE ONLY public.species
    ADD CONSTRAINT species_pkey PRIMARY KEY (id);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: myf_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_firebase_uid_key; Type: CONSTRAINT; Schema: public; Owner: myf_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_firebase_uid_key UNIQUE (firebase_uid);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: myf_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: weather_data weather_data_pkey; Type: CONSTRAINT; Schema: public; Owner: myf_user
--

ALTER TABLE ONLY public.weather_data
    ADD CONSTRAINT weather_data_pkey PRIMARY KEY (id);


--
-- Name: idx_catches_date; Type: INDEX; Schema: public; Owner: myf_user
--

CREATE INDEX idx_catches_date ON public.catches USING btree (date);


--
-- Name: idx_catches_location; Type: INDEX; Schema: public; Owner: myf_user
--

CREATE INDEX idx_catches_location ON public.catches USING btree (latitude, longitude);


--
-- Name: idx_catches_species; Type: INDEX; Schema: public; Owner: myf_user
--

CREATE INDEX idx_catches_species ON public.catches USING btree (species);


--
-- Name: idx_catches_user_id; Type: INDEX; Schema: public; Owner: myf_user
--

CREATE INDEX idx_catches_user_id ON public.catches USING btree (user_id);


--
-- Name: idx_photos_catch_id; Type: INDEX; Schema: public; Owner: myf_user
--

CREATE INDEX idx_photos_catch_id ON public.photos USING btree (catch_id);


--
-- Name: idx_weather_catch_id; Type: INDEX; Schema: public; Owner: myf_user
--

CREATE INDEX idx_weather_catch_id ON public.weather_data USING btree (catch_id);


--
-- Name: catches update_catches_updated_at; Type: TRIGGER; Schema: public; Owner: myf_user
--

CREATE TRIGGER update_catches_updated_at BEFORE UPDATE ON public.catches FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: photos photos_catch_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: myf_user
--

ALTER TABLE ONLY public.photos
    ADD CONSTRAINT photos_catch_id_fkey FOREIGN KEY (catch_id) REFERENCES public.catches(id) ON DELETE CASCADE;


--
-- Name: weather_data weather_data_catch_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: myf_user
--

ALTER TABLE ONLY public.weather_data
    ADD CONSTRAINT weather_data_catch_id_fkey FOREIGN KEY (catch_id) REFERENCES public.catches(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict jnjeskP1DRAE62UooAg1dpY0NIKiQMdbaGHxW1I2jKxWhz3VivJ6qJ2HO2INqPX

