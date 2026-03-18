
CREATE TABLE public.chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_code text NOT NULL,
  user_id uuid NOT NULL,
  display_name text NOT NULL DEFAULT 'Player',
  message text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_chat_messages_room_code ON public.chat_messages(room_code);

ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view chat messages" ON public.chat_messages FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can insert chat messages" ON public.chat_messages FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;
