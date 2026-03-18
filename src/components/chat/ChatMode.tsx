import { useState } from 'react';
import ChatJoin from './ChatJoin';
import ChatRoom from './ChatRoom';

interface ChatModeProps {
  onExit: () => void;
  playerName: string;
  initialRoomCode?: string | null;
}

export default function ChatMode({ onExit, playerName, initialRoomCode }: ChatModeProps) {
  const [roomCode, setRoomCode] = useState<string | null>(initialRoomCode || null);

  if (!roomCode) {
    return <ChatJoin playerName={playerName} onJoin={setRoomCode} onExit={onExit} />;
  }

  return (
    <ChatRoom
      roomCode={roomCode}
      playerName={playerName}
      onExit={() => setRoomCode(null)}
    />
  );
}
