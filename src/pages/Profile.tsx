import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { NavBar } from '@/components/NavBar';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { User, Mail, Shield, Calendar, Save, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { z } from 'zod';

const profileSchema = z.object({
  displayName: z.string().trim().min(1, 'Display name is required').max(100, 'Display name is too long'),
});

export default function Profile() {
  const { profile, isAdmin, refreshProfile, user } = useAuth();
  const [displayName, setDisplayName] = useState(profile?.display_name || '');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    const validation = profileSchema.safeParse({ displayName });
    if (!validation.success) {
      toast.error(validation.error.errors[0].message);
      return;
    }

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ display_name: displayName.trim() })
        .eq('id', user?.id);

      if (error) throw error;

      // Log the activity
      await supabase.from('activity_logs').insert({
        user_id: user?.id,
        action: 'profile_update',
        entity_type: 'profile',
        entity_id: user?.id,
        metadata: { display_name: displayName.trim() }
      });

      await refreshProfile();
      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <NavBar />
      
      <main className="container py-8 flex-1">
        <div className="mx-auto max-w-2xl space-y-8">
          <div>
            <h1 className="text-3xl font-bold">Profile Settings</h1>
            <p className="text-muted-foreground">Manage your account information</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Personal Information
              </CardTitle>
              <CardDescription>
                Update your display name and view your account details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="displayName">Display Name</Label>
                <Input
                  id="displayName"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Enter your display name"
                  maxLength={100}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    value={profile?.email || ''}
                    disabled
                    className="bg-muted"
                  />
                </div>
                <p className="text-xs text-muted-foreground">Email cannot be changed</p>
              </div>

              <div className="flex items-center gap-4 pt-2">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Role:</span>
                  <Badge variant={isAdmin ? "default" : "secondary"}>
                    {isAdmin ? 'Admin' : 'User'}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    Joined: {profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
              </div>

              <Button onClick={handleSave} disabled={isSaving} className="w-full sm:w-auto">
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Account Statistics</CardTitle>
              <CardDescription>
                Your content summary
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AccountStats userId={user?.id} />
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}

function AccountStats({ userId }: { userId?: string }) {
  const [stats, setStats] = useState({ videos: 0, links: 0 });
  const [isLoading, setIsLoading] = useState(true);

  useState(() => {
    if (!userId) return;
    
    const fetchStats = async () => {
      try {
        const [videosRes, linksRes] = await Promise.all([
          supabase.from('videos').select('id', { count: 'exact' }).eq('user_id', userId),
          supabase.from('links').select('id', { count: 'exact' }).eq('user_id', userId),
        ]);
        
        setStats({
          videos: videosRes.count || 0,
          links: linksRes.count || 0,
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  });

  if (isLoading) {
    return <div className="text-sm text-muted-foreground">Loading stats...</div>;
  }

  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="p-4 rounded-lg bg-muted/50">
        <p className="text-2xl font-bold">{stats.videos}</p>
        <p className="text-sm text-muted-foreground">Videos saved</p>
      </div>
      <div className="p-4 rounded-lg bg-muted/50">
        <p className="text-2xl font-bold">{stats.links}</p>
        <p className="text-sm text-muted-foreground">Links saved</p>
      </div>
    </div>
  );
}
