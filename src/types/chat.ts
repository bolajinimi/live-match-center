export interface ChatMessage {
  id: string;
  matchId: string;
  userId: string;
  username: string;
  message: string;
  timestamp: string;
}

export interface TypingUser {
  userId: string;
  username: string;
}

export interface LocalUser {
  userId: string;
  username: string;
}
