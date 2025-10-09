import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';
import type { User } from '../types';
import type { User as SupabaseAuthUser, Session } from '@supabase/supabase-js';

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
  const currentUserRef = useRef<User | null>(null);

  const updateUserState = (value: User | null) => {
    currentUserRef.current = value;
    setUser(value);
  };

  const buildUser = (authUser: SupabaseAuthUser, profile?: any): User => {
    const fallbackUsername = authUser.email?.split('@')[0] || 'Player';
    const usernameFromMetadata = authUser.user_metadata?.username;
    const now = new Date().toISOString();

    return {
      id: authUser.id,
      email: authUser.email || '',
      username: profile?.username || usernameFromMetadata || fallbackUsername,
      avatar_url: profile?.avatar_url || authUser.user_metadata?.avatar_url,
      is_online: profile?.is_online ?? true,
      last_seen: profile?.last_seen || now,
      created_at: profile?.created_at || authUser.created_at || now
    };
  };

  const syncUserProfile = async (authUser: SupabaseAuthUser) => {
    const fallbackUsername = authUser.email?.split('@')[0] || 'Player';
    const baseUsername = (authUser.user_metadata?.username || fallbackUsername).trim();

    const normalizeUsername = (value: string) => {
      const sanitized = value
        .toLowerCase()
        .replace(/[^a-z0-9_]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .slice(0, 28);
      return sanitized || `player-${Math.random().toString(36).slice(2, 8)}`;
    };

    try {
      // Primeiro, verificar se o usuário já existe
      const { data: existingUser } = await supabase
        .from('users')
        .select('*')
        .eq('id', authUser.id)
        .single();

      // Se já existe, só atualizar status online
      if (existingUser) {
        const { data, error } = await supabase
          .from('users')
          .update({
            is_online: true,
            last_seen: new Date().toISOString()
          })
          .eq('id', authUser.id)
          .select()
          .single();

        if (error) {
          console.error('❌ Erro ao atualizar status online:', error);
          return existingUser;
        }

        console.log('✅ Status online atualizado');
        return data || existingUser;
      }

      // Se não existe, criar novo perfil
      let attempt = 0;
      const maxAttempts = 5;
      let usernameCandidate = normalizeUsername(baseUsername);

      while (attempt < maxAttempts) {
        const { data, error } = await supabase
          .from('users')
          .insert({
            id: authUser.id,
            email: authUser.email || '',
            username: usernameCandidate,
            avatar_url: authUser.user_metadata?.avatar_url || null,
            is_online: true,
            last_seen: new Date().toISOString()
          })
          .select()
          .single();

        if (!error) {
          console.log('✅ Novo perfil criado:', data.username);
          return data;
        }

        // 23505 = unique_violation (username já usado)
        if (error.code === '23505' && error.message?.includes('username')) {
          attempt += 1;
          usernameCandidate = `${normalizeUsername(baseUsername)}-${Math.floor(Math.random() * 9999)}`;
          console.log(`⚠️ Username já existe, tentando: ${usernameCandidate} (tentativa ${attempt}/${maxAttempts})`);
          continue;
        }

        console.error('❌ Erro ao criar perfil do usuário:', error);
        return null;
      }

      console.error('❌ Todas as tentativas de criar username falharam');
      return null;
    } catch (error) {
      console.error('❌ Erro inesperado ao sincronizar perfil:', error);
      return null;
    }
  };

  const markUserOffline = async (userId: string) => {
    try {
      await supabase
        .from('users')
        .update({
          is_online: false,
          last_seen: new Date().toISOString()
        })
        .eq('id', userId);
    } catch (error) {
      console.error('⚠️  Falha ao marcar usuário offline:', error);
    }
  };

  const handleSession = async (session: Session | null) => {
    if (!session?.user) {
      updateUserState(null);
      setLoading(false);
      return;
    }

    const profile = await syncUserProfile(session.user);
    updateUserState(buildUser(session.user, profile));
    setLoading(false);
  };

  useEffect(() => {
    // GUARD ABSOLUTO - se já inicializou, NÃO faz nada
    if (initializedRef.current) {
      console.log('✅ Auth já inicializado, ignorando re-render');
      return;
    }
    
    console.log('🔄 Inicializando auth pela PRIMEIRA e ÚNICA vez...');
    console.log('🔍 Timestamp:', new Date().toISOString());
    initializedRef.current = true;

    let mounted = true;

    // Verificar sessão inicial
    supabase.auth.getSession()
      .then(async ({ data: { session } }) => {
        if (!mounted) return;

        console.log('📦 Sessão carregada:', session ? 'Logado' : 'Sem sessão');

        await handleSession(session);
        console.log('✅ Loading finalizado');
      })
      .catch((error) => {
        console.error('❌ Erro ao carregar sessão:', error);
        if (mounted) setLoading(false);
      });

    // Listener para mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!mounted) return;

      console.log('🔔 Auth state changed:', _event, session ? 'Logado' : 'Deslogado');

      if (_event === 'SIGNED_OUT' && currentUserRef.current?.id) {
        await markUserOffline(currentUserRef.current.id);
      }

      await handleSession(session);
    });

    return () => {
      console.log('🧹 Cleanup auth - componente desmontado');
      console.log('⚠️  Se ver esta mensagem repetidamente = PROBLEMA DE LOOP');
      mounted = false;
      subscription.unsubscribe();
    };
  }, []); // ARRAY VAZIO - NUNCA re-executa (só roda 1x na montagem)

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

      await syncUserProfile(data.user);

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
      console.log('📝 Iniciando cadastro:', { email, username });

      // Verificar se as variáveis estão configuradas
      if (!supabaseUrl || !supabaseKey) {
        throw new Error('⚠️ Configuração incorreta. Entre em contato com o administrador.');
      }

      // Validar inputs
      if (!email || !password || !username) {
        throw new Error('Preencha todos os campos');
      }

      if (password.length < 6) {
        throw new Error('A senha deve ter pelo menos 6 caracteres');
      }

      // Criar conta no Supabase Auth
      console.log('🔐 Criando conta no Supabase Auth...');
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username: username.trim()
          },
          emailRedirectTo: undefined // Desabilitar confirmação por email
        }
      });

      if (error) {
        console.error('❌ Erro do Supabase Auth:', error);
        
        // Mensagens mais amigáveis
        if (error.message.includes('already registered')) {
          throw new Error('Este email já está cadastrado. Faça login.');
        }
        if (error.message.includes('invalid email')) {
          throw new Error('Email inválido');
        }
        if (error.message.includes('password')) {
          throw new Error('Senha muito fraca. Use pelo menos 6 caracteres.');
        }
        
        throw error;
      }

      if (!data.user) {
        throw new Error('Erro ao criar usuário');
      }

      console.log('✅ Conta criada no Auth, sincronizando perfil...');

      // Sincronizar perfil na tabela users
      const profile = await syncUserProfile(data.user);
      
      if (!profile) {
        console.warn('⚠️ Perfil não foi criado, mas auth funcionou');
      } else {
        console.log('✅ Perfil criado:', profile.username);
      }

      // onAuthStateChange vai atualizar o user automaticamente
      console.log('✅ Cadastro concluído com sucesso!');
    } catch (error: any) {
      console.error('❌ Erro no cadastro:', error);
      throw new Error(error.message || 'Erro ao criar conta');
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      if (currentUserRef.current?.id) {
        await markUserOffline(currentUserRef.current.id);
      }

      await supabase.auth.signOut();
      updateUserState(null);
    } catch (error) {
      console.error('Signout error:', error);
      updateUserState(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};
