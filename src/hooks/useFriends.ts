import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface FriendProfile {
  user_id: string;
  display_name: string;
  avatar_url: string | null;
  xp: number;
}

export function useFriends(userId: string | null) {
  const [friends, setFriends] = useState<FriendProfile[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFriends = useCallback(async () => {
    if (!userId) { setFriends([]); setLoading(false); return; }

    // Get friend IDs where current user is user_id
    const { data: friendRows } = await supabase
      .from('friends')
      .select('friend_id')
      .eq('user_id', userId);

    if (!friendRows || friendRows.length === 0) {
      setFriends([]);
      setLoading(false);
      return;
    }

    const friendIds = friendRows.map(r => r.friend_id);

    const { data: profiles } = await supabase
      .from('profiles')
      .select('user_id, display_name, avatar_url, xp')
      .in('user_id', friendIds);

    setFriends(profiles || []);
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    fetchFriends();
  }, [fetchFriends]);

  // Realtime subscription
  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel('friends-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'friends',
      }, () => {
        fetchFriends();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [userId, fetchFriends]);

  return { friends, loading, refetch: fetchFriends };
}
