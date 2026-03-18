
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS coins integer NOT NULL DEFAULT 500,
ADD COLUMN IF NOT EXISTS wins integer NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS losses integer NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS draws integer NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_daily_bonus timestamp with time zone;

ALTER TABLE public.battle_rooms 
ADD COLUMN IF NOT EXISTS bet_amount integer NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS questions_data jsonb;
