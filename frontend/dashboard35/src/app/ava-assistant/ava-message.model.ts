// Defines the structure for an AVA assistant message
export interface AvaMessage {
  id: string;
  content: string;
  sender: "user" | "assistant";
  timestamp: Date;
} 