
-- Battle rooms for quiz battles
CREATE TABLE public.battle_rooms (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  room_code text NOT NULL UNIQUE,
  host_id uuid NOT NULL,
  guest_id uuid,
  subject_id text NOT NULL,
  topic_name text NOT NULL,
  status text NOT NULL DEFAULT 'waiting',
  question_ids text[] NOT NULL DEFAULT '{}',
  current_question integer NOT NULL DEFAULT 0,
  host_score integer NOT NULL DEFAULT 0,
  guest_score integer NOT NULL DEFAULT 0,
  host_display_name text NOT NULL DEFAULT 'Player 1',
  guest_display_name text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  started_at timestamp with time zone,
  finished_at timestamp with time zone
);

-- Battle answers tracking
CREATE TABLE public.battle_answers (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id uuid NOT NULL REFERENCES public.battle_rooms(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  question_index integer NOT NULL,
  selected_answer text NOT NULL,
  is_correct boolean NOT NULL,
  answered_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(room_id, user_id, question_index)
);

-- Enable RLS
ALTER TABLE public.battle_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.battle_answers ENABLE ROW LEVEL SECURITY;

-- Battle rooms: anyone authenticated can view/create/update rooms
CREATE POLICY "Anyone can view battle rooms" ON public.battle_rooms FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can create rooms" ON public.battle_rooms FOR INSERT TO authenticated WITH CHECK (auth.uid() = host_id);
CREATE POLICY "Players can update their room" ON public.battle_rooms FOR UPDATE TO authenticated USING (auth.uid() = host_id OR auth.uid() = guest_id);

-- Battle answers: players can insert and view answers for their rooms
CREATE POLICY "Players can view battle answers" ON public.battle_answers FOR SELECT TO authenticated USING (true);
CREATE POLICY "Players can insert answers" ON public.battle_answers FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Enable realtime for battle tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.battle_rooms;
ALTER PUBLICATION supabase_realtime ADD TABLE public.battle_answers;
