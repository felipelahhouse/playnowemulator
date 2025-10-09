# 🚀 GUIA RÁPIDO - PlayNowEmu# 🚀 Guia Rápido - Novos Recursos PlayNowEmu



## ⚡ Deploy em 3 minutos## 🌍 Mudança de Idioma



### 1️⃣ Ativar Email/Password no Firebase### Como Mudar o Idioma do Site

🔗 https://console.firebase.google.com/project/planowemulator/authentication/providers

1. **Encontre o Seletor de Idioma**

- Clique em **"Email/Password"**   - Vá para o topo da página (header)

- **ATIVE** o toggle   - No canto superior direito, procure pelo ícone de **globo 🌐**

- Salvar

2. **Escolha Seu Idioma**

### 2️⃣ Ativar Google Sign-In (Opcional)   - Click no ícone do globo

🔗 https://console.firebase.google.com/project/planowemulator/authentication/providers   - Verá 3 opções com bandeiras:

     - 🇧🇷 **Português** (Brasil)

- Clique em **"Google"**     - 🇺🇸 **English** (Estados Unidos)

- **ATIVE** o toggle     - 🇪🇸 **Español** (Espanha)

- Email de suporte: `seu-email@gmail.com`

- Salvar3. **Pronto!**

   - O site inteiro muda para o idioma escolhido

### 3️⃣ Adicionar Domínios Autorizados   - Sua escolha fica salva automaticamente

🔗 https://console.firebase.google.com/project/planowemulator/authentication/settings   - Mesmo se fechar o navegador, vai lembrar



- Aba **"Authorized domains"**---

- Adicionar:

  - `planowemulator.web.app`## 🎨 Mudança de Tema

  - `localhost`

### Como Mudar o Tema Visual

---

1. **Encontre o Seletor de Tema**

## 🎮 Testar Localmente   - No header (topo da página)

   - Ao lado do seletor de idioma

```bash   - Ícone de **paleta de cores 🎨**

# Instalar dependências (primeira vez)

npm install2. **Escolha Seu Tema Favorito**

   - Click no ícone da paleta

# Rodar em desenvolvimento   - Opções disponíveis:

npm run dev     - 🎮 **Original** - Estilo neon cyan/roxo/rosa (padrão)

```     - 🎃 **Halloween** - Laranja/roxo com efeitos animados

     - 🎄 **Natal** - Verde/vermelho festivo

Abre em: http://localhost:5173     - ⚡ **Neon** - Rosa/amarelo/cyan vibrante



---3. **Tema Halloween Especial**

   - **Auto-ativado em Outubro!**

## 🌐 Fazer Deploy   - Quando ativar, verá:

     - 🦇 Morcegos voando pela tela

```bash     - 👻 Fantasmas flutuantes

# Build + Deploy     - 🎃 Abóboras pulando nos cantos

npm run build     - 🕷️ Teias de aranha

npx firebase-tools deploy     - 🍂 Folhas de outono caindo

```     - 🎃 Jack-o'-lanterns piscando



Site: https://planowemulator.web.app4. **Pronto!**

   - O tema muda instantaneamente

---   - Cores, gradientes e efeitos são atualizados

   - Sua escolha fica salva

## ✅ Checklist Pós-Deploy

---

- [ ] Email/Password ativado

- [ ] Google ativado (opcional)## 📸 Como Adicionar Foto de Perfil

- [ ] Domínios autorizados adicionados

- [ ] Testou criar conta### Passo a Passo

- [ ] Testou fazer login

- [ ] Testou jogar um jogo1. **Abrir Configurações de Perfil**

   - Click no seu **nome de usuário** no header

---   - No menu que aparece, click em **"Editar Perfil"**



## 🆘 Problemas?2. **Fazer Upload da Foto**

   - Verá uma área com seu avatar atual (ou ícone padrão)

### Não consigo criar conta   - Click no botão **"Alterar Foto"**

- Verifique se Email/Password está ativado   - Selecione uma imagem do seu computador

- Abra F12 → Console para ver erros

3. **Requisitos da Foto**

### Login com Google não funciona   - ✅ Formatos aceitos: **JPG, PNG, GIF**

- Verifique se Google está ativado   - ✅ Tamanho máximo: **2MB**

- Verifique se domínios estão autorizados   - ❌ Outros formatos não funcionam

- Permita pop-ups no navegador

4. **Confirmar**

### Site não carrega   - Você verá um preview da foto

- Aguarde 2-3 minutos após deploy   - Se estiver bom, click em **"Salvar Alterações"**

- Limpe cache: Ctrl+Shift+R   - Aguarde o upload (barra de progresso aparece)



---5. **Pronto!**

   - Sua foto aparece:

## 📞 Links Úteis     - No header ao lado do seu nome

     - Em streams que você fizer

- **Site:** https://planowemulator.web.app     - Em salas multiplayer

- **Firebase Console:** https://console.firebase.google.com/project/planowemulator     - No seu perfil público

- **Authentication:** https://console.firebase.google.com/project/planowemulator/authentication

- **Firestore:** https://console.firebase.google.com/project/planowemulator/firestore### ⚠️ Dicas

- Use fotos quadradas (ficam melhores)

---- Evite fotos muito escuras

- Comprima fotos grandes antes de fazer upload

**Pronto! Tudo configurado! 🎉**- Se der erro, tente uma foto menor


---

## 🎮 Salas Multiplayer Agora São Auto-Deletadas

### O Que Mudou?

**Antes:**
- Salas ficavam abertas mesmo depois de vazias
- Database ficava cheio de salas antigas
- Jogadores viam salas "fantasmas"

**Agora:**
- ✅ **Sala deleta quando o host (criador) sai**
- ✅ **Sala deleta quando fica vazia**
- ✅ **Database sempre limpo**
- ✅ **Lobby mostra apenas salas ativas**

### Como Funciona?

#### Quando Você Cria uma Sala:
1. Você é o **host** (criador)
2. Se você sair, a sala é **deletada automaticamente**
3. Todos os outros jogadores são desconectados
4. Sala some do lobby

#### Quando Você Entra em uma Sala:
1. Você é um **player** (jogador)
2. Se você sair, apenas você sai
3. Sala continua se tiver mais alguém
4. Se você for o último, sala é **deletada automaticamente**

### 🔍 Logs no Console
- Abra o console do navegador (F12)
- Veja mensagens detalhadas:
  - `[🚪 SAINDO]` - Você está saindo
  - `[🗑️ HOST SAINDO]` - Host deletando sala
  - `[✓ SALA DELETADA]` - Sala foi removida
  - `[👋 ÚLTIMO PLAYER]` - Última pessoa saindo

---

## 🎯 Interface do Player Mais Limpa

### O Que Mudou?

**Antes:**
- 3 caixas de informação
- Texto "Emulador SNES Real..." ocupando espaço
- Visual poluído

**Agora:**
- ✅ **Apenas 2 caixas de informação**
- ✅ **Foco no jogo**
- ✅ **Layout mais limpo**

### Caixas Restantes:
1. **Controles Padrão** - Como jogar
2. **Status** - Informações do jogo

---

## 📱 Melhorias em Mobile

### Jogos Funcionam Melhor em Celular!

**O Que Foi Melhorado:**

1. **Controles Touch**
   - Gamepad virtual aparece automaticamente
   - Botões com boa opacidade (70%)
   - Posicionados perfeitamente

2. **Performance**
   - Threads desabilitados (evita travamentos)
   - Carregamento mais rápido
   - Menos uso de bateria

3. **Experiência**
   - Zoom bloqueado (tela estável)
   - Scroll bounce desativado (iOS)
   - Tela cheia funciona melhor

### Como Jogar no Celular:

1. Abra o site no navegador do celular
2. Escolha um jogo
3. Click em "Jogar Agora"
4. **Controles virtuais aparecem automaticamente**
5. Jogue normalmente!

**Dica:** Use modo paisagem (horizontal) para melhor experiência

---

## ❓ Perguntas Frequentes (FAQ)

### Idiomas

**P: Minha escolha de idioma fica salva?**
R: Sim! Fica salva no navegador automaticamente.

**P: Preciso estar logado para mudar idioma?**
R: Não! Funciona mesmo sem login.

**P: Posso adicionar mais idiomas?**
R: No momento temos PT, EN e ES. Mais idiomas virão!

### Temas

**P: O tema Halloween aparece sozinho?**
R: Sim! Automaticamente em Outubro.

**P: Posso desativar os efeitos de Halloween?**
R: Sim! Basta escolher outro tema.

**P: Os temas afetam a performance?**
R: Não! Efeitos são otimizados e leves.

### Fotos de Perfil

**P: Minha foto fica pública?**
R: Sim, aparece em streams, lobbies e perfil.

**P: Posso trocar a foto depois?**
R: Sim! Quantas vezes quiser.

**P: Onde a foto é armazenada?**
R: No Supabase Storage, seguro e protegido.

### Multiplayer

**P: Perco progresso se o host sair?**
R: Sim, a sala fecha. É importante avisar antes!

**P: Posso transferir host para outro jogador?**
R: Por enquanto não, mas pode criar nova sala.

**P: Salas antigas somem sozinhas?**
R: Sim! Após 24h sem atividade (futuro) ou quando vazias.

---

## 🎉 Aproveite os Novos Recursos!

Agora você sabe como usar todos os novos recursos do PlayNowEmu:

- ✅ Mudar idioma do site
- ✅ Escolher tema visual
- ✅ Adicionar foto de perfil
- ✅ Entender auto-delete de salas
- ✅ Jogar melhor em mobile

**Divirta-se jogando! 🎮**

---

**Dúvidas?** Entre em contato com o suporte ou veja a documentação completa em `FEATURES.md`
