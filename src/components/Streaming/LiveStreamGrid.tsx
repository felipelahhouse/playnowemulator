import React, { useEffect, useState } from 'react';
import { Radio, Eye, Heart, Play } from 'lucide-react';
import {
  Timestamp,
  collection,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
  where
} from 'firebase/firestore';
import SpectatorView from './SpectatorView';
import { db } from '../../lib/firebase';

interface Stream {
  id: string;
  streamerId: string;
  gameId?: string;
  title: string;
  isLive: boolean;
  viewerCount: number;
  startedAt: string;
  streamerUsername: string;
  gameTitle: string;
  gameCover?: string | null;
}

const LiveStreamGrid: React.FC = () => {
  const [streams, setStreams] = useState<Stream[]>([]);
  const [selectedStream, setSelectedStream] = useState<Stream | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const streamsQuery = query(
      collection(db, 'live_streams'),
      where('isLive', '==', true),
      orderBy('startedAt', 'desc')
    );

    const unsubscribe = onSnapshot(
      streamsQuery,
      async (snapshot) => {
        if (!isMounted) {
          return;
        }

        const rawStreams = snapshot.docs.map((docSnap) => {
          const data = docSnap.data() as any;
          const startedAtValue = data.startedAt as Timestamp | string | undefined;

          const normalizeDate = (value: Timestamp | string | Date | undefined): string => {
            if (!value) return new Date().toISOString();
            if (value instanceof Timestamp) {
              return value.toDate().toISOString();
            }
            if (value instanceof Date) {
              return value.toISOString();
            }
            if (typeof value === 'string') {
              return value;
            }
            if (typeof (value as any)?.toDate === 'function') {
              try {
                return (value as any).toDate().toISOString();
              } catch (error) {
                console.warn('Failed to convert date value', value, error);
              }
            }
            return new Date().toISOString();
          };

          return {
            id: docSnap.id,
            streamerId: data.streamerId,
            gameId: data.gameId,
            title: data.title ?? 'Untitled Stream',
            isLive: data.isLive !== false,
            viewerCount: data.viewerCount ?? 0,
            startedAt: normalizeDate(startedAtValue),
            streamerUsername: data.streamerUsername ?? 'Unknown',
            gameTitle: data.gameTitle ?? 'Unknown Game',
            gameCover: data.gameCover ?? data.thumbnailUrl ?? null
          } satisfies Stream;
        });

        if (rawStreams.length === 0) {
          setStreams([]);
          setLoading(false);
          return;
        }

        const userIds = Array.from(new Set(rawStreams.map((stream) => stream.streamerId).filter(Boolean)));
        const gameIds = Array.from(new Set(rawStreams.map((stream) => stream.gameId).filter(Boolean))) as string[];

        const userMap = new Map<string, string>();
        const gameMap = new Map<string, { title: string; cover?: string | null }>();

        await Promise.all([
          Promise.all(
            userIds.map(async (userId) => {
              if (!userId || userMap.has(userId)) return;
              try {
                const userDoc = await getDoc(doc(db, 'users', userId));
                if (userDoc.exists()) {
                  const userData = userDoc.data() as any;
                  userMap.set(userId, userData.username ?? 'Unknown');
                }
              } catch (error) {
                console.warn('Failed to load user', userId, error);
              }
            })
          ),
          Promise.all(
            gameIds.map(async (gameId) => {
              if (!gameId || gameMap.has(gameId)) return;
              try {
                const gameDoc = await getDoc(doc(db, 'games', gameId));
                if (gameDoc.exists()) {
                  const gameData = gameDoc.data() as any;
                  gameMap.set(gameId, {
                    title: gameData.title ?? 'Unknown Game',
                    cover: gameData.thumbnailUrl ?? gameData.imageUrl ?? gameData.image_url ?? null
                  });
                }
              } catch (error) {
                console.warn('Failed to load game', gameId, error);
              }
            })
          )
        ]);

        const enrichedStreams = rawStreams.map((stream) => ({
          ...stream,
          streamerUsername: userMap.get(stream.streamerId) ?? stream.streamerUsername,
          gameTitle: gameMap.get(stream.gameId ?? '')?.title ?? stream.gameTitle,
          gameCover: gameMap.get(stream.gameId ?? '')?.cover ?? stream.gameCover ?? null
        }));

        if (isMounted) {
          setStreams(enrichedStreams);
          setLoading(false);
        }
      },
      (error) => {
        console.error('Error loading live streams:', error);
        if (isMounted) {
          setStreams([]);
          setLoading(false);
        }
      }
    );

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  const getStreamDuration = (startedAt: string) => {
    const start = new Date(startedAt).getTime();
    const now = Date.now();
    const diff = now - start;

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  if (selectedStream) {
    return (
      <SpectatorView
        streamId={selectedStream.id}
        streamTitle={selectedStream.title}
        streamerName={selectedStream.streamerUsername}
        gameTitle={selectedStream.gameTitle}
        gameCover={selectedStream.gameCover ?? null}
        onClose={() => setSelectedStream(null)}
      />
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-purple-900 flex items-center justify-center">
        <div className="text-center">
          <Radio className="w-16 h-16 text-cyan-400 animate-pulse mx-auto mb-4" />
          <p className="text-gray-400 text-lg">Loading live streams...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-purple-900 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-pink-500 rounded-xl flex items-center justify-center">
              <Radio className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                Live Streams
              </h1>
              <p className="text-gray-400">
                {streams.length} {streams.length === 1 ? 'stream' : 'streams'} ao vivo
              </p>
            </div>
          </div>
        </div>

        {/* Streams Grid */}
        {streams.length === 0 ? (
          <div className="text-center py-20">
            <Radio className="w-20 h-20 text-gray-700 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-white mb-2">No Live Streams</h2>
            <p className="text-gray-400 mb-6">
              No one is streaming right now. Be the first!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {streams.map((stream) => (
              <div
                key={stream.id}
                className="group bg-gray-900/50 rounded-xl overflow-hidden border-2 border-gray-800 hover:border-cyan-500/50 transition-all cursor-pointer"
                onClick={() => setSelectedStream(stream)}
              >
                {/* Thumbnail */}
                <div className="relative aspect-video bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center overflow-hidden">
                    {stream.gameCover ? (
                    <img
                      src={stream.gameCover}
                      alt={stream.gameTitle}
                      className="w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-all"
                    />
                  ) : (
                    <Radio className="w-16 h-16 text-gray-700" />
                  )}

                  {/* Live Badge */}
                  <div className="absolute top-3 left-3 flex items-center gap-2 px-3 py-1.5 bg-red-500/90 backdrop-blur-sm rounded-full">
                    <Radio className="w-3 h-3 text-white animate-pulse" />
                    <span className="text-white font-bold text-xs">LIVE</span>
                  </div>

                  {/* Viewer Count */}
                  <div className="absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1 bg-black/70 backdrop-blur-sm rounded-full">
                    <Eye className="w-3 h-3 text-white" />
                    <span className="text-white font-bold text-xs">
                      {stream.viewerCount.toLocaleString()}
                    </span>
                  </div>

                  {/* Duration */}
                  <div className="absolute bottom-3 right-3 px-2.5 py-1 bg-black/70 backdrop-blur-sm rounded text-white text-xs font-bold">
                    {getStreamDuration(stream.startedAt)}
                  </div>

                  {/* Play Overlay */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center">
                    <div className="w-16 h-16 bg-cyan-500 rounded-full flex items-center justify-center transform scale-90 group-hover:scale-100 transition-all">
                      <Play className="w-8 h-8 text-white ml-1" />
                    </div>
                  </div>
                </div>

                {/* Stream Info */}
                <div className="p-4">
                  <h3 className="text-white font-bold text-lg mb-2 line-clamp-2 group-hover:text-cyan-400 transition-colors">
                    {stream.title}
                  </h3>

                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-400 to-purple-400 flex items-center justify-center text-sm font-bold text-white">
                      {stream.streamerUsername[0]?.toUpperCase?.() ?? 'P'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-gray-400 text-sm truncate">
                        {stream.streamerUsername}
                      </p>
                      <p className="text-gray-500 text-xs truncate">
                        {stream.gameTitle}
                      </p>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center gap-4 pt-3 border-t border-gray-800">
                    <div className="flex items-center gap-1.5">
                      <Eye className="w-4 h-4 text-purple-400" />
                      <span className="text-purple-400 text-sm font-bold">
                        {stream.viewerCount}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Heart className="w-4 h-4 text-pink-400" />
                      <span className="text-pink-400 text-sm font-bold">0</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default LiveStreamGrid;
