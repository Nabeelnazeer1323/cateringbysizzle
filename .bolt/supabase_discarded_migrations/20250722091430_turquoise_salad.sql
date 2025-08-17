/*
  # Add RLS policies for combined registration flow

  1. New Policies
    - `companies` table: Allow authenticated users to insert new companies
    - `profiles` table: Allow users to update their own profile records

  2. Security
    - Enable RLS on both tables (if not already enabled)
    - Add policies for INSERT on companies and UPDATE on profiles
    - Ensure users can only modify their own data

  3. Notes
    - These policies support the new registration flow where users can create companies
      and update their profiles immediately after signup
    - The companies INSERT policy allows any authenticated user to create a company
    - The profiles UPDATE policy ensures users can only update their own profile
*/

-- Ensure RLS is enabled on companies table
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;

-- Ensure RLS is enabled on profiles table  
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to insert new companies
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'companies' 
    AND policyname = 'Authenticated users can create companies'
  ) THEN
    CREATE POLICY "Authenticated users can create companies"
      ON companies
      FOR INSERT
      TO authenticated
      WITH CHECK (auth.uid() IS NOT NULL);
  END IF;
END $$;

-- Allow users to update their own profile
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'profiles' 
    AND policyname = 'Users can update own profile'
  ) THEN
    CREATE POLICY "Users can update own profile"
      ON profiles
      FOR UPDATE
      TO authenticated
      USING (auth.uid() = id)
      WITH CHECK (auth.uid() = id);
  END IF;
END $$;

-- Allow users to read their own profile (if not already exists)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'profiles' 
    AND policyname = 'Users can read own profile'
  ) THEN
    CREATE POLICY "Users can read own profile"
      ON profiles
      FOR SELECT
      TO authenticated
      USING (auth.uid() = id);
  END IF;
END $$;

-- Allow users to read companies for joining (if not already exists)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'companies' 
    AND policyname = 'Authenticated users can read companies'
  ) THEN
    CREATE POLICY "Authenticated users can read companies"
      ON companies
      FOR SELECT
      TO authenticated
      USING (true);
  END IF;
END $$;