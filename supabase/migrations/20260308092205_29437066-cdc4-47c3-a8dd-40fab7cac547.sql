-- Add validation trigger for battle_rooms to ensure data integrity

-- Function to validate battle room data
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
$$ LANGUAGE plpgsql;

-- Drop trigger if exists and create new one
DROP TRIGGER IF EXISTS validate_battle_room_trigger ON battle_rooms;
CREATE TRIGGER validate_battle_room_trigger
  BEFORE INSERT OR UPDATE ON battle_rooms
  FOR EACH ROW
  EXECUTE FUNCTION validate_battle_room();

-- Add index for faster room code lookups
CREATE INDEX IF NOT EXISTS idx_battle_rooms_room_code ON battle_rooms(room_code);

-- Add index for cleanup queries
CREATE INDEX IF NOT EXISTS idx_battle_rooms_status_finished_at ON battle_rooms(status, finished_at);
CREATE INDEX IF NOT EXISTS idx_battle_rooms_status_created_at ON battle_rooms(status, created_at);

-- Add constraint to ensure unique room codes
ALTER TABLE battle_rooms DROP CONSTRAINT IF EXISTS battle_rooms_room_code_key;
ALTER TABLE battle_rooms ADD CONSTRAINT battle_rooms_room_code_key UNIQUE (room_code);

-- Comment on table
COMMENT ON TABLE battle_rooms IS 'Stores real-time quiz battle room data with validation triggers to ensure data integrity';
COMMENT ON TABLE battle_answers IS 'Stores individual player answers during battles, linked to battle_rooms';
