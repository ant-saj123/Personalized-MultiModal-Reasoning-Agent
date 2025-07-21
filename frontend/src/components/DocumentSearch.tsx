import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Search, FileText, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { apiClient, Document } from '@/lib/api';

export function DocumentSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Document[]>([]);

  const searchMutation = useMutation({
    mutationFn: (searchQuery: string) => apiClient.search({ query: searchQuery, k: 10 }),
    onSuccess: (response) => {
      setResults(response.documents);
    },
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || searchMutation.isPending) return;
    searchMutation.mutate(query);
  };

  return (
    <div className="h-full flex flex-col max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Document Search</h1>
        <p className="text-muted-foreground">
          Search through your knowledge base using semantic similarity. Find relevant documents, PRDs, and product information.
        </p>
      </div>

      <Card className="mb-6">
        <CardContent className="p-6">
          <form onSubmit={handleSearch} className="flex gap-2">
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search for documents, features, requirements..."
              className="flex-1"
              disabled={searchMutation.isPending}
            />
            <Button 
              type="submit" 
              disabled={!query.trim() || searchMutation.isPending}
              className="px-4"
            >
              {searchMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Search className="h-4 w-4" />
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {searchMutation.error && (
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="text-destructive">
              Error: {searchMutation.error.message}
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="flex-1">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Search Results
            {results.length > 0 && (
              <Badge variant="secondary">{results.length} found</Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[500px]">
            {results.length === 0 && !searchMutation.isPending && (
              <div className="text-center py-12 text-muted-foreground px-6">
                <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg mb-2">No search performed yet</p>
                <p>Enter a query above to search through your documents</p>
              </div>
            )}

            {searchMutation.isPending && (
              <div className="text-center py-12 text-muted-foreground px-6">
                <Loader2 className="h-12 w-12 mx-auto mb-4 animate-spin opacity-50" />
                <p className="text-lg mb-2">Searching...</p>
                <p>Finding relevant documents</p>
              </div>
            )}

            {results.length > 0 && (
              <div className="space-y-4 p-6">
                {results.map((doc, index) => (
                  <Card key={index} className="border-l-4 border-l-primary/20">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-primary" />
                          <Badge variant="outline">{doc.type}</Badge>
                          <span className="text-sm text-muted-foreground">
                            {doc.source}
                          </span>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <p className="text-sm leading-relaxed">
                          {doc.content.length > 300 
                            ? doc.content.substring(0, 300) + '...'
                            : doc.content
                          }
                        </p>
                        
                        {doc.metadata && Object.keys(doc.metadata).length > 0 && (
                          <div className="pt-2 border-t border-border/50">
                            <p className="text-xs text-muted-foreground mb-1">Metadata:</p>
                            <div className="flex flex-wrap gap-1">
                              {Object.entries(doc.metadata).slice(0, 5).map(([key, value]) => (
                                <Badge key={key} variant="secondary" className="text-xs">
                                  {key}: {String(value).substring(0, 20)}
                                  {String(value).length > 20 && '...'}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}