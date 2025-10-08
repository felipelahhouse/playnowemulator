import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
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
  const initializedRef = useRef(false);

  useEffect(() => {
    // GUARD ABSOLUTO - se já inicializou, NÃO faz nada
    if (initializedRef.current) {
      console.log('✅ Auth já inicializado, ignorando');
      return;
    }
    
    console.log('🔄 Inicializando auth pela primeira vez...');
    initializedRef.current = true;

    let mounted = true;

    // Verificar sessão inicial
    supabase.auth.getSession()
      .then(({ data: { session } }) => {
        if (!mounted) return;
        
        console.log('📦 Sessão carregada:', session ? 'Logado' : 'Sem sessão');
        
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
        console.log('✅ Loading finalizado');
      })
      .catch((error) => {
        console.error('❌ Erro ao carregar sessão:', error);
        if (mounted) setLoading(false);
      });

    // Listener para mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;
      
      console.log('🔔 Auth state changed:', _event, session ? 'Logado' : 'Deslogado');
      
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
      console.log('🧹 Cleanup auth');
      mounted = false;
      subscription.unsubscribe();
    };
  }, []); // ARRAY VAZIO - NUNCA re-executa

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

      // onAuthStateChange vai atualizar o user automaticamente
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

      if (!data.user) {
        throw new Error('Erro ao criar usuário');
      }

      // onAuthStateChange vai atualizar o user automaticamente
    } catch (error: any) {
      console.error('Signup error:', error);
      throw new Error(error.message || 'Erro ao criar conta');
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
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
