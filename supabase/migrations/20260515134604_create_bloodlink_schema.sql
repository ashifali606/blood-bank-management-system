/*
  # BloodLink - Blood Bank Management System Schema

  1. New Tables
    - `donors`
      - `id` (uuid, primary key) - Unique donor identifier
      - `user_id` (uuid, foreign key to auth.users) - Links donor to auth account
      - `full_name` (text) - Donor's full name
      - `age` (integer) - Donor's age
      - `blood_group` (text) - Blood group (A+, A-, B+, B-, AB+, AB-, O+, O-)
      - `phone` (text) - Contact phone number
      - `email` (text) - Email address
      - `location` (text) - City/area location
      - `address` (text) - Full address
      - `last_donation_date` (date) - Date of last donation
      - `availability_status` (boolean) - Whether donor is currently available
      - `created_at` (timestamptz) - Registration timestamp

    - `blood_requests`
      - `id` (uuid, primary key) - Unique request identifier
      - `patient_name` (text) - Name of the patient
      - `hospital_name` (text) - Hospital name
      - `blood_group` (text) - Required blood group
      - `units_needed` (integer) - Number of units required
      - `emergency_level` (text) - Emergency level (critical, urgent, normal)
      - `contact_number` (text) - Emergency contact number
      - `location` (text) - Hospital location
      - `notes` (text) - Additional notes
      - `status` (text) - Request status (active, fulfilled, expired)
      - `created_at` (timestamptz) - Request timestamp

    - `profiles`
      - `id` (uuid, primary key, foreign key to auth.users) - User ID
      - `full_name` (text) - User's full name
      - `phone` (text) - Phone number
      - `blood_group` (text) - Blood group
      - `location` (text) - Location
      - `age` (integer) - Age
      - `role` (text) - User role (donor, admin)
      - `created_at` (timestamptz) - Profile creation timestamp

  2. Security
    - Enable RLS on all tables
    - Donors: anyone can read, authenticated users can insert own, admins can update/delete
    - Blood requests: anyone can read, authenticated users can insert, admins can update
    - Profiles: users can read own, admins can read all, users can update own
*/

-- Create donors table
CREATE TABLE IF NOT EXISTS donors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  full_name text NOT NULL,
  age integer NOT NULL,
  blood_group text NOT NULL CHECK (blood_group IN ('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-')),
  phone text NOT NULL,
  email text NOT NULL,
  location text NOT NULL,
  address text DEFAULT '',
  last_donation_date date,
  availability_status boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Create blood_requests table
CREATE TABLE IF NOT EXISTS blood_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_name text NOT NULL,
  hospital_name text NOT NULL,
  blood_group text NOT NULL CHECK (blood_group IN ('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-')),
  units_needed integer NOT NULL DEFAULT 1,
  emergency_level text NOT NULL DEFAULT 'normal' CHECK (emergency_level IN ('critical', 'urgent', 'normal')),
  contact_number text NOT NULL,
  location text NOT NULL,
  notes text DEFAULT '',
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'fulfilled', 'expired')),
  created_at timestamptz DEFAULT now()
);

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL DEFAULT '',
  phone text DEFAULT '',
  blood_group text DEFAULT '',
  location text DEFAULT '',
  age integer,
  role text NOT NULL DEFAULT 'donor' CHECK (role IN ('donor', 'admin')),
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE donors ENABLE ROW LEVEL SECURITY;
ALTER TABLE blood_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Donors policies
CREATE POLICY "Anyone can view donors"
  ON donors FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Anyone can view donors public"
  ON donors FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Authenticated users can insert donors"
  ON donors FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update own donor profile"
  ON donors FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can update any donor"
  ON donors FOR UPDATE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admins can delete donors"
  ON donors FOR DELETE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- Blood requests policies
CREATE POLICY "Anyone can view blood requests"
  ON blood_requests FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Anyone can view blood requests public"
  ON blood_requests FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Authenticated users can create blood requests"
  ON blood_requests FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Admins can update blood requests"
  ON blood_requests FOR UPDATE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admins can delete blood requests"
  ON blood_requests FOR DELETE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- Profiles policies
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (id = auth.uid());

CREATE POLICY "Admins can view all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (id = auth.uid());

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_donors_blood_group ON donors(blood_group);
CREATE INDEX IF NOT EXISTS idx_donors_location ON donors(location);
CREATE INDEX IF NOT EXISTS idx_donors_availability ON donors(availability_status);
CREATE INDEX IF NOT EXISTS idx_blood_requests_blood_group ON blood_requests(blood_group);
CREATE INDEX IF NOT EXISTS idx_blood_requests_status ON blood_requests(status);
CREATE INDEX IF NOT EXISTS idx_blood_requests_emergency ON blood_requests(emergency_level);

-- Function to auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, phone, blood_group, location, age, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'phone', ''),
    COALESCE(NEW.raw_user_meta_data->>'blood_group', ''),
    COALESCE(NEW.raw_user_meta_data->>'location', ''),
    COALESCE((NEW.raw_user_meta_data->>'age')::integer, NULL),
    'donor'
  );
  RETURN NEW;
END;
$$;

-- Trigger to auto-create profile
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
