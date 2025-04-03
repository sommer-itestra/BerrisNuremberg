/*
  # Create orders table for food order collection

  1. New Tables
    - `orders`
      - `id` (uuid, primary key)
      - `user_name` (text, not null)
      - `food_item` (text, not null)
      - `notes` (text)
      - `created_at` (timestamp with time zone)

  2. Security
    - Enable RLS on `orders` table
    - Add policies for:
      - Select: Allow anyone to read all orders
      - Insert: Allow anyone to create orders
      - Delete: Allow anyone to delete orders (for demo purposes)
*/

CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_name text NOT NULL,
  food_item text NOT NULL,
  notes text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read orders"
  ON orders
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Anyone can create orders"
  ON orders
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Anyone can delete orders"
  ON orders
  FOR DELETE
  TO public
  USING (true);