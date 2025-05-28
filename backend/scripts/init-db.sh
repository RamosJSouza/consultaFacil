#!/bin/bash

# Check if psql is installed
if ! command -v psql &> /dev/null; then
    echo "Error: PostgreSQL client (psql) is not installed"
    exit 1
fi

# Database configuration
DB_NAME="consultafacil"
DB_USER="postgres"  # Change this if needed
DB_HOST="localhost" # Change this if needed
DB_PORT="5432"     # Change this if needed

echo "Initializing ConsultaFácil database..."

# Create database and initialize schema
psql -h $DB_HOST -p $DB_PORT -U $DB_USER -f ../database.sql

if [ $? -eq 0 ]; then
    echo "Database initialization completed successfully!"
else
    echo "Error: Database initialization failed"
    exit 1
fi 