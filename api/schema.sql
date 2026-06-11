-- ============================================================================
-- Database Schema: Survey Builder
-- ============================================================================
-- Note: Cloudflare D1 utilizes SQLite under the hood. Thus, this schema 
-- is written in the SQLite dialect using dynamic types like TEXT and JSON.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Table: users
-- ----------------------------------------------------------------------------
-- Represents the owners/creators in the system. These are the people
-- who sign in to build dashboards and view the responses.
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    username TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ----------------------------------------------------------------------------
-- Table: surveys
-- ----------------------------------------------------------------------------
-- Represents a single survey created by a user.
-- It acts as the "container" for questions and handles visual branding.
-- 
-- Relationships:
-- * Belongs to exactly 1 user (user_id).
-- * Has Many questions.
-- * Has Many responses.
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS surveys (
    id TEXT PRIMARY KEY,
    
    -- Foreign key to determine who owns the survey.
    -- ON DELETE CASCADE ensures if a user is deleted, their surveys do too.
    user_id TEXT NOT NULL,
    
    title TEXT NOT NULL,
    
    -- A user-friendly text string used to generate public links.
    -- Instead of accessing /survey/abc-123-uuid, users can access /survey/my-feedback
    url_slug TEXT UNIQUE NOT NULL, 
    
    -- Branding specific requirements from the MVP parameters
    brand_color TEXT DEFAULT '#000000',
    logo_url TEXT,
    
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

-- ----------------------------------------------------------------------------
-- Table: questions
-- ----------------------------------------------------------------------------
-- Represents an individual question block within a survey.
-- 
-- Relationships:
-- * Belongs to exactly 1 survey (survey_id).
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS questions (
    id TEXT PRIMARY KEY,
    survey_id TEXT NOT NULL,
    
    -- The category parameter, allowing the UI to know how to render the input.
    -- Allowed values implicitly: 'short_text', 'multiple_choice', 'rating'
    question_type TEXT NOT NULL, 
    
    -- The actual prompt/text of the question asked to the respondent.
    question_text TEXT NOT NULL,
    
    -- The sorted order index (0, 1, 2, etc.) to guarantee questions show up
    -- in the exact intended configuration on the frontend.
    order_index INTEGER NOT NULL,
    
    -- Validation rule
    is_required BOOLEAN DEFAULT 0,
    
    -- Flexible storage for metadata linked to specific question types.
    -- By utilizing JSON we do not need to create 5 distinct columns for data
    -- that might only apply to 1 type.
    -- Example 1 ('multiple_choice'): ["Apple", "Orange", "Banana"]
    -- Example 2 ('rating'): {"max_rating": 5, "icon": "star"}
    type_specific_options JSON, 
    
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (survey_id) REFERENCES surveys (id) ON DELETE CASCADE
);

-- ----------------------------------------------------------------------------
-- Table: responses
-- ----------------------------------------------------------------------------
-- Represents a single set of answers submitted by an anonymous user 
-- via the public survey link.
-- 
-- Relationships:
-- * Belongs to exactly 1 survey (survey_id).
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS responses (
    id TEXT PRIMARY KEY,
    survey_id TEXT NOT NULL,
    
    -- Storing responses as a JSON object acting as a Map.
    -- The keys represent the Question ID, and the values capture the users input.
    -- Schema format: { "question_1_id": "Text Answer", "question_2_id": "Option A" }
    answers JSON NOT NULL, 
    
    submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (survey_id) REFERENCES surveys (id) ON DELETE CASCADE
);
