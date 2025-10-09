import React, { createContext, useContext, useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import type { User } from '../types';
import type { User as SupabaseUser } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl || '', supabaseKey || '');

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, username: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Buscar ou criar perfil do usuário
  const getOrCreateProfile = async (authUser: SupabaseUser): Promise<User | null> => {
    try {
      // Tentar buscar perfil existente
      const { data: profile, error: fetchError } = await supabase
        .from('users')
        .select('*')
        .eq('id', authUser.id)
        .single();

      // Se achou, atualizar online status e retornar
      if (profile && !fetchError) {
        await supabase
          .from('users')
          .update({ is_online: true, last_seen: new Date().toISOString() })
          .eq('id', authUser.id);
        
        return profile as User;
      }

      // Se não achou, criar novo perfil
      const username = authUser.user_metadata?.username || authUser.email?.split('@')[0] || 'Player';
      
      const { data: newProfile, error: insertError } = await supabase
        .from('users')
        .insert({
          id: authUser.id,
          email: authUser.email,
          username: username,
          is_online: true,
          last_seen: new Date().toISOString()
        })
        .select()
        .single();

      if (insertError) {
        console.error('Erro ao criar perfil:', insertError);
        // Fallback: retornar user básico
        return {
          id: authUser.id,
          email: authUser.email || '',
          username: username,
          is_online: true,
          last_seen: new Date().toISOString(),
          created_at: authUser.created_at || new Date().toISOString()
        };
      }

      return newProfile as User;
    } catch (error) {
      console.error('Erro ao buscar/criar perfil:', error);
      // Fallback: retornar user básico
      return {
        id: authUser.id,
        email: authUser.email || '',
        username: authUser.user_metadata?.username || authUser.email?.split('@')[0] || 'Player',
        is_online: true,
        last_seen: new Date().toISOString(),
        created_at: authUser.created_at || new Date().toISOString()
      };
    }
  };

  // Inicializar auth
  useEffect(() => {
    let mounted = true;
    let timeoutId: NodeJS.Timeout;

    const initAuth = async () => {
      try {
        // Timeout de 5 segundos para evitar travamento infinito
        const timeoutPromise = new Promise((_, reject) => {
          timeoutId = setTimeout(() => reject(new Error('Auth timeout')), 5000);
        });

        const authPromise = supabase.auth.getSession();

        const { data: { session } } = await Promise.race([
          authPromise,
          timeoutPromise
        ]) as any;
        
        clearTimeout(timeoutId);
        
        if (mounted && session?.user) {
          const profile = await getOrCreateProfile(session.user);
          setUser(profile);
        }
      } catch (error) {
        console.error('Erro ao inicializar auth:', error);
        // Em caso de erro, continua sem usuário
        setUser(null);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    initAuth();

    // Listener de mudanças de auth
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;

      if (event === 'SIGNED_OUT') {
        setUser(null);
      } else if (session?.user) {
        const profile = await getOrCreateProfile(session.user);
        setUser(profile);
      } else {
        setUser(null);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      
      if (error) throw error;
      if (!data.user) throw new Error('Login falhou');

      const profile = await getOrCreateProfile(data.user);
      setUser(profile);
    } catch (error: any) {
      console.error('Erro no login:', error);
      throw new Error(error.message || 'Erro ao fazer login');
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, username: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { username },
          emailRedirectTo: undefined
        }
      });

      if (error) throw error;
      if (!data.user) throw new Error('Cadastro falhou');

      const profile = await getOrCreateProfile(data.user);
      setUser(profile);
    } catch (error: any) {
      console.error('Erro no cadastro:', error);
      throw new Error(error.message || 'Erro ao criar conta');
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      if (user?.id) {
        await supabase
          .from('users')
          .update({ is_online: false, last_seen: new Date().toISOString() })
          .eq('id', user.id);
      }
      await supabase.auth.signOut();
      setUser(null);
    } catch (error) {
      console.error('Erro ao sair:', error);
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};
