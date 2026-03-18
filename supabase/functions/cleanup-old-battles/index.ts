import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

/**
 * Cleanup old battle rooms edge function
 * 
 * This function runs periodically to:
 * 1. Delete finished rooms older than 24 hours
 * 2. Delete abandoned waiting rooms older than 1 hour
 * 3. Delete their associated answers
 * 
 * Can be triggered manually or via cron job
 */
serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create Supabase client with service role for admin operations
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000).toISOString();

    // Find old finished rooms (>24 hours)
    const { data: finishedRooms, error: finishedError } = await supabase
      .from('battle_rooms')
      .select('id')
      .eq('status', 'finished')
      .lt('finished_at', oneDayAgo);

    if (finishedError) throw finishedError;

    // Find abandoned waiting rooms (>1 hour)
    const { data: abandonedRooms, error: abandonedError } = await supabase
      .from('battle_rooms')
      .select('id')
      .eq('status', 'waiting')
      .lt('created_at', oneHourAgo);

    if (abandonedError) throw abandonedError;

    const roomsToDelete = [
      ...(finishedRooms || []),
      ...(abandonedRooms || []),
    ].map(r => r.id);

    let deletedRooms = 0;
    let deletedAnswers = 0;

    if (roomsToDelete.length > 0) {
      // Delete associated answers first
      const { count: answersCount, error: answersError } = await supabase
        .from('battle_answers')
        .delete({ count: 'exact' })
        .in('room_id', roomsToDelete);

      if (answersError) throw answersError;
      deletedAnswers = answersCount || 0;

      // Delete rooms
      const { count: roomsCount, error: roomsError } = await supabase
        .from('battle_rooms')
        .delete({ count: 'exact' })
        .in('id', roomsToDelete);

      if (roomsError) throw roomsError;
      deletedRooms = roomsCount || 0;
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Cleanup completed',
        deletedRooms,
        deletedAnswers,
        timestamp: now.toISOString(),
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Cleanup error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
