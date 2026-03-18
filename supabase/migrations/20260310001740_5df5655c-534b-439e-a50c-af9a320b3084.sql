-- Enable realtime for battle tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.battle_rooms;
ALTER PUBLICATION supabase_realtime ADD TABLE public.battle_answers;