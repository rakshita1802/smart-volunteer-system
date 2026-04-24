CREATE DATABASE volunteer_mgmt;

\c volunteer_mgmt;

CREATE TABLE issues (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  location VARCHAR(255) NOT NULL,
  problem_type VARCHAR(100) NOT NULL,  -- 'water', 'education', 'health', 'food', 'shelter'
  severity INTEGER CHECK (severity BETWEEN 1 AND 5),
  people_affected INTEGER DEFAULT 0,
  status VARCHAR(50) DEFAULT 'open',   -- 'open', 'assigned', 'resolved'
  reported_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE volunteers (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20),
  location VARCHAR(255) NOT NULL,
  skills TEXT[],                        -- e.g. ARRAY['medical', 'teaching', 'logistics']
  availability VARCHAR(50),             -- 'weekdays', 'weekends', 'anytime'
  is_active BOOLEAN DEFAULT TRUE,
  registered_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE tasks (
  id SERIAL PRIMARY KEY,
  issue_id INTEGER REFERENCES issues(id) ON DELETE CASCADE,
  volunteer_id INTEGER REFERENCES volunteers(id) ON DELETE SET NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  required_skill VARCHAR(100),
  status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'in_progress', 'completed'
  assigned_at TIMESTAMP,
  completed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);