import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { X, Trophy, Gamepad2, Clock, Star, LogOut } from 'lucide-react';

interface UserProfileProps {
  isOpen: boolean;
  onClose: () => void;
}

const UserProfile: React.FC<UserProfileProps> = ({ isOpen, onClose }) => {
  const { user, signOut } = useAuth();

  if (!isOpen || !user) return null;

  const handleLogout = async () => {
    try {
      await signOut();
      onClose();
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  const mockStats = {
    gamesPlayed: 42,
    hoursPlayed: 156,
    achievements: 23,
    favoriteGame: 'Super Mario Bros',
    winRate: 78
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl mx-4 bg-gray-900/95 backdrop-blur-md rounded-2xl border border-cyan-500/30 shadow-2xl shadow-cyan-500/20">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white rounded-lg hover:bg-gray-800/50 transition-all duration-200"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="p-6 border-b border-gray-700/50">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <div className="w-20 h-20 bg-gradient-to-br from-cyan-400 to-purple-500 rounded-full flex items-center justify-center">
                <span className="text-2xl font-bold text-white">
                  {user.username.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-400 rounded-full border-2 border-gray-900 animate-pulse" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">{user.username}</h2>
              <p className="text-gray-400">{user.email}</p>
              <p className="text-sm text-green-400">Online now</p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Gaming Stats</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-xl p-4 border border-cyan-500/30">
              <div className="flex items-center space-x-2 mb-2">
                <Gamepad2 className="w-5 h-5 text-cyan-400" />
                <span className="text-cyan-400 font-medium">Games</span>
              </div>
              <p className="text-2xl font-bold text-white">{mockStats.gamesPlayed}</p>
            </div>
            
            <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl p-4 border border-purple-500/30">
              <div className="flex items-center space-x-2 mb-2">
                <Clock className="w-5 h-5 text-purple-400" />
                <span className="text-purple-400 font-medium">Hours</span>
              </div>
              <p className="text-2xl font-bold text-white">{mockStats.hoursPlayed}</p>
            </div>

            <div className="bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-xl p-4 border border-yellow-500/30">
              <div className="flex items-center space-x-2 mb-2">
                <Trophy className="w-5 h-5 text-yellow-400" />
                <span className="text-yellow-400 font-medium">Achievements</span>
              </div>
              <p className="text-2xl font-bold text-white">{mockStats.achievements}</p>
            </div>

            <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-xl p-4 border border-green-500/30">
              <div className="flex items-center space-x-2 mb-2">
                <Star className="w-5 h-5 text-green-400" />
                <span className="text-green-400 font-medium">Win Rate</span>
              </div>
              <p className="text-2xl font-bold text-white">{mockStats.winRate}%</p>
            </div>
          </div>

          {/* Recent Achievements */}
          <div>
            <h4 className="text-md font-semibold text-white mb-3">Recent Achievements</h4>
            <div className="space-y-3">
              <div className="flex items-center space-x-3 p-3 bg-gray-800/50 rounded-lg border border-gray-700/50">
                <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center">
                  <Trophy className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-white font-medium">First Victory</p>
                  <p className="text-sm text-gray-400">Won your first multiplayer match</p>
                </div>
                <span className="text-xs text-gray-500">2 days ago</span>
              </div>
              
              <div className="flex items-center space-x-3 p-3 bg-gray-800/50 rounded-lg border border-gray-700/50">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-500 rounded-lg flex items-center justify-center">
                  <Gamepad2 className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-white font-medium">Game Explorer</p>
                  <p className="text-sm text-gray-400">Played 10 different games</p>
                </div>
                <span className="text-xs text-gray-500">1 week ago</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer com botão de Logout */}
        <div className="p-6 border-t border-gray-700/50">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg hover:shadow-red-500/50"
          >
            <LogOut className="w-5 h-5" />
            Sair da Conta
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;