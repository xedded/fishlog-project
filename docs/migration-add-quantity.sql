-- Add quantity column to catches table
-- This allows tracking multiple fish caught at the same time/location

ALTER TABLE catches ADD COLUMN IF NOT EXISTS quantity INTEGER DEFAULT 1;

-- Update existing catches to have quantity = 1
UPDATE catches SET quantity = 1 WHERE quantity IS NULL;

-- Verify the change
SELECT id, species_id, quantity, caught_at FROM catches LIMIT 5;
