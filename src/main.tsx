import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { TranslationProvider } from './contexts/TranslationContext';
import { ThemeProvider } from './contexts/ThemeContext';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <TranslationProvider>
      <ThemeProvider>
        <App />
      </ThemeProvider>
    </TranslationProvider>
  </StrictMode>
);

// Registrar Service Worker para cache inteligente
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((registration) => {
        console.log('✅ Service Worker registrado:', registration.scope);
        
        // Atualizar SW quando houver nova versão
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                // Nova versão disponível - recarregar página
                console.log('🔄 Nova versão disponível! Recarregando...');
                window.location.reload();
              }
            });
          }
        });
      })
      .catch((error) => {
        console.error('❌ Erro ao registrar Service Worker:', error);
      });
  });
}

// Force rebuild Wed Oct  8 18:39:02 EDT 2025
