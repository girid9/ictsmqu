-- Drop all existing battle_rooms policies
DROP POLICY IF EXISTS "Anyone can view battle rooms" ON public.battle_rooms;
DROP POLICY IF EXISTS "Authenticated users can create rooms" ON public.battle_rooms;
DROP POLICY IF EXISTS "Players can update their room" ON public.battle_rooms;
DROP POLICY IF EXISTS "Hosts can delete waiting rooms" ON public.battle_rooms;

-- Recreate as PERMISSIVE (default)
CREATE POLICY "Anyone can view battle rooms"
  ON public.battle_rooms FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create rooms"
  ON public.battle_rooms FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = host_id);

CREATE POLICY "Players can update their room"
  ON public.battle_rooms FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = host_id 
    OR auth.uid() = guest_id 
    OR (guest_id IS NULL AND status = 'waiting')
  );

CREATE POLICY "Hosts can delete waiting rooms"
  ON public.battle_rooms FOR DELETE
  TO authenticated
  USING (auth.uid() = host_id AND status = 'waiting');

-- Also fix battle_answers policies
DROP POLICY IF EXISTS "Players can insert answers" ON public.battle_answers;
DROP POLICY IF EXISTS "Players can view battle answers" ON public.battle_answers;

CREATE POLICY "Players can insert answers"
  ON public.battle_answers FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Players can view battle answers"
  ON public.battle_answers FOR SELECT
  TO authenticated
  USING (true);