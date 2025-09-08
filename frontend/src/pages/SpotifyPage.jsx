import {useRef} from 'react'
import { io } from 'socket.io-client';

const SpotifyPage = ({ socketUrl }) => {
  const socket = useRef(io(socketUrl));
  return (
    <div>
      Spotify
    </div>
  )
}

export default SpotifyPage
