import { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { AppSidebar } from './AppSidebar';
import { SidebarProvider, SidebarTrigger } from './ui/sidebar';
import { Badge } from './ui/badge';
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { apiClient } from '@/lib/api';

export function MainLayout() {
  const [healthStatus, setHealthStatus] = useState<'unknown' | 'healthy' | 'error'>('unknown');

  useEffect(() => {
    // Initial health check
    const checkHealth = async () => {
      try {
        await apiClient.healthCheck();
        setHealthStatus('healthy');
      } catch (error) {
        setHealthStatus('error');
      }
    };

    checkHealth();

    // Set up periodic health checks
    const interval = setInterval(checkHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  const getHealthBadge = () => {
    switch (healthStatus) {
      case 'healthy':
        return (
          <Badge variant="outline" className="text-green-400 border-green-400/30">
            <CheckCircle className="w-3 h-3 mr-1" />
            Connected
          </Badge>
        );
      case 'error':
        return (
          <Badge variant="outline" className="text-red-400 border-red-400/30">
            <XCircle className="w-3 h-3 mr-1" />
            Disconnected
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="text-yellow-400 border-yellow-400/30">
            <AlertCircle className="w-3 h-3 mr-1" />
            Checking...
          </Badge>
        );
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col">
          <header className="h-14 border-b border-border bg-card/50 backdrop-blur-sm flex items-center gap-4 px-4">
            <SidebarTrigger className="h-8 w-8" />
            <div className="flex-1" />
            {getHealthBadge()}
          </header>
          <main className="flex-1 p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}