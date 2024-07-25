export interface Message {
    id?: string | null;
    conversation_id: string;
    content: string;
    created_at?: string;
    username?: string;
  }