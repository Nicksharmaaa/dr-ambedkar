-- Setup dedicated user and database for Ambedkar Heritage
DO $$
BEGIN
   IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'ambedkar_user') THEN
      CREATE ROLE ambedkar_user WITH LOGIN PASSWORD 'ambedkar_local_sih_2026_sec!';
   ELSE
      ALTER ROLE ambedkar_user WITH PASSWORD 'ambedkar_local_sih_2026_sec!';
   END IF;
END
$$;

SELECT 'Database check' as step;
SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = 'ambedkar_db';
DROP DATABASE IF EXISTS ambedkar_db;
CREATE DATABASE ambedkar_db OWNER ambedkar_user;
GRANT ALL PRIVILEGES ON DATABASE ambedkar_db TO ambedkar_user;
