import { Message } from "../message/message";

export interface Conversation {
    id: string;
    title?: string;
    phone?: string;
    email_address?: string;
    participants: string[];
    messages: Message[];
    created_at: string;
    updated_at: string;
  }
  