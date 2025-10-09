import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import type { User } from '../types';

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

  // Buscar ou criar perfil do usuário no Firestore
  const getOrCreateProfile = async (firebaseUser: FirebaseUser): Promise<User | null> => {
    try {
      const userRef = doc(db, 'users', firebaseUser.uid);
      const userDoc = await getDoc(userRef);

      if (userDoc.exists()) {
        // Atualizar status online
        await updateDoc(userRef, {
          is_online: true,
          last_seen: new Date()
        });
        
        return userDoc.data() as User;
      }

      // Criar novo perfil
      const username = firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Player';
      const newUser: User = {
        id: firebaseUser.uid,
        email: firebaseUser.email || '',
        username: username,
        is_online: true,
        last_seen: new Date().toISOString(),
        created_at: new Date().toISOString()
      };

      await setDoc(userRef, newUser);
      return newUser;
    } catch (error) {
      console.error('Erro ao buscar/criar perfil:', error);
      return {
        id: firebaseUser.uid,
        email: firebaseUser.email || '',
        username: firebaseUser.displayName || 'Player',
        is_online: true,
        last_seen: new Date().toISOString(),
        created_at: new Date().toISOString()
      };
    }
  };

  // Inicializar auth
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const profile = await getOrCreateProfile(firebaseUser);
        setUser(profile);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      const profile = await getOrCreateProfile(result.user);
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
      const result = await createUserWithEmailAndPassword(auth, email, password);
      
      // Criar perfil com username
      const newUser: User = {
        id: result.user.uid,
        email: email,
        username: username,
        is_online: true,
        last_seen: new Date().toISOString(),
        created_at: new Date().toISOString()
      };

      await setDoc(doc(db, 'users', result.user.uid), newUser);
      setUser(newUser);
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
        await updateDoc(doc(db, 'users', user.id), {
          is_online: false,
          last_seen: new Date()
        });
      }
      await firebaseSignOut(auth);
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
