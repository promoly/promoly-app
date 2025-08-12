-- Enable pgvector extension for embeddings
CREATE EXTENSION IF NOT EXISTS vector;

-- Create the promoly database if it doesn't exist
-- This is handled by the docker-compose environment variables
