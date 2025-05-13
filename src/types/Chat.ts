export type Chat = {
    id: string;
    messages: ChatMessage[];
}

export type ChatMessage = {
    role: string;
    content: string;
    createdAt: string;
}