-- Drop the old restrictive update policy
DROP POLICY "Players can update their room" ON public.battle_rooms;

-- Create new policy that allows: host updates OR guest updates OR joining (guest_id is null and status is waiting)
CREATE POLICY "Players can update their room"
  ON public.battle_rooms FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = host_id 
    OR auth.uid() = guest_id 
    OR (guest_id IS NULL AND status = 'waiting')
  );