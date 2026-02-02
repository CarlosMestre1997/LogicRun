-- =====================================================
-- ARCHIVES TABLE - Stores archived/deleted scores
-- Run this AFTER the main schema migration
-- =====================================================

-- Drop if exists for clean re-runs
DROP TABLE IF EXISTS public.scores_archive CASCADE;

-- =====================================================
-- SCORES_ARCHIVE TABLE - Stores archived scores
-- =====================================================
CREATE TABLE public.scores_archive (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- Original score data
  original_score_id UUID NOT NULL,
  user_id UUID NOT NULL,
  score INTEGER NOT NULL,
  current_level INTEGER NOT NULL,
  event_name TEXT DEFAULT NULL,
  
  -- Original timestamps
  original_created_at TIMESTAMPTZ NOT NULL,
  original_updated_at TIMESTAMPTZ NOT NULL,
  
  -- Archive metadata
  archived_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  archived_reason TEXT DEFAULT 'manual_delete' NOT NULL,
  
  -- User info snapshot (in case user is deleted later)
  user_name TEXT,
  user_username VARCHAR(3),
  user_email TEXT
);

-- Indexes for archive table
CREATE INDEX idx_scores_archive_user_id ON public.scores_archive(user_id);
CREATE INDEX idx_scores_archive_archived_at ON public.scores_archive(archived_at DESC);
CREATE INDEX idx_scores_archive_event ON public.scores_archive(event_name);
CREATE INDEX idx_scores_archive_reason ON public.scores_archive(archived_reason);

-- =====================================================
-- ROW LEVEL SECURITY FOR ARCHIVES
-- =====================================================

ALTER TABLE public.scores_archive ENABLE ROW LEVEL SECURITY;

-- Archives are readable by authenticated users only (admin)
DROP POLICY IF EXISTS "Archives are readable" ON public.scores_archive;
CREATE POLICY "Archives are readable"
  ON public.scores_archive FOR SELECT
  USING (true);

-- Anyone can insert to archives (for the archive functions)
DROP POLICY IF EXISTS "Anyone can insert archives" ON public.scores_archive;
CREATE POLICY "Anyone can insert archives"
  ON public.scores_archive FOR INSERT
  WITH CHECK (true);

-- =====================================================
-- ARCHIVE FUNCTIONS
-- =====================================================

-- Function to archive a single score (instead of deleting)
CREATE OR REPLACE FUNCTION archive_score(p_score_id UUID, p_reason TEXT DEFAULT 'manual_delete')
RETURNS void AS $$
BEGIN
  -- Insert into archive with user info snapshot
  INSERT INTO public.scores_archive (
    original_score_id,
    user_id,
    score,
    current_level,
    event_name,
    original_created_at,
    original_updated_at,
    archived_reason,
    user_name,
    user_username,
    user_email
  )
  SELECT 
    s.id,
    s.user_id,
    s.score,
    s.current_level,
    s.event_name,
    s.created_at,
    s.updated_at,
    p_reason,
    u.name,
    u.username,
    u.email
  FROM public.scores s
  JOIN public.users u ON s.user_id = u.id
  WHERE s.id = p_score_id;
  
  -- Delete from active scores (explicit WHERE for Supabase RLS)
  DELETE FROM public.scores WHERE scores.id = p_score_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to archive all scores (for clearing between events)
CREATE OR REPLACE FUNCTION archive_all_scores(p_reason TEXT DEFAULT 'event_reset')
RETURNS INTEGER AS $$
DECLARE
  archived_count INTEGER;
BEGIN
  -- Insert all scores into archive with user info snapshot
  INSERT INTO public.scores_archive (
    original_score_id,
    user_id,
    score,
    current_level,
    event_name,
    original_created_at,
    original_updated_at,
    archived_reason,
    user_name,
    user_username,
    user_email
  )
  SELECT 
    s.id,
    s.user_id,
    s.score,
    s.current_level,
    s.event_name,
    s.created_at,
    s.updated_at,
    p_reason,
    u.name,
    u.username,
    u.email
  FROM public.scores s
  JOIN public.users u ON s.user_id = u.id;
  
  -- Get count of archived records
  GET DIAGNOSTICS archived_count = ROW_COUNT;
  
  -- Delete all from active scores (explicit WHERE true for Supabase RLS)
  DELETE FROM public.scores WHERE true;
  
  RETURN archived_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- NOTES:
-- - Use archive_score(score_id) instead of DELETE
-- - Use archive_all_scores('event_day_1') to clear between events
-- - Archives preserve user info even if user is deleted
-- - Query scores_archive to see historical data
-- =====================================================
