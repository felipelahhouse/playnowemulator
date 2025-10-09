# 🌍 Guia de Tradução - Como Aplicar Traduções em Componentes

## 📚 Índice
1. [Setup Básico](#setup-básico)
2. [Uso em Componentes](#uso-em-componentes)
3. [Traduzindo Componentes Existentes](#traduzindo-componentes-existentes)
4. [Adicionando Novas Traduções](#adicionando-novas-traduções)
5. [Exemplos Práticos](#exemplos-práticos)

---

## Setup Básico

### 1. Import do Hook
```typescript
import { useTranslation } from '../contexts/TranslationContext';
```

### 2. Uso Básico
```typescript
function MyComponent() {
  const { t, language, setLanguage } = useTranslation();
  
  return (
    <div>
      <h1>{t('welcome')}</h1>
      <p>{t('description')}</p>
    </div>
  );
}
```

---

## Uso em Componentes

### Exemplo 1: Botões
```typescript
// ❌ ANTES (hardcoded)
<button>Sign In</button>
<button>Sign Out</button>

// ✅ DEPOIS (traduzido)
<button>{t('signIn')}</button>
<button>{t('signOut')}</button>
```

### Exemplo 2: Títulos e Descrições
```typescript
// ❌ ANTES
<div>
  <h2>Game Library</h2>
  <p>Choose your favorite retro game</p>
</div>

// ✅ DEPOIS
<div>
  <h2>{t('gameLibrary')}</h2>
  <p>{t('gameLibraryDesc')}</p>
</div>
```

### Exemplo 3: Placeholders
```typescript
// ❌ ANTES
<input placeholder="Enter your username..." />
<input placeholder="Enter stream title..." />

// ✅ DEPOIS
<input placeholder={t('usernamePlaceholder')} />
<input placeholder={t('streamTitlePlaceholder')} />
```

### Exemplo 4: Alertas e Notificações
```typescript
// ❌ ANTES
alert('Room created successfully!');
toast.error('Failed to upload image');

// ✅ DEPOIS
alert(t('roomCreated'));
toast.error(t('uploadFailed'));
```

---

## Traduzindo Componentes Existentes

### Header.tsx
```typescript
// ❌ ANTES
const Header = () => {
  return (
    <nav>
      <a href="#games">Games</a>
      <a href="#multiplayer">Multiplayer</a>
      <a href="#tournaments">Tournaments</a>
      <a href="#community">Community</a>
      <button>Sign In</button>
      <button>Sign Up</button>
    </nav>
  );
};

// ✅ DEPOIS
const Header = () => {
  const { t } = useTranslation();
  
  return (
    <nav>
      <a href="#games">{t('games')}</a>
      <a href="#multiplayer">{t('multiplayer')}</a>
      <a href="#tournaments">{t('tournaments')}</a>
      <a href="#community">{t('community')}</a>
      <button>{t('signIn')}</button>
      <button>{t('signUp')}</button>
    </nav>
  );
};
```

### GamePlayer.tsx
```typescript
// ❌ ANTES
<div className="info-section">
  <h3>Default Controls</h3>
  <div className="controls">
    <div>Arrow Keys: Movement</div>
    <div>Z: A Button</div>
    <div>X: B Button</div>
    <div>Enter: Start</div>
    <div>Space: Select</div>
  </div>
</div>

// ✅ DEPOIS
const { t } = useTranslation();

<div className="info-section">
  <h3>{t('defaultControls')}</h3>
  <div className="controls">
    <div>{t('arrowKeys')}: {t('movement')}</div>
    <div>Z: {t('aButton')}</div>
    <div>X: {t('bButton')}</div>
    <div>{t('enter')}: {t('start')}</div>
    <div>{t('space')}: {t('select')}</div>
  </div>
</div>
```

### MultiplayerLobby.tsx
```typescript
// ❌ ANTES
return (
  <div>
    <h2>Multiplayer Lobbies</h2>
    <button onClick={createRoom}>Create Room</button>
    <button onClick={refreshLobbies}>Refresh</button>
    
    {rooms.length === 0 ? (
      <p>No active rooms. Create one!</p>
    ) : (
      <div>
        {rooms.map(room => (
          <div key={room.id}>
            <h3>{room.game_title}</h3>
            <p>Players: {room.player_count}/4</p>
            <button onClick={() => joinRoom(room.id)}>Join</button>
          </div>
        ))}
      </div>
    )}
  </div>
);

// ✅ DEPOIS
const { t } = useTranslation();

return (
  <div>
    <h2>{t('multiplayerLobbies')}</h2>
    <button onClick={createRoom}>{t('createRoom')}</button>
    <button onClick={refreshLobbies}>{t('refresh')}</button>
    
    {rooms.length === 0 ? (
      <p>{t('noActiveRooms')}</p>
    ) : (
      <div>
        {rooms.map(room => (
          <div key={room.id}>
            <h3>{room.game_title}</h3>
            <p>{t('players')}: {room.player_count}/4</p>
            <button onClick={() => joinRoom(room.id)}>{t('join')}</button>
          </div>
        ))}
      </div>
    )}
  </div>
);
```

### ProfileSettings.tsx
```typescript
// ❌ ANTES
return (
  <div className="modal">
    <h2>Edit Profile</h2>
    
    <div className="avatar-section">
      <h3>Profile Picture</h3>
      <button>Change Photo</button>
      <p>Max size: 2MB. Formats: JPG, PNG, GIF</p>
    </div>
    
    <div className="form-section">
      <label>Username</label>
      <input placeholder="Enter username..." />
      
      <label>Email</label>
      <input disabled />
    </div>
    
    <div className="buttons">
      <button onClick={handleSave}>Save Changes</button>
      <button onClick={onClose}>Cancel</button>
    </div>
  </div>
);

// ✅ DEPOIS
const { t } = useTranslation();

return (
  <div className="modal">
    <h2>{t('editProfile')}</h2>
    
    <div className="avatar-section">
      <h3>{t('profilePicture')}</h3>
      <button>{t('changePhoto')}</button>
      <p>{t('photoRequirements')}</p>
    </div>
    
    <div className="form-section">
      <label>{t('username')}</label>
      <input placeholder={t('usernamePlaceholder')} />
      
      <label>{t('email')}</label>
      <input disabled />
    </div>
    
    <div className="buttons">
      <button onClick={handleSave}>{t('saveChanges')}</button>
      <button onClick={onClose}>{t('cancel')}</button>
    </div>
  </div>
);
```

### StreamerView.tsx
```typescript
// ❌ ANTES
const [streamTitle, setStreamTitle] = useState('My Live Stream');

return (
  <div>
    <div className="stream-controls">
      <input 
        value={streamTitle}
        onChange={(e) => setStreamTitle(e.target.value)}
        placeholder="Stream title..."
      />
      <button onClick={startStream}>Go Live</button>
      <button onClick={endStream}>End Stream</button>
    </div>
    
    <div className="viewer-count">
      <p>{viewerCount} viewers watching</p>
    </div>
    
    <div className="stream-status">
      <span className="live-badge">LIVE</span>
      <span className="duration">{formatDuration(streamTime)}</span>
    </div>
  </div>
);

// ✅ DEPOIS
const { t } = useTranslation();
const [streamTitle, setStreamTitle] = useState(t('myLiveStream'));

return (
  <div>
    <div className="stream-controls">
      <input 
        value={streamTitle}
        onChange={(e) => setStreamTitle(e.target.value)}
        placeholder={t('streamTitlePlaceholder')}
      />
      <button onClick={startStream}>{t('goLive')}</button>
      <button onClick={endStream}>{t('endStream')}</button>
    </div>
    
    <div className="viewer-count">
      <p>{viewerCount} {t('viewersWatching')}</p>
    </div>
    
    <div className="stream-status">
      <span className="live-badge">{t('live')}</span>
      <span className="duration">{formatDuration(streamTime)}</span>
    </div>
  </div>
);
```

---

## Adicionando Novas Traduções

### Passo 1: Adicionar em TranslationContext.tsx

```typescript
const translations = {
  pt: {
    // ... traduções existentes
    newFeature: 'Novo Recurso',
    newFeatureDesc: 'Descrição do novo recurso',
    newButton: 'Clique Aqui',
    newError: 'Erro ao processar',
    newSuccess: 'Sucesso!',
  },
  en: {
    // ... existing translations
    newFeature: 'New Feature',
    newFeatureDesc: 'Description of the new feature',
    newButton: 'Click Here',
    newError: 'Error processing',
    newSuccess: 'Success!',
  },
  es: {
    // ... traducciones existentes
    newFeature: 'Nueva Función',
    newFeatureDesc: 'Descripción de la nueva función',
    newButton: 'Haz Clic Aquí',
    newError: 'Error al procesar',
    newSuccess: '¡Éxito!',
  },
};
```

### Passo 2: Usar no Componente

```typescript
function NewFeature() {
  const { t } = useTranslation();
  
  const handleClick = () => {
    try {
      // ... lógica
      toast.success(t('newSuccess'));
    } catch (error) {
      toast.error(t('newError'));
    }
  };
  
  return (
    <div>
      <h2>{t('newFeature')}</h2>
      <p>{t('newFeatureDesc')}</p>
      <button onClick={handleClick}>
        {t('newButton')}
      </button>
    </div>
  );
}
```

---

## Exemplos Práticos

### Exemplo 1: Modal de Confirmação
```typescript
function ConfirmDeleteModal({ onConfirm, onCancel }) {
  const { t } = useTranslation();
  
  return (
    <div className="modal">
      <h2>{t('confirmDelete')}</h2>
      <p>{t('deleteWarning')}</p>
      <div className="actions">
        <button onClick={onConfirm} className="danger">
          {t('delete')}
        </button>
        <button onClick={onCancel}>
          {t('cancel')}
        </button>
      </div>
    </div>
  );
}
```

### Exemplo 2: Toast Notifications
```typescript
function GameLibrary() {
  const { t } = useTranslation();
  
  const handlePlayGame = async (gameId: string) => {
    try {
      toast.info(t('loadingGame'));
      await loadGame(gameId);
      toast.success(t('gameLoaded'));
    } catch (error) {
      toast.error(t('gameLoadError'));
    }
  };
  
  return (
    <div>
      {games.map(game => (
        <button 
          key={game.id}
          onClick={() => handlePlayGame(game.id)}
        >
          {t('playNow')}
        </button>
      ))}
    </div>
  );
}
```

### Exemplo 3: Formulário com Validação
```typescript
function LoginForm() {
  const { t } = useTranslation();
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const validate = (username: string, password: string) => {
    const newErrors: Record<string, string> = {};
    
    if (!username) {
      newErrors.username = t('usernameRequired');
    }
    
    if (!password) {
      newErrors.password = t('passwordRequired');
    } else if (password.length < 6) {
      newErrors.password = t('passwordTooShort');
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  return (
    <form>
      <div>
        <label>{t('username')}</label>
        <input placeholder={t('usernamePlaceholder')} />
        {errors.username && <span className="error">{errors.username}</span>}
      </div>
      
      <div>
        <label>{t('password')}</label>
        <input type="password" placeholder={t('passwordPlaceholder')} />
        {errors.password && <span className="error">{errors.password}</span>}
      </div>
      
      <button type="submit">{t('signIn')}</button>
    </form>
  );
}
```

### Exemplo 4: Lista com Estados Vazios
```typescript
function FriendsList() {
  const { t } = useTranslation();
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(true);
  
  if (loading) {
    return <div>{t('loading')}</div>;
  }
  
  if (friends.length === 0) {
    return (
      <div className="empty-state">
        <p>{t('noFriends')}</p>
        <button>{t('addFriend')}</button>
      </div>
    );
  }
  
  return (
    <div>
      <h2>{t('myFriends')}</h2>
      {friends.map(friend => (
        <div key={friend.id}>
          <span>{friend.username}</span>
          <button>{t('remove')}</button>
        </div>
      ))}
    </div>
  );
}
```

---

## 📝 Checklist de Tradução

Ao traduzir um componente, verifique:

- [ ] Importou `useTranslation`
- [ ] Substituiu todos os textos hardcoded
- [ ] Traduziu placeholders de inputs
- [ ] Traduziu labels de formulários
- [ ] Traduziu mensagens de erro
- [ ] Traduziu mensagens de sucesso
- [ ] Traduziu tooltips e hints
- [ ] Traduziu textos de botões
- [ ] Traduziu títulos e subtítulos
- [ ] Adicionou traduções para todos os 3 idiomas (PT, EN, ES)

---

## 🎯 Boas Práticas

### ✅ Faça
```typescript
// Use chaves descritivas
{t('gameNotFound')}
{t('uploadImageSuccess')}
{t('playerJoinedRoom')}

// Mantenha consistência
{t('save')} // Sempre 'save', não 'saveButton' em um lugar e 'save' em outro

// Use namespaces lógicos (futuro)
{t('errors.notFound')}
{t('success.saved')}
```

### ❌ Evite
```typescript
// Chaves genéricas demais
{t('text1')}
{t('button2')}
{t('msg')}

// Textos concatenados
{t('hello') + ' ' + username} // ❌
{t('greeting', { name: username })} // ✅ (quando implementarmos interpolação)

// Textos hardcoded misturados
<div>
  {t('welcome')} // ✅
  to our site // ❌
</div>
```

---

## 🚀 Próximos Passos

1. **Traduzir Componentes Principais:**
   - [ ] Header.tsx
   - [ ] GameLibrary.tsx
   - [ ] MultiplayerLobby.tsx
   - [ ] LiveStreamGrid.tsx
   - [ ] UserProfile.tsx

2. **Adicionar Interpolação:**
   ```typescript
   // Futuro: t('greeting', { name: 'Felipe' })
   // Output PT: "Olá, Felipe!"
   // Output EN: "Hello, Felipe!"
   ```

3. **Adicionar Pluralização:**
   ```typescript
   // Futuro: t('viewerCount', { count: 5 })
   // Output: "5 espectadores" ou "1 espectador"
   ```

4. **Adicionar Formatação de Data/Hora:**
   ```typescript
   // Usar biblioteca como date-fns com locale
   ```

---

**Dúvidas?** Consulte a documentação completa em `FEATURES.md`
