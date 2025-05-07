-- Basic schema for PaperSwitch

-- Users Table
CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL, -- Store hashed passwords, NOT plaintext!
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Feedback Table
CREATE TABLE feedback (
    feedback_id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(user_id) NULL, -- Allow anonymous feedback
    rating SMALLINT CHECK (rating >= 1 AND rating <= 5) NOT NULL,
    feedback_text TEXT,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Saved Designs Table
-- Using JSONB to store flexible design configuration
CREATE TABLE saved_designs (
    design_id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(user_id),
    design_name VARCHAR(100) NULL, -- Optional name for the design
    design_config JSONB NOT NULL, -- Stores the full notebookConfig object
    saved_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Add indexes for frequently queried columns
CREATE INDEX idx_feedback_user ON feedback(user_id);
CREATE INDEX idx_designs_user ON saved_designs(user_id);

-- Optional: Orders table if implementing full checkout
-- CREATE TABLE orders (
--     order_id SERIAL PRIMARY KEY,
--     user_id INT NOT NULL REFERENCES users(user_id),
--     order_details JSONB NOT NULL, -- Could store the cart items array
--     total_price NUMERIC(10, 2) NOT NULL,
--     shipping_address JSONB NOT NULL,
--     order_status VARCHAR(50) DEFAULT 'pending',
--     ordered_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
--     -- Add payment details/references if needed
-- ); 