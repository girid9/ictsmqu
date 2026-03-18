-- Fix function search path security warning
-- Update validate_battle_room function with secure search_path

CREATE OR REPLACE FUNCTION validate_battle_room()
RETURNS TRIGGER AS $$
BEGIN
  -- Validate room code format (6 alphanumeric characters)
  IF NEW.room_code !~ '^[A-Z0-9]{6}$' THEN
    RAISE EXCEPTION 'Invalid room code format. Must be 6 uppercase alphanumeric characters.';
  END IF;

  -- Validate display names
  IF LENGTH(TRIM(NEW.host_display_name)) < 1 OR LENGTH(TRIM(NEW.host_display_name)) > 20 THEN
    RAISE EXCEPTION 'Host display name must be between 1 and 20 characters.';
  END IF;

  IF NEW.guest_display_name IS NOT NULL AND (LENGTH(TRIM(NEW.guest_display_name)) < 1 OR LENGTH(TRIM(NEW.guest_display_name)) > 20) THEN
    RAISE EXCEPTION 'Guest display name must be between 1 and 20 characters.';
  END IF;

  -- Validate scores (0-10)
  IF NEW.host_score < 0 OR NEW.host_score > 10 THEN
    RAISE EXCEPTION 'Host score must be between 0 and 10.';
  END IF;

  IF NEW.guest_score < 0 OR NEW.guest_score > 10 THEN
    RAISE EXCEPTION 'Guest score must be between 0 and 10.';
  END IF;

  -- Validate current question (0-10)
  IF NEW.current_question < 0 OR NEW.current_question > 10 THEN
    RAISE EXCEPTION 'Current question must be between 0 and 10.';
  END IF;

  -- Validate status
  IF NEW.status NOT IN ('waiting', 'ready', 'active', 'finished') THEN
    RAISE EXCEPTION 'Invalid status. Must be waiting, ready, active, or finished.';
  END IF;

  -- Validate question_ids array length (max 10 for battle mode)
  IF ARRAY_LENGTH(NEW.question_ids, 1) > 10 THEN
    RAISE EXCEPTION 'Cannot have more than 10 questions in a battle.';
  END IF;

  -- Ensure finished rooms have finished_at timestamp
  IF NEW.status = 'finished' AND NEW.finished_at IS NULL THEN
    NEW.finished_at = NOW();
  END IF;

  -- Ensure active/finished rooms have started_at timestamp
  IF (NEW.status = 'active' OR NEW.status = 'finished') AND NEW.started_at IS NULL THEN
    NEW.started_at = NOW();
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;