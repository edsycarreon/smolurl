
-- Connect to the ml_practice database
\c postgres;

-- Use schema
CREATE SCHEMA IF NOT EXISTS smolapp;
-- Connect to the smolapp schema
SET search_path TO smolapp;

-- Main tables
-- Drop the table if it exists
DROP TABLE IF EXISTS person;
DROP TABLE IF EXISTS link;
DROP TABLE IF EXISTS link_config;

-- Create tables

-- Person
CREATE TABLE person (
  person_id SERIAL PRIMARY KEY,
  first_name VARCHAR(45) NOT NULL,
  last_name VARCHAR(45) NOT NULL,
  email VARCHAR(45) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  added_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT NULL
);

-- Link
CREATE TABLE link (
  link_id SERIAL PRIMARY KEY,
  person_id INT NOT NULL,
  short_url VARCHAR(7) UNIQUE NOT NULL,
  original_url TEXT NOT NULL,
  added_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT NULL,
  FOREIGN KEY (person_id) REFERENCES person(person_id)
);

-- Link Configs
CREATE TABLE link_config (
  link_config_id SERIAL PRIMARY KEY,
  link_id INT NOT NULL,
  visit_count INT NOT NULL DEFAULT 0,
  expires_in TIMESTAMP DEFAULT NULL,
  last_redirect TIMESTAMP DEFAULT NULL,
  password VARCHAR(255) DEFAULT NULL,
  added_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT NULL,
  FOREIGN KEY (link_id) REFERENCES link(link_id)
);