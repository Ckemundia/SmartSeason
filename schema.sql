-- Supabase PostgreSQL Schema Setup for SmartSeason

-- 1. Create Users Table
CREATE TABLE public.users (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('ADMIN', 'AGENT')),
    status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'ACTIVE', 'SUSPENDED')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Note: We map our internal JWT Auth system alongside Supabase data. 
-- We do not strictly use Supabase Auth to preserve our existing login architectures seamlessly.

-- 2. Create Fields Table
CREATE TABLE public.fields (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    crop_type TEXT NOT NULL,
    stage TEXT NOT NULL DEFAULT 'Planted',
    planting_date TIMESTAMP WITH TIME ZONE,
    agent_ids INTEGER[] DEFAULT '{}',
    milestones JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create Notes Table
CREATE TABLE public.notes (
    id SERIAL PRIMARY KEY,
    field_id INTEGER REFERENCES public.fields(id) ON DELETE CASCADE,
    author_id INTEGER REFERENCES public.users(id),
    author_name TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Create Stage Requests Table
CREATE TABLE public.stage_requests (
    id SERIAL PRIMARY KEY,
    field_id INTEGER REFERENCES public.fields(id) ON DELETE CASCADE,
    agent_id INTEGER REFERENCES public.users(id),
    target_stage TEXT NOT NULL,
    proof TEXT,
    proof_image TEXT, -- Base64 String URL limits apply, TEXT usually caps out sufficiently in Postgres
    status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- DO NOT FORGET TO CHANGE THE BCRYPT PASSWORD GENERATION (Default: 'admin123')
INSERT INTO public.users (name, email, password, role, status)
VALUES ('Admin', 'admin@smartseason.com', '$2a$10$w0.04cOKwAys45y2/OOM2O6V.QO8kEIfhIdVnI/tP2c/dAYl.qZ0G', 'ADMIN', 'ACTIVE');
