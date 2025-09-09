-- Drop tables in reverse order of creation to respect foreign key constraints
-- This script will delete all data and tables. Use with caution.

DROP TABLE IF EXISTS transactions;
DROP TABLE IF EXISTS action_logs;
DROP TABLE IF EXISTS accounts;
DROP TABLE IF EXISTS users;

-- Drop custom types
DROP TYPE IF EXISTS transaction_type;
DROP TYPE IF EXISTS account_type;
