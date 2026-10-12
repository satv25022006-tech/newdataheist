import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, UserRole } from '../types';
import { bureauStore, DEFAULT_INVESTIGATOR, DEFAULT_ADMIN } from '../lib/store';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

interface AuthContextType {
  user: UserProfile;
  role: UserRole;
  isAdmin: boolean;
  login: (idOrEmail: string, password?: string) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
  isSupabaseActive: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile>(bureauStore.getCurrentUser());

  useEffect(() => {
    const client = supabase;
    if (isSupabaseConfigured && client) {
      client.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) {
          client
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single()
            .then(({ data: profile }) => {
              if (profile) {
                const updated: UserProfile = {
                  id: profile.id,
                  email: session.user.email || profile.email,
                  displayName: profile.display_name || 'Inspector',
                  badgeNumber: profile.badge_number || 'BD-1000',
                  role: profile.role || 'investigator',
                  createdAt: profile.created_at,
                };
                setUser(updated);
                bureauStore.setCurrentUser(updated);
              }
            });
        }
      });
    }
  }, []);

  const login = async (idOrEmail: string, password: string = ''): Promise<{ success: boolean; message: string }> => {
    const cleanId = idOrEmail.trim().toLowerCase();
    const cleanPass = password.trim();

    if (!cleanId) {
      return { success: false, message: 'Please enter an Admin ID or Bureau ID.' };
    }

    // Check for Admin Clearance
    const isAdminId = 
      cleanId === 'admin' || 
      cleanId === 'bd-0001' || 
      cleanId === 'chief' || 
      cleanId.includes('admin@');

    if (isAdminId) {
      // Validate password
      if (!cleanPass) {
        return { success: false, message: 'Password is required for Admin access.' };
      }
      if (cleanPass !== 'admin123' && cleanPass !== 'admin' && cleanPass !== 'bureau2026') {
        return { success: false, message: 'Invalid Admin Password. (Default: admin123)' };
      }

      setUser(DEFAULT_ADMIN);
      bureauStore.setCurrentUser(DEFAULT_ADMIN);
      return { success: true, message: 'Chief Inspector Admin clearance authenticated.' };
    }

    // Field Investigator login
    const investigatorUser: UserProfile = {
      ...DEFAULT_INVESTIGATOR,
      displayName: idOrEmail.includes('@') ? idOrEmail.split('@')[0] : idOrEmail,
      badgeNumber: `BD-${Math.floor(1000 + Math.random() * 8999)}`,
      role: 'investigator',
    };

    setUser(investigatorUser);
    bureauStore.setCurrentUser(investigatorUser);
    return { success: true, message: `Authenticated as Investigator: ${investigatorUser.displayName}` };
  };

  const logout = () => {
    if (isSupabaseConfigured && supabase) {
      supabase.auth.signOut();
    }
    setUser(DEFAULT_INVESTIGATOR);
    bureauStore.setCurrentUser(DEFAULT_INVESTIGATOR);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user.role,
        isAdmin: user.role === 'admin',
        login,
        logout,
        isSupabaseActive: isSupabaseConfigured,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
};
