import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Trash2, Pencil, ExternalLink, X, Check, Search, Download } from 'lucide-react';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface LinkWithUser {
  id: string;
  title: string;
  url: string;
  favicon: string | null;
  user_id: string;
  user_email: string;
  user_name: string | null;
  created_at: string;
  tags: string[] | null;
}

interface AdminLinkTableProps {
  links: LinkWithUser[];
  onRefresh: () => void;
}

export function AdminLinkTable({ links, onRefresh }: AdminLinkTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editUrl, setEditUrl] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);

  const filteredLinks = links.filter(link => 
    link.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    link.url.toLowerCase().includes(searchTerm.toLowerCase()) ||
    link.user_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (link.user_name?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const allSelected = filteredLinks.length > 0 && filteredLinks.every(l => selectedIds.has(l.id));
  const someSelected = selectedIds.size > 0;

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredLinks.map(l => l.id)));
    }
  };

  const toggleSelect = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const startEditing = (link: LinkWithUser) => {
    setEditingId(link.id);
    setEditTitle(link.title);
    setEditUrl(link.url);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditTitle('');
    setEditUrl('');
  };

  const saveEdit = async (linkId: string) => {
    try {
      const { error } = await supabase
        .from('links')
        .update({ 
          title: editTitle.trim(), 
          url: editUrl.trim(),
          updated_at: new Date().toISOString()
        })
        .eq('id', linkId);

      if (error) throw error;
      
      toast.success('Link updated');
      cancelEditing();
      onRefresh();
    } catch (error) {
      console.error('Error updating link:', error);
      toast.error('Failed to update link');
    }
  };

  const deleteLink = async (linkId: string) => {
    try {
      const { error } = await supabase
        .from('links')
        .delete()
        .eq('id', linkId);

      if (error) throw error;
      
      toast.success('Link deleted');
      onRefresh();
    } catch (error) {
      console.error('Error deleting link:', error);
      toast.error('Failed to delete link');
    }
  };

  const bulkDelete = async () => {
    try {
      const { error } = await supabase
        .from('links')
        .delete()
        .in('id', Array.from(selectedIds));

      if (error) throw error;
      
      toast.success(`Deleted ${selectedIds.size} links`);
      setSelectedIds(new Set());
      setBulkDeleteOpen(false);
      onRefresh();
    } catch (error) {
      console.error('Error bulk deleting links:', error);
      toast.error('Failed to delete links');
    }
  };

  const exportSelected = () => {
    const selectedLinks = links.filter(l => selectedIds.has(l.id));
    const exportData = selectedLinks.map(l => ({
      title: l.title,
      url: l.url,
      owner_email: l.user_email,
      owner_name: l.user_name,
      created_at: l.created_at,
      tags: l.tags,
    }));
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `links-export-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast.success(`Exported ${selectedLinks.length} links`);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search links by title, URL, or user..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        {someSelected && (
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={exportSelected}>
              <Download className="h-4 w-4 mr-2" />
              Export ({selectedIds.size})
            </Button>
            <AlertDialog open={bulkDeleteOpen} onOpenChange={setBulkDeleteOpen}>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete ({selectedIds.size})
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete {selectedIds.size} Links</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete {selectedIds.size} links. This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={bulkDelete}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Delete All
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        )}
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">
                <Checkbox 
                  checked={allSelected}
                  onCheckedChange={toggleSelectAll}
                />
              </TableHead>
              <TableHead className="w-[50px]">Icon</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>URL</TableHead>
              <TableHead>Owner</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredLinks.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  No links found
                </TableCell>
              </TableRow>
            ) : (
              filteredLinks.map((link) => (
                <TableRow key={link.id} className={selectedIds.has(link.id) ? 'bg-muted/50' : ''}>
                  <TableCell>
                    <Checkbox 
                      checked={selectedIds.has(link.id)}
                      onCheckedChange={() => toggleSelect(link.id)}
                    />
                  </TableCell>
                  <TableCell>
                    {link.favicon ? (
                      <img 
                        src={link.favicon} 
                        alt="" 
                        className="w-6 h-6 object-contain"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="w-6 h-6 rounded bg-muted flex items-center justify-center">
                        <ExternalLink className="h-3 w-3 text-muted-foreground" />
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    {editingId === link.id ? (
                      <Input 
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        className="h-8"
                      />
                    ) : (
                      <span className="font-medium line-clamp-1">{link.title}</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {editingId === link.id ? (
                      <Input 
                        value={editUrl}
                        onChange={(e) => setEditUrl(e.target.value)}
                        className="h-8"
                      />
                    ) : (
                      <a 
                        href={link.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground max-w-[200px] truncate"
                      >
                        <ExternalLink className="h-3 w-3 flex-shrink-0" />
                        <span className="truncate">{link.url}</span>
                      </a>
                    )}
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="text-sm font-medium">{link.user_name || 'No name'}</p>
                      <p className="text-xs text-muted-foreground">{link.user_email}</p>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(link.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      {editingId === link.id ? (
                        <>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8"
                            onClick={() => saveEdit(link.id)}
                          >
                            <Check className="h-4 w-4 text-green-500" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8"
                            onClick={cancelEditing}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8"
                            onClick={() => startEditing(link)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Link</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This will permanently delete "{link.title}" owned by {link.user_email}. This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => deleteLink(link.id)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      
      <p className="text-sm text-muted-foreground">
        {someSelected ? `${selectedIds.size} selected · ` : ''}
        Showing {filteredLinks.length} of {links.length} links
      </p>
    </div>
  );
}
