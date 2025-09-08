import { useState, useRef } from "react";
import { Youtube, Users, ExternalLink, ArrowLeft, CheckCircle, AlertCircle } from "lucide-react";
import YouTubePlayer from "../components/YoutubePlayer";
import { io } from "socket.io-client";

const YoutubePage = ({ socketUrl }) => {
  const socket = useRef(null);
  const [roomId, setRoomId] = useState("");
  const [joinedRoom, setJoinedRoom] = useState(false);
  const [videoUrl, setVideoUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [inputUrl, setInputUrl] = useState("");

  const joinRoom = async (e) => {
    if (e) e.preventDefault();
    setError("");

    if (roomId.trim() === "" || roomId.length !== 5) {
      setError("Room ID must be exactly 5 characters");
      return;
    }

    setLoading(true);

    try {
      if (!socket.current) {
        socket.current = io(socketUrl);
      }
      socket.current.emit("join-room", roomId );
      setJoinedRoom(true);

      socket.current.on("sync-music", (video) => {
        console.log("Received sync data:", video);
        setVideoUrl(video.url);
      });
    } catch (err) {
      setError("Failed to connect to room. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isValidYouTubeUrl(inputUrl)) {
      setError("Please enter a valid YouTube URL");
      return;
    }
    if (joinedRoom) {
      setVideoUrl(inputUrl);
      setInputUrl("");
      socket.current.emit("load-video", {
        roomId,
        url: inputUrl,
        time: 0,
        playing: false,
      });
    }
  };

  const leaveRoom = () => {
    if (socket.current) {
      socket.current.disconnect();
      socket.current = null;
    }
    setJoinedRoom(false);
    setVideoUrl("");
    setRoomId("");
  };

  const isValidYouTubeUrl = (url) => {
    const youtubeRegex =
      /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)[\w-]+/;
    return youtubeRegex.test(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800 text-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-6">
            <Youtube className="w-12 h-12 text-red-500 mr-3" />
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-red-400 to-pink-400 bg-clip-text text-transparent">
              YouTube Sync
            </h1>
          </div>
          <p className="text-xl text-slate-300 mb-2">
            Watch YouTube videos together in perfect sync
          </p>
          <p className="text-slate-400">
            Create or join a room to start watching with friends
          </p>
        </div>

        {!joinedRoom ? (
          <div className="max-w-md mx-auto">
            <div className="bg-slate-800/50 rounded-2xl p-8 border border-slate-700/50 shadow-2xl">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-red-400" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">
                  Join a Room
                </h2>
                <p className="text-slate-400">
                  Enter a 5-digit room ID to get started
                </p>
              </div>

              <form onSubmit={joinRoom} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Room ID
                  </label>
                  <input
                    type="text"
                    placeholder="Enter 5-digit Room ID"
                    maxLength={5}
                    value={roomId}
                    onChange={(e) => {
                      setRoomId(e.target.value.toUpperCase());
                      setError("");
                    }}
                    className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white"
                    disabled={loading}
                  />
                  {error && (
                    <div className="flex items-center mt-2 text-red-400 text-sm">
                      <AlertCircle className="w-4 h-4 mr-2" />
                      {error}
                    </div>
                  )}
                </div>
                <button
                  type="submit"
                  disabled={loading || roomId.length !== 5}
                  className="w-full bg-gradient-to-r from-red-500 to-red-600 text-white py-3 px-6 rounded-lg"
                >
                  {loading ? "Joining..." : "Join Room"}
                </button>
              </form>
            </div>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto space-y-8">
            {/* Room Header */}
            <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700/50 flex justify-between items-center">
              <div className="flex items-center space-x-4">
                <CheckCircle className="w-6 h-6 text-green-400" />
                <h2 className="text-2xl font-bold text-white">Room {roomId}</h2>
              </div>
              <button
                onClick={leaveRoom}
                className="flex items-center px-4 py-2 bg-slate-700/50 rounded-lg"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Leave Room
              </button>
            </div>

            {/* Video URL Input */}
            <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700/50">
              <form onSubmit={handleSubmit} className="flex gap-4">
                <div className="flex-1 flex items-center border rounded-lg px-3 py-2 bg-slate-700/50">
                  <ExternalLink className="text-red-400 mr-2" />
                  <input
                    type="text"
                    value={inputUrl}
                    onChange={(e) => setInputUrl(e.target.value)}
                    placeholder="Paste YouTube URL here..."
                    className="flex-1 bg-transparent outline-none"
                  />
                </div>
                <button
                  type="submit"
                  className="bg-red-600 text-white px-4 py-2 rounded-lg"
                >
                  Load Video
                </button>
              </form>
            </div>

            {/* Video Player */}
            {videoUrl && isValidYouTubeUrl(videoUrl) && (
              <YouTubePlayer socket={socket.current} roomId={roomId} videoUrl={videoUrl} />
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default YoutubePage;
