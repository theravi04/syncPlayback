import { useState, useRef, useEffect } from "react";
import {
  Youtube,
  Users,
  ExternalLink,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import YouTubePlayer from "../components/YoutubePlayer";
import { io } from "socket.io-client";

const YoutubePage = ({ socketUrl }) => {
  // console.log(socketUrl);

  const socket = useRef(null);
  const [roomId, setRoomId] = useState("");
  const [joinedRoom, setJoinedRoom] = useState(false);
  const [videoUrl, setVideoUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState("disconnected");
  const [error, setError] = useState("");
  const [users, setUsers] = useState([]);
  const [name, setName] = useState("");

  const joinRoom = async (e) => {
    if (e) e.preventDefault();
    setError("");

    if (roomId.trim() === "") {
      setError("Please enter a room ID");
      return;
    }

    if (roomId.length !== 5) {
      setError("Room ID must be exactly 5 characters");
      return;
    }

    setLoading(true);

    try {
      // Initialize socket connection when joining
      if (!socket.current) {
        socket.current = io(socketUrl); // <-- this actually connects
      }
      // Emit join-room event
      socket.current.emit("join-room", { roomId, name });

      setJoinedRoom(true);
      setConnectionStatus("connected");

      // Listen for sync events from server
      socket.current.on("sync-music", (data) => {
        console.log("Received sync data:", data);
      });
    } catch (err) {
      setError("Failed to connect to room. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
  if (!socket.current) return;

  const handleUsersUpdate = (roomUsers) => {
    setUsers(roomUsers);
  };

  socket.current.on("users-update", handleUsersUpdate);

  return () => {
    if (socket.current) {
      socket.current.off("users-update", handleUsersUpdate);
    }
  };
}, []);


  const leaveRoom = () => {
    if (socket.current) {
      socket.current.emit("leave-room", roomId);
      socket.current = null;
    }
    setJoinedRoom(false);
    setVideoUrl("");
    setConnectionStatus("disconnected");
    setRoomId("");
  };

  const isValidYouTubeUrl = (url) => {
    const youtubeRegex =
      /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)[\w-]+/;
    return youtubeRegex.test(url);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      joinRoom(e);
    }
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
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-8 border border-slate-700/50 shadow-2xl">
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

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Your Name
                  </label>
                  <input
                    type="text"
                    placeholder="Enter your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)} // <-- correct state
                    className="w-full mb-2 px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 transition-all duration-200"
                  />
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
                    onKeyDown={handleKeyDown}
                    className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 transition-all duration-200"
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
                  onClick={joinRoom}
                  disabled={loading || roomId.length !== 5}
                  className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 disabled:from-slate-600 disabled:to-slate-700 text-white font-medium py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 disabled:hover:scale-100 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Joining...
                    </div>
                  ) : (
                    "Join Room"
                  )}
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto space-y-8">
            {/* Room Header */}
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-green-400" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">
                      Room {roomId}
                    </h2>
                    <div className="flex items-center space-x-2 text-sm text-slate-400">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                      <span>Connected and synchronized</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={leaveRoom}
                  className="flex items-center justify-center space-x-2 px-4 py-2 bg-slate-700/50 hover:bg-slate-600/50 text-slate-300 hover:text-white rounded-lg transition-colors duration-200"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Leave Room</span>
                </button>
              </div>
            </div>

            {/* Video URL Input */}
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50">
              <div className="flex items-center space-x-3 mb-4">
                <ExternalLink className="w-6 h-6 text-red-400" />
                <h3 className="text-xl font-semibold text-white">Video URL</h3>
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <input
                  type="url"
                  placeholder="Paste YouTube video URL here..."
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  className="flex-1 px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 transition-all duration-200"
                />
                <button
                  onClick={() => setVideoUrl("")}
                  disabled={!videoUrl}
                  className="px-6 py-3 bg-slate-600/50 hover:bg-slate-500/50 disabled:bg-slate-700/30 text-white disabled:text-slate-500 rounded-lg transition-colors duration-200 disabled:cursor-not-allowed"
                >
                  Clear
                </button>
              </div>
              {videoUrl && !isValidYouTubeUrl(videoUrl) && (
                <div className="flex items-center mt-2 text-amber-400 text-sm">
                  <AlertCircle className="w-4 h-4 mr-2" />
                  Please enter a valid YouTube URL
                </div>
              )}
            </div>

            {/* Video Player */}
            {videoUrl && isValidYouTubeUrl(videoUrl) && (
              <YouTubePlayer
                socket={socket.current}
                roomId={roomId}
                videoUrl={videoUrl}
                users={users} // pass the users list
              />
            )}

            {/* Instructions */}
            {!videoUrl && (
              <div className="bg-slate-800/30 rounded-xl p-6 border border-slate-700/30">
                <h3 className="text-lg font-semibold text-white mb-3">
                  How to get started:
                </h3>
                <div className="space-y-2 text-slate-400">
                  <p>1. Copy a YouTube video URL from your browser</p>
                  <p>2. Paste it in the input field above</p>
                  <p>
                    3. The video will automatically sync with all room members
                  </p>
                  <p>4. Everyone in the room can control playback</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default YoutubePage;
