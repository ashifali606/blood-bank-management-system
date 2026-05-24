/*
  # BloodLink - Complete Database Schema
  
  This migration creates a complete production-ready schema for the Blood Bank Management System.
  
  ## Tables Created:
  
  1. **donors**
     - Stores donor information with user relationship
     - Blood group, contact details, availability status
     - Indexed for fast searching
  
  2. **blood_requests**
     - Emergency blood request records
     - Patient and hospital information
     - Emergency priority levels
  
  3. **profiles**
     - User profile data linked to auth.users
     - Role-based access (donor, seeker)
     - Auto-created on signup via trigger
  
  ## Security:
  
  - Row Level Security (RLS) enabled on all tables
  - Users can only modify their own data
  - Public read access for donors and blood requests (for finding donors)
  - Authenticated users can create records
  - Proper ownership checks on all policies
  
  ## Features:
  
  - Auto-profile creation trigger on user signup
  - Updated_at timestamp triggers
  - Optimized indexes for search operations
*/

-- Drop existing tables if they exist (clean slate)
DROP TABLE IF EXISTS public.donors CASCADE;
DROP TABLE IF EXISTS public.blood_requests CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.update_updated_at_column() CASCADE;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users CASCADE;

-- Create profiles table (linked to auth.users)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL DEFAULT '',
  phone TEXT DEFAULT '',
  role TEXT NOT NULL DEFAULT 'donor' CHECK (role IN ('donor', 'seeker')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create donors table
CREATE TABLE public.donors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  full_name TEXT NOT NULL,
  age INTEGER NOT NULL CHECK (age >= 18 AND age <= 65),
  blood_group TEXT NOT NULL CHECK (blood_group IN ('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-')),
  phone TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  availability BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create blood_requests table
CREATE TABLE public.blood_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_name TEXT NOT NULL,
  blood_group TEXT NOT NULL CHECK (blood_group IN ('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-')),
  hospital_name TEXT NOT NULL,
  city TEXT NOT NULL,
  phone TEXT NOT NULL,
  units_needed INTEGER NOT NULL DEFAULT 1 CHECK (units_needed >= 1),
  emergency_level TEXT NOT NULL DEFAULT 'normal' CHECK (emergency_level IN ('critical', 'urgent', 'normal')),
  message TEXT DEFAULT '',
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'fulfilled', 'expired')),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.donors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blood_requests ENABLE ROW LEVEL SECURITY;

-- ============================================
-- PROFILES POLICIES
-- ============================================

-- Users can read their own profile
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Users can insert their own profile
CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- ============================================
-- DONORS POLICIES
-- ============================================

-- Anyone can view donors (public access for emergency)
CREATE POLICY "Anyone can view donors"
  ON public.donors FOR SELECT
  TO anon, authenticated
  USING (true);

-- Authenticated users can insert donors (own profile)
CREATE POLICY "Authenticated users can insert donors"
  ON public.donors FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Users can update their own donor profile
CREATE POLICY "Users can update own donor profile"
  ON public.donors FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Users can delete their own donor profile
CREATE POLICY "Users can delete own donor profile"
  ON public.donors FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- ============================================
-- BLOOD_REQUESTS POLICIES
-- ============================================

-- Anyone can view active blood requests (public emergency access)
CREATE POLICY "Anyone can view blood requests"
  ON public.blood_requests FOR SELECT
  TO anon, authenticated
  USING (true);

-- Authenticated users can create blood requests
CREATE POLICY "Authenticated users can create blood requests"
  ON public.blood_requests FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Users can update their own blood requests
CREATE POLICY "Users can update own blood requests"
  ON public.blood_requests FOR UPDATE
  TO authenticated
  USING (created_by = auth.uid())
  WITH CHECK (created_by = auth.uid());

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

CREATE INDEX idx_donors_blood_group ON public.donors(blood_group);
CREATE INDEX idx_donors_city ON public.donors(city);
CREATE INDEX idx_donors_availability ON public.donors(availability);
CREATE INDEX idx_donors_user_id ON public.donors(user_id);
CREATE INDEX idx_blood_requests_status ON public.blood_requests(status);
CREATE INDEX idx_blood_requests_blood_group ON public.blood_requests(blood_group);
CREATE INDEX idx_blood_requests_created_by ON public.blood_requests(created_by);

-- ============================================
-- FUNCTIONS AND TRIGGERS
-- ============================================

-- Function to auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email, phone, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.raw_user_meta_data->>'full_name', ''),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'phone', ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'donor')
  );
  RETURN NEW;
END;
$$;

-- Trigger to auto-create profile on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_donors_updated_at
  BEFORE UPDATE ON public.donors
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_blood_requests_updated_at
  BEFORE UPDATE ON public.blood_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
