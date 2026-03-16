import { supabase } from '@/integrations/supabase/client';

export async function searchUsers(query: string, currentUserId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('user_id, display_name, avatar_url, xp')
    .ilike('display_name', `%${query}%`)
    .neq('user_id', currentUserId)
    .limit(20);

  if (error) throw error;
  return data || [];
}

export async function sendFriendRequest(fromId: string, toId: string) {
  const { error } = await supabase
    .from('friend_requests')
    .insert({ from_id: fromId, to_id: toId, status: 'pending' });

  if (error) {
    if (error.code === '23505') throw new Error('Friend request already sent');
    throw error;
  }
}

export async function acceptFriendRequest(requestId: string, fromId: string, toId: string) {
  // Update request status
  const { error: updateError } = await supabase
    .from('friend_requests')
    .update({ status: 'accepted' })
    .eq('id', requestId);

  if (updateError) throw updateError;

  // Insert mutual friendship rows
  const { error: friendError } = await supabase
    .from('friends')
    .insert([
      { user_id: toId, friend_id: fromId },
      { user_id: fromId, friend_id: toId },
    ]);

  if (friendError) throw friendError;
}

export async function declineFriendRequest(requestId: string) {
  const { error } = await supabase
    .from('friend_requests')
    .update({ status: 'declined' })
    .eq('id', requestId);

  if (error) throw error;
}

export async function removeFriend(userId: string, friendId: string) {
  // Delete both directions
  const { error: e1 } = await supabase
    .from('friends')
    .delete()
    .eq('user_id', userId)
    .eq('friend_id', friendId);

  if (e1) throw e1;

  const { error: e2 } = await supabase
    .from('friends')
    .delete()
    .eq('user_id', friendId)
    .eq('friend_id', userId);

  if (e2) throw e2;
}

export async function challengeFriend(
  hostId: string,
  friendId: string,
  hostDisplayName: string,
  subjectId: string,
  topicName: string
) {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }

  const { data, error } = await supabase
    .from('battle_rooms')
    .insert({
      room_code: code,
      host_id: hostId,
      host_display_name: hostDisplayName,
      subject_id: subjectId,
      topic_name: topicName,
      status: 'waiting',
      invited_friend_id: friendId,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}
