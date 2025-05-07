# Use the official lightweight PostgreSQL image
FROM postgres:16-alpine

# Set environment variables for database
# Replace 'your_password' with a strong password in a real setup
ENV POSTGRES_DB=paperswitch
ENV POSTGRES_USER=paperswitch_user
ENV POSTGRES_PASSWORD=your_very_secure_password

# Copy the SQL schema file to the Docker entrypoint directory
# Files in /docker-entrypoint-initdb.d are run automatically when the container starts
COPY schema.sql /docker-entrypoint-initdb.d/

# Expose the PostgreSQL port
EXPOSE 5432 