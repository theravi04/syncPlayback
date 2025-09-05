import { Play, Youtube, Music, FileVideo } from "lucide-react";
import Card from "../components/Card";

// Main Home Component
const Home = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800 text-white">
      {/* Hero Section */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
        <div className="text-center mb-12 sm:mb-16 lg:mb-20">
          <div className="flex items-center justify-center mb-4 sm:mb-6">
            <Play className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 text-emerald-500 mr-2 sm:mr-3" />
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
              Sync-Playback
            </h1>
          </div>
          <p className="text-lg sm:text-xl md:text-2xl text-slate-300 mb-3 sm:mb-4 px-2">
            Watch videos/audios in sync with your friends!
          </p>
          <p className="text-base sm:text-lg text-slate-400 max-w-2xl mx-auto px-4">
            This is completely free website for those who don't have a speaker.
          </p>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 max-w-7xl mx-auto mb-16 sm:mb-20">
          <Card
            icon={<FileVideo />}
            iconColor="text-emerald-400"
            iconBgColor="group-hover:bg-emerald-500/20"
            title="Local Files"
            description="This leads you to sync videos/audio file present locally"
            buttonText="Take me there"
            buttonColors="from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700"
            hoverBorderColor="hover:border-emerald-500/50"
            hoverShadowColor="hover:shadow-emerald-500/10"
            to="/localfile"
          />

          <Card
            icon={<Youtube />}
            iconColor="text-red-400"
            iconBgColor="group-hover:bg-red-500/20"
            title="YouTube"
            description="This leads you to sync videos of youtube"
            buttonText="Take me there"
            buttonColors="from-red-500 to-red-600 hover:from-red-600 hover:to-red-700"
            hoverBorderColor="hover:border-red-500/50"
            hoverShadowColor="hover:shadow-red-500/10"
            to="/youtube"
          />

          <Card
            icon={<Music />}
            iconColor="text-green-400"
            iconBgColor="group-hover:bg-green-500/20"
            title="Spotify"
            description="This leads you to sync songs of spotify"
            buttonText="Take me there"
            buttonColors="from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
            hoverBorderColor="hover:border-green-500/50"
            hoverShadowColor="hover:shadow-green-500/10"
            to="/spotify"
            className="sm:col-span-2 lg:col-span-1"
          />
        </div>

        {/* Features Section */}
        <div className="text-center">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-8 sm:mb-12 px-4">
            Why Choose Sync-Playback?
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 max-w-5xl mx-auto">
            <div className="text-center p-4 sm:p-6 bg-slate-800/30 rounded-xl border border-slate-700/30">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <span className="text-xl sm:text-2xl">🆓</span>
              </div>
              <h3 className="text-base sm:text-lg font-semibold text-white mb-2">100% Free</h3>
              <p className="text-slate-400 text-sm sm:text-base leading-relaxed">No subscriptions, no hidden costs. Enjoy unlimited synchronized playback.</p>
            </div>
            <div className="text-center p-4 sm:p-6 bg-slate-800/30 rounded-xl border border-slate-700/30">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <span className="text-xl sm:text-2xl">⚡</span>
              </div>
              <h3 className="text-base sm:text-lg font-semibold text-white mb-2">Real-time Sync</h3>
              <p className="text-slate-400 text-sm sm:text-base leading-relaxed">Advanced synchronization technology ensures perfect timing across all devices.</p>
            </div>
            <div className="text-center p-4 sm:p-6 bg-slate-800/30 rounded-xl border border-slate-700/30 sm:col-span-2 lg:col-span-1">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <span className="text-xl sm:text-2xl">🌐</span>
              </div>
              <h3 className="text-base sm:text-lg font-semibold text-white mb-2">Cross-platform</h3>
              <p className="text-slate-400 text-sm sm:text-base leading-relaxed">Works seamlessly on desktop, mobile, and tablet devices.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-700/50 py-6 sm:py-8 mt-8 sm:mt-12">
        <div className="container mx-auto px-4 sm:px-6 text-center text-slate-400">
          <p className="text-sm sm:text-base">Made with ❤️ for seamless media sharing experiences</p>
        </div>
      </footer>
    </div>
  );
};

export default Home;