import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, Loader2, User, Video, Link as LinkIcon, LogIn, LogOut, Settings, Trash2, Pencil, Plus } from 'lucide-react';

interface ActivityLog {
  id: string;
  user_id: string;
  action: string;
  entity_type: string | null;
  entity_id: string | null;
  metadata: Record<string, any> | null;
  created_at: string;
  user_email?: string;
  user_name?: string | null;
}

export function ActivityLogTable() {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const { data: logsData, error: logsError } = await supabase
        .from('activity_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (logsError) throw logsError;

      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, email, display_name');

      if (profilesError) throw profilesError;

      const logsWithUsers = (logsData || []).map((log: any) => {
        const user = profiles?.find((p: any) => p.id === log.user_id);
        return {
          ...log,
          user_email: user?.email || 'Unknown',
          user_name: user?.display_name,
        };
      });

      setLogs(logsWithUsers);
    } catch (error) {
      console.error('Error fetching activity logs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredLogs = logs.filter(log => 
    log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.entity_type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.user_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.user_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'login':
        return <LogIn className="h-4 w-4 text-green-500" />;
      case 'logout':
        return <LogOut className="h-4 w-4 text-orange-500" />;
      case 'create':
        return <Plus className="h-4 w-4 text-blue-500" />;
      case 'update':
        return <Pencil className="h-4 w-4 text-yellow-500" />;
      case 'delete':
        return <Trash2 className="h-4 w-4 text-red-500" />;
      case 'profile_update':
        return <Settings className="h-4 w-4 text-purple-500" />;
      default:
        return <User className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getEntityIcon = (entityType: string | null) => {
    switch (entityType) {
      case 'video':
        return <Video className="h-3 w-3" />;
      case 'link':
        return <LinkIcon className="h-3 w-3" />;
      default:
        return null;
    }
  };

  const getActionBadgeVariant = (action: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (action) {
      case 'delete':
        return 'destructive';
      case 'create':
        return 'default';
      case 'login':
      case 'logout':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const formatMetadata = (metadata: Record<string, any> | null) => {
    if (!metadata) return null;
    const entries = Object.entries(metadata).slice(0, 2);
    return entries.map(([key, value]) => (
      <span key={key} className="text-xs text-muted-foreground">
        {key}: {typeof value === 'string' ? value.slice(0, 30) : JSON.stringify(value)}
      </span>
    ));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search activity logs..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]"></TableHead>
              <TableHead>Action</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Entity</TableHead>
              <TableHead>Details</TableHead>
              <TableHead>Time</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredLogs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  No activity logs found
                </TableCell>
              </TableRow>
            ) : (
              filteredLogs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell>
                    {getActionIcon(log.action)}
                  </TableCell>
                  <TableCell>
                    <Badge variant={getActionBadgeVariant(log.action)} className="capitalize">
                      {log.action.replace('_', ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="text-sm font-medium">{log.user_name || 'No name'}</p>
                      <p className="text-xs text-muted-foreground">{log.user_email}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    {log.entity_type && (
                      <div className="flex items-center gap-1">
                        {getEntityIcon(log.entity_type)}
                        <span className="text-sm capitalize">{log.entity_type}</span>
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-0.5">
                      {formatMetadata(log.metadata)}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(log.created_at).toLocaleString()}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      
      <p className="text-sm text-muted-foreground">
        Showing {filteredLogs.length} of {logs.length} logs (last 100)
      </p>
    </div>
  );
}
