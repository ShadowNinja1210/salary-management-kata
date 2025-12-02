-- Create Employee table for Salary Management Kata
CREATE TABLE IF NOT EXISTS "Employee" (
  id SERIAL PRIMARY KEY,
  "fullName" VARCHAR(255) NOT NULL,
  "jobTitle" VARCHAR(255) NOT NULL,
  country VARCHAR(255) NOT NULL,
  salary DECIMAL(18, 2) NOT NULL,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_employee_country ON "Employee" (country);
CREATE INDEX IF NOT EXISTS idx_employee_job_title ON "Employee" ("jobTitle");
