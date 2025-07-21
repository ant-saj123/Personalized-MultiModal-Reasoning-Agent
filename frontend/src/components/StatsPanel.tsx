import { useQuery } from '@tanstack/react-query';
import { BarChart3, Database, Activity, Zap } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { apiClient } from '@/lib/api';

export function StatsPanel() {
  const { data: stats, isLoading, error } = useQuery({
    queryKey: ['stats'],
    queryFn: () => apiClient.getStats(),
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  if (error) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-2">System Analytics</h1>
          <p className="text-muted-foreground">
            Monitor your PM Copilot system performance and usage statistics.
          </p>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="text-destructive">
              Error loading statistics: {error.message}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">System Analytics</h1>
        <p className="text-muted-foreground">
          Monitor your PM Copilot system performance and usage statistics.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Documents</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                stats?.total_vector_count?.toLocaleString() || 0
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Vectors in knowledge base
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Index Status</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <Badge variant="outline" className="text-green-400 border-green-400/30">
                  Active
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {isLoading ? (
                <Skeleton className="h-3 w-20" />
              ) : (
                stats?.index_name || 'Unknown'
              )}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vector Dimension</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                stats?.dimension || 0
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Embedding dimensions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Index Fullness</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                `${((stats?.index_fullness || 0) * 100).toFixed(1)}%`
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Storage utilization
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Index Utilization</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-2 w-full" />
            </div>
          ) : (
            <>
              <div className="flex justify-between text-sm">
                <span>Storage Used</span>
                <span>{((stats?.index_fullness || 0) * 100).toFixed(2)}%</span>
              </div>
              <Progress value={(stats?.index_fullness || 0) * 100} className="h-2" />
              <p className="text-xs text-muted-foreground">
                Current index utilization based on vector count and storage limits
              </p>
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Namespaces</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-24" />
            </div>
          ) : stats?.namespaces && Object.keys(stats.namespaces).length > 0 ? (
            <div className="space-y-2">
              {Object.entries(stats.namespaces).map(([namespace, info]) => (
                <div key={namespace} className="flex justify-between items-center">
                  <span className="text-sm font-medium">{namespace || 'default'}</span>
                  <Badge variant="secondary">
                    {typeof info === 'object' && info && 'vector_count' in info
                      ? `${info.vector_count} vectors`
                      : 'N/A'
                    }
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No namespace information available</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}