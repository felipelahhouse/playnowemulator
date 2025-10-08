import React, { createContext, useContext, useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import type { User } from '../types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey);

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
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Verificar sessão do Supabase
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        // Buscar dados do perfil do usuário
        supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single()
          .then(({ data }) => {
            if (data) {
              setUser({
                id: data.id,
                email: data.email,
                username: data.username,
                avatar_url: data.avatar_url,
                is_online: true,
                last_seen: new Date().toISOString(),
                created_at: data.created_at
              });
            }
          });
      }
      setLoading(false);
    });

    // Listener para mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        // Buscar dados do perfil quando logar
        supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single()
          .then(({ data }) => {
            if (data) {
              setUser({
                id: data.id,
                email: data.email,
                username: data.username,
                avatar_url: data.avatar_url,
                is_online: true,
                last_seen: new Date().toISOString(),
                created_at: data.created_at
              });
            }
          });
      } else {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      
      // Login no Supabase
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;

      if (data.user) {
        // Buscar perfil do usuário
        const { data: profile, error: profileError } = await supabase
          .from('users')
          .select('*')
          .eq('id', data.user.id)
          .single();

        if (profileError) throw profileError;

        if (profile) {
          // Atualizar status online
          await supabase
            .from('users')
            .update({ 
              is_online: true,
              last_seen: new Date().toISOString()
            })
            .eq('id', data.user.id);

          const loggedUser: User = {
            id: profile.id,
            email: profile.email,
            username: profile.username,
            avatar_url: profile.avatar_url,
            is_online: true,
            last_seen: new Date().toISOString(),
            created_at: profile.created_at
          };
          
          setUser(loggedUser);
        }
      }
    } catch (error: any) {
      console.error('Sign in error:', error);
      throw new Error(error.message || 'Erro ao fazer login');
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, username: string) => {
    try {
      setLoading(true);

      // Verificar se username já existe
      const { data: existingUsername } = await supabase
        .from('users')
        .select('username')
        .eq('username', username)
        .single();

      if (existingUsername) {
        throw new Error('Este nome de usuário já está em uso. Escolha outro.');
      }

      // Criar conta no Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username: username
          }
        }
      });

      if (error) throw error;

      if (data.user) {
        // Criar perfil do usuário na tabela users
        const { error: profileError } = await supabase
          .from('users')
          .insert({
            id: data.user.id,
            email: email,
            username: username,
            is_online: true,
            last_seen: new Date().toISOString(),
            created_at: new Date().toISOString()
          });

        if (profileError) {
          console.error('Profile creation error:', profileError);
          throw new Error('Erro ao criar perfil do usuário');
        }

        // Fazer login automaticamente
        const loggedUser: User = {
          id: data.user.id,
          email: email,
          username: username,
          avatar_url: undefined,
          is_online: true,
          last_seen: new Date().toISOString(),
          created_at: new Date().toISOString()
        };
        
        setUser(loggedUser);
      }
    } catch (error: any) {
      console.error('Signup error:', error);
      throw new Error(error.message || 'Erro ao criar conta');
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      // Atualizar status para offline no banco
      if (user?.id) {
        await supabase
          .from('users')
          .update({ 
            is_online: false,
            last_seen: new Date().toISOString()
          })
          .eq('id', user.id);
      }

      // Fazer logout no Supabase
      await supabase.auth.signOut();
      setUser(null);
    } catch (error) {
      console.error('Signout error:', error);
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};