import React from 'react'

const SpotifyPage = ({ socketUrl }) => {
  const socket = useRef(io(socketUrl));
  return (
    <div>
      Spotify
    </div>
  )
}

export default SpotifyPage
