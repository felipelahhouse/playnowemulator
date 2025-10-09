import React, { useState, useEffect } from 'react';
import { Search, Star, Users, Gamepad2 } from 'lucide-react';
import { collection, getDocs, doc, updateDoc, increment, query, orderBy } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import type { Game } from '../../types';
import GamePlayer from './GamePlayer';

interface GameLibraryProps {
  onStartStream?: (game: Game) => void;
  onCreateMultiplayer?: (game: Game) => void;
}

const FirebaseGameLibrary: React.FC<GameLibraryProps> = ({ 
  onStartStream,
  onCreateMultiplayer 
}) => {
  const [games, setGames] = useState<Game[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('all');
  const [sortBy, setSortBy] = useState('popular');
  const [loading, setLoading] = useState(true);
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);

  const fetchGames = async () => {
    try {
      setLoading(true);
      
      const gamesQuery = query(
        collection(db, 'games'),
        orderBy('playCount', 'desc')
      );
      
      const snapshot = await getDocs(gamesQuery);
      const gamesData = snapshot.docs.map(d => {
        const data = d.data();
        const mapped: Game = {
          id: d.id,
          title: data.title || 'Untitled',
          description: data.description ?? null,
          coverUrl: data.coverUrl ?? '/covers/placeholder.png',
          playCount: data.playCount ?? 0,
          multiplayerSupport: data.multiplayerSupport ?? false,
          romUrl: data.romUrl || '',
          platform: data.platform || 'snes',
          genre: data.genre ?? null,
          year: data.year ?? null,
          players: data.players ?? null,
          rating: data.rating ?? null,
          publisher: data.publisher ?? null,
          createdAt: data.createdAt?.toDate?.()?.toISOString?.() || new Date().toISOString()
        };
        return mapped;
      });

      setGames(gamesData);
    } catch (error) {
      console.error('Error fetching games:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGames();
  }, []);

  const genres = ['all', 'Platform', 'Action', 'Fighting', 'Racing', 'Sports', 'Beat \'em Up'];

  const filteredGames = games
    .filter(game => {
      const titleMatch = searchTerm.length === 0 || 
        game.title.toLowerCase().includes(searchTerm.toLowerCase());
      const genreMatch = selectedGenre === 'all' || game.genre === selectedGenre;
      return titleMatch && genreMatch;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'popular':
          return (b.playCount || 0) - (a.playCount || 0);
        case 'rating':
          return (b.rating || 0) - (a.rating || 0);
        case 'newest':
          return (b.year || 0) - (a.year || 0);
        case 'alphabetical':
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });

  const handlePlayGame = async (game: Game) => {
    try {
      const gameRef = doc(db, 'games', game.id);
      await updateDoc(gameRef, {
        playCount: increment(1)
      });

      setGames(prev =>
        prev.map(g =>
          g.id === game.id ? { ...g, playCount: (g.playCount || 0) + 1 } : g
        )
      );

      setSelectedGame(game);
    } catch (error) {
      console.error('Error updating play count:', error);
      setSelectedGame(game);
    }
  };

  return (
    <>
      <section id="games" className="py-20 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-gray-900 via-black to-gray-900 pointer-events-none" />

        <div className="container mx-auto relative z-10">
          <div className="text-center mb-12">
            <h2 className="text-5xl font-black mb-4 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400">
              BIBLIOTECA DE JOGOS
            </h2>
            <p className="text-gray-400 text-lg">
              {games.length} jogos retro disponíveis
            </p>
          </div>

          {/* Filtros e Busca */}
          <div className="mb-8 space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500" size={20} />
                <input
                  type="text"
                  placeholder="Buscar jogos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all"
                />
              </div>

              <select
                value={selectedGenre}
                onChange={(e) => setSelectedGenre(e.target.value)}
                className="px-6 py-3 bg-gray-800/50 border border-gray-700 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
              >
                {genres.map(genre => (
                  <option key={genre} value={genre}>
                    {genre === 'all' ? 'Todos os Gêneros' : genre}
                  </option>
                ))}
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-6 py-3 bg-gray-800/50 border border-gray-700 rounded-xl focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 transition-all"
              >
                <option value="popular">Mais Jogados</option>
                <option value="rating">Melhor Avaliados</option>
                <option value="newest">Mais Recentes</option>
                <option value="alphabetical">A-Z</option>
              </select>
            </div>
          </div>

          {/* Grid de Jogos */}
          {loading ? (
            <div className="text-center py-20">
              <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-cyan-400 border-t-transparent"></div>
              <p className="mt-4 text-gray-400">Carregando jogos...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredGames.map((game) => (
                <div
                  key={game.id}
                  className="group bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl overflow-hidden border border-gray-700 hover:border-cyan-500 transition-all duration-300 hover:transform hover:scale-105"
                >
                  {/* Capa do Jogo */}
                  <div className="relative aspect-[3/4] overflow-hidden bg-gray-900">
                    <img
                      src={game.coverUrl || '/covers/placeholder.png'}
                      alt={game.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/covers/placeholder.png';
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>

                  {/* Info do Jogo */}
                  <div className="p-4 space-y-3">
                    <h3 className="font-bold text-lg text-white group-hover:text-cyan-400 transition-colors line-clamp-2">
                      {game.title}
                    </h3>

                    <div className="flex items-center justify-between text-sm">
                      <span className="px-3 py-1 bg-purple-500/20 text-purple-400 rounded-full">
                        {game.genre}
                      </span>
                      {game.year && (
                        <span className="text-gray-500">{game.year}</span>
                      )}
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <Star className="text-yellow-400" size={16} fill="currentColor" />
                        <span className="text-white font-semibold">{game.rating?.toFixed(1)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-400">
                        <Users size={16} />
                        <span>{game.players}P</span>
                      </div>
                    </div>

                    {/* Botões */}
                    <div className="space-y-2 pt-2">
                      <button
                        onClick={() => handlePlayGame(game)}
                        className="w-full px-4 py-2 bg-gradient-to-r from-cyan-500 to-purple-500 text-white rounded-lg font-bold hover:shadow-lg hover:shadow-cyan-500/50 transition-all duration-300 flex items-center justify-center gap-2"
                      >
                        <Gamepad2 size={18} />
                        Jogar Agora
                      </button>

                      {onStartStream && (
                        <button
                          onClick={() => onStartStream(game)}
                          className="w-full px-4 py-2 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-lg font-bold hover:shadow-lg hover:shadow-red-500/50 transition-all duration-300"
                        >
                          📺 Iniciar Stream
                        </button>
                      )}

                      {game.multiplayerSupport && onCreateMultiplayer && (
                        <button
                          onClick={() => onCreateMultiplayer(game)}
                          className="w-full px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg font-bold hover:shadow-lg hover:shadow-green-500/50 transition-all duration-300"
                        >
                          🎮 Multiplayer
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {filteredGames.length === 0 && !loading && (
            <div className="text-center py-20">
              <p className="text-gray-400 text-xl">Nenhum jogo encontrado</p>
            </div>
          )}
        </div>
      </section>

      {selectedGame && (
        <GamePlayer
          gameTitle={selectedGame.title}
          romPath={selectedGame.romUrl}
          onClose={() => setSelectedGame(null)}
        />
      )}
    </>
  );
};

export default FirebaseGameLibrary;
