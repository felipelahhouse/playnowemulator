import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Gamepad as GamepadIcon, User, Settings, LogOut, Trophy, Users, Menu, X, BarChart3 } from 'lucide-react';
import UserProfile from '../User/UserProfile';
import SettingsModal from '../Settings/SettingsModal';
import ProfileSettings from '../User/ProfileSettings';
import UserDashboard from '../User/UserDashboard';
import LanguageSelector from '../Language/LanguageSelector';
import ThemeSelector from '../Theme/ThemeSelector';

const Header: React.FC = () => {
  const { user, signOut } = useAuth();
  const [showProfile, setShowProfile] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showProfileSettings, setShowProfileSettings] = useState(false);
  const [showDashboard, setShowDashboard] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [onlineCount, setOnlineCount] = useState(0);

  const handleSignOut = async () => {
    try {
      setShowProfile(false);
      setShowSettings(false);
      setShowProfileSettings(false);
      setShowDashboard(false);
      await signOut();
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  // Placeholder: could fetch online count from Firestore in future
  useEffect(() => {
    setOnlineCount(user ? 1 : 0);
  }, [user]);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? 'bg-black/90 backdrop-blur-2xl border-b border-cyan-500/30 shadow-2xl shadow-cyan-500/10'
          : 'bg-black/50 backdrop-blur-xl border-b border-cyan-500/10'
      }`}>
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 group cursor-pointer">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 blur-lg opacity-50 group-hover:opacity-75 transition-opacity duration-300" />
                <GamepadIcon className="relative w-10 h-10 text-cyan-400 transform group-hover:rotate-12 group-hover:scale-110 transition-all duration-300" />
              </div>
              <div>
                <div className="text-2xl font-black tracking-tight">
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400">
                    PLAYNOW
                  </span>
                  <span className="text-white">emu</span>
                </div>
                <div className="text-xs text-gray-500 font-mono tracking-widest">// GAMING MATRIX</div>
              </div>
            </div>

            <nav className="hidden md:flex items-center space-x-1">
              {['Games', 'Multiplayer', 'Tournaments', 'Community'].map((item, index) => {
                const colors = ['cyan', 'purple', 'pink', 'green'];
                const color = colors[index];
                return (
                  <a
                    key={item}
                    href={`#${item.toLowerCase()}`}
                    className="relative px-6 py-2.5 text-gray-300 hover:text-white transition-all duration-300 font-medium group"
                  >
                    <span className="relative z-10">{item}</span>
                    <div className={`absolute inset-0 bg-${color}-500/0 group-hover:bg-${color}-500/10 rounded-xl transition-all duration-300 transform group-hover:scale-105`} />
                    <div className={`absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-0 h-0.5 bg-gradient-to-r from-${color}-400 to-${color}-600 group-hover:w-full transition-all duration-300`} />
                  </a>
                );
              })}
            </nav>

            <div className="flex items-center gap-4">
              {/* Language and Theme Selectors - Top Right */}
              <div className="hidden md:flex items-center gap-2">
                <LanguageSelector />
                <ThemeSelector />
              </div>
              
              {user ? (
                <>
                  {/* Online Players Counter */}
                  <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 backdrop-blur-sm rounded-full border border-cyan-500/30 hover:border-cyan-400/50 transition-all duration-300">
                    <Users className="w-4 h-4 text-cyan-400" />
                    <div className="flex items-center gap-1.5">
                      <span className="text-cyan-400 text-xl font-black">{onlineCount}</span>
                      <span className="text-gray-400 text-sm font-bold">Online</span>
                    </div>
                    <div className="relative">
                      <div className="w-2 h-2 bg-cyan-400 rounded-full" />
                      <div className="absolute inset-0 w-2 h-2 bg-cyan-400 rounded-full animate-ping" />
                    </div>
                  </div>

                  {/* Settings Button */}
                  <button
                    onClick={() => setShowSettings(true)}
                    className="p-3 bg-gradient-to-r from-green-500/10 to-emerald-500/10 text-green-400 hover:text-green-300 hover:from-green-500/20 hover:to-emerald-500/20 rounded-xl border border-green-500/30 hover:border-green-400/50 transition-all duration-300 hover:shadow-lg hover:shadow-green-400/20 hover:scale-105 group"
                    title="Configurações"
                  >
                    <Settings className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
                  </button>

                  {/* Quick Sign Out */}
                  <button
                    onClick={handleSignOut}
                    className="hidden lg:flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-500/10 to-rose-500/10 text-red-400 border border-red-500/30 rounded-xl hover:text-red-300 hover:border-red-400/60 hover:from-red-500/20 hover:to-rose-500/20 transition-all duration-300"
                    title="Sair da conta"
                  >
                    <LogOut className="w-4 h-4" />
                    <span className="font-semibold">Sair</span>
                  </button>

                  <div className="hidden sm:flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-green-500/10 to-emerald-500/10 backdrop-blur-sm rounded-full border border-green-500/30">
                    <div className="relative">
                      <div className="w-2.5 h-2.5 bg-green-400 rounded-full" />
                      <div className="absolute inset-0 w-2.5 h-2.5 bg-green-400 rounded-full animate-ping" />
                    </div>
                    <span className="text-green-300 text-sm font-bold tracking-wide">ONLINE</span>
                  </div>

                  <div className="relative group">
                    <button
                      onClick={() => setShowProfile(!showProfile)}
                      className="flex items-center space-x-3 px-5 py-3 rounded-xl bg-gradient-to-r from-cyan-500/10 via-purple-500/10 to-pink-500/10 border border-cyan-500/30 hover:border-cyan-400/50 transition-all duration-300 hover:shadow-xl hover:shadow-cyan-400/25 hover:scale-105 group"
                    >
                      <div className="relative">
                        <div className="absolute -inset-2 bg-gradient-to-r from-cyan-400 to-purple-400 rounded-full blur-md opacity-0 group-hover:opacity-50 transition-opacity duration-300" />
                        <User className="relative w-5 h-5 text-cyan-400 group-hover:scale-110 transition-transform duration-300" />
                      </div>
                      <span className="text-white font-black tracking-wide">{user.username}</span>
                      <Trophy className="w-5 h-5 text-yellow-400 animate-pulse" />
                    </button>

                    {showProfile && (
                      <div className="absolute top-full right-0 mt-3 w-56 bg-black/95 backdrop-blur-2xl rounded-2xl border border-cyan-500/30 shadow-2xl shadow-cyan-500/20 overflow-hidden">
                        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400" />
                        <div className="p-2 mt-2">
                          {[
                            { icon: BarChart3, label: 'Dashboard', color: 'cyan', action: () => { setShowProfile(false); setShowDashboard(true); } },
                            { icon: User, label: 'Editar Perfil', color: 'purple', action: () => { setShowProfile(false); setShowProfileSettings(true); } },
                            { icon: Trophy, label: 'Conquistas', color: 'yellow', action: () => setShowProfile(false) },
                            { icon: Users, label: 'Amigos', color: 'pink', action: () => setShowProfile(false) },
                            { icon: Settings, label: 'Configurações', color: 'green', action: () => { setShowProfile(false); setShowSettings(true); } }
                          ].map(({ icon: Icon, label, color, action }) => (
                            <button
                              key={label}
                              onClick={action}
                              className={`w-full flex items-center space-x-3 px-4 py-3 text-left text-gray-300 hover:text-${color}-400 hover:bg-${color}-500/10 rounded-xl transition-all duration-200 group`}
                            >
                              <Icon className="w-5 h-5" />
                              <span className="font-medium">{label}</span>
                            </button>
                          ))}
                          <hr className="my-2 border-gray-800" />
                          <button
                            onClick={handleSignOut}
                            className="w-full flex items-center space-x-3 px-4 py-3 text-left text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition-all duration-200"
                          >
                            <LogOut className="w-5 h-5" />
                            <span className="font-medium">Sair</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="hidden md:flex items-center space-x-3">
                  <button className="px-5 py-2.5 text-cyan-400 hover:text-cyan-300 font-bold transition-all duration-300 hover:scale-105">
                    Sign In
                  </button>
                  <button className="px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-bold rounded-xl hover:shadow-xl hover:shadow-cyan-500/50 transition-all duration-300 hover:scale-105">
                    Sign Up
                  </button>
                </div>
              )}

              <button
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="md:hidden p-2 text-cyan-400 hover:bg-cyan-500/10 rounded-lg transition-all duration-300"
              >
                {showMobileMenu ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-50" />
      </header>

      {showMobileMenu && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-black/95 backdrop-blur-2xl" />
          <div className="relative container mx-auto px-4 pt-24 pb-8">
            {/* Language and Theme Selectors - Mobile */}
            <div className="flex items-center justify-center gap-3 mb-6 pb-6 border-b border-gray-800">
              <LanguageSelector />
              <ThemeSelector />
            </div>

            <nav className="space-y-4">
              {['Games', 'Multiplayer', 'Tournaments', 'Community'].map((item) => (
                <a
                  key={item}
                  href={`#${item.toLowerCase()}`}
                  onClick={() => setShowMobileMenu(false)}
                  className="block px-6 py-4 text-xl font-bold text-white bg-gradient-to-r from-cyan-500/10 to-purple-500/10 border border-cyan-500/30 rounded-xl hover:scale-105 transition-all duration-300"
                >
                  {item}
                </a>
              ))}
            </nav>

            {user && (
              <div className="mt-8">
                <button
                  onClick={() => {
                    setShowMobileMenu(false);
                    handleSignOut();
                  }}
                  className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-red-500/15 to-rose-500/15 border border-red-500/40 rounded-xl text-red-300 font-semibold hover:from-red-500/25 hover:to-rose-500/25 hover:text-red-200 transition-all duration-300"
                >
                  <LogOut className="w-5 h-5" />
                  <span>Sair da conta</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {showProfile && (
        <UserProfile
          isOpen={showProfile}
          onClose={() => setShowProfile(false)}
        />
      )}

      {showSettings && (
        <SettingsModal
          isOpen={showSettings}
          onClose={() => setShowSettings(false)}
        />
      )}

      {showProfileSettings && (
        <ProfileSettings
          onClose={() => setShowProfileSettings(false)}
        />
      )}

      {showDashboard && (
        <UserDashboard
          onClose={() => setShowDashboard(false)}
        />
      )}
    </>
  );
};

export default Header;
