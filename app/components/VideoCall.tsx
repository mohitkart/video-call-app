/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSocket } from "@/store/socket";
import { getRandomCode } from '@/utils/shared';
export default function VideoCall() {
  const [roomId, setRoomId] = useState('');
  const router = useRouter();
   const [connectionStatus, setConnectionStatus] = useState("Checking...");
   const socket:any = useSocket();
 
   useEffect(() => {
     if (socket) {
       // Set initial status based on socket state
       if (socket.isConnected) {
         setConnectionStatus("✅ Connected");
       } else if (socket.isConnecting) {
         setConnectionStatus("🔄 Connecting...");
       } else {
         setConnectionStatus("⏳ Ready to connect");
       }
 
       socket.on("connecting", () => {
         setConnectionStatus("🔄 Connecting...");
       });
 
       socket.on("connect", () => {
         setConnectionStatus("✅ Connected");
       });
 
       socket.on("disconnect", () => {
         setConnectionStatus("❌ Disconnected");
       });
 
       socket.on("connect_error", () => {
         setConnectionStatus("❌ Connection failed");
       });
     }
   }, [socket]);
 
   const createAndJoin = () => {
     const roomId = getRandomCode(8);
     router.push(`/room/${roomId}`);
   };
 
   const joinRoom = () => {
     if (roomId) router.push(`/room/${roomId}`);
     else {
       alert("Please provide a valid room id");
     }
   };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white">
      <h1 className="text-4xl font-bold mb-8">Video Call</h1>

        {/* Hero section */}
        <div className="text-center mb-12">

          {/* Connection Status */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-lg border border-white/20 rounded-full text-sm text-gray-300">
            <div
              className={`w-2 h-2 rounded-full ${
                connectionStatus.includes("✅")
                  ? "bg-green-500"
                  : connectionStatus.includes("🔄")
                  ? "bg-yellow-500 animate-pulse"
                  : connectionStatus.includes("❌")
                  ? "bg-red-500"
                  : "bg-gray-400 animate-pulse"
              }`}
            ></div>
            <span>{connectionStatus}</span>
          </div>
        </div>

      <div className="space-y-4 w-96">
        <button
          onClick={createAndJoin}
          className="w-full px-6 py-3 bg-blue-600 rounded-lg hover:bg-blue-700 text-lg"
        >
          Create Room
        </button>
        <div className="flex gap-2">
          <input
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
            placeholder="Enter Room ID"
            className="flex-1 px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white"
          />
          <button onClick={joinRoom} className="px-6 py-3 bg-green-600 rounded-lg hover:bg-green-700">
            Join
          </button>
        </div>
      </div>
    </div>
  );
}
