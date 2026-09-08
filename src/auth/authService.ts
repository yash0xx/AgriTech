import { supabase } from '../lib/supabase';
import { Profile, PlatformRole, TeamRole, TeamMember } from '../types';

export const authService = {
  /**
   * Fetch a user profile by ID from public.profiles
   */
  async fetchProfile(userId: string): Promise<Profile | null> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error || !data) {
        return null;
      }

      return {
        id: data.id,
        fullName: data.full_name,
        role: data.role as PlatformRole,
        status: data.status,
        avatarUrl: data.avatar_url,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      };
    } catch (err) {
      console.error('fetchProfile error:', err);
      return null;
    }
  },

  /**
   * Fetch team member record for a specific user ID
   */
  async fetchTeamMembership(userId: string): Promise<TeamMember | null> {
    try {
      const { data, error } = await supabase
        .from('team_members')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error || !data) {
        return null;
      }

      return {
        id: data.id,
        userId: data.user_id,
        displayName: data.display_name,
        teamRole: data.team_role as TeamRole,
        isActive: data.is_active ?? true,
        assignedBy: data.assigned_by,
        assignedAt: data.assigned_at,
      };
    } catch {
      return null;
    }
  },

  /**
   * Fetch all 6 team members for Admin view
   */
  async fetchTeamMembers(): Promise<TeamMember[]> {
    try {
      const { data, error } = await supabase
        .from('team_members_overview')
        .select('*');

      if (error || !data) {
        return [];
      }

      return data.map((row: any) => ({
        id: row.team_member_id,
        userId: row.user_id,
        email: row.email,
        displayName: row.display_name,
        teamRole: row.team_role as TeamRole,
        isActive: row.is_active ?? true,
        assignedAt: row.assigned_at,
        fullName: row.full_name,
        accountStatus: row.account_status,
      }));
    } catch (err) {
      console.error('fetchTeamMembers error:', err);
      return [];
    }
  },

  /**
   * Update profile (safe: user can only change name/avatar)
   */
  async updateProfile(userId: string, updates: { fullName?: string; avatarUrl?: string }) {
    const payload: Record<string, any> = {};
    if (updates.fullName !== undefined) payload.full_name = updates.fullName;
    if (updates.avatarUrl !== undefined) payload.avatar_url = updates.avatarUrl;

    const { error } = await supabase
      .from('profiles')
      .update(payload)
      .eq('id', userId);

    if (error) throw error;
    return { success: true };
  },

  /**
   * Assign or update a team member role (Admin Only)
   */
  async assignTeamRole(userId: string, teamRole: TeamRole) {
    const { error } = await supabase
      .from('team_members')
      .upsert(
        {
          user_id: userId,
          team_role: teamRole,
          assigned_at: new Date().toISOString(),
        },
        { onConflict: 'user_id' }
      );

    if (error) throw error;
    return { success: true };
  },
};
