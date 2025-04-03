/*
  # Update orders table schema

  This migration has been modified to avoid conflicts with existing policies.
  Since the policies were already created in the previous migration, 
  we'll only create the table if it doesn't exist.

  1. Tables
    - Ensures `orders` table exists with:
      - `id` (uuid, primary key)
      - `user_name` (text, not null)
      - `food_item` (text, not null)
      - `notes` (text)
      - `created_at` (timestamp with time zone)

  2. Security
    - Ensures RLS is enabled on the table
*/

-- Create table if it doesn't exist
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_name text NOT NULL,
  food_item text NOT NULL,
  notes text,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS (idempotent operation)
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;