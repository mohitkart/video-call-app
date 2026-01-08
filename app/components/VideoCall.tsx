"use client";

import { useEffect, useRef } from "react";
import { io } from "socket.io-client";

const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL!, {
  transports: ["websocket"]
});

const ICE_SERVERS = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    {
      urls: "turn:openrelay.metered.ca:80",
      username: "openrelayproject",
      credential: "openrelayproject"
    }
  ]
};

export default function VideoCall() {
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const peers = useRef<Record<string, RTCPeerConnection>>({});
  const makingOffer = useRef<Record<string, boolean>>({});
  const polite = useRef<Record<string, boolean>>({});
  const localStream = useRef<MediaStream | null>(null);

  useEffect(() => {
    socket.emit("join-room", "room-1");

    socket.on("user-joined", (id) => {
      polite.current[id] = (socket?.id||0) > id;
      createPeer(id);
    });

    socket.on("offer", async ({ from, offer }) => {
      let peer = peers.current[from];
      if (!peer) peer = createPeer(from);

      const offerCollision =
        makingOffer.current[from] || peer.signalingState !== "stable";

      if (offerCollision) {
        if (!polite.current[from]) {
          console.warn("Ignoring offer collision");
          return;
        }
      }

      await peer.setRemoteDescription(offer);
      const answer = await peer.createAnswer();
      await peer.setLocalDescription(answer);

      socket.emit("answer", { to: from, answer });
    });

    socket.on("answer", async ({ from, answer }) => {
      const peer = peers.current[from];
      if (!peer) return;

      if (peer.signalingState !== "have-local-offer") return;

      await peer.setRemoteDescription(answer);
    });

    socket.on("ice-candidate", ({ from, candidate }) => {
      peers.current[from]?.addIceCandidate(candidate);
    });
  }, []);

  function createPeer(id: string) {
    const peer = new RTCPeerConnection(ICE_SERVERS);
    peers.current[id] = peer;
    makingOffer.current[id] = false;

    localStream.current?.getTracks().forEach((track) => {
      peer.addTrack(track, localStream.current!);
    });

    peer.onicecandidate = ({ candidate }) => {
      if (candidate) {
        socket.emit("ice-candidate", { to: id, candidate });
      }
    };

    peer.ontrack = ({ streams }) => {
      const video = document.createElement("video");
      video.srcObject = streams[0];
      video.autoplay = true;
      video.playsInline = true;
      document.body.appendChild(video);
    };

    peer.onnegotiationneeded = async () => {
      try {
        makingOffer.current[id] = true;
        const offer = await peer.createOffer();
        await peer.setLocalDescription(offer);
        socket.emit("offer", { to: id, offer });
      } finally {
        makingOffer.current[id] = false;
      }
    };

    return peer;
  }

  async function startCamera() {
    localStream.current = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true
    });
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = localStream.current;
    }
  }

  return (
    <>
      <button onClick={startCamera}>Start Camera</button>
      <video ref={localVideoRef} autoPlay muted playsInline />
    </>
  );
}
