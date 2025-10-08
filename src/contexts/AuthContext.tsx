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
    // Verificar se tem usuário salvo localmente
    const savedUser = localStorage.getItem('current_user');
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        setUser(userData);
      } catch (e) {
        localStorage.removeItem('current_user');
      }
    }
    setLoading(false);
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      // Sistema local de autenticação (prioritário para funcionar sempre)
      const localUsers = JSON.parse(localStorage.getItem('local_users') || '{}');
      
      // Verificar se usuário existe localmente
      if (localUsers[email] && localUsers[email].password === password) {
        const userData = localUsers[email];
        const loggedUser: User = {
          id: userData.id,
          email: email,
          username: userData.username,
          avatar_url: undefined,
          is_online: true,
          last_seen: new Date().toISOString(),
          created_at: userData.created_at
        };
        setUser(loggedUser);
        localStorage.setItem('current_user', JSON.stringify(loggedUser));
        return;
      }

      throw new Error('Email ou senha inválidos. Crie uma conta primeiro.');
    } catch (error: any) {
      console.error('Sign in error:', error);
      throw error;
    }
  };

  const signUp = async (email: string, password: string, username: string) => {
    try {
      // Sistema local de cadastro (sempre funciona)
      const localUsers = JSON.parse(localStorage.getItem('local_users') || '{}');
      
      // Verificar se usuário já existe
      if (localUsers[email]) {
        throw new Error('Este email já está cadastrado. Faça login.');
      }

      // Criar novo usuário localmente
      const newUser = {
        id: 'user-' + Date.now(),
        password: password,
        username: username,
        created_at: new Date().toISOString()
      };

      localUsers[email] = newUser;
      localStorage.setItem('local_users', JSON.stringify(localUsers));

      // Fazer login automaticamente
      const loggedUser: User = {
        id: newUser.id,
        email: email,
        username: username,
        avatar_url: undefined,
        is_online: true,
        last_seen: new Date().toISOString(),
        created_at: newUser.created_at
      };
      
      setUser(loggedUser);
      localStorage.setItem('current_user', JSON.stringify(loggedUser));
    } catch (error: any) {
      console.error('Signup error:', error);
      throw error;
    }
  };

  const signOut = async () => {
    // Limpar dados locais
    localStorage.removeItem('current_user');
    setUser(null);
    
    // Fazer logout no Supabase
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.log('Supabase signout skipped:', e);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};