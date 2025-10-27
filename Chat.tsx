import React, { useState, useRef, useEffect } from 'react';
import type { ChatMessage, User } from '../../types';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { ScrollArea } from '../ui/scroll-area';
import { Avatar } from '../ui/avatar';
import * as Icons from '../Icons';
import { cn } from '../../utils/cn';

interface ChatProps {
    messages: ChatMessage[];
    onSendMessage: (text: string) => void;
    currentUser: User | null;
}

const Chat: React.FC<ChatProps> = ({ messages, onSendMessage, currentUser }) => {
    const [newMessage, setNewMessage] = useState('');
    const scrollAreaRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollAreaRef.current) {
            scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (newMessage.trim()) {
            onSendMessage(newMessage.trim());
            setNewMessage('');
        }
    };

    return (
        <div className="flex flex-col h-full bg-black/20 p-2 rounded-lg">
            <h3 className="text-sm font-bold text-slate-400 p-2">Live Chat</h3>
            <ScrollArea className="flex-grow p-2">
                <div className="space-y-4">
                    {messages.map((msg) => (
                        <div key={msg.id} className={cn("flex items-start gap-2", msg.userId === currentUser?.id ? "justify-end" : "")}>
                            {msg.userId !== currentUser?.id && (
                                <Avatar className="w-6 h-6"><img src={msg.avatarUrl} alt={msg.userName} /></Avatar>
                            )}
                            <div className="flex flex-col">
                                <span className={cn("text-xs text-slate-500", msg.userId === currentUser?.id ? "text-right" : "text-left")}>{msg.userName}</span>
                                <div className={cn("p-2 rounded-lg text-sm max-w-xs", msg.userId === currentUser?.id ? "bg-purple-600 text-white" : "bg-slate-700 text-slate-200")}>
                                    {msg.text}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </ScrollArea>
            <form onSubmit={handleSubmit} className="flex gap-2 p-2">
                <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="bg-slate-800 border-slate-600"
                />
                <Button type="submit" size="icon">
                    <Icons.Send className="w-4 h-4" />
                </Button>
            </form>
        </div>
    );
};

export default Chat;
