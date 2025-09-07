import React, { useEffect, useRef, useState } from "react";
import io from "socket.io-client";

const LocalFilePage = ({ socketUrl }) => {
  const [role, setRole] = useState(null); // "host" or "peer"
  const [joined, setJoined] = useState(false);
  const socketRef = useRef(null);
  const pcRef = useRef(null);
  const dcRef = useRef(null);
  const peersRef = useRef({});
  const audioRef = useRef(null);
  const remoteAudioRef = useRef(null);
  const roomId = "room-123"; // could be dynamic

  const config = {
    iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
  };

  useEffect(() => {
    socketRef.current = io(socketUrl);

    socketRef.current.on("signal-offer", async ({ from, sdp }) => {
      if (role !== "peer") return;

      pcRef.current = new RTCPeerConnection(config);

      pcRef.current.ontrack = (e) => {
        if (remoteAudioRef.current) {
          remoteAudioRef.current.srcObject = e.streams[0];
        }
      };

      pcRef.current.ondatachannel = (e) => {
        dcRef.current = e.channel;
        dcRef.current.onmessage = (evt) => {
          const msg = JSON.parse(evt.data);
          handleControlMessage(msg);
        };
      };

      pcRef.current.onicecandidate = (e) => {
        if (e.candidate) {
          socketRef.current.emit("signal-candidate", {
            roomId,
            targetId: from,
            candidate: e.candidate,
          });
        }
      };

      await pcRef.current.setRemoteDescription(new RTCSessionDescription(sdp));
      const answer = await pcRef.current.createAnswer();
      await pcRef.current.setLocalDescription(answer);
      socketRef.current.emit("signal-answer", {
        roomId,
        targetId: from,
        sdp: answer,
      });
    });

    socketRef.current.on("signal-answer", async ({ from, sdp }) => {
      if (role !== "host") return;
      const peer = peersRef.current[from];
      if (peer) {
        await peer.pc.setRemoteDescription(new RTCSessionDescription(sdp));
      }
    });

    socketRef.current.on("signal-candidate", async ({ from, candidate }) => {
      if (role === "peer" && pcRef.current) {
        await pcRef.current.addIceCandidate(candidate);
      } else if (role === "host" && peersRef.current[from]) {
        await peersRef.current[from].pc.addIceCandidate(candidate);
      }
    });

    socketRef.current.on("peer-joined", async ({ id, role: peerRole }) => {
      if (role === "host" && peerRole === "peer") {
        createPeerConnection(id);
      }
    });

    socketRef.current.on("peer-left", ({ id }) => {
      if (peersRef.current[id]) {
        peersRef.current[id].pc.close();
        delete peersRef.current[id];
      }
    });

    return () => {
      socketRef.current.disconnect();
    };
  }, [role]);

  const joinRoom = (chosenRole) => {
    setRole(chosenRole);
    socketRef.current.emit("join-room", { roomId, role: chosenRole });
    setJoined(true);
  };

  const createPeerConnection = async (peerId) => {
    const pc = new RTCPeerConnection(config);
    const dc = pc.createDataChannel("sync");

    dc.onopen = () => console.log("DC open with", peerId);
    peersRef.current[peerId] = { pc, dc };

    pc.onicecandidate = (e) => {
      if (e.candidate) {
        socketRef.current.emit("signal-candidate", {
          roomId,
          targetId: peerId,
          candidate: e.candidate,
        });
      }
    };

    // attach host's audio
    if (audioRef.current && audioRef.current.captureStream) {
      const stream = audioRef.current.captureStream();
      stream.getAudioTracks().forEach((track) => pc.addTrack(track, stream));
    }

    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    socketRef.current.emit("signal-offer", {
      roomId,
      targetId: peerId,
      sdp: offer,
    });
  };

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    audioRef.current.src = url;
    audioRef.current.play();

    // sync events
    audioRef.current.addEventListener("play", () =>
      broadcast({ type: "play", time: audioRef.current.currentTime })
    );
    audioRef.current.addEventListener("pause", () =>
      broadcast({ type: "pause", time: audioRef.current.currentTime })
    );
    audioRef.current.addEventListener("seeked", () =>
      broadcast({ type: "seek", time: audioRef.current.currentTime })
    );
  };

  const broadcast = (msg) => {
    Object.values(peersRef.current).forEach(({ dc }) => {
      if (dc.readyState === "open") dc.send(JSON.stringify(msg));
    });
  };

  const handleControlMessage = (msg) => {
    const audio = remoteAudioRef.current;
    if (!audio) return;
    if (msg.type === "play") {
      audio.currentTime = msg.time;
      audio.play();
    } else if (msg.type === "pause") {
      audio.currentTime = msg.time;
      audio.pause();
    } else if (msg.type === "seek") {
      audio.currentTime = msg.time;
    }
  };

  return (
    <div className="p-4">
      {!joined ? (
        <div className="space-x-4">
          <button
            onClick={() => joinRoom("host")}
            className="px-4 py-2 bg-green-600 text-white rounded"
          >
            Host
          </button>
          <button
            onClick={() => joinRoom("peer")}
            className="px-4 py-2 bg-blue-600 text-white rounded"
          >
            Peer
          </button>
        </div>
      ) : role === "host" ? (
        <div>
          <input type="file" accept="audio/*" onChange={handleFile} />
          <audio ref={audioRef} controls hidden />
          <p className="mt-2">You are hosting</p>
        </div>
      ) : (
        <div>
          <audio ref={remoteAudioRef} controls autoPlay />
          <p className="mt-2">You are listening</p>
        </div>
      )}
    </div>
  );
};

export default LocalFilePage;
