--
-- PostgreSQL database dump
--

\restrict yQr6oegtUKnKpsrrHYi9U3YVvHtYRmbjN5DzhOMzaVvvQqKIHvSAjqgrSPAUYzY

-- Dumped from database version 16.15 (Ubuntu 16.15-0ubuntu0.24.04.1)
-- Dumped by pg_dump version 16.15 (Ubuntu 16.15-0ubuntu0.24.04.1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: assignments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.assignments (
    id integer NOT NULL,
    base_id integer NOT NULL,
    equipment_type_id integer NOT NULL,
    personnel_name character varying(100) NOT NULL,
    quantity integer NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by integer,
    CONSTRAINT assignments_quantity_check CHECK ((quantity > 0))
);


--
-- Name: assignments_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.assignments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: assignments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.assignments_id_seq OWNED BY public.assignments.id;


--
-- Name: audit_logs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.audit_logs (
    id integer NOT NULL,
    user_id integer,
    action character varying(50) NOT NULL,
    details text NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: audit_logs_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.audit_logs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: audit_logs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.audit_logs_id_seq OWNED BY public.audit_logs.id;


--
-- Name: bases; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.bases (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    location character varying(150) NOT NULL
);


--
-- Name: bases_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.bases_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: bases_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.bases_id_seq OWNED BY public.bases.id;


--
-- Name: equipment_types; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.equipment_types (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    category character varying(50) NOT NULL,
    CONSTRAINT equipment_types_category_check CHECK (((category)::text = ANY ((ARRAY['WEAPON'::character varying, 'VEHICLE'::character varying, 'AMMUNITION'::character varying])::text[])))
);


--
-- Name: equipment_types_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.equipment_types_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: equipment_types_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.equipment_types_id_seq OWNED BY public.equipment_types.id;


--
-- Name: expenditures; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.expenditures (
    id integer NOT NULL,
    base_id integer NOT NULL,
    equipment_type_id integer NOT NULL,
    quantity integer NOT NULL,
    reason character varying(200),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by integer,
    CONSTRAINT expenditures_quantity_check CHECK ((quantity > 0))
);


--
-- Name: expenditures_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.expenditures_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: expenditures_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.expenditures_id_seq OWNED BY public.expenditures.id;


--
-- Name: purchases; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.purchases (
    id integer NOT NULL,
    base_id integer NOT NULL,
    equipment_type_id integer NOT NULL,
    quantity integer NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by integer,
    CONSTRAINT purchases_quantity_check CHECK ((quantity > 0))
);


--
-- Name: purchases_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.purchases_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: purchases_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.purchases_id_seq OWNED BY public.purchases.id;


--
-- Name: transfers; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.transfers (
    id integer NOT NULL,
    source_base_id integer NOT NULL,
    destination_base_id integer NOT NULL,
    equipment_type_id integer NOT NULL,
    quantity integer NOT NULL,
    status character varying(20) DEFAULT 'COMPLETED'::character varying NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    initiated_by integer,
    CONSTRAINT transfers_check CHECK ((source_base_id <> destination_base_id)),
    CONSTRAINT transfers_quantity_check CHECK ((quantity > 0)),
    CONSTRAINT transfers_status_check CHECK (((status)::text = ANY ((ARRAY['PENDING'::character varying, 'IN_TRANSIT'::character varying, 'COMPLETED'::character varying])::text[])))
);


--
-- Name: transfers_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.transfers_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: transfers_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.transfers_id_seq OWNED BY public.transfers.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    id integer NOT NULL,
    username character varying(50) NOT NULL,
    password_hash character varying(255) NOT NULL,
    role character varying(30) NOT NULL,
    base_id integer,
    CONSTRAINT users_role_check CHECK (((role)::text = ANY ((ARRAY['ADMIN'::character varying, 'BASE_COMMANDER'::character varying, 'LOGISTICS_OFFICER'::character varying])::text[])))
);


--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: assignments id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.assignments ALTER COLUMN id SET DEFAULT nextval('public.assignments_id_seq'::regclass);


--
-- Name: audit_logs id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.audit_logs ALTER COLUMN id SET DEFAULT nextval('public.audit_logs_id_seq'::regclass);


--
-- Name: bases id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bases ALTER COLUMN id SET DEFAULT nextval('public.bases_id_seq'::regclass);


--
-- Name: equipment_types id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.equipment_types ALTER COLUMN id SET DEFAULT nextval('public.equipment_types_id_seq'::regclass);


--
-- Name: expenditures id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.expenditures ALTER COLUMN id SET DEFAULT nextval('public.expenditures_id_seq'::regclass);


--
-- Name: purchases id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.purchases ALTER COLUMN id SET DEFAULT nextval('public.purchases_id_seq'::regclass);


--
-- Name: transfers id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.transfers ALTER COLUMN id SET DEFAULT nextval('public.transfers_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Data for Name: assignments; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.assignments (id, base_id, equipment_type_id, personnel_name, quantity, created_at, created_by) FROM stdin;
1	1	1	Sgt. Miller	2	2026-11-10 14:28:06.259659	1
2	2	2	Lt. Reyes	3	2026-11-14 14:28:06.259659	1
\.


--
-- Data for Name: audit_logs; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.audit_logs (id, user_id, action, details, created_at) FROM stdin;
1	1	SEED	Sample data loaded	2026-11-20 14:28:06.266594
\.


--
-- Data for Name: bases; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.bases (id, name, location) FROM stdin;
1	Fort Alpha	Northern Sector
2	Fort Bravo	Eastern Sector
3	Fort Charlie	Southern Sector
\.


--
-- Data for Name: equipment_types; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.equipment_types (id, name, category) FROM stdin;
1	M4 Carbine	WEAPON
2	M9 Pistol	WEAPON
3	Humvee	VEHICLE
4	Armored Truck	VEHICLE
5	5.56mm Ammo (box)	AMMUNITION
6	9mm Ammo (box)	AMMUNITION
\.


--
-- Data for Name: expenditures; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.expenditures (id, base_id, equipment_type_id, quantity, reason, created_at, created_by) FROM stdin;
1	1	5	100	Range training	2026-11-13 14:28:06.264961	1
2	2	5	40	Live-fire exercise	2026-11-17 14:28:06.264961	1
\.


--
-- Data for Name: purchases; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.purchases (id, base_id, equipment_type_id, quantity, created_at, created_by) FROM stdin;
1	1	1	120	2026-10-11 14:28:06.243264	1
2	1	3	15	2026-10-11 14:28:06.245525	1
3	1	5	500	2026-10-16 14:28:06.246987	1
4	2	1	80	2026-10-21 14:28:06.248332	1
5	2	2	60	2026-10-21 14:28:06.24963	1
6	2	5	300	2026-10-26 14:28:06.251857	1
7	3	3	10	2026-10-31 14:28:06.25322	1
8	3	4	6	2026-10-31 14:28:06.254196	1
9	3	6	400	2026-11-05 14:28:06.255579	1
\.


--
-- Data for Name: transfers; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.transfers (id, source_base_id, destination_base_id, equipment_type_id, quantity, status, created_at, initiated_by) FROM stdin;
1	1	2	1	20	COMPLETED	2026-11-08 14:28:06.257328	1
2	2	3	5	50	COMPLETED	2026-11-12 14:28:06.257328	1
3	1	3	3	3	COMPLETED	2026-11-15 14:28:06.257328	1
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.users (id, username, password_hash, role, base_id) FROM stdin;
1	admin_user	$2b$10$1HPKf7zhwE7BH8M1c/EhVuZGgUfueaBCvtM2Sx9eMakMPYUNE0EAK	ADMIN	\N
2	commander_alpha	$2b$10$5mes.001U5B9EM96YyvuiOOkZx7gTn23BSOfb.jH2YzZRaLvfUx06	BASE_COMMANDER	1
3	commander_bravo	$2b$10$3326hE3kbGvuS6t9b4Gf/upRtJP.wqjgRYTZ4wGZlhZ6wauLhLwmG	BASE_COMMANDER	2
4	logistics_officer	$2b$10$VFimd6p3dQfisdppzBuezuJEAL/uLy7Emovn8qQ598Q0mX8WB/hQO	LOGISTICS_OFFICER	1
\.


--
-- Name: assignments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.assignments_id_seq', 2, true);


--
-- Name: audit_logs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.audit_logs_id_seq', 1, true);


--
-- Name: bases_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.bases_id_seq', 3, true);


--
-- Name: equipment_types_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.equipment_types_id_seq', 6, true);


--
-- Name: expenditures_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.expenditures_id_seq', 2, true);


--
-- Name: purchases_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.purchases_id_seq', 9, true);


--
-- Name: transfers_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.transfers_id_seq', 3, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.users_id_seq', 4, true);


--
-- Name: assignments assignments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.assignments
    ADD CONSTRAINT assignments_pkey PRIMARY KEY (id);


--
-- Name: audit_logs audit_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT audit_logs_pkey PRIMARY KEY (id);


--
-- Name: bases bases_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bases
    ADD CONSTRAINT bases_name_key UNIQUE (name);


--
-- Name: bases bases_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bases
    ADD CONSTRAINT bases_pkey PRIMARY KEY (id);


--
-- Name: equipment_types equipment_types_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.equipment_types
    ADD CONSTRAINT equipment_types_name_key UNIQUE (name);


--
-- Name: equipment_types equipment_types_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.equipment_types
    ADD CONSTRAINT equipment_types_pkey PRIMARY KEY (id);


--
-- Name: expenditures expenditures_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.expenditures
    ADD CONSTRAINT expenditures_pkey PRIMARY KEY (id);


--
-- Name: purchases purchases_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.purchases
    ADD CONSTRAINT purchases_pkey PRIMARY KEY (id);


--
-- Name: transfers transfers_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.transfers
    ADD CONSTRAINT transfers_pkey PRIMARY KEY (id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: users users_username_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_key UNIQUE (username);


--
-- Name: idx_assign_base_eq_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_assign_base_eq_date ON public.assignments USING btree (base_id, equipment_type_id, created_at);


--
-- Name: idx_exp_base_eq_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_exp_base_eq_date ON public.expenditures USING btree (base_id, equipment_type_id, created_at);


--
-- Name: idx_purchases_base_eq_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_purchases_base_eq_date ON public.purchases USING btree (base_id, equipment_type_id, created_at);


--
-- Name: idx_transfers_dst; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_transfers_dst ON public.transfers USING btree (destination_base_id, equipment_type_id, created_at);


--
-- Name: idx_transfers_src; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_transfers_src ON public.transfers USING btree (source_base_id, equipment_type_id, created_at);


--
-- Name: assignments assignments_base_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.assignments
    ADD CONSTRAINT assignments_base_id_fkey FOREIGN KEY (base_id) REFERENCES public.bases(id);


--
-- Name: assignments assignments_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.assignments
    ADD CONSTRAINT assignments_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: assignments assignments_equipment_type_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.assignments
    ADD CONSTRAINT assignments_equipment_type_id_fkey FOREIGN KEY (equipment_type_id) REFERENCES public.equipment_types(id);


--
-- Name: audit_logs audit_logs_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT audit_logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: expenditures expenditures_base_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.expenditures
    ADD CONSTRAINT expenditures_base_id_fkey FOREIGN KEY (base_id) REFERENCES public.bases(id);


--
-- Name: expenditures expenditures_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.expenditures
    ADD CONSTRAINT expenditures_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: expenditures expenditures_equipment_type_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.expenditures
    ADD CONSTRAINT expenditures_equipment_type_id_fkey FOREIGN KEY (equipment_type_id) REFERENCES public.equipment_types(id);


--
-- Name: purchases purchases_base_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.purchases
    ADD CONSTRAINT purchases_base_id_fkey FOREIGN KEY (base_id) REFERENCES public.bases(id);


--
-- Name: purchases purchases_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.purchases
    ADD CONSTRAINT purchases_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: purchases purchases_equipment_type_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.purchases
    ADD CONSTRAINT purchases_equipment_type_id_fkey FOREIGN KEY (equipment_type_id) REFERENCES public.equipment_types(id);


--
-- Name: transfers transfers_destination_base_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.transfers
    ADD CONSTRAINT transfers_destination_base_id_fkey FOREIGN KEY (destination_base_id) REFERENCES public.bases(id);


--
-- Name: transfers transfers_equipment_type_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.transfers
    ADD CONSTRAINT transfers_equipment_type_id_fkey FOREIGN KEY (equipment_type_id) REFERENCES public.equipment_types(id);


--
-- Name: transfers transfers_initiated_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.transfers
    ADD CONSTRAINT transfers_initiated_by_fkey FOREIGN KEY (initiated_by) REFERENCES public.users(id);


--
-- Name: transfers transfers_source_base_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.transfers
    ADD CONSTRAINT transfers_source_base_id_fkey FOREIGN KEY (source_base_id) REFERENCES public.bases(id);


--
-- Name: users users_base_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_base_id_fkey FOREIGN KEY (base_id) REFERENCES public.bases(id) ON DELETE SET NULL;


--
-- PostgreSQL database dump complete
--

\unrestrict yQr6oegtUKnKpsrrHYi9U3YVvHtYRmbjN5DzhOMzaVvvQqKIHvSAjqgrSPAUYzY

