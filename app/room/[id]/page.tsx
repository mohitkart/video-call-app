/* eslint-disable react-hooks/preserve-manual-memoization */
'use client';
import { useParams } from 'next/navigation';
import { useRef, useEffect, useCallback, useState } from 'react';
import { useSocket } from '../../../hooks/useSocket';

export default function RoomPage() {
  const params = useParams();
  const roomId = params.id as string;
  const socketRef = useSocket(roomId!);

    // ✅ Add state for real-time notifications
  const [messages, setMessages] = useState<string[]>([]);
  const [users, setUsers] = useState<string[]>([]);
  
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
    setMessages(prev => [...prev, 'Other user ready - starting call...']);
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

    const handleCreated = async () => {
      hostRef.current = true;
      await getUserMediaStream();
      setMessages(prev => [...prev, 'You created the room']);
    };

    const handleJoined = async () => {
      await getUserMediaStream();
      setMessages(prev => [...prev, 'You joined the room']);
    };


     // ✅ NEW: Real-time join/leave handlers
    const handleUserJoined = (data: { socketId: string; message: string }) => {
      setMessages(prev => [...prev, data.message]);
      setUsers(prev => [...prev, data.socketId]);
    };

    const handleUserLeft = (data: { socketId: string; message: string }) => {
      setMessages(prev => [...prev, data.message]);
      setUsers(prev => prev.filter(id => id !== data.socketId));
    };

    socket.on('joined',handleJoined);
    socket.on('created',handleCreated);
    socket.on('ready', initiateCall);
    socket.on('offer', handleOffer);
    socket.on('answer', handleAnswer);
    socket.on('icecandidate', handleIceCandidate);
    socket.on('user-joined', handleUserJoined);  // ✅ NEW
    socket.on('user-left', handleUserLeft);     // ✅ NEW

    return () => {
      socket.off('created');
      socket.off('joined');
      socket.off('ready');
      socket.off('offer');
      socket.off('answer');
      socket.off('icecandidate');
      socket.off('user-joined');
      socket.off('user-left');
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
       {/* ✅ Real-time notifications */}
      <div className="w-full max-w-2xl mb-6 p-4 bg-gray-800 rounded-lg">
        <h3 className="text-lg font-bold mb-2">Room Status</h3>
        {messages.slice(-5).map((msg, i) => (
          <div key={i} className="text-sm mb-1">{msg}</div>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-4 mb-8">
        <video ref={userVideoRef} autoPlay muted className="w-96 h-64 bg-black rounded-lg" />
        <video ref={peerVideoRef} autoPlay className="w-96 h-64 bg-black rounded-lg" />
      </div>

        <div className="text-sm text-gray-400 mb-4">
        Users in room: {users.length}
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
