import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft, Send, Mic, MicOff, Phone, PhoneOff } from 'lucide-react';
import IncomingCallOverlay from './IncomingCallOverlay';

interface Message {
  id: string;
  room_code: string;
  user_id: string;
  display_name: string;
  message: string;
  created_at: string;
}

interface ChatRoomProps {
  roomCode: string;
  playerName: string;
  onExit: () => void;
}

type CallState = 'idle' | 'calling' | 'ringing' | 'active';

export default function ChatRoom({ roomCode, playerName, onExit }: ChatRoomProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [userId, setUserId] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [callState, setCallState] = useState<CallState>('idle');
  const [callerName, setCallerName] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const peerRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const remoteAudioRef = useRef<HTMLAudioElement>(null);
  const pendingOfferRef = useRef<{ offer: RTCSessionDescriptionInit; from: string } | null>(null);
  const voiceChannelRef = useRef<any>(null);
  const ringtoneRef = useRef<any>(null);

  // Get user ID
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUserId(data.user?.id ?? null));
  }, []);

  // Fetch existing messages
  useEffect(() => {
    const fetchMessages = async () => {
      const { data } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('room_code', roomCode)
        .order('created_at', { ascending: true })
        .limit(100);
      if (data) setMessages(data as Message[]);
    };
    fetchMessages();
  }, [roomCode]);

  // Realtime message subscription
  useEffect(() => {
    const channel = supabase
      .channel(`chat-${roomCode}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'chat_messages',
        filter: `room_code=eq.${roomCode}`,
      }, (payload) => {
        setMessages(prev => [...prev, payload.new as Message]);
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [roomCode]);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Simple ringtone using Web Audio API
  const startRingtone = useCallback(() => {
    try {
      const ctx = new AudioContext();
      const playBeep = () => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.value = 440;
        gain.gain.value = 0.3;
        osc.start();
        osc.stop(ctx.currentTime + 0.3);
      };
      const interval = setInterval(playBeep, 1500);
      playBeep();
      ringtoneRef.current = { ctx, interval };
    } catch { /* silent */ }
  }, []);

  const stopRingtone = useCallback(() => {
    if (ringtoneRef.current) {
      clearInterval(ringtoneRef.current.interval);
      ringtoneRef.current.ctx.close().catch(() => {});
      ringtoneRef.current = null;
    }
  }, []);

  // Create peer connection
  const createPeer = useCallback(() => {
    const pc = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
      ],
    });

    pc.onicecandidate = (e) => {
      if (e.candidate && voiceChannelRef.current) {
        voiceChannelRef.current.send({
          type: 'broadcast',
          event: 'ice-candidate',
          payload: { candidate: e.candidate, from: userId },
        });
      }
    };

    pc.ontrack = (e) => {
      if (remoteAudioRef.current) {
        remoteAudioRef.current.srcObject = e.streams[0];
      }
    };

    pc.onconnectionstatechange = () => {
      if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed') {
        endCall(false);
      }
    };

    peerRef.current = pc;
    return pc;
  }, [userId]);

  // Voice call signaling
  useEffect(() => {
    if (!userId) return;

    const voiceChannel = supabase.channel(`voice-${roomCode}`, {
      config: { broadcast: { self: false } },
    });
    voiceChannelRef.current = voiceChannel;

    voiceChannel
      .on('broadcast', { event: 'call-request' }, ({ payload }) => {
        if (payload.from === userId) return;
        // Incoming call - show ringing UI
        setCallerName(payload.callerName || 'Someone');
        pendingOfferRef.current = null; // will get offer after accept
        setCallState('ringing');
        startRingtone();
      })
      .on('broadcast', { event: 'call-accepted' }, async ({ payload }) => {
        if (payload.from === userId) return;
        // Other side accepted, send the offer now
        stopRingtone();
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          localStreamRef.current = stream;
          const pc = createPeer();
          stream.getTracks().forEach(track => pc.addTrack(track, stream));
          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);
          setCallState('active');

          voiceChannel.send({
            type: 'broadcast',
            event: 'offer',
            payload: { offer, from: userId },
          });
        } catch (err) {
          console.error('Failed to create offer:', err);
          setCallState('idle');
        }
      })
      .on('broadcast', { event: 'call-declined' }, ({ payload }) => {
        if (payload.from === userId) return;
        stopRingtone();
        setCallState('idle');
      })
      .on('broadcast', { event: 'offer' }, async ({ payload }) => {
        if (payload.from === userId) return;
        // Receive offer and send answer
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          localStreamRef.current = stream;
          const pc = createPeer();
          stream.getTracks().forEach(track => pc.addTrack(track, stream));
          await pc.setRemoteDescription(new RTCSessionDescription(payload.offer));
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          setCallState('active');

          voiceChannel.send({
            type: 'broadcast',
            event: 'answer',
            payload: { answer, from: userId },
          });
        } catch (err) {
          console.error('Failed to handle offer:', err);
        }
      })
      .on('broadcast', { event: 'answer' }, async ({ payload }) => {
        if (payload.from === userId) return;
        if (peerRef.current) {
          await peerRef.current.setRemoteDescription(new RTCSessionDescription(payload.answer));
        }
      })
      .on('broadcast', { event: 'ice-candidate' }, async ({ payload }) => {
        if (payload.from === userId) return;
        if (peerRef.current) {
          try {
            await peerRef.current.addIceCandidate(new RTCIceCandidate(payload.candidate));
          } catch { /* ignore */ }
        }
      })
      .on('broadcast', { event: 'hangup' }, () => {
        endCall(false);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(voiceChannel);
      voiceChannelRef.current = null;
    };
  }, [userId, roomCode, createPeer, startRingtone, stopRingtone]);

  // Start a call (ring the other person)
  const startCall = useCallback(() => {
    if (!voiceChannelRef.current) return;
    setCallState('calling');
    startRingtone();
    voiceChannelRef.current.send({
      type: 'broadcast',
      event: 'call-request',
      payload: { from: userId, callerName: playerName },
    });

    // Auto-cancel after 30 seconds
    setTimeout(() => {
      setCallState(prev => {
        if (prev === 'calling') {
          stopRingtone();
          return 'idle';
        }
        return prev;
      });
    }, 30000);
  }, [userId, playerName, startRingtone, stopRingtone]);

  // Accept incoming call
  const acceptCall = useCallback(() => {
    stopRingtone();
    setCallState('active');
    if (voiceChannelRef.current) {
      voiceChannelRef.current.send({
        type: 'broadcast',
        event: 'call-accepted',
        payload: { from: userId },
      });
    }
  }, [userId, stopRingtone]);

  // Decline incoming call
  const declineCall = useCallback(() => {
    stopRingtone();
    setCallState('idle');
    if (voiceChannelRef.current) {
      voiceChannelRef.current.send({
        type: 'broadcast',
        event: 'call-declined',
        payload: { from: userId },
      });
    }
  }, [userId, stopRingtone]);

  // End active call
  const endCall = useCallback((notify = true) => {
    stopRingtone();
    localStreamRef.current?.getTracks().forEach(t => t.stop());
    localStreamRef.current = null;
    peerRef.current?.close();
    peerRef.current = null;
    setCallState('idle');

    if (notify && voiceChannelRef.current) {
      voiceChannelRef.current.send({
        type: 'broadcast',
        event: 'hangup',
        payload: { from: userId },
      });
    }
  }, [userId, stopRingtone]);

  const sendMessage = async () => {
    const trimmed = input.trim();
    if (!trimmed || !userId) return;
    setInput('');
    await supabase.from('chat_messages').insert({
      room_code: roomCode,
      user_id: userId,
      display_name: playerName,
      message: trimmed,
    });
  };

  // Speech-to-text
  const toggleListening = () => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) return;
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput(prev => prev + (prev ? ' ' : '') + transcript);
      setIsListening(false);
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);
    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
  };

  const callButtonLabel = callState === 'calling' ? 'Calling…' : callState === 'active' ? 'End Call' : 'Call';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col h-[calc(100vh-2rem)] max-w-lg mx-auto"
    >
      {/* Incoming call overlay */}
      <AnimatePresence>
        {callState === 'ringing' && (
          <IncomingCallOverlay
            callerName={callerName}
            onAccept={acceptCall}
            onDecline={declineCall}
          />
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex items-center gap-3 py-3 px-1 border-b border-border">
        <button onClick={onExit} className="text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <h2 className="text-sm font-bold text-foreground">Room: {roomCode}</h2>
          <p className="text-[10px] text-muted-foreground">Share this code with others to join</p>
        </div>
        <button
          onClick={callState === 'active' || callState === 'calling' ? () => endCall() : startCall}
          disabled={callState === 'ringing'}
          className={`px-3 py-2 rounded-full flex items-center gap-1.5 text-xs font-bold transition-all ${
            callState === 'active'
              ? 'bg-destructive text-destructive-foreground'
              : callState === 'calling'
              ? 'bg-yellow-500/20 text-yellow-600 animate-pulse'
              : 'bg-green-500/10 text-green-600 hover:bg-green-500/20'
          }`}
        >
          {callState === 'active' || callState === 'calling' ? (
            <PhoneOff className="w-4 h-4" />
          ) : (
            <Phone className="w-4 h-4" />
          )}
          {callButtonLabel}
        </button>
      </div>

      {/* Active call indicator */}
      {callState === 'active' && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          className="px-3 py-2 bg-green-500/10 border-b border-green-500/20 text-center"
        >
          <p className="text-xs font-semibold text-green-600">🔊 Voice call active — speak freely!</p>
        </motion.div>
      )}

      {callState === 'calling' && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          className="px-3 py-2 bg-yellow-500/10 border-b border-yellow-500/20 text-center"
        >
          <motion.p
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
            className="text-xs font-semibold text-yellow-600"
          >
            📞 Calling… waiting for answer
          </motion.p>
        </motion.div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-3">
        {messages.length === 0 && (
          <p className="text-center text-xs text-muted-foreground mt-8">
            — Start of conversation —
          </p>
        )}
        {messages.map(msg => {
          const isMe = msg.user_id === userId;
          return (
            <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[75%] px-3 py-2 rounded-2xl text-sm ${
                  isMe
                    ? 'bg-primary text-primary-foreground rounded-br-md'
                    : 'bg-muted text-foreground rounded-bl-md'
                }`}
              >
                {!isMe && (
                  <p className="text-[10px] font-bold opacity-70 mb-0.5">{msg.display_name}</p>
                )}
                <p className="break-words">{msg.message}</p>
                <p className={`text-[9px] mt-1 ${isMe ? 'opacity-60' : 'opacity-40'}`}>
                  {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="px-3 py-3 border-t border-border bg-card/50">
        <div className="flex items-center gap-2">
          <button
            onClick={toggleListening}
            className={`w-9 h-9 rounded-full flex items-center justify-center transition-all shrink-0 ${
              isListening
                ? 'bg-destructive text-destructive-foreground animate-pulse'
                : 'bg-muted text-muted-foreground hover:text-foreground'
            }`}
          >
            {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Type a message..."
            className="flex-1 px-3 py-2 rounded-xl bg-muted/50 border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim()}
            className="w-9 h-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center transition-all hover:opacity-90 active:scale-95 disabled:opacity-40 shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Remote audio element */}
      <audio ref={remoteAudioRef} autoPlay />
    </motion.div>
  );
}
