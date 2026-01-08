/* eslint-disable react-hooks/refs */
"use client";

import envirnment from "@/envirnment";
import { useEffect, useRef, useState } from "react";
import io from "socket.io-client";

const socket = io(envirnment.api_url);

const ICE_SERVERS = {
  iceServers: [{ urls: "stun:stun.l.google.com:19302" }]
};

export default function VideoCall() {
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const peersRef = useRef<Record<string, RTCPeerConnection>>({});
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [currentuseId, setCurrentUserId] = useState<string | null>(null);

  // Step 1: Get camera & mic
  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((stream) => {
        setLocalStream(stream);
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
      });

    socket.emit("join-room", "room-1");
  }, []);

  // Step 2: When new user joins
  socket.on("user-joined", async (userId) => {
     setCurrentUserId(userId)
     console.log("userId",userId)
    const peer = createPeer(userId);
    peersRef.current[userId] = peer;

    const offer = await peer.createOffer();
    await peer.setLocalDescription(offer);

    socket.emit("offer", { to: userId, offer });
  });

  // Step 3: Receive offer
  socket.on("offer", async ({ offer, from }) => {
    const peer = createPeer(from);
    peersRef.current[from] = peer;

    await peer.setRemoteDescription(offer);
    const answer = await peer.createAnswer();
    await peer.setLocalDescription(answer);

    socket.emit("answer", { to: from, answer });
  });

  // Step 4: Receive answer
  socket.on("answer", async ({ answer, from }) => {
    await peersRef.current[from]?.setRemoteDescription(answer);
  });

  // Step 5: ICE candidates
  socket.on("ice-candidate", ({ candidate, from }) => {
    peersRef.current[from]?.addIceCandidate(candidate);
  });

  // Create Peer
  function createPeer(userId: string) {
    const peer = new RTCPeerConnection(ICE_SERVERS);

    localStream?.getTracks().forEach((track) => {
      peer.addTrack(track, localStream);
    });

    peer.onicecandidate = (e) => {
      if (e.candidate) {
        socket.emit("ice-candidate", {
          to: userId,
          candidate: e.candidate
        });
      }
    };

    peer.ontrack = (e) => {
      const video = document.createElement("video");
      video.srcObject = e.streams[0];
      video.autoplay = true;
      document.body.appendChild(video);
    };

    return peer;
  }

  return (
    <div>
      <h2>Next.js Video Call ({currentuseId})</h2>
      <video ref={localVideoRef} autoPlay muted />
    </div>
  );
}
