import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface PendingChallenge {
  id: string;
  room_code: string;
  host_display_name: string;
  subject_id: string;
  topic_name: string;
  host_id: string;
}

export function useFriendChallenges(userId: string | null) {
  const [challenges, setChallenges] = useState<PendingChallenge[]>([]);

  useEffect(() => {
    if (!userId) return;

    const fetch = async () => {
      const { data } = await supabase
        .from('battle_rooms')
        .select('id, room_code, host_display_name, subject_id, topic_name, host_id')
        .eq('invited_friend_id', userId)
        .eq('status', 'waiting')
        .is('guest_id', null);

      setChallenges((data as PendingChallenge[]) || []);
    };

    fetch();

    const channel = supabase
      .channel('friend-challenges')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'battle_rooms',
      }, () => {
        fetch();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [userId]);

  return challenges;
}
