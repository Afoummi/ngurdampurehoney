import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

export type UserRole = 'admin' | 'moderator' | 'customer';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  /** True once the signed-in user's roles have been fetched from user_roles. */
  isRoleReady: boolean;
  isAdmin: boolean;
  isModerator: boolean;
  userRole: UserRole;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: Error | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRoleReady, setIsRoleReady] = useState(false);
  const [userRole, setUserRole] = useState<UserRole>('customer');

  const isAdmin = userRole === 'admin';
  const isModerator = userRole === 'moderator';

  useEffect(() => {
    // Set up auth listener FIRST, then check current session
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        // Only update state on meaningful events to avoid refresh loops
        if (event === 'SIGNED_IN' || event === 'SIGNED_OUT' || event === 'USER_UPDATED' || event === 'INITIAL_SESSION') {
          setSession(session);
          setUser(session?.user ?? null);

          if (session?.user) {
            // Use setTimeout to avoid potential deadlock with Supabase client
            setTimeout(() => {
              checkUserRole(session.user.id);
            }, 0);
          } else {
            setUserRole('customer');
            setIsRoleReady(true);
          }
        }
        
        // Handle TOKEN_REFRESHED silently without re-fetching roles
        if (event === 'TOKEN_REFRESHED' && session) {
          setSession(session);
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        checkUserRole(session.user.id);
      } else {
        setIsRoleReady(true);
      }
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkUserRole = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId);

      if (error) {
        console.error('Error checking user role:', error);
        setUserRole('customer');
        setIsRoleReady(true);
        return;
      }

      const roles = (data ?? []).map((r) => r.role as UserRole);
      // Pick highest-privilege role: admin > moderator > customer
      if (roles.includes('admin')) setUserRole('admin');
      else if (roles.includes('moderator')) setUserRole('moderator');
      else setUserRole('customer');
      setIsRoleReady(true);
    } catch (error) {
      console.error('Error checking user role:', error);
      setUserRole('customer');
      setIsRoleReady(true);
    }
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    const redirectUrl = `${window.location.origin}/`;

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: { full_name: fullName },
      },
    });

    return { error: error as Error | null };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error as Error | null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUserRole('customer');
    setIsRoleReady(false);
  };

  const resetPassword = async (email: string) => {
    const redirectUrl = `${window.location.origin}/auth?reset=true`;
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: redirectUrl,
    });
    return { error: error as Error | null };
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        isLoading,
        isRoleReady,
        isAdmin,
        isModerator,
        userRole,
        signUp,
        signIn,
        signOut,
        resetPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
