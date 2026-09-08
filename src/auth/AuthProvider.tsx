import React, { createContext, useEffect, useState, useCallback, useMemo } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { authService } from './authService';
import { Profile, PlatformRole, TeamMember, TeamRole } from '../types';

export interface SignUpMetadata {
  fullName: string;
  role: 'FARMER' | 'SELLER' | 'BUYER';
}

export interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  role: PlatformRole | null;
  teamMember: TeamMember | null;
  teamRole: TeamRole | null;
  loading: boolean;
  isAuthenticated: boolean;
  isSuspended: boolean;
  signIn: (email: string, password: string) => Promise<{ error?: string | null }>;
  signUp: (email: string, password: string, metadata: SignUpMetadata) => Promise<{ error?: string | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [teamMember, setTeamMember] = useState<TeamMember | null>(null);
  const [loading, setLoading] = useState(true);

  // Load user profile and team details directly from Supabase
  const loadUserData = useCallback(async (userId: string) => {
    try {
      const [prof, tm] = await Promise.all([
        authService.fetchProfile(userId),
        authService.fetchTeamMembership(userId),
      ]);
      if (prof?.status === 'SUSPENDED') {
        console.warn('Account Suspended. Signing out.');
        await supabase.auth.signOut();
        setProfile(null);
        setUser(null);
        setSession(null);
        setTeamMember(null);
        return;
      }
      setProfile(prof);
      setTeamMember(tm);
    } catch (err) {
      console.error('Failed to load user profile or team details:', err);
    }
  }, []);

  // Initialize session from Supabase Auth
  useEffect(() => {
    let mounted = true;

    async function initAuth() {
      try {
        const { data: { session: initialSession }, error } = await supabase.auth.getSession();
        if (error) {
          console.error('Session retrieval error:', error);
        }
        if (mounted) {
          if (initialSession?.user) {
            setSession(initialSession);
            setUser(initialSession.user);
            await loadUserData(initialSession.user.id);
          } else {
            setSession(null);
            setUser(null);
            setProfile(null);
            setTeamMember(null);
          }
        }
      } catch (err) {
        console.error('Supabase session initialization error:', err);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    initAuth();

    // Listen to real-time auth changes from Supabase
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      if (!mounted) return;
      setSession(newSession);
      setUser(newSession?.user || null);

      if (newSession?.user) {
        await loadUserData(newSession.user.id);
      } else {
        setProfile(null);
        setTeamMember(null);
      }
      setLoading(false);
    });

    return () => {
      mounted = false;
      authListener?.subscription.unsubscribe();
    };
  }, [loadUserData]);

  // Pure Supabase Auth signInWithPassword
  const signIn = async (email: string, password: string): Promise<{ error?: string | null }> => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        setLoading(false);
        const msg = error.message?.toLowerCase() || '';
        if (msg.includes('invalid login credentials') || msg.includes('invalid_grant') || msg.includes('invalid_credentials')) {
          return { error: 'Invalid email or password. Please verify your credentials and try again.' };
        }
        if (msg.includes('email not confirmed')) {
          return { error: 'Please confirm your email address before signing in.' };
        }
        if (msg.includes('network') || msg.includes('failed to fetch')) {
          return { error: 'Network connection issue. Please check your network and try again.' };
        }
        return { error: 'Unable to authenticate. Please check your details and try again.' };
      }

      if (data.user) {
        const prof = await authService.fetchProfile(data.user.id);
        if (prof?.status === 'SUSPENDED') {
          await supabase.auth.signOut();
          setLoading(false);
          return { error: 'Account Suspended: Your access has been suspended by administrators.' };
        }
        setUser(data.user);
        setProfile(prof);
        const tm = await authService.fetchTeamMembership(data.user.id);
        setTeamMember(tm);
      }
      setLoading(false);
      return {};
    } catch (err: any) {
      setLoading(false);
      return { error: 'An unexpected connection error occurred. Please try again.' };
    }
  };

  // Pure Supabase Auth signUp
  const signUp = async (
    email: string,
    password: string,
    metadata: SignUpMetadata
  ): Promise<{ error?: string | null }> => {
    setLoading(true);
    try {
      // Ensure only FARMER, SELLER or BUYER can be requested during public signup
      let assignedRole: PlatformRole = 'BUYER';
      if (metadata.role === 'FARMER') assignedRole = 'FARMER';
      else if (metadata.role === 'SELLER') assignedRole = 'SELLER';

      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            full_name: metadata.fullName.trim(),
            role: assignedRole,
          },
        },
      });

      if (error) {
        setLoading(false);
        return { error: error.message };
      }

      if (data.user) {
        setUser(data.user);
        await loadUserData(data.user.id);
      }
      setLoading(false);
      return {};
    } catch (err: any) {
      setLoading(false);
      return { error: err.message || 'Failed to create account.' };
    }
  };

  // Pure Supabase Auth signOut
  const signOut = async () => {
    setLoading(true);
    try {
      await supabase.auth.signOut();
      setUser(null);
      setProfile(null);
      setTeamMember(null);
      setSession(null);
    } finally {
      setLoading(false);
    }
  };

  // Refresh current user profile
  const refreshProfile = async () => {
    if (user?.id) {
      await loadUserData(user.id);
    }
  };

  const role = useMemo(() => profile?.role || null, [profile]);
  const teamRole = useMemo(() => teamMember?.teamRole || null, [teamMember]);
  const isSuspended = useMemo(() => profile?.status === 'SUSPENDED', [profile]);
  const isAuthenticated = useMemo(() => Boolean(user && profile), [user, profile]);

  const value = {
    user,
    profile,
    role,
    teamMember,
    teamRole,
    loading,
    isAuthenticated,
    isSuspended,
    signIn,
    signUp,
    signOut,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
