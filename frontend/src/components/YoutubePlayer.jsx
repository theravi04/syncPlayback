import { useEffect, useRef } from "react";
import { Play, Wifi, Users } from "lucide-react";
import YouTube from "react-youtube";

const YouTubePlayer = ({ socket, roomId, videoUrl }) => {
  const playerRef = useRef(null);

  useEffect(() => {
    if (!socket) return;

    // Listen for sync events
    socket.on("sync-music", ({ url, time, playing }) => {
      if (playerRef.current) {
        if (playerRef.current.getVideoUrl() !== url) {
          playerRef.current.loadVideoByUrl(url, time);
        } else {
          playerRef.current.seekTo(time, true);
          if (playing) playerRef.current.playVideo();
          else playerRef.current.pauseVideo();
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

  const handleSeek = () => {
    if (socket && playerRef.current) {
      socket.emit("seek-music", {
        roomId,
        url: videoUrl,
        time: playerRef.current.getCurrentTime(),
        playing: playerRef.current.getPlayerState() === 1, // 1 = playing
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
      modestbranding: 1,
    },
  };

  return (
    <div className="space-y-6">
      {/* Player Header */}
      <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700/50">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center">
              <Play className="w-6 h-6 text-red-400" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-white">Now Playing</h3>
              <p className="text-sm text-slate-400">Room {roomId}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2 text-sm text-slate-400">
            <Wifi className="w-4 h-4 text-green-400" />
            <span>Connected</span>
          </div>
        </div>

        {/* YouTube Player */}
        <div className="w-full aspect-video bg-black rounded-xl overflow-hidden shadow-2xl">
          <YouTube
            videoId={extractVideoId(videoUrl)}
            onReady={onPlayerReady}
            onPlay={handlePlay}
            onPause={handlePause}
            onStateChange={(e) => {
              if (e.data === 1 || e.data === 2) return; // ignore play/pause
              handleSeek();
            }}
            opts={opts}
            className="w-full h-full"
          />
        </div>
      </div>
    </div>
  );
};

// Extract YouTube video ID
function extractVideoId(url) {
  const regExp =
    /^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
}

export default YouTubePlayer;
