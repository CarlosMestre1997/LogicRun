-- =====================================================
-- Migration: Limit user fullname to 30 characters
-- =====================================================

-- Add a check constraint to limit the name field to 30 characters
ALTER TABLE public.users
ADD CONSTRAINT users_name_length_check
CHECK (char_length(name) <= 30);
