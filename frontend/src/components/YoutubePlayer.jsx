import { useEffect, useRef } from "react";
import { Play, Pause, Users, Wifi, User } from "lucide-react";
import YouTube from "react-youtube";

const YouTubePlayer = ({ socket, roomId, users, videoUrl }) => {
  const playerRef = useRef(null);

  useEffect(() => {
    if (!socket) return;

    // Listen for sync events
    socket.on("sync-music", ({ url, time, playing }) => {
      if (playerRef.current) {
        if (playerRef.current.internalPlayer) {
          if (playerRef.current.getVideoUrl() !== url) {
            playerRef.current.loadVideoByUrl(url, time);
          } else {
            playerRef.current.seekTo(time);
            if (playing) playerRef.current.playVideo();
            else playerRef.current.pauseVideo();
          }
        }
      }
    });

    return () => {
      socket.off("sync-music");
    };
  }, [socket]);

  const onPlayerReady = (event) => {
    playerRef.current = event.target;
  };

  const handlePlay = () => {
    if (socket && playerRef.current) {
      socket.emit("play-music", {
        roomId,
        url: videoUrl,
        time: playerRef.current.getCurrentTime(),
        playing: true,
      });
    }
  };

  const handlePause = () => {
    if (socket && playerRef.current) {
      socket.emit("pause-music", {
        roomId,
        url: videoUrl,
        time: playerRef.current.getCurrentTime(),
        playing: false,
      });
    }
  };

  const handleSeek = (event) => {
    if (socket && playerRef.current) {
      socket.emit("seek-music", {
        roomId,
        url: videoUrl,
        time: event.target.getCurrentTime(),
        playing: !playerRef.current.isPaused(),
      });
    }
  };

  const opts = {
    height: "100%",
    width: "100%",
    playerVars: {
      autoplay: 0,
      controls: 1,
      rel: 0,
      showinfo: 0,
      modestbranding: 1,
    },
  };

  return (
    <div className="space-y-6">
      {/* Player Container - Made Bigger */}
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 sm:p-8 border border-slate-700/50">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center">
              <Play className="w-6 h-6 text-red-400" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-white">Now Playing</h3>
              <p className="text-sm text-slate-400">
                Synchronized with room {roomId}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2 text-sm text-slate-400">
            <Wifi className="w-4 h-4 text-green-400" />
            <span>Connected</span>
          </div>
        </div>

        {/* Bigger YouTube Player Container */}
        <div className="w-full aspect-video bg-black rounded-xl overflow-hidden shadow-2xl">
          <YouTube
            videoId={extractVideoId(videoUrl)}
            onReady={onPlayerReady}
            onPlay={handlePlay}
            onPause={handlePause}
            onStateChange={handleSeek}
            opts={opts}
            className="w-full h-full"
          />
        </div>
      </div>

      {/* Users and Sync Status - Improved Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Users List */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50">
          <div className="flex items-center space-x-3 mb-4">
            <Users className="w-6 h-6 text-emerald-400" />
            <h3 className="text-lg font-semibold text-white">
              Users in Room ({users?.length || 0})
            </h3>
          </div>
          
          {users && users.length > 0 ? (
            <div className="space-y-3 max-h-32 overflow-y-auto custom-scrollbar">
              {users.map((user, index) => (
                <div 
                  key={user.id || index}
                  className="flex items-center space-x-3 p-3 bg-slate-700/30 rounded-lg border border-slate-600/30"
                >
                  <div className="w-8 h-8 bg-emerald-500/20 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-emerald-400" />
                  </div>
                  <span className="text-white font-medium">{user.name || `User ${index + 1}`}</span>
                  <div className="ml-auto">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-slate-400">
              <User className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No other users in the room yet</p>
              <p className="text-sm">Share the room ID to invite friends!</p>
            </div>
          )}
        </div>

        {/* Sync Status */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-6 h-6 bg-emerald-500/20 rounded-full flex items-center justify-center">
              <div className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse"></div>
            </div>
            <h3 className="text-lg font-semibold text-white">Sync Status</h3>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
              <span className="text-slate-300">Connection</span>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-sm text-green-400 font-medium">Active</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
              <span className="text-slate-300">Synchronization</span>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-sm text-green-400 font-medium">In Sync</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
              <span className="text-slate-300">Room Status</span>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                <span className="text-sm text-blue-400 font-medium">Room {roomId}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper function to extract video ID from a YouTube URL
function extractVideoId(url) {
  const regExp =
    /^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
}

export default YouTubePlayer;