-- Create the database if it does not exist
CREATE DATABASE IF NOT EXISTS ml_practice;
-- Connect to the ml_practice database
\c ml_practice;

-- Main tables
-- Drop the table if it exists
DROP TABLE IF EXISTS person;

-- Create tables

-- Person
CREATE TABLE person (
  person_id SERIAL PRIMARY KEY,
  first_name VARCHAR(45) NOT NULL,
  last_name VARCHAR(45) NOT NULL,
  email VARCHAR(45) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  added_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT NULL,
);