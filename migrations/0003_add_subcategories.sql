-- Migration: Aggiunta tabella subcategories e campo subcategoryId su professionals

CREATE TABLE IF NOT EXISTS subcategories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) NOT NULL UNIQUE,
    category_id INTEGER NOT NULL REFERENCES categories(id) ON DELETE CASCADE
);

ALTER TABLE professionals ADD COLUMN IF NOT EXISTS subcategory_id INTEGER REFERENCES subcategories(id); 