export interface ChatCitation {
  readonly chunkId: string;
  readonly chunkIndex: number;
  readonly pageStart?: number | null;
  readonly pageEnd?: number | null;
  readonly score: number;
  readonly preview: string;
}

export interface ChatSession {
  readonly id: string;
  readonly documentId: string;
  readonly title: string;
  readonly lastMessageAt: string;
}

export interface ChatMessage {
  readonly id: string;
  readonly sessionId: string;
  readonly role: "user" | "assistant";
  readonly content: string;
  readonly citations?: ChatCitation[] | null;
  readonly status?: string | null;
  readonly createdAt: string;
}
