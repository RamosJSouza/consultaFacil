-- Part 1: Database creation (run this first as superuser)
DO $$ 
BEGIN
    IF EXISTS (SELECT FROM pg_database WHERE datname = 'consultafacil') THEN
        RAISE NOTICE 'Database already exists';
    ELSE
        PERFORM dblink_exec('dbname=' || current_database(), 'CREATE DATABASE consultafacil');
    END IF;
END
$$;

-- Part 2: Schema creation and data (run after connecting to consultafacil database)
\c consultafacil;

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop tables if they exist (in correct order due to foreign key constraints)
DROP TABLE IF EXISTS audit_logs CASCADE;
DROP TABLE IF EXISTS rules CASCADE;
DROP TABLE IF EXISTS client_professional_links CASCADE;
DROP TABLE IF EXISTS appointments CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Create users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('client', 'professional', 'superadmin')),
    name VARCHAR(255) NOT NULL,
    specialty VARCHAR(255),
    license_number VARCHAR(50),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create appointments table
CREATE TABLE appointments (
    id SERIAL PRIMARY KEY,
    client_id INTEGER NOT NULL REFERENCES users(id),
    professional_id INTEGER NOT NULL REFERENCES users(id),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    status VARCHAR(50) NOT NULL CHECK (status IN ('pending', 'confirmed', 'cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create client_professional_links table
CREATE TABLE client_professional_links (
    id SERIAL PRIMARY KEY,
    client_id INTEGER NOT NULL REFERENCES users(id),
    professional_id INTEGER NOT NULL REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (client_id, professional_id)
);

-- Create rules table
CREATE TABLE rules (
    id SERIAL PRIMARY KEY,
    rule_name VARCHAR(255) NOT NULL UNIQUE,
    rule_value JSONB NOT NULL,
    created_by INTEGER NOT NULL REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create audit_logs table
CREATE TABLE audit_logs (
    id SERIAL PRIMARY KEY,
    action VARCHAR(255) NOT NULL,
    performed_by INTEGER NOT NULL REFERENCES users(id),
    details JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX idx_appointments_date ON appointments(date);
CREATE INDEX idx_appointments_professional_id ON appointments(professional_id);
CREATE INDEX idx_rules_name ON rules(rule_name);
CREATE INDEX idx_client_professional_links ON client_professional_links(client_id, professional_id);

-- Insert initial superadmin user (password should be properly hashed in production)
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM users WHERE email = 'admin@consultafacil.com') THEN
        INSERT INTO users (email, password, role, name, is_active)
        VALUES ('admin@consultafacil.com', '$2b$10$YOUR_HASHED_PASSWORD', 'superadmin', 'System Administrator', true);
    END IF;
END
$$;
