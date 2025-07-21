import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { History, Trash2, User, Bot, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { apiClient } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export function HistoryPanel() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: history, isLoading, error, refetch } = useQuery({
    queryKey: ['chat-history'],
    queryFn: () => apiClient.getHistory(),
  });

  const clearHistoryMutation = useMutation({
    mutationFn: () => apiClient.clearHistory(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chat-history'] });
      toast({
        title: "History Cleared",
        description: "Conversation history has been successfully cleared.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to clear history: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const handleClearHistory = () => {
    if (window.confirm('Are you sure you want to clear all conversation history? This action cannot be undone.')) {
      clearHistoryMutation.mutate();
    }
  };

  if (error) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-2">Conversation History</h1>
          <p className="text-muted-foreground">
            View and manage your chat history with PM Copilot.
          </p>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="text-destructive">
              Error loading history: {error.message}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold mb-2">Conversation History</h1>
          <p className="text-muted-foreground">
            View and manage your chat history with PM Copilot.
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => refetch()}
            disabled={isLoading}
          >
            <RefreshCw className={cn("h-4 w-4 mr-2", isLoading && "animate-spin")} />
            Refresh
          </Button>
          <Button 
            variant="destructive" 
            size="sm" 
            onClick={handleClearHistory}
            disabled={clearHistoryMutation.isPending || !history?.history?.length}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Clear History
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Chat Messages
            {history?.history && (
              <Badge variant="secondary">
                {history.history.length} messages
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[600px]">
            {isLoading && (
              <div className="space-y-4 p-6">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-16 w-full" />
                  </div>
                ))}
              </div>
            )}

            {!isLoading && (!history?.history || history.history.length === 0) && (
              <div className="text-center py-12 text-muted-foreground px-6">
                <History className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg mb-2">No conversation history</p>
                <p>Start chatting with PM Copilot to see your message history here.</p>
              </div>
            )}

            {history?.history && history.history.length > 0 && (
              <div className="space-y-4 p-6">
                {history.history.map((message, index) => (
                  <div
                    key={index}
                    className={cn(
                      "flex gap-3",
                      message.role === 'user' ? "justify-end" : "justify-start"
                    )}
                  >
                    {message.role === 'assistant' && (
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-1">
                        <Bot className="h-4 w-4 text-primary" />
                      </div>
                    )}
                    
                    <div className={cn(
                      "max-w-2xl",
                      message.role === 'user' ? "text-right" : "text-left"
                    )}>
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className="text-xs">
                          {message.role === 'user' ? 'You' : 'Assistant'}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          Message #{index + 1}
                        </span>
                      </div>
                      <Card className={cn(
                        "border-l-4",
                        message.role === 'user' 
                          ? "border-l-primary/50 bg-primary/5" 
                          : "border-l-secondary/50 bg-secondary/5"
                      )}>
                        <CardContent className="p-3">
                          <div className="text-sm whitespace-pre-wrap">
                            {message.content}
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                    
                    {message.role === 'user' && (
                      <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center flex-shrink-0 mt-1">
                        <User className="h-4 w-4" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}