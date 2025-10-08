import React, { createContext, useContext, useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import type { User } from '../types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Verificar se as variáveis de ambiente estão configuradas
if (!supabaseUrl || !supabaseKey) {
  console.error('❌ ERRO: Variáveis de ambiente do Supabase não configuradas!');
  console.error('Configure VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY');
  console.error('No Cloudflare Pages: Settings > Environment variables');
}

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
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    // Verificar sessão inicial
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return;
      
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email || '',
          username: session.user.user_metadata?.username || session.user.email?.split('@')[0] || 'User',
          avatar_url: session.user.user_metadata?.avatar_url,
          is_online: true,
          last_seen: new Date().toISOString(),
          created_at: session.user.created_at || new Date().toISOString()
        });
      }
      setLoading(false);
    }).catch(() => {
      if (mounted) setLoading(false);
    });

    // Listener para mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;
      
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email || '',
          username: session.user.user_metadata?.username || session.user.email?.split('@')[0] || 'User',
          avatar_url: session.user.user_metadata?.avatar_url,
          is_online: true,
          last_seen: new Date().toISOString(),
          created_at: session.user.created_at || new Date().toISOString()
        });
      } else {
        setUser(null);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []); // Array vazio - roda UMA VEZ

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      
      // Verificar se as variáveis estão configuradas
      if (!supabaseUrl || !supabaseKey) {
        throw new Error('⚠️ Configuração incorreta. Entre em contato com o administrador.');
      }
      
      // Login no Supabase
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        // Mensagens de erro mais amigáveis
        if (error.message.includes('Invalid login credentials')) {
          throw new Error('Email ou senha incorretos');
        }
        if (error.message.includes('Email not confirmed')) {
          throw new Error('Email não confirmado. Verifique sua caixa de entrada.');
        }
        throw error;
      }

      if (!data.user) {
        throw new Error('Erro ao fazer login');
      }

      // Buscar perfil do usuário
      const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', data.user.id)
        .maybeSingle();

      if (profileError && profileError.code !== 'PGRST116') {
        console.error('Profile error:', profileError);
        // Continuar mesmo sem perfil, pode ser criado depois
      }

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
      } else {
        // Se não tiver perfil, criar um básico
        const loggedUser: User = {
          id: data.user.id,
          email: data.user.email || email,
          username: data.user.user_metadata?.username || email.split('@')[0],
          avatar_url: undefined,
          is_online: true,
          last_seen: new Date().toISOString(),
          created_at: data.user.created_at || new Date().toISOString()
        };
        
        setUser(loggedUser);
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

      // Verificar se as variáveis estão configuradas
      if (!supabaseUrl || !supabaseKey) {
        throw new Error('⚠️ Configuração incorreta. Entre em contato com o administrador.');
      }

      // Verificar se username já existe (usando maybeSingle ao invés de single)
      const { data: existingUsername, error: checkError } = await supabase
        .from('users')
        .select('username')
        .eq('username', username)
        .maybeSingle();

      // Ignorar erro "relation does not exist" pois a tabela pode não existir ainda
      if (!checkError || checkError.code !== 'PGRST116') {
        if (existingUsername) {
          throw new Error('Este nome de usuário já está em uso. Escolha outro.');
        }
      }

      // Criar conta no Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username: username
          },
          emailRedirectTo: undefined // Não requer confirmação de email
        }
      });

      if (error) throw error;

      if (!data.user) {
        throw new Error('Erro ao criar usuário');
      }

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
        // Não falhar se o perfil não for criado (pode ser criado pelo trigger)
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