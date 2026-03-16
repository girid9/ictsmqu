import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface FriendRequest {
  id: string;
  from_id: string;
  to_id: string;
  status: string;
  created_at: string;
  profile?: {
    display_name: string;
    avatar_url: string | null;
    xp: number;
  };
}

export function useFriendRequests(userId: string | null) {
  const [incoming, setIncoming] = useState<FriendRequest[]>([]);
  const [outgoing, setOutgoing] = useState<FriendRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRequests = useCallback(async () => {
    if (!userId) { setLoading(false); return; }

    // Fetch incoming pending
    const { data: inData } = await supabase
      .from('friend_requests')
      .select('*')
      .eq('to_id', userId)
      .eq('status', 'pending');

    // Fetch outgoing pending
    const { data: outData } = await supabase
      .from('friend_requests')
      .select('*')
      .eq('from_id', userId)
      .eq('status', 'pending');

    // Enrich with profiles
    const allUserIds = [
      ...(inData || []).map(r => r.from_id),
      ...(outData || []).map(r => r.to_id),
    ];

    let profileMap: Record<string, { display_name: string; avatar_url: string | null; xp: number }> = {};
    if (allUserIds.length > 0) {
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, display_name, avatar_url, xp')
        .in('user_id', allUserIds);

      (profiles || []).forEach(p => {
        profileMap[p.user_id] = { display_name: p.display_name, avatar_url: p.avatar_url, xp: p.xp };
      });
    }

    setIncoming((inData || []).map(r => ({ ...r, profile: profileMap[r.from_id] })));
    setOutgoing((outData || []).map(r => ({ ...r, profile: profileMap[r.to_id] })));
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  // Realtime
  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel('friend-requests-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'friend_requests',
      }, () => {
        fetchRequests();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [userId, fetchRequests]);

  return { incoming, outgoing, loading, refetch: fetchRequests };
}
