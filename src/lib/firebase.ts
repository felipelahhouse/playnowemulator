import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

// 🔥 CONFIGURAÇÃO FIREBASE
const firebaseConfig = {
  apiKey: "AIzaSyDmC_HF775QiX6EA3rx2xDF2XXw8zmg3yQ",
  authDomain: "planowemulator.firebaseapp.com",
  projectId: "planowemulator",
  storageBucket: "planowemulator.firebasestorage.app",
  messagingSenderId: "509464952147",
  appId: "1:509464952147:web:59776912f625f3235cf5a6",
  measurementId: "G-JQDRDZY9BJ"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Exportar serviços
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);

export default app;
