
-- Friends table (mutual relationship, both directions stored)
CREATE TABLE public.friends (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  friend_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, friend_id)
);

-- Friend Requests table
CREATE TABLE public.friend_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  from_id uuid NOT NULL,
  to_id uuid NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (from_id, to_id)
);

-- Add invited_friend_id to battle_rooms for friend challenges
ALTER TABLE public.battle_rooms ADD COLUMN invited_friend_id uuid DEFAULT NULL;

-- Enable RLS
ALTER TABLE public.friends ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.friend_requests ENABLE ROW LEVEL SECURITY;

-- Friends RLS: users can see their own friendships
CREATE POLICY "Users can view own friends" ON public.friends
  FOR SELECT USING (auth.uid() = user_id OR auth.uid() = friend_id);

CREATE POLICY "Users can insert own friends" ON public.friends
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own friends" ON public.friends
  FOR DELETE USING (auth.uid() = user_id OR auth.uid() = friend_id);

-- Friend Requests RLS
CREATE POLICY "Users can view own requests" ON public.friend_requests
  FOR SELECT USING (auth.uid() = from_id OR auth.uid() = to_id);

CREATE POLICY "Users can send requests" ON public.friend_requests
  FOR INSERT WITH CHECK (auth.uid() = from_id);

CREATE POLICY "Users can update requests sent to them" ON public.friend_requests
  FOR UPDATE USING (auth.uid() = to_id);

CREATE POLICY "Users can delete own requests" ON public.friend_requests
  FOR DELETE USING (auth.uid() = from_id OR auth.uid() = to_id);

-- Enable realtime for friend system
ALTER PUBLICATION supabase_realtime ADD TABLE public.friends;
ALTER PUBLICATION supabase_realtime ADD TABLE public.friend_requests;
