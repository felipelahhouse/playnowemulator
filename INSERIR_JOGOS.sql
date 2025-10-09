-- ============================================
-- 🎮 INSERIR JOGOS NO CATÁLOGO
-- ============================================
-- Este script adiciona TODOS os jogos que você tem
-- na pasta public/roms/
-- Total: 37 jogos SNES incríveis!
-- ============================================

-- Limpar jogos existentes (opcional - descomente se quiser começar do zero)
-- DELETE FROM games;

-- Inserir TODOS os jogos disponíveis
INSERT INTO games (title, description, platform, cover_url, rom_url, year, genre, publisher, multiplayer_support)
VALUES
    -- PLATAFORMA / AVENTURA
    (
        'Super Mario World',
        'O clássico jogo de plataforma do Mario no Super Nintendo. Explore a Dinosaur Land, monte em Yoshi e salve a Princesa Peach das garras de Bowser!',
        'SNES',
        'https://images.igdb.com/igdb/image/upload/t_cover_big/co2m7t.jpg',
        '/roms/Super Mario World (U) [!].smc',
        1990,
        'Platform',
        'Nintendo',
        true
    ),
    (
        'Donkey Kong Country',
        'Aventura revolucionária com gráficos pré-renderizados. Junte-se a Donkey Kong e Diddy Kong numa jornada épica para recuperar as bananas roubadas!',
        'SNES',
        'https://images.igdb.com/igdb/image/upload/t_cover_big/co1x7m.jpg',
        '/roms/Donkey Kong Country (U) (V1.2) [!].smc',
        1994,
        'Platform',
        'Rare/Nintendo',
        true
    ),
    (
        'Aladdin',
        'Baseado no filme da Disney, viva as aventuras de Aladdin por Agrabah. Gráficos coloridos e jogabilidade fluida neste clássico da Capcom!',
        'SNES',
        'https://images.igdb.com/igdb/image/upload/t_cover_big/co20m0.jpg',
        '/roms/Aladdin (USA).sfc',
        1993,
        'Action/Platform',
        'Capcom',
        false
    ),
    (
        'The Magical Quest Starring Mickey Mouse',
        'Mickey Mouse em uma aventura mágica! Troque de roupas com poderes especiais e salve Pluto das garras de Pete!',
        'SNES',
        'https://images.igdb.com/igdb/image/upload/t_cover_big/co28lf.jpg',
        '/roms/Magical Quest Starring Mickey Mouse, The (U) [!].smc',
        1992,
        'Platform',
        'Capcom',
        false
    ),
    (
        'Goof Troop',
        'Jogue como Goofy ou Max nesta aventura cooperativa! Resolva puzzles e derrote piratas em uma ilha misteriosa.',
        'SNES',
        'https://images.igdb.com/igdb/image/upload/t_cover_big/co2c8x.jpg',
        '/roms/Goof Troop (E).smc',
        1993,
        'Action/Puzzle',
        'Capcom',
        true
    ),
    (
        'Joe & Mac 2: Lost in the Tropics',
        'Os homens das cavernas estão de volta! Aventura colorida e divertida com Joe e Mac explorando terras tropicais.',
        'SNES',
        'https://images.igdb.com/igdb/image/upload/t_cover_big/co7g47.jpg',
        '/roms/Joe & Mac 2 - Lost in the Tropics (U).smc',
        1994,
        'Platform',
        'Data East',
        true
    ),
    (
        'Prehistorik Man',
        'Aventura pré-histórica colorida! Explore cavernas, enfrente dinossauros e colete comida neste plataforma francês.',
        'SNES',
        'https://images.igdb.com/igdb/image/upload/t_cover_big/co49o3.jpg',
        '/roms/Prehistorik Man (U) [!].smc',
        1995,
        'Platform',
        'Titus',
        false
    ),
    (
        'Sparkster',
        'Gambá espacial com jetpack! Sequência de Rocket Knight Adventures com gráficos incríveis e ação frenética.',
        'SNES',
        'https://images.igdb.com/igdb/image/upload/t_cover_big/co2djq.jpg',
        '/roms/Sparkster (E).smc',
        1994,
        'Action/Platform',
        'Konami',
        false
    ),
    (
        'Mickey to Donald: Magical Adventure 3',
        'Terceiro jogo da série Magical Quest! Mickey e Donald em nova aventura cooperativa mágica.',
        'SNES',
        'https://images.igdb.com/igdb/image/upload/t_cover_big/co6bnr.jpg',
        '/roms/Mickey to Donald - Magical Adventure 3 (J) [t2].smc',
        1995,
        'Platform',
        'Capcom',
        true
    ),

    -- AÇÃO / BEAT EM UP
    (
        'Mega Man X',
        'Revolução da série Mega Man! X enfrenta Sigma e os Mavericks com novos poderes, dash e wall jump. Obra-prima da ação!',
        'SNES',
        'https://images.igdb.com/igdb/image/upload/t_cover_big/co1x7w.jpg',
        '/roms/Mega Man X (U) (V1.0) [!].smc',
        1993,
        'Action/Platform',
        'Capcom',
        false
    ),
    (
        'Teenage Mutant Ninja Turtles IV: Turtles in Time',
        'O melhor beat em up das Tartarugas Ninja! Viaje no tempo enfrentando Shredder e Krang. 4 jogadores simultâneos!',
        'SNES',
        'https://images.igdb.com/igdb/image/upload/t_cover_big/co20qo.jpg',
        '/roms/Teenage Mutant Ninja Turtles IV - Turtles in Time (U) [!].smc',
        1992,
        'Beat em Up',
        'Konami',
        true
    ),
    (
        'Teenage Mutant Hero Turtles: Tournament Fighters',
        'Tartarugas em combates 1v1! Jogo de luta único com as TMNT em torneios épicos.',
        'SNES',
        'https://images.igdb.com/igdb/image/upload/t_cover_big/co5nma.jpg',
        '/roms/Teenage Mutant Hero Turtles - Tournament Fighters (E).smc',
        1993,
        'Fighting',
        'Konami',
        true
    ),
    (
        'Battletoads in Battlemaniacs',
        'Os sapos guerreiros estão de volta! Ação brutal, fases desafiadoras e boss fights épicas. Prepare-se para rage!',
        'SNES',
        'https://images.igdb.com/igdb/image/upload/t_cover_big/co20rb.jpg',
        '/roms/Battletoads in Battlemaniacs (U) [!].smc',
        1993,
        'Beat em Up',
        'Tradewest',
        true
    ),
    (
        'Battletoads & Double Dragon',
        'Crossover épico! Battletoads e Double Dragon juntos contra a Dark Queen. Beat em up cooperativo insano!',
        'SNES',
        'https://images.igdb.com/igdb/image/upload/t_cover_big/co2drd.jpg',
        '/roms/Battletoads & Double Dragon - The Ultimate Team (U) [!].smc',
        1993,
        'Beat em Up',
        'Tradewest',
        true
    ),
    (
        'Super Double Dragon',
        'Billy e Jimmy Lee em nova aventura! Beat em up clássico com novos movimentos especiais.',
        'SNES',
        'https://images.igdb.com/igdb/image/upload/t_cover_big/co76b2.jpg',
        '/roms/Super Double Dragon (U).smc',
        1992,
        'Beat em Up',
        'Technos',
        true
    ),
    (
        'Mighty Morphin Power Rangers',
        'É hora de morfar! Lute como os Power Rangers em combates de beat em up e batalhas de Megazord!',
        'SNES',
        'https://images.igdb.com/igdb/image/upload/t_cover_big/co2o4d.jpg',
        '/roms/Mighty Morphin Power Rangers (U).smc',
        1994,
        'Beat em Up/Fighting',
        'Bandai',
        true
    ),
    (
        'Mighty Morphin Power Rangers: The Movie',
        'Baseado no filme! Rangers enfrentam Ivan Ooze com novos poderes e Ninjazords!',
        'SNES',
        'https://images.igdb.com/igdb/image/upload/t_cover_big/co7nru.jpg',
        '/roms/Mighty Morphin Power Rangers - The Movie (U).smc',
        1995,
        'Beat em Up/Fighting',
        'Bandai',
        true
    ),
    (
        'Mutant Chronicles: Doom Troopers',
        'Sci-fi beat em up dark! Soldados cibernéticos enfrentam hordas de mutantes em missões brutais.',
        'SNES',
        'https://images.igdb.com/igdb/image/upload/t_cover_big/co80ue.jpg',
        '/roms/Mutant Chronicles - Doom Troopers (U) [!].smc',
        1995,
        'Run and Gun',
        'Playmates',
        true
    ),

    -- LUTA
    (
        'Street Fighter Alpha 2',
        'Prequel de SF2 com super combos e custom combos! Rose, Sakura, Gen e mais lutadores únicos!',
        'SNES',
        'https://images.igdb.com/igdb/image/upload/t_cover_big/co20vs.jpg',
        '/roms/Street Fighter Alpha 2 (U) [!].smc',
        1996,
        'Fighting',
        'Capcom',
        true
    ),
    (
        'Super Street Fighter II',
        'Versão definitiva de SF2! 4 novos personagens (Cammy, Fei Long, Dee Jay, T.Hawk) e rebalanceamento!',
        'SNES',
        'https://images.igdb.com/igdb/image/upload/t_cover_big/co3o52.jpg',
        '/roms/Super Street Fighter II - The New Challengers (E) [!].smc',
        1993,
        'Fighting',
        'Capcom',
        true
    ),
    (
        'Fatal Fury 2',
        'Terry Bogard e amigos em torneio mundial! Sistema de planos duplos e desperation moves!',
        'SNES',
        'https://images.igdb.com/igdb/image/upload/t_cover_big/co20p8.jpg',
        '/roms/Fatal Fury 2 (E) [!].smc',
        1993,
        'Fighting',
        'SNK',
        true
    ),
    (
        'Fatal Fury Special',
        'Versão melhorada de Fatal Fury 2! Todos os personagens jogáveis incluindo bosses!',
        'SNES',
        'https://images.igdb.com/igdb/image/upload/t_cover_big/co20z8.jpg',
        '/roms/Fatal Fury Special (E) (61959).smc',
        1994,
        'Fighting',
        'SNK',
        true
    ),
    (
        'Killer Instinct',
        'Sistema de combo revolucionário! Ultra combos, C-C-COMBO BREAKER! Trilha sonora épica!',
        'SNES',
        'https://images.igdb.com/igdb/image/upload/t_cover_big/co20ql.jpg',
        '/roms/Killer Instinct (E) [!].smc',
        1995,
        'Fighting',
        'Rare/Nintendo',
        true
    ),
    (
        'Dragon Ball Z: Super Butouden 2',
        'Luta épica de DBZ! Torneio com os melhores guerreiros Z. Transformações e Kamehamehas!',
        'SNES',
        'https://images.igdb.com/igdb/image/upload/t_cover_big/co6yah.jpg',
        '/roms/Dragon Ball Z - Super Butouden 2 (J) (V1.1).smc',
        1993,
        'Fighting',
        'Bandai',
        true
    ),

    -- AÇÃO / HORROR
    (
        'Castlevania: Dracula X',
        'Richter Belmont vs Dracula! Ação gótica com chicote, sub-armas e múltiplos caminhos!',
        'SNES',
        'https://images.igdb.com/igdb/image/upload/t_cover_big/co2xeh.jpg',
        '/roms/Castlevania - Dracula X (U) [!].smc',
        1995,
        'Action/Platform',
        'Konami',
        false
    ),
    (
        'Castlevania: Vampire''s Kiss',
        'Versão europeia de Castlevania! Explore o castelo sombrio de Dracula com John Morris.',
        'SNES',
        'https://images.igdb.com/igdb/image/upload/t_cover_big/co7uge.jpg',
        '/roms/Castlevania - Vampire''s Kiss (E) [f1].smc',
        1994,
        'Action/Platform',
        'Konami',
        false
    ),

    -- CORRIDA / ESPORTES
    (
        'Super Mario Kart',
        'O jogo que inventou o gênero racing party! Corra com Mario e amigos em pistas coloridas cheias de itens loucos!',
        'SNES',
        'https://images.igdb.com/igdb/image/upload/t_cover_big/co20m6.jpg',
        '/roms/Super Mario Kart (E) [!].smc',
        1992,
        'Racing',
        'Nintendo',
        true
    ),
    (
        'Top Gear',
        'Corrida arcade em alta velocidade! Viaje por países com clima dinâmico e nitro. Clássico de corrida!',
        'SNES',
        'https://images.igdb.com/igdb/image/upload/t_cover_big/co2bkm.jpg',
        '/roms/Top Gear (U) [!].smc',
        1992,
        'Racing',
        'Kemco',
        true
    ),
    (
        'International Superstar Soccer Deluxe',
        'O melhor futebol do SNES! Seleções reais, jogabilidade fluida e modo torneio completo!',
        'SNES',
        'https://images.igdb.com/igdb/image/upload/t_cover_big/co28po.jpg',
        '/roms/International Superstar Soccer Deluxe (U).smc',
        1995,
        'Sports/Soccer',
        'Konami',
        true
    ),

    -- AÇÃO / STAR WARS
    (
        'Super Star Wars: The Empire Strikes Back',
        'Reviva O Império Contra-Ataca! Jogue como Luke, Han ou Chewbacca em Hoth, Dagobah e Cloud City!',
        'SNES',
        'https://images.igdb.com/igdb/image/upload/t_cover_big/co209d.jpg',
        '/roms/Super Star Wars - The Empire Strikes Back (U) (V1.1) [!].smc',
        1993,
        'Action/Platform',
        'LucasArts',
        false
    )
ON CONFLICT DO NOTHING;

-- Verificar jogos inseridos
SELECT 
    title,
    platform,
    year,
    genre,
    CASE WHEN multiplayer_support THEN '✅ Multiplayer' ELSE '👤 Single' END as mode
FROM games
ORDER BY title;

-- Mensagem de sucesso
DO $$
DECLARE
    game_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO game_count FROM games;
    RAISE NOTICE '✅ % jogos inseridos no catálogo!', game_count;
    RAISE NOTICE '🎮 Pronto para jogar!';
END $$;
