import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Send, Bot, User, ExternalLink, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { apiClient, ChatResponse } from '@/lib/api';
import { cn } from '@/lib/utils';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  sources?: any[];
}

export function ChatInterface() {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);

  const { data: history } = useQuery({
    queryKey: ['chat-history'],
    queryFn: () => apiClient.getHistory(),
  });

  const chatMutation = useMutation({
    mutationFn: (message: string) => apiClient.chat({ message, include_sources: true }),
    onSuccess: (response: ChatResponse) => {
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: response.answer,
          timestamp: response.timestamp,
          sources: response.sources
        }
      ]);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || chatMutation.isPending) return;

    const userMessage: Message = {
      role: 'user',
      content: message,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMessage]);
    chatMutation.mutate(message);
    setMessage('');
  };

  return (
    <div className="h-full flex flex-col max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">PM Copilot Assistant</h1>
        <p className="text-muted-foreground">
          Your AI-powered product management companion. Ask questions about product strategy, roadmaps, PRDs, and more.
        </p>
      </div>

      <Card className="flex-1 flex flex-col">
        <CardContent className="flex-1 flex flex-col p-6">
          <ScrollArea className="flex-1 mb-4 min-h-0">
            <div className="space-y-4">
              {messages.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  <Bot className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg mb-2">Welcome to PM Copilot!</p>
                  <p>Start by asking me anything about product management, or try:</p>
                  <div className="mt-4 space-y-2 max-w-md mx-auto text-sm">
                    <p className="italic">"Help me write a PRD for a new feature"</p>
                    <p className="italic">"What are key metrics for user onboarding?"</p>
                    <p className="italic">"Draft release notes for our latest update"</p>
                  </div>
                </div>
              )}
              
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={cn(
                    "flex gap-3 animate-fade-up",
                    msg.role === 'user' ? "justify-end" : "justify-start"
                  )}
                >
                  {msg.role === 'assistant' && (
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-1">
                      <Bot className="h-4 w-4 text-primary" />
                    </div>
                  )}
                  
                  <div className={cn(
                    "max-w-2xl",
                    msg.role === 'user' ? "text-right" : "text-left"
                  )}>
                    <div
                      className={cn(
                        "rounded-lg p-3 mb-2",
                        msg.role === 'user'
                          ? "bg-primary text-primary-foreground ml-12"
                          : "bg-muted"
                      )}
                    >
                      <div className="message-content whitespace-pre-wrap">
                        {msg.content}
                      </div>
                    </div>
                    
                    {msg.sources && msg.sources.length > 0 && (
                      <div className="text-xs space-y-1">
                        <p className="text-muted-foreground font-medium">
                          Sources ({msg.sources.length}):
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {msg.sources.map((source, i) => (
                            <Badge key={i} variant="secondary" className="text-xs">
                              {source.type} - {source.source}
                              <ExternalLink className="h-2 w-2 ml-1" />
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {msg.role === 'user' && (
                    <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center flex-shrink-0 mt-1">
                      <User className="h-4 w-4" />
                    </div>
                  )}
                </div>
              ))}
              
              {chatMutation.isPending && (
                <div className="flex gap-3">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Bot className="h-4 w-4 text-primary" />
                  </div>
                  <div className="bg-muted rounded-lg p-3 flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm text-muted-foreground">Thinking...</span>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
          
          <form onSubmit={handleSubmit} className="flex gap-2">
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Ask me anything about product management..."
              className="flex-1"
              disabled={chatMutation.isPending}
            />
            <Button 
              type="submit" 
              disabled={!message.trim() || chatMutation.isPending}
              className="px-4"
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}