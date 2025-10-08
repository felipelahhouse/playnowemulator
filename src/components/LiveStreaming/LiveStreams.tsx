import React, { useState } from 'react';
import { Radio, Users, Eye, Heart, MessageCircle, Share2, Play, Maximize } from 'lucide-react';

const LiveStreams: React.FC = () => {
  const [selectedStream, setSelectedStream] = useState<number | null>(null);

  const liveStreams = [
    {
      id: 1,
      streamer: 'RetroKing77',
      title: 'Speedrunning Super Metroid - World Record Attempt!',
      game: 'Super Metroid',
      platform: 'SNES',
      viewers: 1247,
      thumbnail: 'https://images.pexels.com/photos/442576/pexels-photo-442576.jpeg?auto=compress&cs=tinysrgb&w=800',
      duration: '2:34:15',
      tags: ['Speedrun', 'Pro', 'SNES']
    },
    {
      id: 2,
      streamer: 'PixelMaster',
      title: 'First Playthrough of Chrono Trigger! | Blind Run',
      game: 'Chrono Trigger',
      platform: 'SNES',
      viewers: 892,
      thumbnail: 'https://images.pexels.com/photos/371924/pexels-photo-371924.jpeg?auto=compress&cs=tinysrgb&w=800',
      duration: '1:12:43',
      tags: ['First Time', 'RPG', 'Chill']
    },
    {
      id: 3,
      streamer: 'NostalgiaGamer',
      title: 'Late Night Final Fantasy VI Marathon',
      game: 'Final Fantasy VI',
      platform: 'SNES',
      viewers: 654,
      thumbnail: 'https://images.pexels.com/photos/1174746/pexels-photo-1174746.jpeg?auto=compress&cs=tinysrgb&w=800',
      duration: '4:56:28',
      tags: ['RPG', 'Marathon', 'Chill']
    },
    {
      id: 4,
      streamer: 'ArcadeHero',
      title: 'Street Fighter II Championship Mode',
      game: 'Street Fighter II',
      platform: 'SNES',
      viewers: 423,
      thumbnail: 'https://images.pexels.com/photos/442576/pexels-photo-442576.jpeg?auto=compress&cs=tinysrgb&w=800',
      duration: '0:45:12',
      tags: ['Fighting', 'Competitive', 'Tournament']
    },
    {
      id: 5,
      streamer: 'SpeedDemon',
      title: 'Mega Man X Any% Speedrun Practice',
      game: 'Mega Man X',
      platform: 'SNES',
      viewers: 312,
      thumbnail: 'https://images.pexels.com/photos/371924/pexels-photo-371924.jpeg?auto=compress&cs=tinysrgb&w=800',
      duration: '1:23:45',
      tags: ['Speedrun', 'Practice', 'Action']
    },
    {
      id: 6,
      streamer: 'RetroQueen',
      title: 'Zelda: A Link to the Past 100% Completion',
      game: 'The Legend of Zelda',
      platform: 'SNES',
      viewers: 1089,
      thumbnail: 'https://images.pexels.com/photos/1174746/pexels-photo-1174746.jpeg?auto=compress&cs=tinysrgb&w=800',
      duration: '3:12:09',
      tags: ['100%', 'Adventure', 'Zelda']
    }
  ];

  return (
    <section id="live-streams" className="py-16 px-4 relative overflow-hidden bg-gray-900">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-gray-900 via-red-950/20 to-gray-900 pointer-events-none" />

      <div className="container mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center space-x-3 mb-4">
            <div className="h-px w-12 bg-gradient-to-r from-transparent to-red-400" />
            <div className="relative">
              <Radio className="w-8 h-8 text-red-400" />
              <div className="absolute inset-0 w-8 h-8 bg-red-400 rounded-full animate-ping opacity-50" />
            </div>
            <div className="h-px w-12 bg-gradient-to-l from-transparent to-red-400" />
          </div>
          <h2 className="text-5xl md:text-6xl font-black text-white mb-4">
            Live <span className="bg-gradient-to-r from-red-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">Streams</span>
          </h2>
          <p className="text-gray-400 text-xl max-w-3xl mx-auto leading-relaxed">
            Watch and interact with live gameplay from the community
          </p>
          <div className="mt-6 h-1 w-32 mx-auto bg-gradient-to-r from-red-400 via-pink-400 to-purple-400 rounded-full" />
        </div>

        {/* Featured Stream */}
        {selectedStream && (
          <div className="mb-12">
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-red-500 via-pink-500 to-purple-500 rounded-3xl opacity-75 blur-xl" />
              <div className="relative bg-black rounded-3xl overflow-hidden border border-red-500/30">
                <div className="aspect-video bg-gray-900 relative">
                  <img
                    src={liveStreams.find(s => s.id === selectedStream)?.thumbnail}
                    alt="Live stream"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

                  {/* Live Badge */}
                  <div className="absolute top-4 left-4 flex items-center space-x-2 px-4 py-2 bg-red-500/90 backdrop-blur-sm rounded-full">
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                    <span className="text-white font-black text-sm">LIVE</span>
                  </div>

                  {/* Viewers */}
                  <div className="absolute top-4 right-4 flex items-center space-x-2 px-4 py-2 bg-black/50 backdrop-blur-sm rounded-full">
                    <Eye className="w-4 h-4 text-white" />
                    <span className="text-white font-bold text-sm">
                      {liveStreams.find(s => s.id === selectedStream)?.viewers.toLocaleString()}
                    </span>
                  </div>

                  {/* Controls */}
                  <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                    <div>
                      <h3 className="text-2xl font-black text-white mb-1">
                        {liveStreams.find(s => s.id === selectedStream)?.title}
                      </h3>
                      <p className="text-gray-300">
                        {liveStreams.find(s => s.id === selectedStream)?.streamer}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button className="p-3 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full transition-all">
                        <Heart className="w-5 h-5 text-white" />
                      </button>
                      <button className="p-3 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full transition-all">
                        <Share2 className="w-5 h-5 text-white" />
                      </button>
                      <button className="p-3 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full transition-all">
                        <Maximize className="w-5 h-5 text-white" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Chat Sidebar */}
                <div className="grid grid-cols-1 lg:grid-cols-4">
                  <div className="lg:col-span-3 p-6 border-r border-gray-800">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-red-500 to-pink-500" />
                      <div className="flex-1">
                        <h4 className="text-white font-bold">
                          {liveStreams.find(s => s.id === selectedStream)?.streamer}
                        </h4>
                        <p className="text-gray-400 text-sm">Playing {liveStreams.find(s => s.id === selectedStream)?.game}</p>
                      </div>
                      <button className="px-6 py-2 bg-gradient-to-r from-red-500 to-pink-500 text-white font-bold rounded-full hover:shadow-lg hover:shadow-red-500/50 transition-all">
                        Follow
                      </button>
                    </div>
                  </div>
                  <div className="p-6 bg-gray-900/50">
                    <h4 className="text-white font-bold mb-4 flex items-center space-x-2">
                      <MessageCircle className="w-5 h-5 text-cyan-400" />
                      <span>Live Chat</span>
                    </h4>
                    <div className="text-gray-400 text-sm">Chat interface would go here...</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Stream Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {liveStreams.map((stream) => (
            <div
              key={stream.id}
              onClick={() => setSelectedStream(stream.id)}
              className="group relative cursor-pointer"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-red-500/20 to-pink-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-all duration-500" />
              <div className="relative bg-gray-900/70 backdrop-blur-sm border border-gray-700/50 group-hover:border-red-400/50 rounded-2xl overflow-hidden transition-all duration-500 group-hover:scale-105">
                {/* Thumbnail */}
                <div className="relative aspect-video overflow-hidden">
                  <img
                    src={stream.thumbnail}
                    alt={stream.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

                  {/* Live Badge */}
                  <div className="absolute top-3 left-3 flex items-center space-x-1 px-3 py-1 bg-red-500 rounded-full">
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                    <span className="text-white font-black text-xs">LIVE</span>
                  </div>

                  {/* Duration */}
                  <div className="absolute top-3 right-3 px-2 py-1 bg-black/70 backdrop-blur-sm rounded text-white text-xs font-bold">
                    {stream.duration}
                  </div>

                  {/* Viewers */}
                  <div className="absolute bottom-3 left-3 flex items-center space-x-1 px-2 py-1 bg-black/70 backdrop-blur-sm rounded-full">
                    <Users className="w-3 h-3 text-red-400" />
                    <span className="text-white text-xs font-bold">{stream.viewers.toLocaleString()}</span>
                  </div>

                  {/* Play Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="p-4 bg-red-500/80 backdrop-blur-sm rounded-full">
                      <Play className="w-8 h-8 text-white" />
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4">
                  <div className="flex items-start space-x-3 mb-3">
                    <div className="relative">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-500 to-pink-500" />
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-gray-900" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-white font-bold text-sm mb-1 line-clamp-2 group-hover:text-red-400 transition-colors">
                        {stream.title}
                      </h3>
                      <p className="text-gray-400 text-xs mb-1">{stream.streamer}</p>
                      <p className="text-gray-500 text-xs">{stream.game} • {stream.platform}</p>
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2">
                    {stream.tags.map((tag, i) => (
                      <span
                        key={i}
                        className="px-2 py-1 bg-gray-800/50 text-gray-400 text-xs rounded-full border border-gray-700/50"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* View More */}
        <div className="text-center mt-12">
          <button className="px-10 py-4 bg-gradient-to-r from-red-500 via-pink-500 to-purple-500 text-white font-black text-lg rounded-xl hover:shadow-2xl hover:shadow-red-500/50 transition-all duration-500">
            Load More Streams
          </button>
        </div>
      </div>
    </section>
  );
};

export default LiveStreams;
