import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import YoutubePage from "./pages/YoutubePage";
import SpotifyPage from "./pages/SpotifyPage";
import LocalFilePage from "./pages/LocalFilePage";

const SOCKET_URL = "https://syncplayback.onrender.com";
// const SOCKET_URL = "http://localhost:5000";

export default function App() {
  return (
    <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/youtube" element={<YoutubePage socketUrl={SOCKET_URL} />} />
        <Route path="/spotify" element={<SpotifyPage socketUrl={SOCKET_URL} />} />
        <Route path="/localfile" element={<LocalFilePage socketUrl={SOCKET_URL} />} />
        </Routes>
    </Router>
  );
}
