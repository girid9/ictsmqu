-- Allow hosts to delete their own waiting rooms (for cancel)
CREATE POLICY "Hosts can delete waiting rooms"
  ON public.battle_rooms FOR DELETE
  TO authenticated
  USING (auth.uid() = host_id AND status = 'waiting');