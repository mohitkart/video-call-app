/* eslint-disable react-hooks/preserve-manual-memoization */
'use client';
import { useParams } from 'next/navigation';
import { useRef, useEffect, useCallback } from 'react';
import { useSocket } from '../../../hooks/useSocket';

export default function RoomPage() {
  const params = useParams();
  const roomId = params.id as string;
  const socketRef = useSocket(roomId!);
  
  const userVideoRef = useRef<HTMLVideoElement>(null);
  const peerVideoRef = useRef<HTMLVideoElement>(null);
  const rtcConnectionRef = useRef<RTCPeerConnection | null>(null);
  const userStreamRef = useRef<MediaStream | null>(null);
  const hostRef = useRef<boolean>(false);

  const createPeerConnection = useCallback((): RTCPeerConnection => {
    const pc = new RTCPeerConnection({
      iceServers: [{ urls: 'stun:openrelay.metered.ca:80' }]
    });

    pc.onicecandidate = (event) => {
      if (event.candidate && socketRef.current) {
        socketRef.current.emit('icecandidate', event.candidate, roomId);
      }
    };

    pc.ontrack = (event) => {
      if (peerVideoRef.current && event.streams[0]) {
        peerVideoRef.current.srcObject = event.streams[0];
      }
    };

    return pc;
  }, [roomId]);

  const getUserMediaStream = useCallback(async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { width: 500, height: 500 },
      audio: true
    });
    userStreamRef.current = stream;
    if (userVideoRef.current) {
      userVideoRef.current.srcObject = stream;
      userVideoRef.current.play();
    }
  }, []);

  const initiateCall = useCallback(async () => {
    if (!userStreamRef.current) return;

    rtcConnectionRef.current = createPeerConnection();
    
    userStreamRef.current.getTracks().forEach((track) => {
      rtcConnectionRef.current?.addTrack(track, userStreamRef.current!);
    });

    const offer = await rtcConnectionRef.current.createOffer();
    await rtcConnectionRef.current.setLocalDescription(offer);
    socketRef.current?.emit('offer', offer, roomId);
  }, [createPeerConnection, roomId]);

  const handleOffer = useCallback(async (offer: RTCSessionDescriptionInit) => {
    if (hostRef.current) return;

    rtcConnectionRef.current = createPeerConnection();
    await rtcConnectionRef.current.setRemoteDescription(offer);

    userStreamRef.current?.getTracks().forEach((track) => {
      rtcConnectionRef.current?.addTrack(track, userStreamRef.current!);
    });

    const answer = await rtcConnectionRef.current.createAnswer();
    await rtcConnectionRef.current.setLocalDescription(answer);
    socketRef.current?.emit('answer', answer, roomId);
  }, [createPeerConnection, roomId]);

  const handleAnswer = useCallback(async (answer: RTCSessionDescriptionInit) => {
    await rtcConnectionRef.current?.setRemoteDescription(answer);
  }, []);

  const handleIceCandidate = useCallback((candidate: RTCIceCandidateInit) => {
    rtcConnectionRef.current?.addIceCandidate(candidate);
  }, []);

  useEffect(() => {
    if (!socketRef.current) return;

    const socket = socketRef.current;

    socket.on('created', async () => {
      hostRef.current = true;
      await getUserMediaStream();
    });

    socket.on('joined', async () => {
      await getUserMediaStream();
    });

    socket.on('ready', initiateCall);
    socket.on('offer', handleOffer);
    socket.on('answer', handleAnswer);
    socket.on('icecandidate', handleIceCandidate);

    return () => {
      socket.off('created');
      socket.off('joined');
      socket.off('ready');
      socket.off('offer');
      socket.off('answer');
      socket.off('icecandidate');
    };
  }, [getUserMediaStream, initiateCall, handleOffer, handleAnswer, handleIceCandidate]);

  const leaveRoom = () => {
    socketRef.current?.emit('leave', roomId);
    if (userStreamRef.current) {
      userStreamRef.current.getTracks().forEach(track => track.stop());
    }
    if (rtcConnectionRef.current) {
      rtcConnectionRef.current.close();
    }
    window.location.href = '/';
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white">
      <div className="grid grid-cols-2 gap-4 mb-8">
        <video ref={userVideoRef} autoPlay muted className="w-96 h-64 bg-black rounded-lg" />
        <video ref={peerVideoRef} autoPlay className="w-96 h-64 bg-black rounded-lg" />
      </div>
      <button
        onClick={leaveRoom}
        className="px-6 py-2 bg-red-600 rounded-lg hover:bg-red-700"
      >
        Leave Room
      </button>
    </div>
  );
}
